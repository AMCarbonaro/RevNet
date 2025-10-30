import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectCurrentUser } from '../../store/selectors/revnet.selectors';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { User, Message } from '../../store/models/revnet.models';
import { MessageItemComponent } from '../message-item/message-item.component';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageItemComponent],
  template: `
    <div class="message-thread" *ngIf="isOpen">
      <div class="thread-header">
        <div class="thread-info">
          <svg class="thread-icon" width="16" height="16" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span class="thread-title">Thread</span>
          <span class="thread-count">{{ threadMessages.length }} replies</span>
        </div>
        <button class="close-btn" (click)="closeThread()">×</button>
      </div>

      <div class="thread-content">
        <!-- Original Message -->
        <div class="original-message">
          <app-message-item [message]="originalMessage"></app-message-item>
        </div>

        <!-- Thread Messages -->
        <div class="thread-messages">
          <app-message-item
            *ngFor="let message of threadMessages"
            [message]="message">
          </app-message-item>
        </div>

        <!-- Thread Input -->
        <div class="thread-input">
          <div class="input-container">
            <input
              type="text"
              [(ngModel)]="threadMessageInput"
              (keydown.enter)="sendThreadMessage()"
              placeholder="Reply to thread..."
              class="thread-input-field">
            <button
              class="send-btn"
              [disabled]="!threadMessageInput.trim()"
              (click)="sendThreadMessage()">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './message-thread.component.scss'
})
export class MessageThreadComponent implements OnInit, OnDestroy {
  @Input() originalMessage!: Message;
  @Input() isOpen = false;
  @Output() threadClosed = new EventEmitter<void>();

  threadMessages: Message[] = [];
  threadMessageInput = '';
  currentUser$: Observable<User | null>;
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Load thread messages when opened
    if (this.isOpen && this.originalMessage) {
      this.loadThreadMessages();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadThreadMessages(): void {
    // In a real app, this would load from the API
    // For now, we'll use mock data
    this.threadMessages = [
      {
        id: 'thread1',
        channel_id: this.originalMessage?.channel_id || '',
        author: {
          id: 'user2',
          username: 'TestUser',
          discriminator: '0002',
          avatar: null,
          status: 'online',
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          bot: false,
          system: false,
          mfa_enabled: false,
          banner: null,
          accent_color: null,
          locale: 'en-US',
          verified: false,
          email: null,
          flags: 0,
          premium_type: 0,
          public_flags: 0
        },
        content: 'This is a reply in the thread!',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        edited_timestamp: null,
        tts: false,
        mention_everyone: false,
        mentions: [],
        mention_roles: [],
        mention_channels: null,
        attachments: [],
        embeds: [],
        reactions: [],
        nonce: null,
        pinned: false,
        webhook_id: null,
        type: 0,
        activity: null,
        application: null,
        application_id: null,
        message_reference: null,
        flags: 0,
        referenced_message: null,
        interaction: null,
        thread: null,
        components: [],
        sticker_items: [],
        stickers: [],
        position: null
      }
    ];
  }

  sendThreadMessage(): void {
    if (!this.threadMessageInput.trim() || !this.originalMessage) return;

    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        const newMessage: Message = {
          id: `thread-${Date.now()}`,
          channel_id: this.originalMessage!.channel_id,
          author: {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            status: user.status || 'online',
            createdAt: user.createdAt || new Date().toISOString(),
            lastActive: user.lastActive || new Date().toISOString(),
            bot: user.bot,
            system: user.system,
            mfa_enabled: user.mfa_enabled,
            banner: user.banner,
            accent_color: user.accent_color,
            locale: user.locale,
            verified: user.verified,
            email: user.email,
            flags: user.flags,
            premium_type: user.premium_type,
            public_flags: user.public_flags
          },
          content: this.threadMessageInput.trim(),
          timestamp: new Date().toISOString(),
          edited_timestamp: null,
          tts: false,
          mention_everyone: false,
          mentions: [],
          mention_roles: [],
          mention_channels: null,
          attachments: [],
          embeds: [],
          reactions: [],
          nonce: null,
          pinned: false,
          webhook_id: null,
          type: 0,
          activity: null,
          application: null,
          application_id: null,
          message_reference: {
            message_id: this.originalMessage!.id,
            channel_id: this.originalMessage!.channel_id,
            guild_id: null
          },
          flags: 0,
          referenced_message: null,
          interaction: null,
          thread: null,
          components: [],
          sticker_items: [],
          stickers: [],
          position: null
        };

        this.threadMessages.push(newMessage);
        this.threadMessageInput = '';

        // Dispatch action to store
        this.store.dispatch(RevNetActions.sendMessage({
          channelId: this.originalMessage!.channel_id,
          content: newMessage.content
        }));
      }
    });
  }

  closeThread(): void {
    this.isOpen = false;
    this.threadClosed.emit();
  }
}
