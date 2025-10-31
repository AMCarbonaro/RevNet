import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ServerDiscoveryService, Server, Channel } from '../../revnet/services/server-discovery.service';

@Component({
  selector: 'app-revolt-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revolt-landing.component.html',
  styleUrls: ['./revolt-landing.component.scss']
})
export class RevoltLandingComponent implements OnInit, OnDestroy {
  server: Server | null = null;
  isLoading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serverDiscoveryService: ServerDiscoveryService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const serverId = params['id'];
        const inviteCode = params['code'];
        
        if (serverId) {
          this.loadServerById(serverId);
        } else if (inviteCode) {
          this.loadServerByInvite(inviteCode);
        } else {
          this.error = 'Invalid URL';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadServerById(id: string) {
    this.isLoading = true;
    this.error = null;

    this.serverDiscoveryService.getPublicServerById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (server) => {
          this.server = server;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[RevoltLanding] Error loading server:', error);
          this.error = 'Server not found';
          this.isLoading = false;
        }
      });
  }

  private loadServerByInvite(code: string) {
    this.isLoading = true;
    this.error = null;

    this.serverDiscoveryService.getServerByInviteCode(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (server) => {
          this.server = server;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('[RevoltLanding] Error loading server by invite:', error);
          this.error = 'Invalid invite code';
          this.isLoading = false;
        }
      });
  }

  onJoinClick() {
    if (!this.server) return;

    // For now, redirect to revnet - in the future, this would join the server
    console.log('[RevoltLanding] Joining server:', this.server.id);
    this.router.navigate(['/revnet']);
  }

  getChannelIcon(channel: Channel): string {
    switch (channel.type) {
      case '0':
        return '#';
      case '2':
        return '🔊';
      case '13':
        return '📺';
      case '15':
        return '📁';
      default:
        return '#';
    }
  }

  getChannelsGrouped(): { name: string; channels: Channel[] }[] {
    if (!this.server?.channels) return [];

    // For now, return all channels in a single group
    // In the future, could group by category if channels have that property
    return [
      { name: 'Channels', channels: this.server.channels }
    ];
  }

  onBackClick() {
    this.router.navigate(['/revolts']);
  }
}

