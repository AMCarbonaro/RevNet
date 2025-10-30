import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { User, Reaction } from '../../store/models/revnet.models';

@Component({
  selector: 'app-message-reactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-reactions" *ngIf="reactions.length > 0">
      <div 
        *ngFor="let reaction of reactions" 
        class="reaction"
        [class.me]="reaction.me"
        (click)="toggleReaction(reaction.emoji.name)">
        <span class="emoji">{{ reaction.emoji.name }}</span>
        <span class="count">{{ reaction.count }}</span>
      </div>
      <button 
        class="add-reaction-btn"
        (click)="showEmojiPicker = !showEmojiPicker"
        title="Add Reaction">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </button>
    </div>

    <!-- Emoji Picker -->
    <div class="emoji-picker" *ngIf="showEmojiPicker" (clickOutside)="showEmojiPicker = false">
      <div class="emoji-picker-header">
        <h4>Add Reaction</h4>
        <button class="close-btn" (click)="showEmojiPicker = false">×</button>
      </div>
      <div class="emoji-grid">
        <button 
          *ngFor="let emoji of commonEmojis" 
          class="emoji-btn"
          (click)="addReaction(emoji)">
          {{ emoji }}
        </button>
      </div>
    </div>
  `,
  styleUrl: './message-reactions.component.scss'
})
export class MessageReactionsComponent implements OnInit, OnDestroy {
  @Input() messageId: string = '';
  @Input() reactions: Reaction[] = [];
  @Output() reactionToggled = new EventEmitter<{ emoji: string; added: boolean }>();

  showEmojiPicker = false;
  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  commonEmojis = [
    '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉',
    '🔥', '💯', '👀', '🤔', '😍', '🤯', '💀', '👏'
  ];

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Initialize reactions if not provided
    if (this.reactions.length === 0) {
      this.reactions = [];
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleReaction(emoji: string): void {
    const existingReaction = this.reactions.find(r => r.emoji.name === emoji);
    
    if (existingReaction) {
      if (existingReaction.me) {
        // Remove reaction
        this.removeReaction(emoji);
      } else {
        // Add user to reaction
        this.addUserToReaction(emoji);
      }
    } else {
      // Add new reaction
      this.addReaction(emoji);
    }
  }

  addReaction(emoji: string): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        const newReaction: Reaction = {
          emoji: {
            id: null,
            name: emoji
          },
          count: 1,
          me: true
        };
        
        this.reactions = [...this.reactions, newReaction];
        this.showEmojiPicker = false;
        this.reactionToggled.emit({ emoji, added: true });
        
        // Dispatch action to store
        this.store.dispatch(RevNetActions.addReaction({
          messageId: this.messageId,
          emoji,
          userId: user.id
        }));
      }
    });
  }

  removeReaction(emoji: string): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        const reactionIndex = this.reactions.findIndex(r => r.emoji.name === emoji);
        if (reactionIndex !== -1) {
          const reaction = this.reactions[reactionIndex];
          
          if (reaction.count === 1) {
            // Remove entire reaction
            this.reactions = this.reactions.filter(r => r.emoji.name !== emoji);
          } else {
            // Decrease count and remove user
            this.reactions[reactionIndex] = {
              ...reaction,
              count: reaction.count - 1,
              me: false
            };
          }
          
          this.reactionToggled.emit({ emoji, added: false });
          
          // Dispatch action to store
          this.store.dispatch(RevNetActions.removeReaction({
            messageId: this.messageId,
            emoji,
            userId: user.id
          }));
        }
      }
    });
  }

  addUserToReaction(emoji: string): void {
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        const reactionIndex = this.reactions.findIndex(r => r.emoji.name === emoji);
        if (reactionIndex !== -1) {
          const reaction = this.reactions[reactionIndex];
          
          this.reactions[reactionIndex] = {
            ...reaction,
            count: reaction.count + 1,
            me: true
          };
          
          this.reactionToggled.emit({ emoji, added: true });
          
          // Dispatch action to store
          this.store.dispatch(RevNetActions.addReaction({
            messageId: this.messageId,
            emoji,
            userId: user.id
          }));
        }
      }
    });
  }
}
