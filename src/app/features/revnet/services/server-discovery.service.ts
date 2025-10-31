import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ServerDiscoveryQuery {
  search?: string;
  category?: string;
  tags?: string[];
  sortBy?: 'popular' | 'recent' | 'active';
  page?: number;
  limit?: number;
}

export interface PaginatedServers {
  servers: Server[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Server {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  icon?: string;
  banner?: string;
  category?: string;
  tags?: string[];
  memberCount: number;
  onlineCount: number;
  messageCount: number;
  isDiscoverable: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  channels?: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  type: string;
  serverId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerDiscoveryService {
  private readonly apiUrl = `${environment.apiUrl}/api/revnet/servers/discover`;

  constructor(private http: HttpClient) {}

  discoverServers(query: ServerDiscoveryQuery): Observable<PaginatedServers> {
    let params = new HttpParams();
    
    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.category) {
      params = params.set('category', query.category);
    }
    if (query.tags && query.tags.length > 0) {
      query.tags.forEach(tag => {
        params = params.append('tags', tag);
      });
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.page) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }

    return this.http.get<PaginatedServers>(this.apiUrl, { params });
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getPopularTags(limit: number = 20): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tags`, {
      params: { limit: limit.toString() }
    });
  }

  getPublicServerById(id: string): Observable<Server> {
    return this.http.get<Server>(`${this.apiUrl}/public/${id}`);
  }

  getServerByInviteCode(code: string): Observable<Server> {
    return this.http.get<Server>(`${this.apiUrl}/invite/${code}`);
  }

  joinServer(serverId: string): Observable<Server> {
    // This would typically require authentication and a different endpoint
    // For now, we'll return a mock response
    return new Observable(observer => {
      observer.next({
        id: serverId,
        name: 'Joined Server',
        memberCount: 0,
        onlineCount: 0,
        messageCount: 0,
        isDiscoverable: false,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      observer.complete();
    });
  }
}
