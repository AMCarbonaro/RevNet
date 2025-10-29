import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlatformStats, CategoryStats, RecentActivity } from '../models/platform.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPlatformStats(): Observable<{ data: PlatformStats }> {
    return this.http.get<{ data: PlatformStats }>(`${this.apiUrl}/platform/stats`);
  }

  getCategoryStats(): Observable<{ data: CategoryStats[] }> {
    return this.http.get<{ data: CategoryStats[] }>(`${this.apiUrl}/platform/categories`);
  }

  getRecentActivity(limit?: number): Observable<{ data: RecentActivity[] }> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<{ data: RecentActivity[] }>(`${this.apiUrl}/platform/activity`, { params });
  }
}
