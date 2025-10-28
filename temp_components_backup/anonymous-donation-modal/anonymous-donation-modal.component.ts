import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Revolt } from '@core/models/revolt.model';
import { Donation } from '@core/models/donation.model';
import { DonationService } from '@core/services/donation.service';

@Component({
  selector: 'app-anonymous-donation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Donate to {{ revolt?.name }}</h3>
          <button 
            class="close-btn"
            (click)="close.emit()">
            <i class="icon-x"></i>
          </button>
        </div>

        <div class="modal-content">
          <!-- Revolt Info -->
          <div class="revolt-info">
            <div class="revolt-icon">
              <img 
                *ngIf="revolt?.icon" 
                [src]="revolt.icon" 
                [alt]="revolt.name">
              <div 
                *ngIf="!revolt?.icon" 
                class="revolt-initials">
                {{ getRevoltInitials(revolt?.name || '') }}
              </div>
            </div>
            <div class="revolt-details">
              <h4>{{ revolt?.name }}</h4>
              <p>{{ revolt?.shortDescription }}</p>
            </div>
          </div>

          <!-- Donation Form -->
          <form 
            [formGroup]="donationForm" 
            (ngSubmit)="onSubmit()"
            class="donation-form">
            
            <!-- Amount Selection -->
            <div class="amount-section">
              <label>Donation Amount</label>
              <div class="amount-options">
                <button 
                  *ngFor="let amount of presetAmounts"
                  type="button"
                  class="amount-btn"
                  [class.selected]="selectedAmount === amount"
                  (click)="selectAmount(amount)">
                  ${{ (amount / 100) | number:'1.0-0' }}
                </button>
              </div>
              
              <div class="custom-amount">
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="Custom amount"
                  min="1"
                  max="10000"
                  step="1">
                <span class="currency">USD</span>
              </div>
            </div>

            <!-- Donor Info (Optional) -->
            <div class="donor-section">
              <label>
                <input 
                  type="checkbox" 
                  formControlName="includeDonorInfo">
                Include my information (optional)
              </label>
              
              <div class="donor-fields" *ngIf="donationForm.get('includeDonorInfo')?.value">
                <input
                  type="text"
                  formControlName="donorName"
                  placeholder="Your name (optional)">
                <input
                  type="email"
                  formControlName="donorEmail"
                  placeholder="Your email (optional)">
              </div>
            </div>

            <!-- Message (Optional) -->
            <div class="message-section">
              <label>Message (optional)</label>
              <textarea
                formControlName="message"
                placeholder="Leave a message of support..."
                rows="3"
                maxlength="500">
              </textarea>
              <div class="char-count">
                {{ donationForm.get('message')?.value?.length || 0 }}/500
              </div>
            </div>

            <!-- Summary -->
            <div class="donation-summary">
              <div class="summary-row">
                <span>Donation Amount:</span>
                <span>${{ (donationForm.value.amount || 0) / 100 | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Processing Fee:</span>
                <span>${{ (getProcessingFee() / 100) | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${{ (getTotalAmount() / 100) | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              class="btn-primary btn-large"
              [disabled]="donationForm.invalid || isProcessing">
              <i *ngIf="!isProcessing" class="icon-heart"></i>
              <i *ngIf="isProcessing" class="icon-loader animate-spin"></i>
              {{ isProcessing ? 'Processing...' : 'Donate Now' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./anonymous-donation-modal.component.scss']
})
export class AnonymousDonationModalComponent implements OnInit {
  @Input() revolt: Revolt | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() donationComplete = new EventEmitter<Donation>();

  donationForm: FormGroup;
  presetAmounts = [500, 1000, 2500, 5000, 10000]; // in cents
  selectedAmount: number | null = null;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService
  ) {
    this.donationForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(100)]],
      includeDonorInfo: [false],
      donorName: [''],
      donorEmail: ['', Validators.email],
      message: ['']
    });
  }

  ngOnInit(): void {
    // Set default amount
    this.selectAmount(this.presetAmounts[1]); // $10
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.donationForm.patchValue({ amount });
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onSubmit(): void {
    if (this.donationForm.valid && this.revolt) {
      this.isProcessing = true;
      
      const donationData = {
        revoltId: this.revolt.id,
        amount: this.donationForm.value.amount,
        donorName: this.donationForm.value.includeDonorInfo ? this.donationForm.value.donorName : null,
        donorEmail: this.donationForm.value.includeDonorInfo ? this.donationForm.value.donorEmail : null,
        message: this.donationForm.value.message || null
      };

      this.donationService.createAnonymousDonation(donationData).subscribe({
        next: (donation) => {
          this.donationComplete.emit(donation);
          this.close.emit();
        },
        error: (error) => {
          console.error('Donation failed:', error);
          this.isProcessing = false;
        }
      });
    }
  }

  getProcessingFee(): number {
    const amount = this.donationForm.value.amount || 0;
    return Math.round(amount * 0.029 + 30); // 2.9% + 30¢
  }

  getTotalAmount(): number {
    const amount = this.donationForm.value.amount || 0;
    return amount + this.getProcessingFee();
  }

  getRevoltInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}