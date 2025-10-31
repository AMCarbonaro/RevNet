import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Server, Channel, Message } from '../store/models/revnet.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RevNetApiService {
  private readonly apiUrl = `${environment.apiUrl}/api/revnet`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    // For now, return empty headers since we're using mock auth in backend
    // In production, you'd get the JWT token from your auth service
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.apiUrl}/servers`, { headers: this.getHeaders() });
  }

  getChannels(serverId: string): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/servers/${serverId}/channels`, { headers: this.getHeaders() });
  }

  getMessages(channelId: string, limit = 50): Observable<{ messages: Message[], total: number, page: number, totalPages: number }> {
    return this.http.get<{ messages: Message[], total: number, page: number, totalPages: number }>(`${this.apiUrl}/channels/${channelId}/messages`, {
      headers: this.getHeaders(),
      params: { limit: limit.toString() }
    });
  }

  sendMessage(channelId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/channels/${channelId}/messages`, {
      content
    }, { headers: this.getHeaders() });
  }

  // Advanced message features
  editMessage(messageId: string, content: string): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/messages/${messageId}`, {
      content
    }, { headers: this.getHeaders() });
  }

  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`, { headers: this.getHeaders() });
  }

  addReaction(messageId: string, emoji: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/${messageId}/reactions`, {
      emoji
    }, { headers: this.getHeaders() });
  }

  removeReaction(messageId: string, emoji: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}/reactions`, {
      headers: this.getHeaders(),
      body: { emoji }
    });
  }

  pinMessage(messageId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/messages/${messageId}/pin`, {}, { headers: this.getHeaders() });
  }

  unpinMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}/pin`, { headers: this.getHeaders() });
  }

  // DM Channel methods
  getDMChannels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dm`, { headers: this.getHeaders() });
  }

  createDMChannel(recipientId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dm`, {
      recipientId
    }, { headers: this.getHeaders() });
  }

  createGroupDM(recipientIds: string[], name?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dm/group`, {
      recipientIds,
      name
    }, { headers: this.getHeaders() });
  }

  // Friends methods
  getFriends(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/friends`, { headers: this.getHeaders() });
  }

  getPendingFriendRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/friends/pending`, { headers: this.getHeaders() });
  }

  sendFriendRequest(friendUsername: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/friends/requests`, {
      friendUsername
    }, { headers: this.getHeaders() });
  }

  acceptFriendRequest(requestId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/friends/requests/${requestId}/accept`, {}, { headers: this.getHeaders() });
  }

  declineFriendRequest(requestId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/friends/requests/${requestId}`, { headers: this.getHeaders() });
  }

  removeFriend(friendId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/friends/${friendId}`, { headers: this.getHeaders() });
  }
}
