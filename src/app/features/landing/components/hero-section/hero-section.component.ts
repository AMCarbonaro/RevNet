import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Output() getStarted = new EventEmitter<void>();
  @Output() browseRevolts = new EventEmitter<void>();
  @Output() demoLogin = new EventEmitter<void>();

  @Input() totalRevolts = 0;
  @Input() totalMembers = 0;
  @Input() totalRaised = 0;
}