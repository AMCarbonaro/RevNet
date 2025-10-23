# UI Components Library Documentation

## Overview

Revolution Network features a comprehensive component library built with React, TypeScript, and Tailwind CSS. The components follow a cyberpunk/terminal aesthetic with modular design principles for reusability and maintainability.

## 🎨 Design System

### Component Categories

1. **Terminal Components** - Matrix-inspired interface elements
2. **Dashboard Components** - Main application interface
3. **Effect Components** - Visual effects and animations
4. **Form Components** - Input and interaction elements
5. **Widget Components** - Dashboard widgets and displays
6. **UI Components** - Basic reusable elements

## 🖥️ Terminal Components

### TerminalInterface

**Purpose**: Main terminal experience with Matrix rain background and interactive choice system.

```typescript
interface TerminalInterfaceProps {
  onComplete: (choice: 'red-pill' | 'blue-pill') => void;
}

export function TerminalInterface({ onComplete }: TerminalInterfaceProps) {
  // Matrix rain background
  // Interactive typing effects
  // Red pill/blue pill choice
  // Web Audio API knock sound
  // Cookie-based state management
}
```

**Features**:
- Matrix rain background animation
- Interactive typing effects with TypeIt.js
- Web Audio API knock sound effects
- Red pill/blue pill choice system
- Skip functionality (ESC key)
- Cookie-based completion tracking

### TerminalInput

**Purpose**: User input handling for terminal interface.

```typescript
interface TerminalInputProps {
  onInput: (input: string) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TerminalInput({ onInput, value, onChange, placeholder }: TerminalInputProps) {
  // Real-time input handling
  // Enter key submission
  // Input validation
  // Placeholder support
}
```

### TerminalCursor

**Purpose**: Blinking cursor animation for terminal interface.

```typescript
export function TerminalCursor() {
  // Blinking animation
  // Terminal-style cursor
  // CSS animation control
}
```

### MatrixRain

**Purpose**: Background matrix rain effect for terminal interface.

```typescript
export function MatrixRain() {
  // Falling character animation
  // Green terminal color scheme
  // Performance optimized
  // Responsive design
}
```

## 📊 Dashboard Components

### Dashboard

**Purpose**: Main dashboard container with progressive access control.

```typescript
interface DashboardProps {
  user?: User;
  letterProgress?: LetterProgress;
}

export function Dashboard({ user, letterProgress }: DashboardProps) {
  // Progressive access control
  // Letter completion checking
  // Dashboard variant selection
  // Chat widget integration
}
```

**Access Levels**:
- **0 Letters**: Anthony Letters interface only
- **1-29 Letters**: Progress tracking and limited features
- **30 Letters**: Full dashboard with chat widgets

### Navigation

**Purpose**: Top navigation bar with user controls and menu.

```typescript
interface NavigationProps {
  user?: User;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function Navigation({ user, isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) {
  // User menu
  // Mobile responsive
  // Logo and branding
  // Navigation links
}
```

### LettersSection

**Purpose**: Anthony Letters progress display and navigation.

```typescript
interface LettersSectionProps {
  userProgress?: {
    completedLetters: number[];
    currentLetter: number;
  };
}

export function LettersSection({ userProgress }: LettersSectionProps) {
  // Progress visualization
  // Book-based organization
  // Letter unlocking logic
  // Assignment tracking
}
```

### ProjectHub

**Purpose**: Project management and discovery interface.

```typescript
interface ProjectHubProps {
  projects: Project[];
  userType: 'creator' | 'supporter';
  onProjectSelect: (project: Project) => void;
}

export function ProjectHub({ projects, userType, onProjectSelect }: ProjectHubProps) {
  // Project filtering
  // Category organization
  // Search functionality
  // User type specific features
}
```

### Feed

**Purpose**: Activity feed displaying community updates and project news.

```typescript
interface FeedProps {
  posts: FeedPost[];
  onPostLike: (postId: string) => void;
  onPostComment: (postId: string, comment: string) => void;
}

export function Feed({ posts, onPostLike, onPostComment }: FeedProps) {
  // Real-time updates
  // Like and comment functionality
  // Post type filtering
  // Infinite scroll
}
```

## ✨ Effect Components

### GlitchText

**Purpose**: Text with glitch effect animation.

```typescript
interface GlitchTextProps {
  text: string;
  className?: string;
  duration?: number;
}

export function GlitchText({ text, className, duration = 300 }: GlitchTextProps) {
  // Glitch animation
  // CSS transform effects
  // Customizable duration
  // Responsive design
}
```

### HolographicCard

**Purpose**: 3D holographic card effect.

