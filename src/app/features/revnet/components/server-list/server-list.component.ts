import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { RevNetActions } from '../../store/actions/revnet.actions';
import { selectServers, selectSelectedServerId, selectDMChannels } from '../../store/selectors/revnet.selectors';
import { Server } from '../../store/models/revnet.models';
import { CreateRevoltModalComponent } from '../create-revolt-modal/create-revolt-modal.component';
import { UnreadBadgeComponent } from '../unread-badge/unread-badge.component';
import { ServerDiscoveryComponent } from '../server-discovery/server-discovery.component';

@Component({
  selector: 'app-server-list',
  standalone: true,
  imports: [CommonModule, CreateRevoltModalComponent, UnreadBadgeComponent, ServerDiscoveryComponent],
  template: `
    <div class="server-list">
      <div class="server-list__header">
        <h2>RevNet</h2>
      </div>
      <div class="server-list__content">
        <!-- Direct Messages Home Button -->
        <div 
          class="dm-home-btn"
          [class.active]="(selectedServerId$ | async) === null"
          (click)="selectDMHome()"
          title="Direct Messages">
          <div class="dm-home-icon">
            <i class="icon-message"></i>
          </div>
          <app-unread-badge 
            [count]="getUnreadDMCount()"
            type="dm"
            size="small">
          </app-unread-badge>
        </div>

        <div 
          *ngFor="let server of servers$ | async" 
          class="server-item"
          [class.active]="(selectedServerId$ | async) === server.id"
          (click)="selectServer(server.id)"
          [title]="server.name">
          <div class="server-content">
            {{ server.name.charAt(0).toUpperCase() }}
          </div>
          <app-unread-badge 
            [serverId]="server.id"
            type="server"
            size="small">
          </app-unread-badge>
        </div>
        
        <!-- Create revolt button -->
        <div class="create-revolt-btn" (click)="showCreateModal = true">
          <span class="create-revolt-icon">+</span>
        </div>
      </div>
      <div class="server-list__footer">
        <button class="discover-btn" (click)="showDiscovery = true" title="Discover Servers">
          <i class="icon-search"></i>
        </button>
        <button class="menu-btn" (click)="openMobileMenu()" title="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>
      
      <!-- Create Revolt Modal -->
      <app-create-revolt-modal
        *ngIf="showCreateModal"
        (modalClosed)="showCreateModal = false"
        (revoltCreated)="onRevoltCreated($event)">
      </app-create-revolt-modal>

      <!-- Server Discovery Modal -->
      <app-server-discovery
        *ngIf="showDiscovery"
        (close)="showDiscovery = false">
      </app-server-discovery>
    </div>
  `,
  styleUrl: './server-list.component.scss'
})
export class ServerListComponent implements OnInit {
  servers$: Observable<Server[]>;
  selectedServerId$: Observable<string | null>;
  dmChannels$: Observable<any[]>;
  showCreateModal = false;
  showDiscovery = false;
  private unreadDMCount = 0; // Store the unread count as a property

  constructor(private store: Store) {
    this.servers$ = this.store.select(selectServers);
    this.selectedServerId$ = this.store.select(selectSelectedServerId);
    this.dmChannels$ = this.store.select(selectDMChannels);
  }

  openMobileMenu(): void {
    // Emit a global event by toggling a class on body; RevNetLayout binds to store state for menu.
    // Simpler: dispatch a DOM CustomEvent that layout can listen for, or directly set a flag via window.
    // We'll use a CustomEvent for now; RevNetLayout listens to it to open the menu.
    document.dispatchEvent(new CustomEvent('revnet-open-mobile-menu'));
  }

  ngOnInit(): void {
    // Load servers when component initializes
    this.store.dispatch(RevNetActions.loadServers());
    this.store.dispatch(RevNetActions.loadDMChannels());
    
    // Set a stable unread count
    this.unreadDMCount = 2; // Mock unread count - stable value
  }

  selectServer(serverId: string): void {
    this.store.dispatch(RevNetActions.selectServer({ serverId }));
    this.store.dispatch(RevNetActions.loadChannels({ serverId }));
  }

  selectDMHome(): void {
    this.store.dispatch(RevNetActions.selectServer({ serverId: null }));
  }

  getUnreadDMCount(): number {
    // Return the stable unread count
    return this.unreadDMCount;
  }

  onRevoltCreated(revolt: any): void {
    // Add the new revolt to the store
    const newServer: Server = {
      id: revolt.id,
      name: revolt.name,
      icon: revolt.icon,
      description: revolt.description,
      owner: revolt.owner,
      permissions: 0,
      features: []
    };
    
    this.store.dispatch(RevNetActions.createRevoltSuccess({ revolt: newServer }));
    this.showCreateModal = false;
    
    // Select the newly created revolt
    this.selectServer(revolt.id);
  }
}
