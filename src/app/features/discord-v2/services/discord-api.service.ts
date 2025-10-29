import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Server, Channel, Message } from '../store/models/discord.models';

@Injectable({
  providedIn: 'root'
})
export class DiscordApiService {
  private readonly apiUrl = 'http://localhost:3000/api'; // NestJS backend

  constructor(private http: HttpClient) {}

  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.apiUrl}/servers`);
  }

  getChannels(serverId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/servers/${serverId}/channels`);
  }

  getMessages(channelId: string, limit = 50): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/channels/${channelId}/messages`, {
      params: { limit: limit.toString() }
    });
  }

  sendMessage(channelId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/channels/${channelId}/messages`, {
      content
    });
  }
}
