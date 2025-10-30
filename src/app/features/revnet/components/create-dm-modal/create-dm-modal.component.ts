import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-dm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>New Direct Message</h2>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              [(ngModel)]="username" 
              placeholder="Enter username"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button 
            class="btn btn-primary" 
            [disabled]="!username.trim()"
            (click)="onCreate()"
          >
            Create DM
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './create-dm-modal.component.scss'
})
export class CreateDMModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<string>();

  username = '';

  onClose() {
    this.close.emit();
  }

  onCreate() {
    if (this.username.trim()) {
      this.create.emit(this.username.trim());
      this.username = '';
    }
  }
}