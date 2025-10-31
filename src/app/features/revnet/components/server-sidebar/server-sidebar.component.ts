import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Server } from '../../store/models/revnet.models';

@Component({
  selector: 'app-server-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './server-sidebar.component.html',
  styleUrls: ['./server-sidebar.component.scss']
})
export class ServerSidebarComponent {
  @Input() servers: Server[] = [];
  @Input() selectedServerId: string | null = null;
  @Input() mobileOpen: boolean = false;
  @Output() serverSelected = new EventEmitter<string>();

  onServerClick(serverId: string): void {
    this.serverSelected.emit(serverId);
  }

  getServerInitials(name: string): string {
    return name.charAt(0).toUpperCase();
  }
}
