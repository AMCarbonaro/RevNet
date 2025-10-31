import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoDataService } from '../../../../core/services/demo-data.service';
import { Server, Channel } from '../../../../features/revnet/store/models/revnet.models';

@Component({
  selector: 'app-channels-revolts-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channels-revolts-showcase.component.html',
  styleUrls: ['./channels-revolts-showcase.component.scss']
})
export class ChannelsRevoltsShowcaseComponent implements OnInit {
  servers: Server[] = [];
  selectedServer: Server | null = null;
  channels: Channel[] = [];
  selectedChannel: Channel | null = null;

  constructor(private demoDataService: DemoDataService) {}

  ngOnInit(): void {
    this.servers = this.demoDataService.getDemoServers() as Server[];
    this.selectedServer = this.servers[0];
    if (this.selectedServer) {
      this.channels = this.demoDataService.getDemoChannels(this.selectedServer.id);
      this.selectedChannel = this.channels[0];
    }
  }

  selectServer(server: Server): void {
    this.selectedServer = server;
    this.channels = this.demoDataService.getDemoChannels(server.id);
    this.selectedChannel = this.channels[0];
  }

  selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
  }
}

