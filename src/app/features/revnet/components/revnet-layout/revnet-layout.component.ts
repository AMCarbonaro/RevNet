import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, takeUntil, Subject } from 'rxjs';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { selectSelectedServerId, selectSelectedChannel, selectSelectedServer } from '../../store/selectors/revnet.selectors';
import { ServerListComponent } from '../server-list/server-list.component';
import { ChannelSidebarComponent } from '../channel-sidebar/channel-sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { MemberListComponent } from '../member-list/member-list.component';
import { DirectMessagesComponent } from '../direct-messages/direct-messages.component';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { PerformanceMonitorComponent } from '../../../../shared/components/performance-monitor/performance-monitor.component';
import { OfflineIndicatorComponent } from '../../../../shared/components/offline-indicator/offline-indicator.component';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';
import { MobileLayoutService, MobilePanel } from '../../services/mobile-layout.service';
import { Server, Channel } from '../../store/models/revnet.models';

@Component({
  selector: 'app-revnet-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ServerListComponent,
    ChannelSidebarComponent,
    ChatAreaComponent,
    MemberListComponent,
    DirectMessagesComponent,
    FriendsListComponent,
    PerformanceMonitorComponent,
    OfflineIndicatorComponent,
    MobileMenuComponent
  ],
  templateUrl: './revnet-layout.component.html',
  styleUrl: './revnet-layout.component.scss'
})
export class RevNetLayoutComponent implements OnInit {
  showMemberList = true; // Toggle this to show/hide member list
  selectedServerId$: Observable<string | null>;
  selectedChannel$: Observable<Channel | null>;
  selectedServer$: Observable<Server | null>;
  
  // Mobile navigation
  activePanel$: Observable<MobilePanel>;
  isMobile$: Observable<boolean>;
  activePanel: MobilePanel = 'servers';
  isMobile = false;
  mobileTitle = 'Servers';
  showMobileMenu = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private mobileLayoutService: MobileLayoutService,
    private cdr: ChangeDetectorRef
  ) {
    this.selectedServerId$ = this.store.select(selectSelectedServerId);
    this.selectedChannel$ = this.store.select(selectSelectedChannel);
    this.selectedServer$ = this.store.select(selectSelectedServer);
    this.activePanel$ = this.mobileLayoutService.activePanel$;
    this.isMobile$ = this.mobileLayoutService.isMobile$;
    
    // Initialize mobile state immediately
    this.isMobile = window.innerWidth <= 768;

    // Listen for menu open events dispatched from inner components (e.g., server list)
    document.addEventListener('revnet-open-mobile-menu', () => {
      this.showMobileMenu = true;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    // Initialize current user
    const currentUser = {
      id: 'user1',
      username: 'CurrentUser',
      discriminator: '0001',
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
    };
    
    this.store.dispatch(RevNetActions.setCurrentUser({ user: currentUser }));
    this.store.dispatch(RevNetActions.loadServers());

    // Subscribe to mobile layout changes
    this.activePanel$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(panel => {
      this.activePanel = panel;
      this.updateMobileTitle();
      this.cdr.markForCheck();
    });

    this.isMobile$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isMobile => {
      this.isMobile = isMobile;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Mobile navigation methods
  navigateBack(): void {
    // In the new mobile layout, back button goes back to channel list
    if (this.selectedChannel$.pipe(takeUntil(this.destroy$))) {
      this.store.dispatch(RevNetActions.selectChannel({ channelId: null }));
    }
  }

  canGoBack(): boolean {
    // Can go back if a channel is selected
    let canGoBack = false;
    this.selectedChannel$.pipe(takeUntil(this.destroy$)).subscribe(channel => {
      canGoBack = channel !== null;
    });
    return canGoBack;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  showServers(): void {
    this.mobileLayoutService.showServers();
  }

  showChannels(): void {
    this.mobileLayoutService.showChannels();
  }

  showChat(): void {
    this.mobileLayoutService.showChat();
  }

  showMembers(): void {
    this.mobileLayoutService.showMembers();
  }


  // Swipe gesture handlers
  onSwipeLeft(): void {
    if (this.isMobile) {
      switch (this.activePanel) {
        case 'servers':
          // Can't go left from servers
          break;
        case 'channels':
          this.showServers();
          break;
        case 'chat':
          this.showChannels();
          break;
        case 'members':
          this.showChat();
          break;
      }
    }
  }

  onSwipeRight(): void {
    if (this.isMobile) {
      switch (this.activePanel) {
        case 'servers':
          // Can't go right from servers
          break;
        case 'channels':
          // Can't go right from channels
          break;
        case 'chat':
          this.showMembers();
          break;
        case 'members':
          // Can't go right from members
          break;
      }
    }
  }

  private updateMobileTitle(): void {
    // For mobile, show server name or "Direct Messages"
    this.selectedServer$.pipe(takeUntil(this.destroy$)).subscribe(server => {
      if (server) {
        this.mobileTitle = server.name;
      } else {
        this.mobileTitle = 'Direct Messages';
      }
    });
  }
}
