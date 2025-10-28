# Styling & Theme Documentation

## Overview

Revolution Network features a Discord-like interface with a cyberpunk/terminal aesthetic, combining Discord's familiar UI patterns with a dark theme, neon accents, and monospace typography. The design system is built on Angular 17+ with Tailwind CSS and custom components for the exact Discord clone experience.

## 🎨 Color Palette

### Discord-Inspired Colors

```css
:root {
  /* Discord Dark Theme Colors */
  --discord-dark: #2C2F33;        /* Discord dark grey */
  --discord-darker: #23272A;       /* Discord darker grey */
  --discord-darkest: #1E2124;      /* Discord darkest grey */
  --discord-light: #36393F;        /* Discord light grey */
  --discord-lighter: #40444B;      /* Discord lighter grey */
  --discord-lightest: #B9BBBE;     /* Discord lightest grey */
  --discord-brand: #5865F2;        /* Discord brand blue */
  --discord-green: #3BA55C;        /* Discord green */
  --discord-yellow: #FEE75C;       /* Discord yellow */
  --discord-red: #ED4245;          /* Discord red */
  
  /* Cyberpunk Accents */
  --neon-green: #39FF14;           /* Terminal green */
  --neon-cyan: #00DDEB;            /* Cyan accent */
  --neon-purple: #8B5CF6;          /* Purple accent */
  
  /* Text Colors */
  --text-primary: #FFFFFF;         /* Primary text */
  --text-secondary: #B9BBBE;       /* Secondary text */
  --text-muted: #72767D;           /* Muted text */
  --text-link: #00AFF4;            /* Link text */
  
  /* Border Colors */
  --border-primary: #40444B;       /* Primary border */
  --border-secondary: #2F3136;     /* Secondary border */
  --border-accent: #5865F2;        /* Accent border */
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Discord color palette
        discord: {
          dark: '#2C2F33',
          darker: '#23272A',
          darkest: '#1E2124',
          light: '#36393F',
          lighter: '#40444B',
          lightest: '#B9BBBE',
          brand: '#5865F2',
          green: '#3BA55C',
          yellow: '#FEE75C',
          red: '#ED4245',
        },
        // Cyberpunk accents
        neon: {
          green: '#39FF14',
          cyan: '#00DDEB',
          purple: '#8B5CF6',
        }
      },
      fontFamily: {
        'discord': ['Whitney', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'typing': 'typing 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## 🔤 Typography System

### Font Families

```css
/* Discord Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');

/* Font Configuration */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.375;
  color: var(--text-primary);
}

