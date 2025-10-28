import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Revolt } from '../models/revolt.model';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    private router: Router
  ) {}

  setLandingPageMeta(): void {
    this.title.setTitle('Revolution Network - Discord for Activists | Join Revolutionary Communities');
    
    this.meta.updateTag({ name: 'description', content: 'Join Revolution Network - the Discord-like platform for activists. Create communities, fund causes, and organize movements with real-time chat, voice channels, and secure collaboration tools.' });
    
    this.meta.updateTag({ name: 'keywords', content: 'activism, discord, revolutionary, communities, social change, organizing, fundraising, secure chat' });
    
    this.meta.updateTag({ property: 'og:title', content: 'Revolution Network - Discord for Activists' });
    this.meta.updateTag({ property: 'og:description', content: 'Join revolutionary communities, organize movements, and fund causes that matter. Experience the power of Discord-like collaboration for social change.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://revnet.app' });
    this.meta.updateTag({ property: 'og:image', content: 'https://revnet.app/assets/og-image.jpg' });
    
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: 'Revolution Network - Discord for Activists' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Join revolutionary communities, organize movements, and fund causes that matter.' });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://revnet.app/assets/twitter-image.jpg' });
  }

  setRevoltMeta(revolt: Revolt): void {
    this.title.setTitle(`${revolt.name} - Revolution Network`);
    
    this.meta.updateTag({ name: 'description', content: revolt.shortDescription });
    this.meta.updateTag({ property: 'og:title', content: revolt.name });
    this.meta.updateTag({ property: 'og:description', content: revolt.shortDescription });
    this.meta.updateTag({ property: 'og:image', content: revolt.banner || revolt.icon || 'https://revnet.app/assets/default-og-image.jpg' });
  }
}
