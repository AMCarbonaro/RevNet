import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { User, Message } from '../../store/models/revnet.models';

@Component({
  selector: 'app-message-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="message-editor" *ngIf="isEditing">
      <div class="editor-content">
        <textarea
          #messageTextarea
          [(ngModel)]="editedContent"
          (keydown.enter)="onKeyDown($event)"
          (keydown.escape)="cancelEdit()"
          placeholder="Edit message..."
          class="editor-textarea"
          rows="3">
        </textarea>
        <div class="editor-footer">
          <div class="editor-hint">
            Press <kbd>Enter</kbd> to save, <kbd>Escape</kbd> to cancel
          </div>
          <div class="editor-actions">
            <button 
              class="btn btn-secondary"
              (click)="cancelEdit()">
              Cancel
            </button>
            <button 
              class="btn btn-primary"
              [disabled]="!editedContent.trim() || editedContent === originalContent"
              (click)="saveEdit()">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './message-editor.component.scss'
})
export class MessageEditorComponent implements OnInit, OnDestroy {
  @Input() message: Message | null = null;
  @Input() isEditing = false;
  @Output() editSaved = new EventEmitter<string>();
  @Output() editCancelled = new EventEmitter<void>();

  @ViewChild('messageTextarea') textarea!: ElementRef<HTMLTextAreaElement>;

  editedContent = '';
  originalContent = '';
  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    if (this.message) {
      this.originalContent = this.message.content;
      this.editedContent = this.message.content;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if (this.isEditing && this.textarea) {
      // Focus and select all text
      setTimeout(() => {
        this.textarea.nativeElement.focus();
        this.textarea.nativeElement.select();
      }, 0);
    }
  }

  onKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      if (keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
        // Ctrl/Cmd + Enter to save
        keyboardEvent.preventDefault();
        this.saveEdit();
      } else if (!keyboardEvent.shiftKey) {
        // Enter to save (without Shift)
        keyboardEvent.preventDefault();
        this.saveEdit();
      }
      // Shift + Enter allows new line
    }
  }

  saveEdit(): void {
    if (!this.message || !this.editedContent.trim() || this.editedContent === this.originalContent) {
      return;
    }

    // Dispatch edit action
    this.store.dispatch(RevNetActions.editMessage({
      messageId: this.message.id,
      content: this.editedContent.trim()
    }));

    // Emit success event
    this.editSaved.emit(this.editedContent.trim());
  }

  cancelEdit(): void {
    this.editedContent = this.originalContent;
    this.editCancelled.emit();
  }

  // Public method to start editing
  startEdit(): void {
    this.isEditing = true;
    this.originalContent = this.message?.content || '';
    this.editedContent = this.originalContent;
    
    // Focus textarea after view update
    setTimeout(() => {
      if (this.textarea) {
        this.textarea.nativeElement.focus();
        this.textarea.nativeElement.select();
      }
    }, 0);
  }
}