.font-discord {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.font-mono {
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

### Typography Scale

```css
/* Discord Text Sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.375rem; }   /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.5rem; }   /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
```

## 🖥️ Discord Interface Layout

### Main Layout Structure

```css
.discord-layout {
  display: flex;
  height: 100vh;
  background: var(--discord-darkest);
  color: var(--text-primary);
}

/* Server Sidebar (Left) */
.server-sidebar {
  width: 72px;
  background: var(--discord-darker);
  border-right: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
}

/* Channel Sidebar (Middle) */
.channel-sidebar {
  width: 240px;
  background: var(--discord-dark);
  border-right: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
}

/* Main Chat Area */
.chat-area {
  flex: 1;
  background: var(--discord-darkest);
  display: flex;
  flex-direction: column;
}

/* Member List (Right) */
.member-list {
  width: 240px;
  background: var(--discord-dark);
  border-left: 1px solid var(--border-secondary);
  display: flex;
  flex-direction: column;
}
```

### Server Sidebar Styling

```css
/* Server List */
.server-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.server-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--discord-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.server-item:hover {
  border-radius: 16px;
  background: var(--discord-brand);
}

.server-item.active {
  border-radius: 16px;
  background: var(--discord-brand);
}

.server-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: var(--text-primary);
  border-radius: 0 2px 2px 0;
}

/* Server Icon */
.server-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

/* Add Server Button */
.add-server {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--discord-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--discord-green);
  font-size: 24px;
  font-weight: 300;
}

.add-server:hover {
  background: var(--discord-green);
  color: var(--text-primary);
  border-radius: 16px;
}
```

### Channel Sidebar Styling

```css
/* Channel Header */
.channel-header {
  height: 48px;
  background: var(--discord-dark);
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

.server-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
}

.server-name:hover {
  color: var(--text-secondary);
}

/* Channel Categories */
.channel-category {
  margin: 16px 8px 4px 8px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.channel-category:hover {
  color: var(--text-secondary);
}

/* Channel List */
.channel-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.channel-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text-muted);
  font-size: 16px;
  font-weight: 500;
}

.channel-item:hover {
  background: var(--discord-light);
  color: var(--text-primary);
}

.channel-item.active {
  background: var(--discord-light);
  color: var(--text-primary);
}

.channel-item.unread {
  color: var(--text-primary);
  font-weight: 600;
}

/* Channel Icons */
.channel-icon {
  margin-right: 6px;
  font-size: 20px;
}

.channel-icon.text::before {
  content: '#';
  font-weight: 600;
}

.channel-icon.voice::before {
  content: '🔊';
}

.channel-icon.video::before {
  content: '📹';
}

/* User Section */
.user-section {
  background: var(--discord-darker);
  padding: 8px;
  border-top: 1px solid var(--border-secondary);
}
```

### Chat Area Styling

```css
/* Chat Header */
.chat-header {
  height: 48px;
  background: var(--discord-dark);
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

.channel-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 8px;
}

.channel-description {
  font-size: 14px;
  color: var(--text-muted);
}

/* Message List */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--discord-darkest);
}

.message {
  display: flex;
  padding: 4px 16px;
  margin: 1px 0;
  position: relative;
}

.message:hover {
  background: rgba(4, 4, 5, 0.07);
}

.message-group {
  display: flex;
  flex-direction: column;
  margin-left: 48px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.message-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.message-author {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-right: 8px;
  cursor: pointer;
}

.message-author:hover {
  text-decoration: underline;
}

.message-timestamp {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 8px;
}

.message-body {
  font-size: 16px;
  line-height: 1.375;
  color: var(--text-primary);
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* Message Input */
.message-input-container {
  background: var(--discord-dark);
  padding: 16px;
  border-top: 1px solid var(--border-secondary);
}

.message-input-wrapper {
  background: var(--discord-darker);
  border-radius: 8px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  padding: 0 16px;
  transition: border-color 0.2s ease;
}

.message-input-wrapper:focus-within {
  border-color: var(--discord-brand);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.375;
  padding: 11px 0;
  resize: none;
  max-height: 200px;
}

.message-input::placeholder {
  color: var(--text-muted);
}

.message-send-button {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.message-send-button:hover {
  color: var(--text-primary);
  background: var(--discord-light);
}

.message-send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Member List Styling

```css
/* Member List Header */
.member-list-header {
  height: 48px;
  background: var(--discord-dark);
  border-bottom: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Member List */
.member-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.member-group {
  margin-bottom: 16px;
}

.member-group-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
  padding: 0 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.member-item:hover {
  background: var(--discord-light);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
  cursor: pointer;
  position: relative;
}

.member-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--discord-dark);
}

.member-status.online {
  background: var(--discord-green);
}

.member-status.away {
  background: var(--discord-yellow);
}

.member-status.busy {
  background: var(--discord-red);
}

.member-status.invisible {
  background: var(--text-muted);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

## 🎤 Voice Channel Styling

### Voice Channel Interface

```css
/* Voice Channel Overlay */
.voice-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.voice-container {
  background: var(--discord-dark);
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.voice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.voice-channel-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.voice-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.voice-close:hover {
  background: var(--discord-light);
  color: var(--text-primary);
}

/* Voice Controls */
.voice-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voice-participants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.voice-participant {
  display: flex;
  align-items: center;
  background: var(--discord-darker);
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-primary);
}

.voice-participant-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.voice-participant-name {
  font-weight: 500;
}

.voice-participant-status {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.voice-participant-status.speaking {
  color: var(--discord-green);
}

.voice-participant-status.muted {
  color: var(--discord-red);
}

/* Voice Control Buttons */
.voice-control-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.voice-control-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s ease;
}

.voice-control-button.mute {
  background: var(--discord-red);
  color: var(--text-primary);
}

.voice-control-button.mute:hover {
  background: #c53030;
}

.voice-control-button.unmute {
  background: var(--discord-green);
  color: var(--text-primary);
}

.voice-control-button.unmute:hover {
  background: #2f855a;
}

.voice-control-button.deafen {
  background: var(--discord-light);
  color: var(--text-primary);
}

.voice-control-button.deafen:hover {
  background: var(--discord-lighter);
}

.voice-control-button.settings {
  background: var(--discord-light);
  color: var(--text-muted);
}

.voice-control-button.settings:hover {
  background: var(--discord-lighter);
  color: var(--text-primary);
}
```

## 🎨 Cyberpunk Effects

### Neon Glow Effects

```css
.neon-glow {
  box-shadow: 0 0 5px var(--neon-green), 0 0 10px var(--neon-green), 0 0 15px var(--neon-green);
}

.neon-glow-cyan {
  box-shadow: 0 0 5px var(--neon-cyan), 0 0 10px var(--neon-cyan), 0 0 15px var(--neon-cyan);
}

.neon-glow-purple {
  box-shadow: 0 0 5px var(--neon-purple), 0 0 10px var(--neon-purple), 0 0 15px var(--neon-purple);
}

/* Pulse Animation */
.pulse-neon {
  animation: pulse-neon 2s ease-in-out infinite;
}

@keyframes pulse-neon {
  0%, 100% { 
    box-shadow: 0 0 5px var(--neon-green), 0 0 10px var(--neon-green), 0 0 15px var(--neon-green);
    opacity: 1;
  }
  50% { 
    box-shadow: 0 0 10px var(--neon-green), 0 0 20px var(--neon-green), 0 0 30px var(--neon-green);
    opacity: 0.8;
  }
}
```

### Matrix Rain Effect (Background)

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
  color: var(--neon-green);
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
  color: var(--neon-green);
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
  color: var(--neon-cyan);
  z-index: -1;
}

.text-glitch::after {
  animation: glitch-2 0.5s infinite;
  color: var(--neon-purple);
  z-index: -2;
}
```

## 🏠 Landing Page Styling

### Revolt Cards

```css
.revolt-card {
  background: var(--discord-dark);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.revolt-card:hover {
  border-color: var(--discord-brand);
  box-shadow: 0 4px 20px rgba(88, 101, 242, 0.2);
  transform: translateY(-2px);
}

.revolt-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--neon-green), var(--neon-cyan), var(--neon-purple));
}

