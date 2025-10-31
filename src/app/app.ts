import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeepAliveService } from './core/services/keep-alive.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('Revolution Network');
  private readonly keepAliveService = inject(KeepAliveService);

  ngOnInit(): void {
    // Start keep-alive service to prevent Render from spinning down
    // This silently pings the backend periodically while the app is active
    this.keepAliveService.start();
  }

  ngOnDestroy(): void {
    // Clean up when app is destroyed
    this.keepAliveService.stop();
  }
}