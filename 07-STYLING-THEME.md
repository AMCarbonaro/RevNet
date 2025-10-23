# Styling & Theme Documentation

## Overview

Revolution Network features a cyberpunk/terminal aesthetic with a dark theme, neon accents, and monospace typography. The design system is built on Tailwind CSS with custom CSS for advanced effects and animations.

## 🎨 Color Palette

### Primary Colors

```css
:root {
  /* Dark Base Colors */
  --primary-bg: #0a0a0a;      /* Dark grey base */
  --primary-dark: #121212;    /* Darker grey */
  --primary-light: #1a1a1a;   /* Light grey */
  --primary-panel: #252525;   /* Panel background */
  
  /* Accent Colors */
  --accent-green: #39FF14;     /* Terminal green */
  --accent-cyan: #00DDEB;      /* Cyan accent */
  --accent-purple: #8B5CF6;   /* Purple accent */
  
  /* Text Colors */
  --text-light: #E5E7EB;      /* Off-white */
  --text-muted: #9CA3AF;      /* Muted text */
  --text-dark: #6B7280;       /* Darker grey text */
  
  /* Border Colors */
  --border-grey: #2a2a2a;     /* Border grey */
  --border-green: #2a4a2a;    /* Muted green border */
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
        },
        border: {
          grey: '#2a2a2a',
          green: '#2a4a2a',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      }
    }
  }
}
```

## 🔤 Typography System

### Font Families

```css
/* Primary Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');

/* Font Configuration */
body {
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.font-sans {
  font-family: 'Inter', sans-serif;
}

.font-mono {
  font-family: 'Fira Code', monospace;
}
```

### Typography Scale

```css
/* Text Sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
```

## ✨ Visual Effects

### Matrix Rain Effect

```css
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
  color: var(--accent-green);
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1;
  position: absolute;
  animation: matrix-rain 20s linear infinite;
}

@keyframes matrix-rain {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}
```

### Neon Glow Effects

```css
.neon-glow {
  box-shadow: 0 0 5px var(--accent-green), 0 0 10px var(--accent-green), 0 0 15px var(--accent-green);
}

.neon-glow-cyan {
  box-shadow: 0 0 5px var(--accent-cyan), 0 0 10px var(--accent-cyan), 0 0 15px var(--accent-cyan);
}

.neon-glow-purple {
  box-shadow: 0 0 5px var(--accent-purple), 0 0 10px var(--accent-purple), 0 0 15px var(--accent-purple);
}

/* Pulse Animation */
.pulse-neon {
  animation: pulse-neon 2s ease-in-out infinite;
}

@keyframes pulse-neon {
  0%, 100% { 
    box-shadow: 0 0 5px var(--accent-green), 0 0 10px var(--accent-green), 0 0 15px var(--accent-green);
    opacity: 1;
  }
  50% { 
    box-shadow: 0 0 10px var(--accent-green), 0 0 20px var(--accent-green), 0 0 30px var(--accent-green);
    opacity: 0.8;
  }
}
```

### Glitch Effects

```css
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

/* Text Glitch */
.text-glitch {
  position: relative;
  color: var(--accent-green);
}

.text-glitch::before,
.text-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.text-glitch::before {
  animation: glitch-1 0.5s infinite;
  color: var(--accent-cyan);
  z-index: -1;
}

.text-glitch::after {
  animation: glitch-2 0.5s infinite;
  color: var(--accent-purple);
  z-index: -2;
}
```

### Scanline Effects

```css
.scanlines {
  position: relative;
  overflow: hidden;
}

.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    transparent 50%,
    rgba(57, 255, 20, 0.03) 50%
  );
  background-size: 100% 4px;
  animation: scanlines 0.1s linear infinite;
  pointer-events: none;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
```

## 🖥️ Terminal Interface Styling

### Terminal Window

```css
.terminal {
  background: #000000;
  border: 1px solid var(--accent-green);
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: var(--accent-green);
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
}

.terminal-header {
  background: var(--primary-dark);
  border-bottom: 1px solid var(--accent-green);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.terminal-dots {
  display: flex;
  gap: 4px;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dot.red { background: #ff5f56; }
.terminal-dot.yellow { background: #ffbd2e; }
.terminal-dot.green { background: #27ca3f; }

.terminal-content {
  padding: 16px;
  min-height: 200px;
  overflow-y: auto;
}

.terminal-cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### Mobile Terminal

```css
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
    background: #000000 !important;
  }
  
  .mobile-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: #000000 !important;
    z-index: 9999;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    touch-action: none;
  }
}
```

## 🎛️ Tiled System Styling

### Panel System

```css
.tiled-panel {
  font-family: 'Fira Code', monospace;
  background: var(--primary-panel);
  border: 1px solid var(--border-grey);
  border-radius: 2px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.tiled-header {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-green);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-grey);
  padding-bottom: 4px;
}

