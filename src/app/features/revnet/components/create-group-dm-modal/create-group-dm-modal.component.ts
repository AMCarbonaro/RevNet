import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-group-dm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>New Group DM</h2>
          <button class="close-btn" (click)="onClose()">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="groupName">Group Name (Optional)</label>
            <input 
              type="text" 
              id="groupName" 
              [(ngModel)]="groupName" 
              placeholder="Enter group name"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label for="usernames">Usernames (comma-separated)</label>
            <textarea 
              id="usernames" 
              [(ngModel)]="usernames" 
              placeholder="Enter usernames separated by commas"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onClose()">Cancel</button>
          <button 
            class="btn btn-primary" 
            [disabled]="!usernames.trim()"
            (click)="onCreate()"
          >
            Create Group DM
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './create-group-dm-modal.component.scss'
})
export class CreateGroupDMModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<{name?: string, usernames: string[]}>();

  groupName = '';
  usernames = '';

  onClose() {
    this.close.emit();
  }

  onCreate() {
    if (this.usernames.trim()) {
      const usernameList = this.usernames
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0);
      
      this.create.emit({
        name: this.groupName.trim() || undefined,
        usernames: usernameList
      });
      
      this.groupName = '';
      this.usernames = '';
    }
  }
}
