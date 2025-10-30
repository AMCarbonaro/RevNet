import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { User, Message, Reaction } from '../../store/models/revnet.models';
import { MessageReactionsComponent } from '../message-reactions/message-reactions.component';
import { MessageEditorComponent } from '../message-editor/message-editor.component';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule, MessageReactionsComponent, MessageEditorComponent],
  template: `
    <div 
      class="message-item"
      [class.editing]="isEditing"
      (mouseenter)="showActions = true"
      (mouseleave)="showActions = false">
      
      <!-- Message Content -->
      <div class="message-content" *ngIf="!isEditing">
        <div class="message-avatar">{{ (message.author?.username || 'Unknown').charAt(0).toUpperCase() }}</div>
        <div class="message-body">
          <div class="message-header">
            <span class="username">{{ message.author?.username || 'Unknown User' }}</span>
            <span class="discriminator">#{{ message.author?.discriminator || '0000' }}</span>
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
            <span class="edited" *ngIf="message.edited_timestamp">(edited)</span>
          </div>
          <div class="message-text" [innerHTML]="formatMessageContent(message.content)"></div>
          
          <!-- Message Reactions -->
          <app-message-reactions
            [messageId]="message.id"
            [reactions]="message.reactions || []"
            (reactionToggled)="onReactionToggled($event)">
          </app-message-reactions>
        </div>
      </div>

      <!-- Message Editor -->
      <app-message-editor
        *ngIf="isEditing"
        [message]="message"
        [isEditing]="isEditing"
        (editSaved)="onEditSaved($event)"
        (editCancelled)="onEditCancelled()">
      </app-message-editor>

      <!-- Message Actions -->
      <div class="message-actions" *ngIf="showActions && !isEditing">
        <button 
          class="action-btn"
          (click)="startEdit()"
          *ngIf="canEdit"
          title="Edit Message">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        
        <button 
          class="action-btn"
          (click)="addReaction()"
          title="Add Reaction">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
        
        <button 
          class="action-btn"
          (click)="togglePin()"
          [title]="message.pinned ? 'Unpin Message' : 'Pin Message'">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path [attr.d]="message.pinned ? 'M16 4v12l-4-2-4 2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2z' : 'M16 4v12l-4-2-4 2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2z'"/>
          </svg>
        </button>
        
        <button 
          class="action-btn danger"
          (click)="deleteMessage()"
          *ngIf="canDelete"
          title="Delete Message">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styleUrl: './message-item.component.scss'
})
export class MessageItemComponent implements OnInit, OnDestroy {
  @Input() message!: Message;
  @Output() messageDeleted = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<{ id: string; content: string }>();

  showActions = false;
  isEditing = false;
  canEdit = false;
  canDelete = false;
  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user && this.message && this.message.author) {
        this.canEdit = user.id === this.message.author.id;
        this.canDelete = user.id === this.message.author.id; // In real app, check permissions
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startEdit(): void {
    this.isEditing = true;
  }

  onEditSaved(content: string): void {
    this.isEditing = false;
    this.messageEdited.emit({ id: this.message.id, content });
  }

  onEditCancelled(): void {
    this.isEditing = false;
  }

  addReaction(): void {
    // This would open an emoji picker
    console.log('Add reaction clicked');
  }

  togglePin(): void {
    if (this.message.pinned) {
      this.store.dispatch(RevNetActions.unpinMessage({ messageId: this.message.id }));
    } else {
      this.store.dispatch(RevNetActions.pinMessage({ messageId: this.message.id }));
    }
  }

  deleteMessage(): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.store.dispatch(RevNetActions.deleteMessage({ messageId: this.message.id }));
      this.messageDeleted.emit(this.message.id);
    }
  }

  onReactionToggled(event: { emoji: string; added: boolean }): void {
    console.log('Reaction toggled:', event);
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString();
  }

  formatMessageContent(content: string): string {
    // Basic formatting - in a real app, you'd use a proper markdown parser
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
}
