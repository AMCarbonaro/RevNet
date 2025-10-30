import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil, combineLatest } from 'rxjs';
// Simplified message list without virtual scrolling for now
import { MessageItemComponent } from '../message-item/message-item.component';
import { Message } from '../../store/models/revnet.models';

@Component({
  selector: 'app-optimized-message-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    MessageItemComponent
  ],
  template: `
    <div class="message-list-container">
      <div class="message-list" [style.height]="containerHeight + 'px'">
        <div 
          *ngFor="let item of messageItems; trackBy: trackByMessageId; let i = index"
          class="message-item"
          [style.height]="messageHeight + 'px'"
        >
          <app-message-item
            [message]="item.message"
            (messageDeleted)="onMessageDeleted($event)"
            (messageEdited)="onMessageEdited($event)"
          ></app-message-item>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .message-list-container {
      height: 100%;
      overflow: hidden;
    }
  `]
})
export class OptimizedMessageListComponent implements OnInit, OnDestroy {
  @Input() messages$!: Observable<Message[]>;
  @Input() containerHeight: number = 400;
  @Input() messageHeight: number = 60;

  @Output() messageDeleted = new EventEmitter<string>();
  @Output() messageEdited = new EventEmitter<{ id: string; content: string }>();
  @Output() loadMoreMessages = new EventEmitter<void>();

  messageItems: { id: string; message: Message; height: number }[] = [];
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.messages$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(messages => {
      this.messageItems = messages.map(message => ({
        id: message.id,
        message: message,
        height: this.messageHeight
      }));
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByMessageId(index: number, item: { id: string; message: Message; height: number }): string {
    return item.id;
  }

  onMessageClick(item: { id: string; message: Message; height: number }): void {
    // Handle message click if needed
  }

  onMessageDeleted(messageId: string): void {
    this.messageDeleted.emit(messageId);
  }

  onMessageEdited(event: { id: string; content: string }): void {
    this.messageEdited.emit(event);
  }

  onScrollEnd(): void {
    this.loadMoreMessages.emit();
  }
}
