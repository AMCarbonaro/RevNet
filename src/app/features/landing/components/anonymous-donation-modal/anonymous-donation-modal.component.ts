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
  templateUrl: './anonymous-donation-modal.component.html',
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
        revoltId: this.revolt._id,
        amount: this.donationForm.value.amount,
        donorName: this.donationForm.value.includeDonorInfo ? this.donationForm.value.donorName : null,
        donorEmail: this.donationForm.value.includeDonorInfo ? this.donationForm.value.donorEmail : null,
        message: this.donationForm.value.message || null,
        isAnonymous: true
      };

      this.donationService.processAnonymousDonation(donationData).subscribe({
        next: (donation: any) => {
          this.donationComplete.emit(donation);
          this.close.emit();
        },
        error: (error: any) => {
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