# Revolution Network

> Empowering grassroots political activism through crowdfunded revolutionary acts

A Next.js 15 application that provides a platform for revolutionary political activism, featuring the complete Anthony Letters system, project funding, real-time collaboration, and FEC compliance monitoring.

## Features

### 🎯 Core Features
- **The Anthony Letters**: Complete 30-letter educational curriculum
- **Project Management**: Create and manage revolutionary projects
- **Crowdfunding**: Support projects with secure payments
- **Real-time Chat**: Connect with fellow revolutionaries
- **FEC Compliance**: Automatic monitoring and legal guidance

### 🔐 Authentication
- NextAuth.js with OAuth providers (Google, GitHub, Discord)
- Demo mode for development
- Role-based access control

### 💰 Payment Processing
- Stripe integration for secure donations
- FEC compliance monitoring at $4,500 and $5,000 thresholds
- Legal resources and guidance

### 🚀 Real-time Features
- Socket.IO for live chat and presence
- Real-time project updates
- Live activity feed

### 🎨 Design
- Cyberpunk/terminal aesthetic
- Matrix rain effects
- Neon glow animations
- Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Real-time**: Socket.IO
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/revolution-network.git
   cd revolution-network
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   MONGODB_URI=mongodb://localhost:27017/revolution-network
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── letters/           # Anthony Letters pages
│   ├── projects/          # Project management pages
│   └── chat/              # Chat pages
├── components/            # React components
│   ├── ui/                # UI components
│   ├── forms/             # Form components
│   ├── widgets/           # Dashboard widgets
│   ├── terminal/          # Terminal interface
│   ├── effects/           # Visual effects
│   └── chat/              # Chat components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # Database connection
│   ├── models.ts         # Database models
│   ├── stripe.ts         # Stripe configuration
│   └── socket.ts         # Socket.IO configuration
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── data/                  # Static data (letters, etc.)
```

## The Anthony Letters

The Anthony Letters is a 30-letter educational curriculum divided into 4 books:

1. **The Awakening** (Letters 1-7): Understanding the system
2. **The Foundation** (Letters 8-15): Building knowledge and skills
3. **The Arsenal** (Letters 16-22): Tools for change
4. **The Revolution** (Letters 23-30): Taking action

Each letter includes:
- Educational content
- Practical assignments
- Progressive unlocking system
- Achievement tracking

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Letters
- `GET /api/letters` - Get all letters
- `GET /api/letters/[id]` - Get specific letter
- `POST /api/letters/complete` - Mark letter as completed

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get specific project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Payments
- `POST /api/stripe/create-payment-intent` - Create payment intent
- `POST /api/stripe/webhook` - Stripe webhook handler

### Real-time
- `GET /api/socket` - Socket.IO endpoint

## Deployment

See [deploy.md](./deploy.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables
4. Deploy!

```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@revolution-network.com or join our Discord server.

## Acknowledgments

- Anthony M. Carbonaro for The Anthony Letters
- The open-source community for amazing tools and libraries
- All the revolutionaries who believe in change

---

**Remember**: This is a tool for education and activism. Use it responsibly and in accordance with local laws and regulations.