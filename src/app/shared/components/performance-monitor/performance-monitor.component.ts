import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerformanceOptimizerService } from '../../../core/services/performance-optimizer.service';
import { Observable, Subject, takeUntil, interval } from 'rxjs';

interface PerformanceMetrics {
  changeDetectionCycles: number;
  memoryLeaks: number;
  slowOperations: number;
  memoryUsage: number;
  fps: number;
}

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="performance-monitor" *ngIf="isVisible">
      <div class="monitor-header">
        <h4>Performance Monitor</h4>
        <button (click)="toggleVisibility()" class="toggle-btn">Hide</button>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">Change Detection:</span>
          <span class="metric-value" [class.warning]="metrics.changeDetectionCycles > 1000">
            {{ metrics.changeDetectionCycles }}
          </span>
        </div>
        
        <div class="metric">
          <span class="metric-label">Memory Usage:</span>
          <span class="metric-value" [class.warning]="metrics.memoryUsage > 100">
            {{ metrics.memoryUsage | number:'1.1-1' }} MB
          </span>
        </div>
        
        <div class="metric">
          <span class="metric-label">FPS:</span>
          <span class="metric-value" [class.warning]="metrics.fps < 30">
            {{ metrics.fps }}
          </span>
        </div>
        
        <div class="metric">
          <span class="metric-label">Slow Operations:</span>
          <span class="metric-value" [class.warning]="metrics.slowOperations > 10">
            {{ metrics.slowOperations }}
          </span>
        </div>
        
        <div class="metric">
          <span class="metric-label">Memory Leaks:</span>
          <span class="metric-value" [class.warning]="metrics.memoryLeaks > 0">
            {{ metrics.memoryLeaks }}
          </span>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="resetMetrics()" class="reset-btn">Reset</button>
        <button (click)="exportMetrics()" class="export-btn">Export</button>
      </div>
    </div>
    
    <button 
      *ngIf="!isVisible" 
      (click)="toggleVisibility()" 
      class="show-monitor-btn"
      title="Show Performance Monitor"
    >
      📊
    </button>
  `,
  styles: [`
    .performance-monitor {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      min-width: 250px;
      max-width: 300px;
    }
    
    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #333;
      padding-bottom: 5px;
    }
    
    .monitor-header h4 {
      margin: 0;
      font-size: 14px;
    }
    
    .toggle-btn, .reset-btn, .export-btn {
      background: #444;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
    }
    
    .toggle-btn:hover, .reset-btn:hover, .export-btn:hover {
      background: #555;
    }
    
    .metrics {
      margin-bottom: 10px;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      padding: 2px 0;
    }
    
    .metric-label {
      color: #ccc;
    }
    
    .metric-value {
      color: #4CAF50;
      font-weight: bold;
    }
    
    .metric-value.warning {
      color: #ff9800;
    }
    
    .actions {
      display: flex;
      gap: 5px;
    }
    
    .show-monitor-btn {
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      z-index: 10000;
    }
    
    .show-monitor-btn:hover {
      background: rgba(0, 0, 0, 0.9);
    }
  `]
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  isVisible = false;
  metrics: PerformanceMetrics = {
    changeDetectionCycles: 0,
    memoryLeaks: 0,
    slowOperations: 0,
    memoryUsage: 0,
    fps: 60
  };

  private destroy$ = new Subject<void>();
  private fpsCounter = 0;
  private lastTime = performance.now();

  constructor(
    private performanceOptimizer: PerformanceOptimizerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Update metrics every second
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateMetrics();
    });

    // Track FPS
    this.trackFPS();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMetrics(): void {
    const perfMetrics = this.performanceOptimizer.getPerformanceMetrics();
    
    this.performanceOptimizer.getMemoryUsage().pipe(
      takeUntil(this.destroy$)
    ).subscribe(memoryUsage => {
      this.metrics = {
        ...perfMetrics,
        memoryUsage: memoryUsage || 0,
        fps: this.metrics.fps
      };
      this.cdr.markForCheck();
    });
  }

  private trackFPS(): void {
    const measureFPS = () => {
      this.fpsCounter++;
      const currentTime = performance.now();
      
      if (currentTime - this.lastTime >= 1000) {
        this.metrics.fps = this.fpsCounter;
        this.fpsCounter = 0;
        this.lastTime = currentTime;
        this.cdr.markForCheck();
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
  }

  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.cdr.markForCheck();
  }

  resetMetrics(): void {
    this.performanceOptimizer.resetMetrics();
    this.metrics = {
      changeDetectionCycles: 0,
      memoryLeaks: 0,
      slowOperations: 0,
      memoryUsage: this.metrics.memoryUsage,
      fps: this.metrics.fps
    };
    this.cdr.markForCheck();
  }

  exportMetrics(): void {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