```typescript
interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function HolographicCard({ children, className, intensity = 1 }: HolographicCardProps) {
  // 3D transform effects
  // Holographic color scheme
  // Hover interactions
  // Performance optimized
}
```

### NeonButton

**Purpose**: Button with neon glow effects.

```typescript
interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function NeonButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false 
}: NeonButtonProps) {
  // Neon glow effects
  // Hover animations
  // Variant styling
  // Accessibility support
}
```

### Scanlines

**Purpose**: CRT monitor scanline effect.

```typescript
interface ScanlinesProps {
  intensity?: number;
  speed?: number;
  className?: string;
}

export function Scanlines({ intensity = 0.1, speed = 1, className }: ScanlinesProps) {
  // Animated scanlines
  // Customizable intensity
  // Performance optimized
  // Overlay positioning
}
```

### StatusIndicator

**Purpose**: System status display with animated indicators.

```typescript
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  // Animated status indicators
  // Color-coded states
  // Responsive sizing
  // Accessibility labels
}
```

## 📝 Form Components

### DonationButton

**Purpose**: Stripe-powered donation button with amount selection.

```typescript
interface DonationButtonProps {
  project: Project;
  onDonationComplete: (donation: Donation) => void;
  suggestedAmounts?: number[];
  customAmount?: boolean;
}

export function DonationButton({ 
  project, 
  onDonationComplete, 
  suggestedAmounts = [25, 50, 100, 250, 500],
  customAmount = true 
}: DonationButtonProps) {
  // Stripe integration
  // Amount selection
  // Payment processing
  // Success/error handling
}
```

### StripePaymentForm

**Purpose**: Complete Stripe payment form with card input.

```typescript
interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  amount: number;
  projectName: string;
}

export function StripePaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError, 
  amount, 
  projectName 
}: StripePaymentFormProps) {
  // Stripe Elements integration
  // Card input handling
  // Payment processing
  // Error handling
  // Loading states
}
```

## 🎛️ Widget Components

### ActivityFeed

**Purpose**: Real-time activity updates widget.

```typescript
interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick: (activity: Activity) => void;
  maxItems?: number;
}

export function ActivityFeed({ activities, onActivityClick, maxItems = 10 }: ActivityFeedProps) {
  // Real-time updates
  // Activity filtering
  // Click handling
  // Performance optimized
}
```

### OnlineUsers

**Purpose**: User presence display widget.

```typescript
interface OnlineUsersProps {
  users: User[];
  maxDisplay?: number;
  showCount?: boolean;
}

export function OnlineUsers({ users, maxDisplay = 5, showCount = true }: OnlineUsersProps) {
  // User presence tracking
  // Avatar display
  // Count indicators
  // Real-time updates
}
```

### ProjectList

**Purpose**: Project listing widget with filtering.

```typescript
interface ProjectListProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  filter?: ProjectFilter;
  sortBy?: 'newest' | 'popular' | 'funding';
}

export function ProjectList({ 
  projects, 
  onProjectSelect, 
  filter, 
  sortBy = 'newest' 
}: ProjectListProps) {
  // Project filtering
  // Sorting options
  // Click handling
  // Responsive grid
}
```

### SystemStatus

**Purpose**: Platform health and status display.

```typescript
interface SystemStatusProps {
  status: SystemStatus;
  onStatusClick?: () => void;
}

export function SystemStatus({ status, onStatusClick }: SystemStatusProps) {
  // System health indicators
  // Performance metrics
  // Status updates
  // Click interactions
}
```

### UserStats

**Purpose**: User statistics display widget.

```typescript
interface UserStatsProps {
  user: User;
  stats: UserStats;
  showProgress?: boolean;
}

export function UserStats({ user, stats, showProgress = true }: UserStatsProps) {
  // Statistics visualization
  // Progress indicators
  // Achievement display
  // Responsive design
}
```

## 🧩 UI Components

### Button

**Purpose**: Base button component with variants and states.

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className 
}: ButtonProps) {
  // Variant styling
  // Size options
  // Loading states
  // Accessibility support
  // Hover effects
}
```

### Card

**Purpose**: Container component for content organization.

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md', 
  className 
}: CardProps) {
  // Variant styling
  // Padding options
  // Hover effects
  // Responsive design
}
```

### LoadingSpinner

**Purpose**: Loading indicator component.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className 
}: LoadingSpinnerProps) {
  // Animated spinner
  // Size variants
  // Color options
  // Accessibility support
}
```

## 🎨 Styling System

### CSS Classes

```css
/* Terminal Interface */
.terminal {
  background: #000000;
  border: 1px solid #39FF14;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
}

