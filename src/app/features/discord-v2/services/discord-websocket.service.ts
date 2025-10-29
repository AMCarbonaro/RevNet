import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Message } from '../store/models/discord.models';

@Injectable({
  providedIn: 'root'
})
export class DiscordWebsocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();

  connect(token: string): void {
    const wsUrl = `ws://localhost:3000/ws?token=${token}`;
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'MESSAGE_CREATE') {
          this.messagesSubject.next(data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
