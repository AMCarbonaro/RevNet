import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoDataService } from '../../../../core/services/demo-data.service';
import { Message } from '../../../../features/revnet/store/models/revnet.models';
import { MessageItemComponent } from '../../../../features/revnet/components/message-item/message-item.component';

@Component({
  selector: 'app-chat-showcase',
  standalone: true,
  imports: [CommonModule, MessageItemComponent],
  templateUrl: './chat-showcase.component.html',
  styleUrls: ['./chat-showcase.component.scss']
})
export class ChatShowcaseComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  isTyping = false;
  typingUsers: string[] = [];
  private messageInterval: any;
  private typingInterval: any;

  constructor(private demoDataService: DemoDataService) {}

  ngOnInit(): void {
    // Load initial demo messages
    this.messages = this.demoDataService.getDemoMessages('demo-channel-1');
    
    // Start auto-animating messages
    this.startMessageAnimation();
    this.startTypingAnimation();
  }

  ngOnDestroy(): void {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private startMessageAnimation(): void {
    let messageIndex = this.messages.length;
    const demoMessages = this.demoDataService.getDemoMessages('demo-channel-2');
    
    // Add new messages every 5 seconds
    this.messageInterval = setInterval(() => {
      if (messageIndex < demoMessages.length) {
        // Simulate typing indicator first
        this.isTyping = true;
        this.typingUsers = [demoMessages[messageIndex].author?.username || 'User'];
        
        setTimeout(() => {
          this.messages = [...this.messages, demoMessages[messageIndex]];
          this.isTyping = false;
          this.typingUsers = [];
          messageIndex++;
          
          // Reset after all messages shown
          if (messageIndex >= demoMessages.length) {
            messageIndex = 0;
            setTimeout(() => {
              this.messages = this.demoDataService.getDemoMessages('demo-channel-1');
            }, 3000);
          }
        }, 1500);
      }
    }, 5000);
  }

  private startTypingAnimation(): void {
    // Show typing indicators randomly
    this.typingInterval = setInterval(() => {
      if (Math.random() > 0.7 && !this.isTyping) {
        const users = ['Organizer', 'Activist', 'Supporter'];
        this.typingUsers = [users[Math.floor(Math.random() * users.length)]];
        this.isTyping = true;
        
        setTimeout(() => {
          this.typingUsers = [];
          this.isTyping = false;
        }, 2000);
      }
    }, 4000);
  }

  onReactionToggled(event: any): void {
    // Demo mode - reactions are visual only
    console.log('Reaction toggled:', event);
  }
}

