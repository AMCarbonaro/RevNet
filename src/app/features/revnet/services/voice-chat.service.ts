import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { RevNetWebSocketService, WebRTCSignal } from './revnet-websocket.service';
import { Store } from '@ngrx/store';
import { selectSelectedServerId } from '../store/selectors/revnet.selectors';

export interface VoiceChannelParticipant {
  userId: string;
  username: string;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  connection?: RTCPeerConnection;
  audioElement?: HTMLAudioElement;
}

export interface VoiceChannelState {
  channelId: string | null;
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  participants: VoiceChannelParticipant[];
  localStream: MediaStream | null;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceChatService implements OnDestroy {
  private voiceState = new BehaviorSubject<VoiceChannelState>({
    channelId: null,
    isConnected: false,
    isMuted: false,
    isDeafened: false,
    participants: [],
    localStream: null
  });

  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private audioContext: AudioContext | null = null;
  private audioElements = new Map<string, HTMLAudioElement>();
  private speakingTimeout: number | null = null;
  private voiceUsersSubscription: any;
  private destroy$ = new Subject<void>();

  // Observable streams
  public voiceState$ = this.voiceState.asObservable();
  public participants$ = this.voiceState.pipe(
    map(state => state.participants)
  );

  constructor(
    private webSocketService: RevNetWebSocketService,
    private store: Store
  ) {
    this.initializeAudioContext();
    this.setupWebRTCSignals();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }

  private setupWebRTCSignals(): void {
    this.webSocketService.webrtcSignals$.subscribe(signal => {
      this.handleWebRTCSignal(signal);
    });
  }

  async joinVoiceChannel(channelId: string): Promise<void> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Update voice state
      this.updateVoiceState({
        channelId,
        isConnected: true,
        localStream: this.localStream
      });

      // Join via WebSocket
      this.store.select(selectSelectedServerId).pipe(take(1)).subscribe(serverId => {
        if (serverId) {
          this.webSocketService.joinVoiceChannel(channelId, serverId);
        }
      });

      // Set up audio context
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Start speaking detection
      this.startSpeakingDetection();

      // Add local stream tracks to peer connections for existing participants
      // This will be called when we receive other users' offers
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          // Track will be added to peer connections when offers are received
          console.log('Local audio track ready:', track);
        });
      }

      // Subscribe to voice channel users to create peer connections and update participants
      // Store subscription for cleanup
      this.voiceUsersSubscription = this.webSocketService.voiceChannelUsers$
        .pipe(takeUntil(this.destroy$))
        .subscribe(users => {
          console.log('Voice channel users updated:', users);
          
          // Update participants list from WebSocket
          const participants: VoiceChannelParticipant[] = users.map(user => {
            // Check if we already have a participant with connection info
            const existing = this.voiceState.value.participants.find(p => p.userId === user.userId);
            
            return {
              userId: user.userId,
              username: user.username || `User${user.userId.substring(0, 8)}`,
              isMuted: existing?.isMuted || false,
              isDeafened: existing?.isDeafened || false,
              isSpeaking: existing?.isSpeaking || false,
              connection: existing?.connection,
              audioElement: existing?.audioElement
            };
          });

          // Create peer connections for new users
          users.forEach(user => {
            const currentUserId = 'local'; // TODO: Get actual current user ID
            if (user.userId !== currentUserId && !this.peerConnections.has(user.userId)) {
              console.log('Creating peer connection for:', user.userId);
              this.createPeerConnectionForUser(user.userId, channelId);
            }
          });

          // Update participants in state
          this.updateVoiceState({ participants });
        });

      console.log('Joined voice channel:', channelId);
    } catch (error) {
      console.error('Error joining voice channel:', error);
      throw error;
    }
  }

  async leaveVoiceChannel(): Promise<void> {
    const currentState = this.voiceState.value;
    
    if (currentState.channelId) {
      // Leave via WebSocket
      this.webSocketService.leaveVoiceChannel(currentState.channelId);
    }

    // Close all peer connections
    this.peerConnections.forEach(connection => {
      connection.close();
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Clean up audio elements
    this.audioElements.forEach(element => {
      element.pause();
      element.srcObject = null;
    });
    this.audioElements.clear();

    // Stop speaking detection
    this.stopSpeakingDetection();
    
    // Complete destroy subject to unsubscribe
    this.destroy$.next();
    this.destroy$.complete();

    // Update voice state
    this.updateVoiceState({
      channelId: null,
      isConnected: false,
      isMuted: false,
      isDeafened: false,
      participants: [],
      localStream: null
    });

    console.log('Left voice channel');
  }

  toggleMute(): void {
    const currentState = this.voiceState.value;
    const newMutedState = !currentState.isMuted;

    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState;
      });
    }

    this.updateVoiceState({
      isMuted: newMutedState
    });

    console.log('Mute toggled:', newMutedState);
  }

  toggleDeafen(): void {
    const currentState = this.voiceState.value;
    const newDeafenedState = !currentState.isDeafened;

    // Mute local audio when deafened
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !newDeafenedState;
      });
    }

    // Mute all remote audio when deafened
    this.audioElements.forEach(element => {
      element.muted = newDeafenedState;
    });

    this.updateVoiceState({
      isDeafened: newDeafenedState
    });

    console.log('Deafen toggled:', newDeafenedState);
  }

  private async handleWebRTCSignal(signal: WebRTCSignal): Promise<void> {
    const { fromUserId, channelId, offer, answer, candidate } = signal;

    if (offer) {
      await this.handleOffer(fromUserId, channelId, offer);
    } else if (answer) {
      await this.handleAnswer(fromUserId, channelId, answer);
    } else if (candidate) {
      await this.handleIceCandidate(fromUserId, channelId, candidate);
    }
  }

  private async handleOffer(fromUserId: string, channelId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      let connection = this.peerConnections.get(fromUserId);
      
      if (!connection) {
        connection = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        this.peerConnections.set(fromUserId, connection);

        // Set up connection event handlers
        this.setupPeerConnection(fromUserId, connection);

        // Add local stream to connection
        if (this.localStream) {
          this.localStream.getAudioTracks().forEach(track => {
            connection!.addTrack(track, this.localStream!);
          });
        }
      }

      // Set remote description
      await connection.setRemoteDescription(offer);

      // Create and set local description
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      // Send answer back
      this.webSocketService.sendVoiceAnswer(channelId, fromUserId, answer);

      console.log('Handled offer from:', fromUserId);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(fromUserId: string, channelId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const connection = this.peerConnections.get(fromUserId);
      if (connection) {
        await connection.setRemoteDescription(answer);
        console.log('Handled answer from:', fromUserId);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(fromUserId: string, channelId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const connection = this.peerConnections.get(fromUserId);
      if (connection) {
        await connection.addIceCandidate(candidate);
        console.log('Handled ICE candidate from:', fromUserId);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private async createPeerConnectionForUser(userId: string, channelId: string): Promise<void> {
    try {
      const connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      this.peerConnections.set(userId, connection);
      this.setupPeerConnection(userId, connection);

      // Add local stream to connection
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          connection.addTrack(track, this.localStream!);
        });
      }

      // Create and send offer
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      this.webSocketService.sendVoiceOffer(channelId, userId, offer);

      console.log('Created peer connection and sent offer to:', userId);
    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  }

  private setupPeerConnection(userId: string, connection: RTCPeerConnection): void {
    // Handle incoming stream
    connection.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      this.handleRemoteStream(userId, event.streams[0]);
    };

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        const currentState = this.voiceState.value;
        if (currentState.channelId) {
          this.webSocketService.sendIceCandidate(currentState.channelId, userId, event.candidate);
        }
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, connection.connectionState);
      
      if (connection.connectionState === 'disconnected' || connection.connectionState === 'failed') {
        this.removeParticipant(userId);
      }
    };
  }

  private handleRemoteStream(userId: string, stream: MediaStream): void {
    // Create audio element for remote stream
    const audioElement = document.createElement('audio');
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.muted = this.voiceState.value.isDeafened;
    
    this.audioElements.set(userId, audioElement);

    // Add to participants
    this.addParticipant({
      userId,
      username: `User${userId}`, // TODO: Get actual username
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      audioElement
    });
  }

  private addParticipant(participant: VoiceChannelParticipant): void {
    const currentState = this.voiceState.value;
    const existingIndex = currentState.participants.findIndex(p => p.userId === participant.userId);
    
    if (existingIndex >= 0) {
      // Update existing participant
      currentState.participants[existingIndex] = participant;
    } else {
      // Add new participant
      currentState.participants.push(participant);
    }

    this.updateVoiceState({
      participants: [...currentState.participants]
    });
  }

  private removeParticipant(userId: string): void {
    const currentState = this.voiceState.value;
    const updatedParticipants = currentState.participants.filter(p => p.userId !== userId);
    
    // Clean up audio element
    const audioElement = this.audioElements.get(userId);
    if (audioElement) {
      audioElement.pause();
      audioElement.srcObject = null;
      this.audioElements.delete(userId);
    }

    // Clean up peer connection
    const connection = this.peerConnections.get(userId);
    if (connection) {
      connection.close();
      this.peerConnections.delete(userId);
    }

    this.updateVoiceState({
      participants: updatedParticipants
    });
  }

  private startSpeakingDetection(): void {
    if (!this.localStream || !this.audioContext) {
      console.warn('Cannot start speaking detection: missing stream or audio context');
      return;
    }

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (!audioTrack) {
      console.warn('No audio track available for speaking detection');
      return;
    }

    // Check if track is enabled
    if (!audioTrack.enabled) {
      console.warn('Audio track is disabled');
      return;
    }

    console.log('Starting speaking detection...');

    const source = this.audioContext.createMediaStreamSource(this.localStream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isSpeaking = false;

    const detectSpeaking = () => {
      if (!this.voiceState.value.isConnected || !this.localStream) {
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const threshold = 20; // Lower threshold for better detection
      
      const currentlySpeaking = average > threshold && !this.voiceState.value.isMuted;
      
      if (currentlySpeaking !== isSpeaking) {
        isSpeaking = currentlySpeaking;
        console.log('Speaking state changed:', isSpeaking, 'average:', average.toFixed(2));
        this.updateSpeakingState(isSpeaking);
      }

      if (this.voiceState.value.isConnected) {
        const animationFrameId = requestAnimationFrame(detectSpeaking);
        // Store animation frame ID for cleanup
        this.speakingTimeout = animationFrameId;
      }
    };

    // Start detection
    detectSpeaking();
  }

  private stopSpeakingDetection(): void {
    if (this.speakingTimeout) {
      cancelAnimationFrame(this.speakingTimeout as number);
      this.speakingTimeout = null;
    }
  }

  private updateSpeakingState(isSpeaking: boolean): void {
    const currentState = this.voiceState.value;
    
    // Update local user speaking state
    const updatedParticipants = currentState.participants.map(p => {
      if (p.userId === 'local' || !p.userId) {
        return { ...p, isSpeaking };
      }
      return p;
    });

    // If local user not in participants, add them
    const localUserExists = updatedParticipants.some(p => p.userId === 'local' || !p.userId);
    if (!localUserExists && currentState.isConnected && currentState.localStream) {
      updatedParticipants.unshift({
        userId: 'local',
        username: 'You',
        isMuted: currentState.isMuted,
        isDeafened: currentState.isDeafened,
        isSpeaking: isSpeaking
      });
    }

    this.updateVoiceState({
      participants: updatedParticipants
    });
  }

  private updateVoiceState(updates: Partial<VoiceChannelState>): void {
    const currentState = this.voiceState.value;
    this.voiceState.next({
      ...currentState,
      ...updates
    });
  }

  // Public getters
  get isConnected(): boolean {
    return this.voiceState.value.isConnected;
  }

  get isMuted(): boolean {
    return this.voiceState.value.isMuted;
  }

  get isDeafened(): boolean {
    return this.voiceState.value.isDeafened;
  }

  get currentChannelId(): string | null {
    return this.voiceState.value.channelId;
  }

  get participants(): VoiceChannelParticipant[] {
    return this.voiceState.value.participants;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
