import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of, EMPTY } from 'rxjs';
import { map, switchMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { RevNetActions } from '../actions/revnet.actions';
import { RevNetApiService } from '../../services/revnet-api.service';
import { RevNetWebSocketService } from '../../services/revnet-websocket.service';
import { DMApiService } from '../../services/dm-api.service';
import { NotificationService } from '../../services/notification.service';
import { MessageSearchService } from '../../services/message-search.service';
import { selectSelectedChannelId, selectSelectedServerId } from '../selectors/revnet.selectors';
import { Message } from '../models/revnet.models';

@Injectable()
export class RevNetEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private apiService = inject(RevNetApiService);
  private webSocketService = inject(RevNetWebSocketService);
  private dmApiService = inject(DMApiService);
  private notificationService = inject(NotificationService);
  private messageSearchService = inject(MessageSearchService);

  // Load servers effect
  loadServers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.loadServers),
      switchMap(() =>
        this.apiService.getServers().pipe(
          map(servers => RevNetActions.loadServersSuccess({ servers })),
          catchError(error => of(RevNetActions.loadServersFailure({ error: error.message })))
        )
      )
    )
  );

  // Load channels effect
  loadChannels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.loadChannels),
      switchMap(({ serverId }) =>
        this.apiService.getChannels(serverId).pipe(
          map(channels => RevNetActions.loadChannelsSuccess({ channels })),
          catchError(error => of(RevNetActions.loadChannelsFailure({ error: error.message })))
        )
      )
    )
  );

  // Load messages effect
  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.loadMessages),
      switchMap(({ channelId }) =>
        this.apiService.getMessages(channelId).pipe(
          map(response => RevNetActions.loadMessagesSuccess({ channelId, messages: response.messages })),
          catchError(error => of(RevNetActions.loadMessagesFailure({ error: error.message })))
        )
      )
    )
  );

  // Send message effect
  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.sendMessage),
      switchMap(({ channelId, content }) =>
        this.apiService.sendMessage(channelId, content).pipe(
          map(message => RevNetActions.sendMessageSuccess({ message })),
          catchError(error => of(RevNetActions.sendMessageFailure({ error: error.message })))
        )
      )
    )
  );

  // WebSocket connection effect
  connectWebSocket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.webSocketConnected),
      tap(() => {
        console.log('WebSocket connected in effects');
        this.webSocketService.connect();
      })
    ), { dispatch: false }
  );

  // WebSocket disconnection effect
  disconnectWebSocket$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.webSocketDisconnected),
      tap(() => {
        console.log('WebSocket disconnected in effects');
        this.webSocketService.disconnect();
      })
    ), { dispatch: false }
  );

  // Join channel effect
  joinChannel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.selectChannel),
      withLatestFrom(this.store.select(selectSelectedServerId)),
      tap(([{ channelId }, serverId]) => {
        console.log('Joining channel:', channelId, 'server:', serverId);
        if (serverId && channelId) {
          this.webSocketService.joinChannel(channelId, serverId);
        }
      })
    ), { dispatch: false }
  );

  // Leave channel effect
  leaveChannel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.selectChannel),
      withLatestFrom(this.store.select(selectSelectedChannelId)),
      tap(([{ channelId }, previousChannelId]) => {
        if (previousChannelId && previousChannelId !== channelId) {
          this.webSocketService.leaveChannel(previousChannelId);
        }
      })
    ), { dispatch: false }
  );

  // Handle incoming WebSocket messages
  handleWebSocketMessages$ = createEffect(() =>
    this.webSocketService.messages$.pipe(
      tap(wsMessage => console.log('Effect received WebSocket message:', wsMessage)),
      map(wsMessage => {
        // Convert WebSocketMessage to Message format
        const message: Message = {
          id: wsMessage.id,
          channel_id: wsMessage.channelId,
          author: {
            id: wsMessage.author.id,
            username: wsMessage.author.username,
            discriminator: wsMessage.author.discriminator,
            avatar: wsMessage.author.avatar,
            status: 'online',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            bot: false,
            system: false,
            mfa_enabled: false,
            banner: null,
            accent_color: null,
            locale: 'en-US',
            verified: false,
            email: null,
            flags: 0,
            premium_type: 0,
            public_flags: 0
          },
          content: wsMessage.content,
          timestamp: wsMessage.timestamp,
          edited_timestamp: wsMessage.editedTimestamp || null,
          tts: wsMessage.tts,
          mention_everyone: wsMessage.mentionEveryone,
          mentions: [],
          mention_roles: [],
          mention_channels: null,
          attachments: [],
          embeds: [],
          reactions: [],
          nonce: null,
          pinned: wsMessage.pinned,
          webhook_id: null,
          type: wsMessage.type,
          activity: null,
          application: null,
          application_id: null,
          message_reference: null,
          flags: wsMessage.flags,
          referenced_message: null,
          interaction: null,
          thread: null,
          components: [],
          sticker_items: [],
          stickers: [],
          position: null
        };
        return RevNetActions.messageReceived({ message });
      })
    )
  );

  // Handle WebSocket connection status
  handleWebSocketConnection$ = createEffect(() =>
    this.webSocketService.connected$.pipe(
      map(connected => 
        connected 
          ? RevNetActions.webSocketConnected()
          : RevNetActions.webSocketDisconnected()
      )
    )
  );

  // Handle typing indicators
  handleTypingUsers$ = createEffect(() =>
    this.webSocketService.typingUsers$.pipe(
      tap(typingUser => {
        console.log('User typing:', typingUser);
        // You can dispatch actions to update typing state here
      })
    ), { dispatch: false }
  );

  // Handle voice channel events
  handleVoiceChannelUsers$ = createEffect(() =>
    this.webSocketService.voiceChannelUsers$.pipe(
      tap(users => {
        console.log('Voice channel users:', users);
        // You can dispatch actions to update voice channel state here
      })
    ), { dispatch: false }
  );

  // Handle WebRTC signals
  handleWebRTCSignals$ = createEffect(() =>
    this.webSocketService.webrtcSignals$.pipe(
      tap(signal => {
        console.log('WebRTC signal received:', signal);
        // You can dispatch actions to handle WebRTC signals here
      })
    ), { dispatch: false }
  );

  // Add reaction effect
  addReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.addReaction),
      switchMap(({ messageId, emoji, userId }) =>
        this.apiService.addReaction(messageId, emoji).pipe(
          map(() => RevNetActions.addReactionSuccess({ messageId, emoji, userId })),
          catchError(error => of(RevNetActions.addReactionFailure({ error: error.message })))
        )
      )
    )
  );

  // Remove reaction effect
  removeReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.removeReaction),
      switchMap(({ messageId, emoji, userId }) =>
        this.apiService.removeReaction(messageId, emoji).pipe(
          map(() => RevNetActions.removeReactionSuccess({ messageId, emoji, userId })),
          catchError(error => of(RevNetActions.removeReactionFailure({ error: error.message })))
        )
      )
    )
  );

  // Edit message effect
  editMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.editMessage),
      switchMap(({ messageId, content }) =>
        this.apiService.editMessage(messageId, content).pipe(
          map(message => RevNetActions.editMessageSuccess({ message })),
          catchError(error => of(RevNetActions.editMessageFailure({ error: error.message })))
        )
      )
    )
  );

  // Delete message effect
  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.deleteMessage),
      switchMap(({ messageId }) =>
        this.apiService.deleteMessage(messageId).pipe(
          map(() => RevNetActions.deleteMessageSuccess({ messageId })),
          catchError(error => of(RevNetActions.deleteMessageFailure({ error: error.message })))
        )
      )
    )
  );

  // Pin message effect
  pinMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.pinMessage),
      switchMap(({ messageId }) =>
        this.apiService.pinMessage(messageId).pipe(
          map(() => RevNetActions.pinMessageSuccess({ messageId })),
          catchError(error => of(RevNetActions.pinMessageFailure({ error: error.message })))
        )
      )
    )
  );

  // Unpin message effect
  unpinMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.unpinMessage),
      switchMap(({ messageId }) =>
        this.apiService.unpinMessage(messageId).pipe(
          map(() => RevNetActions.unpinMessageSuccess({ messageId })),
          catchError(error => of(RevNetActions.unpinMessageFailure({ error: error.message })))
        )
      )
    )
  );

  // Friend effects
  loadFriends$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.loadFriends),
      switchMap(() =>
        this.dmApiService.getFriends().pipe(
          map(friends => RevNetActions.loadFriendsSuccess({ friends })),
          catchError(error => of(RevNetActions.loadFriendsFailure({ error: error.message })))
        )
      )
    )
  );

  loadFriendRequests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.loadFriendRequests),
      switchMap(() =>
        this.dmApiService.getFriendRequests().pipe(
          map(friendRequests => RevNetActions.loadFriendRequestsSuccess({ friendRequests })),
          catchError(error => of(RevNetActions.loadFriendRequestsFailure({ error: error.message })))
        )
      )
    )
  );

  sendFriendRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.sendFriendRequest),
      switchMap(({ friendUsername }) =>
        this.dmApiService.sendFriendRequest(friendUsername).pipe(
          map(friendRequest => RevNetActions.sendFriendRequestSuccess({ friendRequest })),
          catchError(error => of(RevNetActions.sendFriendRequestFailure({ error: error.message })))
        )
      )
    )
  );

  acceptFriendRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.acceptFriendRequest),
      switchMap(({ requestId }) =>
        this.dmApiService.acceptFriendRequest(requestId).pipe(
          map(friend => RevNetActions.acceptFriendRequestSuccess({ friend })),
          catchError(error => of(RevNetActions.acceptFriendRequestFailure({ error: error.message })))
        )
      )
    )
  );

  declineFriendRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.declineFriendRequest),
      switchMap(({ requestId }) =>
        this.dmApiService.declineFriendRequest(requestId).pipe(
          map(() => RevNetActions.declineFriendRequestSuccess({ requestId })),
          catchError(error => of(RevNetActions.declineFriendRequestFailure({ error: error.message })))
        )
      )
    )
  );

  removeFriend$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.removeFriend),
      switchMap(({ friendId }) =>
        this.dmApiService.removeFriend(friendId).pipe(
          map(() => RevNetActions.removeFriendSuccess({ friendId })),
          catchError(error => of(RevNetActions.removeFriendFailure({ error: error.message })))
        )
      )
    )
  );

  blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.blockUser),
      switchMap(({ userId }) =>
        this.dmApiService.blockUser(userId).pipe(
          map(blockedUser => RevNetActions.blockUserSuccess({ blockedUser })),
          catchError(error => of(RevNetActions.blockUserFailure({ error: error.message })))
        )
      )
    )
  );

  unblockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.unblockUser),
      switchMap(({ userId }) =>
        this.dmApiService.unblockUser(userId).pipe(
          map(() => RevNetActions.unblockUserSuccess({ userId })),
          catchError(error => of(RevNetActions.unblockUserFailure({ error: error.message })))
        )
      )
    )
  );

  // DM effects
  loadDMChannels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.loadDMChannels),
      switchMap(() =>
        this.dmApiService.getDMChannels().pipe(
          map(dmChannels => RevNetActions.loadDMChannelsSuccess({ dmChannels })),
          catchError(error => of(RevNetActions.loadDMChannelsFailure({ error: error.message })))
        )
      )
    )
  );

  createDMChannel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.createDMChannel),
      switchMap(({ recipientId }) =>
        this.dmApiService.createDMChannel(recipientId).pipe(
          map(dmChannel => RevNetActions.createDMChannelSuccess({ dmChannel })),
          catchError(error => of(RevNetActions.createDMChannelFailure({ error: error.message })))
        )
      )
    )
  );

  createGroupDM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.createGroupDM),
      switchMap(({ recipientIds, name }) =>
        this.dmApiService.createGroupDM(recipientIds, name).pipe(
          map(dmChannel => RevNetActions.createGroupDMSuccess({ dmChannel })),
          catchError(error => of(RevNetActions.createGroupDMFailure({ error: error.message })))
        )
      )
    )
  );

  closeDMChannel$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.closeDMChannel),
      switchMap(({ channelId }) =>
        this.dmApiService.closeDMChannel(channelId).pipe(
          map(() => RevNetActions.closeDMChannelSuccess({ channelId })),
          catchError(error => of(RevNetActions.closeDMChannelFailure({ error: error.message })))
        )
      )
    )
  );

  addRecipientToGroupDM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.addRecipientToGroupDM),
      switchMap(({ channelId, userId }) =>
        this.dmApiService.addRecipientToGroupDM(channelId, userId).pipe(
          map(dmChannel => RevNetActions.addRecipientToGroupDMSuccess({ dmChannel })),
          catchError(error => of(RevNetActions.addRecipientToGroupDMFailure({ error: error.message })))
        )
      )
    )
  );

  removeRecipientFromGroupDM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.removeRecipientFromGroupDM),
      switchMap(({ channelId, userId }) =>
        this.dmApiService.removeRecipientFromGroupDM(channelId, userId).pipe(
          map(dmChannel => RevNetActions.removeRecipientFromGroupDMSuccess({ dmChannel })),
          catchError(error => of(RevNetActions.removeRecipientFromGroupDMFailure({ error: error.message })))
        )
      )
    )
  );

  // WebSocket event handling effects
  handleFriendRequestReceived$ = createEffect(() =>
    this.webSocketService.friendRequestReceived$.pipe(
      tap((event) => {
        this.notificationService.showFriendRequestNotification(event.fromUsername);
      }),
      map((event) => RevNetActions.friendRequestReceived({ friendRequest: event.request }))
    )
  );

  handleFriendAccepted$ = createEffect(() =>
    this.webSocketService.friendAccepted$.pipe(
      tap((event) => {
        this.notificationService.showFriendAcceptedNotification(event.byUsername);
      }),
      map((event) => RevNetActions.friendAccepted({ friend: event.request }))
    )
  );

  handleDMOpened$ = createEffect(() =>
    this.webSocketService.dmOpened$.pipe(
      tap((event) => {
        console.log('DM opened via WebSocket:', event);
      }),
      map((event: any) => RevNetActions.dMOpened({ dmChannel: event.channel }))
    )
  );

  handleGroupDMOpened$ = createEffect(() =>
    this.webSocketService.groupDMOpened$.pipe(
      tap((event) => {
        console.log('Group DM opened via WebSocket:', event);
      }),
      map((event: any) => RevNetActions.groupDMOpened({ dmChannel: event.channel }))
    )
  );

  // Handle DM message notifications
  handleDMMessageNotification$ = createEffect(() =>
    this.webSocketService.messages$.pipe(
      withLatestFrom(this.store.select(selectSelectedChannelId)),
      tap(([message, selectedChannelId]) => {
        // Only show notification if the message is not from the current channel
        if (message.channelId !== selectedChannelId) {
          // Check if this is a DM channel (you'd need to implement this check)
          // For now, we'll show notification for any message not in the selected channel
          this.notificationService.showDMMessageNotification(
            message.author.username,
            message.content,
            message.channelId
          );
        }
      })
    ), { dispatch: false }
  );

  // Search effects
  searchMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.searchMessages),
      switchMap(({ filters }) =>
        this.messageSearchService.searchMessages(filters).pipe(
          map(response => RevNetActions.searchMessagesSuccess({ 
            results: response.messages, 
            total: response.total 
          })),
          catchError(error => of(RevNetActions.searchMessagesFailure({ error: error.message })))
        )
      )
    )
  );

  // Navigate to message effect
  navigateToMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RevNetActions.navigateToMessage),
      tap(({ serverId, channelId, messageId }) => {
        // Set highlight for the message
        this.store.dispatch(RevNetActions.setSearchHighlight({ messageId }));
        
        // Load messages for the channel if not already loaded
        this.store.dispatch(RevNetActions.loadMessages({ channelId }));
        
        // Clear highlight after 3 seconds
        setTimeout(() => {
          this.store.dispatch(RevNetActions.setSearchHighlight({ messageId: null }));
        }, 3000);
      })
    ), { dispatch: false }
  );
}
