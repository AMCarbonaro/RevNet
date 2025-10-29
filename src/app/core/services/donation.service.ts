import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnonymousDonationRequest, DonationResponse, DonationStats } from '../models/donation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  processAnonymousDonation(donationData: AnonymousDonationRequest): Observable<DonationResponse> {
    return this.http.post<DonationResponse>(`${this.apiUrl}/donations/anonymous`, donationData);
  }

  confirmDonation(paymentIntentId: string): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(`${this.apiUrl}/donations/confirm/${paymentIntentId}`, {});
  }

  getDonationsByRevolt(revoltId: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/donations/revolt/${revoltId}`);
  }

  getDonationStats(revoltId: string): Observable<{ data: DonationStats }> {
    return this.http.get<{ data: DonationStats }>(`${this.apiUrl}/donations/stats/${revoltId}`);
  }
}