.terminal-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
}

/* Matrix Rain Effect */
.matrix-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.1;
}

.matrix-char {
  color: #39FF14;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1;
  position: absolute;
  animation: matrix-rain 20s linear infinite;
}

/* Neon Effects */
.neon-glow {
  box-shadow: 0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14;
}

.neon-glow-cyan {
  box-shadow: 0 0 5px #00DDEB, 0 0 10px #00DDEB, 0 0 15px #00DDEB;
}

/* Glitch Effect */
.glitch {
  animation: glitch 0.3s ease-in-out;
}

@keyframes glitch {
  0% { transform: translate(2px, -2px); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, 2px); }
  75% { transform: translate(-2px, -2px); }
  100% { transform: translate(0, 0); }
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0a0a0a',
          dark: '#121212',
          light: '#1a1a1a',
          panel: '#252525',
        },
        accent: {
          green: '#39FF14',
          cyan: '#00DDEB',
          purple: '#8B5CF6',
        },
        text: {
          light: '#E5E7EB',
          muted: '#9CA3AF',
          dark: '#6B7280',
        }
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out',
        'typing': 'typing 2s steps(40, end)',
        'blink': 'blink 1s infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
      }
    }
  }
}
```

## 📱 Responsive Design

### Mobile Optimization

```typescript
// Mobile-specific terminal interface
const TerminalMobile = () => {
  return (
    <div className="mobile-fullscreen">
      <MatrixRain />
      <TerminalInterface onComplete={handleComplete} />
    </div>
  );
};

// Responsive dashboard layout
const DashboardLayout = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <LettersSection />
      <ProjectHub />
      <ActivityFeed />
    </div>
  );
};
```

### Breakpoint System

```css
/* Mobile First Approach */
@media (max-width: 768px) {
  .terminal-mobile {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 1rem;
    border-radius: 0;
    border: none;
  }
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🧪 Testing

### Component Testing

```typescript
// Terminal Interface Testing
describe('TerminalInterface', () => {
  test('should render matrix rain background', () => {
    render(<TerminalInterface onComplete={jest.fn()} />);
    expect(screen.getByTestId('matrix-rain')).toBeInTheDocument();
  });
  
  test('should handle red pill choice', () => {
    const onComplete = jest.fn();
    render(<TerminalInterface onComplete={onComplete} />);
    
    fireEvent.click(screen.getByText('1'));
    expect(onComplete).toHaveBeenCalledWith('red-pill');
  });
});

// Dashboard Testing
describe('Dashboard', () => {
  test('should show letters interface for new users', () => {
    const user = { letterProgress: { completedLetters: [] } };
    render(<Dashboard user={user} />);
    expect(screen.getByText('The Anthony Letters')).toBeInTheDocument();
  });
  
  test('should show full dashboard for completed users', () => {
    const user = { letterProgress: { completedLetters: Array.from({length: 30}, (_, i) => i + 1) } };
    render(<Dashboard user={user} />);
    expect(screen.getByText('Project Hub')).toBeInTheDocument();
  });
});
```

### Accessibility Testing

```typescript
// Accessibility Testing
describe('Accessibility', () => {
  test('should have proper ARIA labels', () => {
    render(<TerminalInterface onComplete={jest.fn()} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label');
  });
  
  test('should support keyboard navigation', () => {
    render(<Dashboard user={mockUser} />);
    const firstButton = screen.getByRole('button');
    firstButton.focus();
    expect(firstButton).toHaveFocus();
  });
});
```

## 🚀 Performance Optimization

### Component Optimization

```typescript
// Memoized components for performance
const MemoizedTerminalInterface = React.memo(TerminalInterface);
const MemoizedMatrixRain = React.memo(MatrixRain);

// Lazy loading for heavy components
const LazyDashboard = React.lazy(() => import('./Dashboard'));
const LazyProjectHub = React.lazy(() => import('./ProjectHub'));

// Virtual scrolling for large lists
const VirtualizedProjectList = ({ projects }: { projects: Project[] }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={projects.length}
      itemSize={100}
      itemData={projects}
    >
      {ProjectItem}
    </FixedSizeList>
  );
};
```

### Animation Performance

```css
/* GPU-accelerated animations */
.matrix-char {
  will-change: transform;
  transform: translateZ(0);
}

.neon-glow {
  will-change: box-shadow;
  transform: translateZ(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .matrix-char {
    animation: none;
  }
  
  .neon-glow {
    box-shadow: none;
  }
}
```

This comprehensive component library provides the building blocks for Revolution Network's cyberpunk interface while maintaining accessibility, performance, and user experience standards.
