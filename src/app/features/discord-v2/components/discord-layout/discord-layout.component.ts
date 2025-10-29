import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DiscordActions } from '../../store/actions/discord.actions';
import { ServerListComponent } from '../server-list/server-list.component';
import { ChannelSidebarComponent } from '../channel-sidebar/channel-sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';

@Component({
  selector: 'app-discord-v2-layout',
  standalone: true,
  imports: [
    CommonModule,
    ServerListComponent,
    ChannelSidebarComponent,
    ChatAreaComponent
  ],
  templateUrl: './discord-layout.component.html',
  styleUrl: './discord-layout.component.scss'
})
export class DiscordV2LayoutComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(DiscordActions.loadServers());
  }
}
