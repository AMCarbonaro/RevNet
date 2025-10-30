import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SearchFilters {
  query: string;
  serverId?: string;
  channelId?: string;
  userId?: string;
  hasAttachments?: boolean;
  hasEmbeds?: boolean;
  before?: string;
  after?: string;
  limit?: number;
}

export interface SearchResult {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  serverId: string;
  channelName: string;
  serverName: string;
  createdAt: string;
  editedTimestamp?: string;
  attachments?: any[];
  embeds?: any[];
  pinned: boolean;
  type: number;
  tts: boolean;
  mentionEveryone: boolean;
  flags: number;
}

export interface SearchResponse {
  messages: SearchResult[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageSearchService {
  private readonly apiUrl = `${environment.apiUrl}/api/revnet/channels`;

  constructor(private http: HttpClient) {}

  searchMessages(filters: SearchFilters): Observable<SearchResponse> {
    let params = new HttpParams();
    
    params = params.set('query', filters.query);
    
    if (filters.serverId) {
      params = params.set('serverId', filters.serverId);
    }
    if (filters.channelId) {
      params = params.set('channelId', filters.channelId);
    }
    if (filters.userId) {
      params = params.set('userId', filters.userId);
    }
    if (filters.hasAttachments !== undefined) {
      params = params.set('hasAttachments', filters.hasAttachments.toString());
    }
    if (filters.hasEmbeds !== undefined) {
      params = params.set('hasEmbeds', filters.hasEmbeds.toString());
    }
    if (filters.before) {
      params = params.set('before', filters.before);
    }
    if (filters.after) {
      params = params.set('after', filters.after);
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    // Use a dummy channelId since the search endpoint is under channels/:channelId/messages/search
    // In a real implementation, you might want to create a separate search endpoint
    const dummyChannelId = 'search';
    return this.http.get<SearchResponse>(`${this.apiUrl}/${dummyChannelId}/messages/search`, { params });
  }

  exportResults(results: SearchResult[]): void {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `message-search-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
