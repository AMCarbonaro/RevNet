import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friend, FriendRequest, DMChannel } from '../store/models/revnet.models';

@Injectable({
  providedIn: 'root'
})
export class DMApiService {
  private baseUrl = '/api/revnet';

  constructor(private http: HttpClient) {}

  // Friend API methods
  getFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.baseUrl}/friends`);
  }

  getFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.baseUrl}/friends/pending`);
  }

  sendFriendRequest(friendUsername: string): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(`${this.baseUrl}/friends/requests`, {
      friendUsername
    });
  }

  acceptFriendRequest(requestId: string): Observable<Friend> {
    return this.http.put<Friend>(`${this.baseUrl}/friends/requests/${requestId}/accept`, {});
  }

  declineFriendRequest(requestId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/friends/requests/${requestId}`);
  }

  removeFriend(friendId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/friends/${friendId}`);
  }

  blockUser(userId: string): Observable<Friend> {
    return this.http.post<Friend>(`${this.baseUrl}/friends/${userId}/block`, {});
  }

  unblockUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/friends/${userId}/unblock`);
  }

  // DM API methods
  getDMChannels(): Observable<DMChannel[]> {
    return this.http.get<DMChannel[]>(`${this.baseUrl}/dm`);
  }

  createDMChannel(recipientId: string): Observable<DMChannel> {
    return this.http.post<DMChannel>(`${this.baseUrl}/dm`, {
      recipientId
    });
  }

  createGroupDM(recipientIds: string[], name?: string): Observable<DMChannel> {
    return this.http.post<DMChannel>(`${this.baseUrl}/dm/group`, {
      recipientIds,
      name
    });
  }

  addRecipientToGroupDM(channelId: string, userId: string): Observable<DMChannel> {
    return this.http.post<DMChannel>(`${this.baseUrl}/dm/${channelId}/recipients`, {
      userId
    });
  }

  removeRecipientFromGroupDM(channelId: string, userId: string): Observable<DMChannel> {
    return this.http.delete<DMChannel>(`${this.baseUrl}/dm/${channelId}/recipients/${userId}`);
  }

  closeDMChannel(channelId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dm/${channelId}`);
  }

  getDMChannelById(channelId: string): Observable<DMChannel> {
    return this.http.get<DMChannel>(`${this.baseUrl}/dm/${channelId}`);
  }
}
