import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { User } from '../../store/models/revnet.models';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail?: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload">
      <!-- Upload Area -->
      <div 
        class="upload-area"
        [class.drag-over]="isDragOver"
        [class.uploading]="uploadingFiles.length > 0"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <div class="upload-content" *ngIf="!isUploading">
          <svg class="upload-icon" width="48" height="48" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          <div class="upload-text">
            <h3>Drop files here to upload</h3>
            <p>or click to browse files</p>
          </div>
        </div>

        <!-- Upload Progress -->
        <div class="upload-progress" *ngIf="isUploading">
          <div class="progress-header">
            <span class="progress-title">Uploading {{ uploadingFiles.length }} file(s)</span>
            <button class="cancel-btn" (click)="cancelAllUploads()">Cancel All</button>
          </div>
          <div class="progress-list">
            <div 
              *ngFor="let file of uploadingFiles" 
              class="progress-item"
              [class.error]="file.status === 'error'">
              <div class="file-info">
                <div class="file-icon">
                  <svg *ngIf="isImage(file)" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                  </svg>
                  <svg *ngIf="!isImage(file)" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div class="file-details">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
              <div class="file-actions">
                <div class="progress-bar" *ngIf="file.status === 'uploading'">
                  <div class="progress-fill" [style.width.%]="file.progress"></div>
                </div>
                <div class="file-status" *ngIf="file.status === 'completed'">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                </div>
                <div class="file-status error" *ngIf="file.status === 'error'">
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </div>
                <button 
                  class="remove-btn" 
                  (click)="removeFile(file.id)"
                  *ngIf="file.status !== 'uploading'">
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Hidden File Input -->
        <input
          #fileInput
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          (change)="onFileSelect($event)"
          style="display: none;">
      </div>

      <!-- Uploaded Files Preview -->
      <div class="uploaded-files" *ngIf="uploadedFiles.length > 0">
        <div class="files-header">
          <h4>Uploaded Files</h4>
          <button class="clear-btn" (click)="clearAllFiles()">Clear All</button>
        </div>
        <div class="files-grid">
          <div 
            *ngFor="let file of uploadedFiles" 
            class="file-preview"
            [class.image]="isImage(file)">
            <div class="file-thumbnail" *ngIf="isImage(file) && file.thumbnail">
              <img [src]="file.thumbnail" [alt]="file.name">
            </div>
            <div class="file-icon-large" *ngIf="!isImage(file) || !file.thumbnail">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
            <button class="remove-file-btn" (click)="removeFile(file.id)">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @Input() maxFileSize: number = 10 * 1024 * 1024; // 10MB
  @Input() maxFiles: number = 10;
  @Input() acceptedTypes: string[] = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar'];
  @Output() filesUploaded = new EventEmitter<UploadedFile[]>();
  @Output() filesChanged = new EventEmitter<UploadedFile[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragOver = false;
  uploadingFiles: UploadedFile[] = [];
  uploadedFiles: UploadedFile[] = [];
  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isUploading(): boolean {
    return this.uploadingFiles.some(file => file.status === 'uploading');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    const validFiles = files.filter(file => this.validateFile(file));
    
    if (validFiles.length === 0) {
      return;
    }

    if (this.uploadedFiles.length + validFiles.length > this.maxFiles) {
      alert(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    validFiles.forEach(file => {
      this.uploadFile(file);
    });
  }

  private validateFile(file: File): boolean {
    if (file.size > this.maxFileSize) {
      alert(`File ${file.name} is too large. Maximum size is ${this.formatFileSize(this.maxFileSize)}`);
      return false;
    }

    const fileType = file.type || `.${file.name.split('.').pop()?.toLowerCase()}`;
    const isAccepted = this.acceptedTypes.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.replace('*', ''));
      }
      return fileType === type;
    });

    if (!isAccepted) {
      alert(`File type ${fileType} is not supported`);
      return false;
    }

    return true;
  }

  private uploadFile(file: File): void {
    const uploadedFile: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      progress: 0,
      status: 'uploading'
    };

    this.uploadingFiles.push(uploadedFile);

    // Simulate upload progress
    this.simulateUpload(uploadedFile, file);
  }

  private simulateUpload(uploadedFile: UploadedFile, file: File): void {
    const interval = setInterval(() => {
      uploadedFile.progress += Math.random() * 20;
      
      if (uploadedFile.progress >= 100) {
        uploadedFile.progress = 100;
        uploadedFile.status = 'completed';
        uploadedFile.url = URL.createObjectURL(file);
        
        // Generate thumbnail for images
        if (this.isImage(uploadedFile)) {
          this.generateThumbnail(file, uploadedFile);
        }

        // Move to uploaded files
        this.uploadingFiles = this.uploadingFiles.filter(f => f.id !== uploadedFile.id);
        this.uploadedFiles.push(uploadedFile);
        
        this.filesChanged.emit([...this.uploadedFiles]);
        
        clearInterval(interval);
      }
    }, 200);
  }

  private generateThumbnail(file: File, uploadedFile: UploadedFile): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedFile.thumbnail = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(fileId: string): void {
    this.uploadingFiles = this.uploadingFiles.filter(f => f.id !== fileId);
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
    this.filesChanged.emit([...this.uploadedFiles]);
  }

  clearAllFiles(): void {
    this.uploadingFiles = [];
    this.uploadedFiles = [];
    this.filesChanged.emit([]);
  }

  cancelAllUploads(): void {
    this.uploadingFiles = [];
  }

  isImage(file: UploadedFile): boolean {
    return file.type.startsWith('image/');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
