# Revolution Network

> Empowering grassroots political activism through crowdfunded revolutionary acts

A Next.js 15 application that provides a platform for revolutionary political activism, featuring the complete Anthony Letters system, project funding, real-time collaboration, and FEC compliance monitoring.

## 🎯 Vision

Revolution Network is designed to democratize political activism by providing a platform where individuals can learn, organize, and fund revolutionary projects. The platform combines educational content (The Anthony Letters), project management, crowdfunding, and legal compliance monitoring to create a comprehensive ecosystem for political change.

## 🚀 Core Features

### Educational Foundation
- **The Anthony Letters System** - 30 progressive letters across 4 books teaching revolutionary principles
- **Progressive Unlocking** - Features unlock based on letter completion
- **Assignment System** - Interactive assignments for each letter
- **Achievement Tracking** - Gamified learning experience

### Project Management
- **4-Step Creation Wizard** - Guided project creation process
- **Crowdfunding Integration** - Stripe-powered donation system
- **Team Collaboration** - Role-based project participation
- **Real-time Updates** - Live project progress tracking

### Legal Compliance
- **FEC Monitoring** - Automatic alerts at $4,500 and $5,000 thresholds
- **Legal Resources** - Built-in compliance guidance
- **Registration Assistance** - Help with political committee formation

### Social Features
- **Real-time Chat** - Project-specific and general chat rooms
- **Activity Feeds** - Community updates and project news
- **User Profiles** - Creator and supporter dashboards
- **Following System** - Connect with other activists

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless backend
- **MongoDB** - Document database
- **NextAuth.js** - Authentication
- **Socket.IO** - Real-time communication

### Payments & Compliance
- **Stripe** - Payment processing
- **FEC API Integration** - Compliance monitoring
- **Webhook Handling** - Real-time payment updates

### Design System
- **Cyberpunk Aesthetic** - Terminal-inspired interface
- **Matrix Rain Effects** - Immersive animations
- **Neon Accents** - Green, cyan, purple color scheme
- **Monospace Typography** - Fira Code font family

## 🎮 User Journey

### 1. Terminal Interface
New users are greeted with a Matrix-inspired terminal interface featuring:
- Matrix rain background animation
- Interactive "red pill/blue pill" choice
- Web Audio API knock sound effects
- Cookie-based state management

### 2. Anthony Letters Progression
Users must complete The Anthony Letters to unlock platform features:

**Book 1: The Awakening (Letters 1-7)**
- Unlocks: Join existing revolts
- Teaches: System awareness, power structures

**Book 2: The Foundation (Letters 8-15)**
- Unlocks: Create local revolts
- Teaches: Organizing principles, community building

**Book 3: The Arsenal (Letters 16-28)**
- Unlocks: Create national revolts
- Teaches: Advanced tactics, strategic planning

**Book 4: The Revolution (Letters 29-30)**
- Unlocks: Full platform access + Revolutionary badge
- Teaches: Leadership, systemic change

### 3. Dashboard Access
Progressive dashboard access based on letter completion:
- **0 Letters**: Anthony Letters interface only
- **1-29 Letters**: Progress tracking and limited features
- **30 Letters**: Full dashboard with chat widgets and project access

### 4. Project Participation
- **Join Projects**: Participate in existing revolutionary acts
- **Create Projects**: Launch your own initiatives
- **Fund Projects**: Support causes with donations
- **Collaborate**: Work with teams on complex projects

## 📊 Progressive Unlocking System

| Letters Completed | Unlocked Features |
|------------------|-------------------|
| 0-7 | Join existing revolts |
| 8-15 | Create local revolts |
| 16-28 | Create national revolts |
| 29-30 | Full platform access + Revolutionary badge |

## 🎨 Design Philosophy

### Cyberpunk Aesthetic
- **Terminal Interface** - Matrix-inspired onboarding
- **Monospace Typography** - Authentic hacker feel
- **Neon Accents** - High-contrast color scheme
- **Dark Theme** - Reduced eye strain for long sessions

### Tiled Window Manager
- **Panel-based Layout** - Organized information display
- **Widget System** - Modular dashboard components
- **Responsive Design** - Mobile-first approach
- **Accessibility** - High contrast and keyboard navigation

## 🔒 Security & Compliance

### Authentication
- **OAuth Integration** - Google, GitHub, Discord
- **Session Management** - Secure JWT tokens
- **Demo Mode** - Development-friendly authentication

### Legal Compliance
- **FEC Monitoring** - Automatic threshold alerts
- **Legal Resources** - Built-in compliance guidance
- **Registration Help** - Political committee formation
- **Audit Trails** - Complete donation tracking

### Data Protection
- **MongoDB Security** - Encrypted connections
- **Stripe PCI Compliance** - Secure payment processing
- **User Privacy** - Anonymous donation options
- **GDPR Compliance** - Data protection measures

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account
- OAuth provider accounts (optional)

### Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

### Environment Setup
See [11-ENVIRONMENT-CONFIG.md](./11-ENVIRONMENT-CONFIG.md) for detailed setup instructions.

## 📁 Documentation Structure

- [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) - Technical architecture and component structure
- [02-DATABASE-SCHEMA.md](./02-DATABASE-SCHEMA.md) - Database design and data models
- [03-AUTHENTICATION.md](./03-AUTHENTICATION.md) - Auth system and user management
- [04-ANTHONY-LETTERS.md](./04-ANTHONY-LETTERS.md) - Complete letter content and progression
- [05-PAYMENT-FEC.md](./05-PAYMENT-FEC.md) - Payment processing and compliance
- [06-UI-COMPONENTS.md](./06-UI-COMPONENTS.md) - Component library and usage
- [07-STYLING-THEME.md](./07-STYLING-THEME.md) - Design system and styling
- [08-API-ENDPOINTS.md](./08-API-ENDPOINTS.md) - API documentation
- [09-REALTIME-FEATURES.md](./09-REALTIME-FEATURES.md) - Socket.IO and chat system
- [10-PROJECT-SYSTEM.md](./10-PROJECT-SYSTEM.md) - Project management features
- [11-ENVIRONMENT-CONFIG.md](./11-ENVIRONMENT-CONFIG.md) - Environment setup
- [12-KNOWN-ISSUES.md](./12-KNOWN-ISSUES.md) - Issues and improvements
- [13-DEPENDENCIES.md](./13-DEPENDENCIES.md) - Package dependencies
- [14-DEPLOYMENT.md](./14-DEPLOYMENT.md) - Production deployment guide

## 🎯 Success Metrics

The platform is successful when:
1. Users complete the Anthony Letters progression
2. Projects receive meaningful funding
3. Real-time collaboration drives engagement
4. FEC compliance is maintained
5. Mobile experience is seamless

## 🔮 Future Roadmap

### Phase 1: Core Platform ✅
- [x] Terminal interface
- [x] Anthony Letters system
- [x] Basic project management
- [x] User authentication

### Phase 2: Social Features ✅
- [x] Feed system
- [x] User profiles
- [x] Real-time chat
- [x] Following system

### Phase 3: Payment Integration ✅
- [x] Stripe integration
- [x] FEC compliance
- [x] Donation tracking
- [x] Legal guidance

### Phase 4: Advanced Features (Future)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] International expansion

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the setup guides

---

**Built with ❤️ for the Revolution**