.revolt-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.revolt-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.revolt-info {
  flex: 1;
}

.revolt-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.revolt-members {
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.revolt-members::before {
  content: '👥';
  margin-right: 4px;
}

.revolt-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 16px;
}

.revolt-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.revolt-funding {
  display: flex;
  flex-direction: column;
}

.funding-amount {
  font-size: 16px;
  font-weight: 600;
  color: var(--discord-green);
}

.funding-goal {
  font-size: 12px;
  color: var(--text-muted);
}

.revolt-actions {
  display: flex;
  gap: 8px;
}

.revolt-join-btn {
  flex: 1;
  background: var(--discord-brand);
  color: var(--text-primary);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.revolt-join-btn:hover {
  background: #4752C4;
}

.revolt-donate-btn {
  background: transparent;
  color: var(--discord-green);
  border: 1px solid var(--discord-green);
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.revolt-donate-btn:hover {
  background: var(--discord-green);
  color: var(--text-primary);
}
```

## 📱 Mobile Responsive Design

### Mobile Discord Layout

```css
@media (max-width: 768px) {
  .discord-layout {
    flex-direction: column;
  }
  
  .server-sidebar {
    width: 100%;
    height: 60px;
    flex-direction: row;
    overflow-x: auto;
    padding: 8px 16px;
  }
  
  .channel-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--border-secondary);
  }
  
  .member-list {
    display: none;
  }
  
  .chat-area {
    height: calc(100vh - 260px);
  }
  
  .message-input-container {
    padding: 12px;
  }
  
  .message-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

@media (max-width: 480px) {
  .revolt-card {
    padding: 16px;
  }
  
  .revolt-actions {
    flex-direction: column;
  }
  
  .revolt-join-btn,
  .revolt-donate-btn {
    width: 100%;
  }
}
```

## ♿ Accessibility

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --discord-dark: #000000;
    --discord-darker: #000000;
    --discord-darkest: #000000;
    --text-primary: #FFFFFF;
    --text-secondary: #FFFFFF;
    --border-primary: #FFFFFF;
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
  outline: 2px solid var(--discord-brand);
  outline-offset: 2px;
}

.btn:focus-visible {
  outline: 2px solid var(--discord-brand);
  outline-offset: 2px;
}

.message-input:focus-visible {
  outline: 2px solid var(--discord-brand);
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
  animation: typing 1.5s infinite;
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
  box-shadow: 0 4px 20px rgba(88, 101, 242, 0.2);
}

.hover-glow:hover {
  box-shadow: 0 0 10px var(--discord-brand);
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

This comprehensive styling system provides the foundation for Revolution Network's Discord-like interface with cyberpunk aesthetics, ensuring a familiar yet unique user experience that combines the best of both worlds.