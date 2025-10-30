import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { 
  selectFriends, 
  selectFriendRequests, 
  selectOnlineFriends,
  selectPendingFriendRequests 
} from '../../store/selectors/revnet.selectors';
import { Friend, FriendRequest } from '../../store/models/revnet.models';

@Component({
  selector: 'app-friends-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="friends-list" *ngIf="isVisible">
      <div class="friends-header">
        <h3>Friends</h3>
        <button class="add-friend-btn" (click)="showAddFriendForm = !showAddFriendForm">
          <i class="icon-plus"></i>
        </button>
      </div>

      <!-- Add Friend Form -->
      <div class="add-friend-form" *ngIf="showAddFriendForm">
        <input 
          type="text" 
          [(ngModel)]="friendUsername" 
          placeholder="Enter username"
          (keyup.enter)="sendFriendRequest()"
        />
        <button (click)="sendFriendRequest()" [disabled]="!friendUsername.trim()">
          Send Request
        </button>
        <button (click)="cancelAddFriend()">Cancel</button>
      </div>

      <!-- Pending Friend Requests -->
      <div class="friend-requests" *ngIf="(pendingRequests$ | async)?.length && (pendingRequests$ | async)!.length > 0">
        <h4>Pending Requests</h4>
        <ng-container *ngFor="let request of pendingRequests$ | async">
          <div 
            *ngIf="request"
            class="friend-request-item"
          >
          <div class="request-info">
            <div class="request-avatar">
              {{ (request.user?.username || '').charAt(0).toUpperCase() || '?' }}
            </div>
            <div class="request-details">
              <div class="request-username">{{ request.user?.username || 'Unknown User' }}</div>
              <div class="request-status">Wants to be friends</div>
            </div>
          </div>
          <div class="request-actions">
            <button class="accept-btn" (click)="acceptFriendRequest(request.id)">
              Accept
            </button>
            <button class="decline-btn" (click)="declineFriendRequest(request.id)">
              Decline
            </button>
          </div>
          </div>
        </ng-container>
      </div>

      <!-- Online Friends -->
      <div class="online-friends" *ngIf="(onlineFriends$ | async)?.length && (onlineFriends$ | async)!.length > 0">
        <h4>Online ({{ (onlineFriends$ | async)?.length }})</h4>
        <ng-container *ngFor="let friend of onlineFriends$ | async">
          <div 
            *ngIf="friend"
            class="friend-item online"
            (click)="startDM(friend.friend?.id || '')"
          >
          <div class="friend-avatar">
            <div class="avatar-circle">
              {{ (friend.friend?.username || '').charAt(0).toUpperCase() || '?' }}
            </div>
            <div class="online-indicator"></div>
          </div>
          <div class="friend-info">
            <div class="friend-username">{{ friend.friend?.username || 'Unknown User' }}</div>
            <div class="friend-status">{{ friend.friend?.status || 'offline' }}</div>
          </div>
          <div class="friend-actions">
            <button class="message-btn" (click)="startDM(friend.friend?.id || '')" title="Message">
              <i class="icon-message"></i>
            </button>
            <button class="more-btn" (click)="showFriendOptions(friend)" title="More">
              <i class="icon-more"></i>
            </button>
          </div>
          </div>
        </ng-container>
      </div>

      <!-- All Friends -->
      <div class="all-friends" *ngIf="(friends$ | async)?.length && (friends$ | async)!.length > 0">
        <h4>All Friends ({{ (friends$ | async)?.length }})</h4>
        <ng-container *ngFor="let friend of friends$ | async">
          <div 
            *ngIf="friend"
            class="friend-item"
            [class.online]="friend.friend?.status === 'online'"
          >
          <div class="friend-avatar">
            <div class="avatar-circle">
              {{ (friend.friend?.username || '').charAt(0).toUpperCase() || '?' }}
            </div>
            <div class="online-indicator" *ngIf="friend.friend?.status === 'online'"></div>
          </div>
          <div class="friend-info">
            <div class="friend-username">{{ friend.friend?.username || 'Unknown User' }}</div>
            <div class="friend-status">{{ friend.friend?.status || 'offline' }}</div>
          </div>
          <div class="friend-actions">
            <button class="message-btn" (click)="startDM(friend.friend?.id || '')" title="Message">
              <i class="icon-message"></i>
            </button>
            <button class="more-btn" (click)="showFriendOptions(friend)" title="More">
              <i class="icon-more"></i>
            </button>
          </div>
          </div>
        </ng-container>
      </div>

      <!-- No Friends State -->
      <div *ngIf="(friends$ | async)?.length === 0 && (pendingRequests$ | async)?.length === 0" class="no-friends">
        <p>No friends yet</p>
        <button class="add-friend-btn" (click)="showAddFriendForm = true">
          Add a friend
        </button>
      </div>
    </div>
  `,
  styleUrl: './friends-list.component.scss'
})
export class FriendsListComponent implements OnInit {
  @Input() isVisible: boolean = true;
  
  friends$: Observable<Friend[]>;
  friendRequests$: Observable<FriendRequest[]>;
  onlineFriends$: Observable<Friend[]>;
  pendingRequests$: Observable<FriendRequest[]>;

  showAddFriendForm = false;
  friendUsername = '';

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    this.friends$ = this.store.select(selectFriends);
    this.friendRequests$ = this.store.select(selectFriendRequests);
    this.onlineFriends$ = this.store.select(selectOnlineFriends);
    this.pendingRequests$ = this.store.select(selectPendingFriendRequests);
  }

  ngOnInit(): void {
    this.store.dispatch(RevNetActions.loadFriends());
    this.store.dispatch(RevNetActions.loadFriendRequests());
  }

  sendFriendRequest(): void {
    if (this.friendUsername.trim()) {
      this.store.dispatch(RevNetActions.sendFriendRequest({ 
        friendUsername: this.friendUsername.trim() 
      }));
      this.friendUsername = '';
      this.showAddFriendForm = false;
    }
  }

  cancelAddFriend(): void {
    this.friendUsername = '';
    this.showAddFriendForm = false;
  }

  acceptFriendRequest(requestId: string): void {
    this.store.dispatch(RevNetActions.acceptFriendRequest({ requestId }));
  }

  declineFriendRequest(requestId: string): void {
    this.store.dispatch(RevNetActions.declineFriendRequest({ requestId }));
  }

  startDM(userId: string): void {
    if (userId) {
      this.store.dispatch(RevNetActions.createDMChannel({ recipientId: userId }));
    }
  }

  showFriendOptions(friend: Friend): void {
    // TODO: Show friend options menu (remove, block, etc.)
    console.log('Show options for friend:', friend.friend?.username || 'Unknown User');
  }
}
