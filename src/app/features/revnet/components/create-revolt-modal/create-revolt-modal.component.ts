import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { User } from '../../store/models/revnet.models';

@Component({
  selector: 'app-create-revolt-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Create Revolt</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <form (ngSubmit)="createRevolt()" #revoltForm="ngForm">
          <div class="form-group">
            <label for="revoltName">Revolt Name</label>
            <input
              type="text"
              id="revoltName"
              name="revoltName"
              [(ngModel)]="revoltData.name"
              #nameInput="ngModel"
              required
              minlength="2"
              maxlength="100"
              placeholder="Enter revolt name..."
              class="form-input"
            />
            <div class="error-message" *ngIf="nameInput.invalid && nameInput.touched">
              <span *ngIf="nameInput.errors?.['required']">Revolt name is required</span>
              <span *ngIf="nameInput.errors?.['minlength']">Name must be at least 2 characters</span>
              <span *ngIf="nameInput.errors?.['maxlength']">Name must be less than 100 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="revoltDescription">Description (Optional)</label>
            <textarea
              id="revoltDescription"
              name="revoltDescription"
              [(ngModel)]="revoltData.description"
              maxlength="500"
              placeholder="What's this revolt about?"
              class="form-textarea"
              rows="3"
            ></textarea>
            <div class="char-count">{{ revoltData.description.length || 0 }}/500</div>
          </div>

          <div class="form-group">
            <label for="revoltIcon">Revolt Icon (Optional)</label>
            <div class="icon-upload">
              <div class="icon-preview" *ngIf="iconPreview">
                <img [src]="iconPreview" alt="Icon preview" />
              </div>
              <div class="icon-placeholder" *ngIf="!iconPreview">
                <svg width="48" height="48" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <input
                type="file"
                id="revoltIcon"
                name="revoltIcon"
                (change)="onIconChange($event)"
                accept="image/*"
                class="file-input"
              />
              <label for="revoltIcon" class="file-label">
                {{ iconPreview ? 'Change Icon' : 'Upload Icon' }}
              </label>
            </div>
            <div class="file-info">PNG, JPG, or GIF. Max 8MB.</div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                [(ngModel)]="revoltData.isPublic"
                name="isPublic"
              />
              <span class="checkmark"></span>
              Make this revolt public
            </label>
            <div class="checkbox-description">
              Public revolts can be discovered by anyone
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary"
              [disabled]="!revoltForm.valid || isCreating"
            >
              <span *ngIf="isCreating" class="spinner"></span>
              {{ isCreating ? 'Creating...' : 'Create Revolt' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @import '../../styles/variables';
    @import '../../styles/mixins';

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .modal-content {
      background: #2f3136;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #40444b;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #dcddde;
      }

      .close-btn {
        background: none;
        border: none;
        color: #72767d;
        font-size: 24px;
        line-height: 1;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.1s ease;
        cursor: pointer;

        &:hover {
          background: #40444b;
          color: #dcddde;
        }
      }
    }

    form {
      padding: 16px;
    }

    .form-group {
      margin-bottom: 16px;

      label {
        display: block;
        font-weight: 600;
        color: #dcddde;
        margin-bottom: 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-input,
      .form-textarea {
        width: 100%;
        background: #202225;
        border: 1px solid #40444b;
        border-radius: 6px;
        padding: 12px;
        color: #dcddde;
        font-size: 14px;
        transition: all 0.1s ease;

        &:focus {
          outline: none;
          border-color: #5865f2;
          box-shadow: 0 0 0 2px rgba(88, 101, 242, 0.2);
        }

        &::placeholder {
          color: #72767d;
        }
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
      }

      .char-count {
        text-align: right;
        font-size: 10px;
        color: #72767d;
        margin-top: 4px;
      }
    }

    .icon-upload {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px dashed #40444b;
      border-radius: 8px;
      transition: all 0.1s ease;

      &:hover {
        border-color: #5865f2;
        background: rgba(88, 101, 242, 0.05);
      }

      .icon-preview {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #40444b;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .icon-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #202225;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #72767d;
        border: 2px solid #40444b;
      }

      .file-input {
        display: none;
      }

      .file-label {
        background: none;
        border: none;
        background: #5865f2;
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.1s ease;

        &:hover {
          background: #4752c4;
        }
      }

      .file-info {
        font-size: 10px;
        color: #72767d;
        text-align: center;
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
      color: #dcddde;

      input[type="checkbox"] {
        display: none;
      }

      .checkmark {
        width: 20px;
        height: 20px;
        border: 2px solid #40444b;
        border-radius: 4px;
        position: relative;
        transition: all 0.1s ease;

        &::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid #ffffff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          opacity: 0;
          transition: opacity 0.1s ease;
        }
      }

      input[type="checkbox"]:checked + .checkmark {
        background: #5865f2;
        border-color: #5865f2;

        &::after {
          opacity: 1;
        }
      }
    }

    .checkbox-description {
      font-size: 12px;
      color: #72767d;
      margin-top: 4px;
      margin-left: 32px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #40444b;

      .btn {
        background: none;
        border: none;
        padding: 12px 16px;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.1s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 120px;
        justify-content: center;
        cursor: pointer;

        &.btn-secondary {
          background: #202225;
          color: #dcddde;
          border: 1px solid #40444b;

          &:hover {
            background: #40444b;
          }
        }

        &.btn-primary {
          background: #5865f2;
          color: #ffffff;

          &:hover:not(:disabled) {
            background: #4752c4;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    }
  `]
})
export class CreateRevoltModalComponent implements OnInit, OnDestroy {
  @Output() modalClosed = new EventEmitter<void>();
  @Output() revoltCreated = new EventEmitter<any>();

  revoltData = {
    name: '',
    description: '',
    icon: null as File | null,
    isPublic: false
  };

  iconPreview: string | null = null;
  isCreating = false;
  currentUser$: Observable<User | null>;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Focus on name input when modal opens
    setTimeout(() => {
      const nameInput = document.getElementById('revoltName') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onIconChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validate file size (8MB max)
      if (file.size > 8 * 1024 * 1024) {
        alert('File size must be less than 8MB');
        input.value = '';
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        input.value = '';
        return;
      }

      this.revoltData.icon = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.iconPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  createRevolt(): void {
    if (this.isCreating) return;

    this.isCreating = true;

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', this.revoltData.name);
    formData.append('description', this.revoltData.description || '');
    formData.append('isPublic', this.revoltData.isPublic.toString());
    
    if (this.revoltData.icon) {
      formData.append('icon', this.revoltData.icon);
    }

    // Dispatch action to create revolt
    this.store.dispatch(RevNetActions.createRevolt({ revoltData: formData }));

    // Simulate API call for now
    setTimeout(() => {
      const newRevolt = {
        id: `revolt-${Date.now()}`,
        name: this.revoltData.name,
        description: this.revoltData.description,
        icon: this.iconPreview,
        isPublic: this.revoltData.isPublic,
        memberCount: 1,
        owner: true,
        createdAt: new Date().toISOString()
      };

      this.revoltCreated.emit(newRevolt);
      this.closeModal();
    }, 1500);
  }

  closeModal(): void {
    this.modalClosed.emit();
  }
}
