import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-full-interface-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './full-interface-showcase.component.html',
  styleUrls: ['./full-interface-showcase.component.scss']
})
export class FullInterfaceShowcaseComponent {
  constructor(private router: Router) {}

  onTryIt(): void {
    this.router.navigate(['/register']);
  }

  onViewDemo(): void {
    this.router.navigate(['/welcome']);
  }
}