.tiled-text {
  font-size: 11px;
  color: var(--text-light);
  line-height: 1.4;
}

.tiled-text-muted {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
}
```

### Widget Styling

```css
.widget {
  background: var(--primary-panel);
  border: 1px solid var(--border-grey);
  border-radius: 4px;
  padding: 16px;
  transition: all 0.3s ease;
}

.widget:hover {
  border-color: var(--accent-green);
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-grey);
}

.widget-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-green);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.widget-content {
  color: var(--text-light);
  font-size: 12px;
  line-height: 1.4;
}
```

## 🎨 Component Styling

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.btn-primary {
  background: var(--accent-green);
  color: #000000;
  border-color: var(--accent-green);
}

.btn-primary:hover {
  background: #2dd42d;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.4);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--accent-green);
  border-color: var(--accent-green);
}

.btn-secondary:hover {
  background: var(--accent-green);
  color: #000000;
}

.btn-neon {
  box-shadow: 0 0 5px var(--accent-green);
  animation: pulse-neon 2s ease-in-out infinite;
}
```

### Cards

```css
.card {
  background: var(--primary-panel);
  border: 1px solid var(--border-grey);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--accent-green);
  box-shadow: 0 4px 20px rgba(57, 255, 20, 0.1);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-grey);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-green);
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-content {
  color: var(--text-light);
  line-height: 1.6;
}
```

### Forms

```css
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-green);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--primary-dark);
  border: 1px solid var(--border-grey);
  border-radius: 4px;
  color: var(--text-light);
  font-size: 12px;
  font-family: 'Fira Code', monospace;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-green);
  box-shadow: 0 0 0 2px rgba(57, 255, 20, 0.2);
}

.form-input::placeholder {
  color: var(--text-muted);
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .text-responsive {
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
  
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Mobile Optimizations

```css
/* Mobile Terminal */
@media (max-width: 768px) {
  .mobile-terminal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: #000000 !important;
    z-index: 9999;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    touch-action: none;
  }
  
  /* Prevent zoom on mobile */
  input, textarea, select {
    font-size: 16px;
  }
  
  /* Touch-friendly buttons */
  .btn-mobile {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
}
```

## ♿ Accessibility

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --accent-green: #00FF00;
    --accent-cyan: #00FFFF;
    --text-light: #FFFFFF;
    --primary-bg: #000000;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .matrix-rain {
    display: none;
  }
  
  .neon-glow {
    box-shadow: none;
  }
}
```

### Focus States

```css
.focus-visible {
  outline: 2px solid var(--accent-green);
  outline-offset: 2px;
}

.btn:focus-visible {
  outline: 2px solid var(--accent-green);
  outline-offset: 2px;
}

.form-input:focus-visible {
  outline: 2px solid var(--accent-green);
  outline-offset: 2px;
}
```

## 🎭 Animation System

### Keyframe Animations

```css
/* Typing Animation */
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

.typing {
  animation: typing 2s steps(40, end);
}

/* Blink Animation */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.blink {
  animation: blink 1s infinite;
}

/* Matrix Rain */
@keyframes matrix-rain {
  0% { transform: translateY(-100vh); }
  100% { transform: translateY(100vh); }
}

.matrix-rain {
  animation: matrix-rain 20s linear infinite;
}
```

### Transition System

```css
/* Standard Transitions */
.transition-standard {
  transition: all 0.3s ease;
}

.transition-fast {
  transition: all 0.15s ease;
}

.transition-slow {
  transition: all 0.5s ease;
}

/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(57, 255, 20, 0.2);
}

.hover-glow:hover {
  box-shadow: 0 0 10px var(--accent-green);
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

## 🎨 Custom CSS Classes

### Utility Classes

```css
/* Text Utilities */
.text-gradient {
  background: linear-gradient(45deg, var(--accent-green), var(--accent-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-shadow {
  text-shadow: 0 0 10px var(--accent-green);
}

/* Layout Utilities */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Spacing Utilities */
.space-y > * + * {
  margin-top: 1rem;
}

.space-x > * + * {
  margin-left: 1rem;
}
```

### Component Utilities

```css
/* Loading States */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.2), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Status Indicators */
.status-online {
  color: var(--accent-green);
}

.status-offline {
  color: var(--text-muted);
}

.status-warning {
  color: var(--warning);
}

.status-error {
  color: var(--error);
}
```

This comprehensive styling system provides the foundation for Revolution Network's cyberpunk aesthetic while maintaining accessibility, performance, and responsive design principles.
