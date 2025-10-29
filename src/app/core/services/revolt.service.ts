import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Revolt, RevoltFilters, RevoltResponse } from '../models/revolt.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RevoltService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFeaturedRevolts(): Observable<{ data: Revolt[] }> {
    return this.http.get<{ data: Revolt[] }>(`${this.apiUrl}/revolts/featured`);
  }

  getPublicRevolts(filters: RevoltFilters = {}): Observable<RevoltResponse> {
    let params = new HttpParams();
    
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.offset) {
      params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<RevoltResponse>(`${this.apiUrl}/revolts/public`, { params });
  }

  getRevoltById(id: string): Observable<{ data: Revolt }> {
    return this.http.get<{ data: Revolt }>(`${this.apiUrl}/revolts/${id}`);
  }

  getRevoltChannels(id: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/revolts/${id}/channels`);
  }
}
