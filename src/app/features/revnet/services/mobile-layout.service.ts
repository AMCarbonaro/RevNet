import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type MobilePanel = 'servers' | 'channels' | 'chat' | 'members';

@Injectable({
  providedIn: 'root'
})
export class MobileLayoutService {
  private activePanelSubject = new BehaviorSubject<MobilePanel>('servers');
  private panelHistory: MobilePanel[] = ['servers'];
  private isMobileSubject = new BehaviorSubject<boolean>(false);

  activePanel$: Observable<MobilePanel> = this.activePanelSubject.asObservable();
  isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    this.checkMobileView();
    this.listenToResize();
  }

  private checkMobileView(): void {
    const isMobile = window.innerWidth <= 768;
    this.isMobileSubject.next(isMobile);
  }

  private listenToResize(): void {
    window.addEventListener('resize', () => {
      this.checkMobileView();
    });
  }

  setActivePanel(panel: MobilePanel): void {
    const currentPanel = this.activePanelSubject.value;
    if (currentPanel !== panel) {
      this.panelHistory.push(panel);
      this.activePanelSubject.next(panel);
    }
  }

  navigateBack(): void {
    if (this.canGoBack()) {
      this.panelHistory.pop(); // Remove current panel
      const previousPanel = this.panelHistory[this.panelHistory.length - 1];
      this.activePanelSubject.next(previousPanel);
    }
  }

  canGoBack(): boolean {
    return this.panelHistory.length > 1;
  }

  getCurrentPanel(): MobilePanel {
    return this.activePanelSubject.value;
  }

  isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  // Navigation helpers
  showServers(): void {
    this.setActivePanel('servers');
  }

  showChannels(): void {
    this.setActivePanel('channels');
  }

  showChat(): void {
    this.setActivePanel('chat');
  }

  showMembers(): void {
    this.setActivePanel('members');
  }

  // Reset to initial state
  reset(): void {
    this.panelHistory = ['servers'];
    this.activePanelSubject.next('servers');
  }
}
