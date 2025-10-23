# Revolution Network Mobile App

A React Native mobile application for the Revolution Network platform, featuring real-time collaboration, offline capabilities, and enterprise-grade security.

## Features

### 🔐 Authentication
- Email/password authentication
- OAuth integration (Google, GitHub, Discord)
- Biometric authentication (Face ID, Touch ID, Fingerprint)
- Two-factor authentication (2FA)
- Demo mode for testing

### 📱 Core Features
- **Anthony Letters**: Read and track progress through the revolutionary letters
- **Project Management**: Create, fund, and manage revolutionary projects
- **Real-time Chat**: Communicate with other revolutionaries
- **Dashboard**: View your impact and progress
- **Profile Management**: Manage your account and preferences

### 🔄 Offline Support
- Offline data synchronization
- Queue actions for when online
- Cached content for offline reading
- Background sync when connection restored

### 🔔 Push Notifications
- Real-time project updates
- Letter completion notifications
- Chat messages
- System announcements
- Customizable notification preferences

### 🎨 UI/UX
- Cyberpunk theme with neon accents
- Dark mode optimized
- Smooth animations and transitions
- Responsive design for all screen sizes
- Accessibility support

## Tech Stack

- **React Native 0.72+**
- **TypeScript** for type safety
- **React Navigation 6** for navigation
- **React Native Vector Icons** for icons
- **React Native Linear Gradient** for gradients
- **React Native Async Storage** for local storage
- **React Native Biometrics** for biometric auth
- **React Native Push Notification** for notifications
- **React Native Camera** for camera integration
- **React Native Share** for sharing functionality

## Getting Started

### Prerequisites

- Node.js 18+ 
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update environment variables with your configuration

### Environment Variables

Create a `.env` file in the mobile directory:

```env
# API Configuration
API_BASE_URL=https://your-api-url.com
API_KEY=your-api-key

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
DISCORD_CLIENT_ID=your-discord-client-id

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
FCM_SENDER_ID=your-fcm-sender-id

# Analytics
MIXPANEL_TOKEN=your-mixpanel-token
SENTRY_DSN=your-sentry-dsn
```

### Running the App

#### iOS
```bash
npx react-native run-ios
```

#### Android
```bash
npx react-native run-android
```

### Development

#### Code Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── services/           # API and service integrations
├── navigation/         # Navigation configuration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── constants/          # App constants
```

#### Key Services

- **authService**: Handles authentication, biometric login, and user management
- **offlineService**: Manages offline synchronization and data caching
- **pushNotificationService**: Handles push notifications and local notifications

### Building for Production

#### Android
```bash
cd android
./gradlew assembleRelease
```

#### iOS
```bash
cd ios
xcodebuild -workspace RevNet.xcworkspace -scheme RevNet -configuration Release
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## Features Implementation

### Authentication Flow
1. User opens app
2. Check for existing authentication
3. If authenticated, proceed to main app
4. If not, show login/register screens
5. Support OAuth, biometric, and demo login

### Offline Synchronization
1. Queue actions when offline
2. Store data locally using AsyncStorage
3. Sync when connection restored
4. Handle conflicts and merge strategies

### Push Notifications
1. Request permission on app launch
2. Register for push notifications
3. Handle incoming notifications
4. Update UI based on notification data

### Real-time Features
1. WebSocket connection for real-time updates
2. Handle connection state changes
3. Reconnect on network restoration
4. Queue messages when offline

## Deployment

### App Store (iOS)
1. Build release version
2. Upload to App Store Connect
3. Submit for review
4. Configure app metadata and screenshots

### Google Play Store (Android)
1. Build release APK/AAB
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

### Over-the-Air Updates
- Configure CodePush for instant updates
- Test updates in staging environment
- Deploy to production with rollback capability

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

### Debug Mode
- Enable debug mode in development
- Use React Native Debugger
- Monitor network requests
- Check console logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## Roadmap

### Upcoming Features
- [ ] Advanced project collaboration tools
- [ ] Voice messages in chat
- [ ] AR/VR project visualization
- [ ] Advanced analytics dashboard
- [ ] Social features and networking
- [ ] Integration with external platforms
- [ ] Advanced security features
- [ ] Performance optimizations

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added offline support and push notifications
- **v1.2.0** - Enhanced security and biometric authentication
- **v2.0.0** - Major UI overhaul and performance improvements

---

Built with ❤️ by the Revolution Network team
