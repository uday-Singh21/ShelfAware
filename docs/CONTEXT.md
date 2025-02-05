# Shelf Aware

## Overview
Shelf Aware is a React Native mobile app designed to track perishable items using barcode scanning and OCR to extract expiry dates. It helps users manage product expiration with timely notifications and a modern, intuitive UI.

## Core Features
- Barcode scanning and OCR for expiry date extraction
- Push notifications for expiring items
- Modern, intuitive user interface
- Multi-language support
- Cloud synchronization via Firebase

## App Architecture

### Authentication Flow
- **Login Screen**
  - Email and password fields
  - "Forgot Password?" functionality
  - Link to sign-up screen
- **Sign-Up Screen**
  - Name, email, and password fields
  - Firebase authentication integration
  - Link back to login

### Main Navigation
The app uses bottom tab navigation with four primary sections:
1. **Home** - Main dashboard and scanning
2. **Expired Products** - Expiration tracking
3. **Notifications** - Alert management
4. **Settings** - App customization

### Screen Details

#### Home Screen
- Central scan button for barcode/OCR
- Recently scanned products list
- Quick access to product details
- Expiring soon alerts

#### Product Details Screen
- Complete product information display
- Manual edit capabilities
- Options to delete or mark as used

#### Expired Products Screen
- Expired/near-expiry items list
- Filtering capabilities
- Direct access to product details

#### Notifications Screen
- Expiry alert history
- Notification management options
- Archive functionality

#### Settings Screen
- Notification preferences
- Alert threshold customization
- Language settings
- Account management

## Technical Implementation

### Tech Stack
- **Frontend**: React Native with JavaScript
- **Backend/Database**: Firebase
- **UI Framework**: React Native Paper

### Core Technologies
- **Frontend Framework**: React Native
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Backend/Auth**: Firebase
- **Scanning**: react-native-vision-camera
- **OCR**: tesseract.js
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Design Guidelines
- Material Design principles
- iOS Human Interface Guidelines
- Smooth animations and transitions
- Responsive layouts
- Typography:
  - Primary Font: Inter (Modern, clean, highly legible)
  - Secondary Font: SF Pro Display (iOS) / Roboto (Android)
  - Monospace: JetBrains Mono (for code or numeric displays)

### Development Priorities
1. User-friendly interface
2. Reliable scanning functionality
3. Accurate expiry date extraction
4. Timely notification delivery
5. Seamless cloud synchronization

### Database Schema

#### Firebase Collections

##### Users
```json
{
  "uid": "string",              // Firebase Auth UID
  "email": "string",
  "displayName": "string",
  "createdAt": "timestamp",
  "settings": {
    "language": "string",
    "notificationPreferences": {
      "expiryThreshold": "number",  // Days before expiry
      "pushEnabled": "boolean"
    }
  }
}
```

##### Products
```json
{
  "id": "string",
  "userId": "string",          // Reference to user
  "name": "string",
  "barcode": "string",
  "category": "string",
  "expiryDate": "timestamp",
  "addedDate": "timestamp",
  "isExpired": "boolean",
  "imageUrl": "string?",
  "notes": "string?"
}
```

##### Notifications
```json
{
  "id": "string",
  "userId": "string",          // Reference to user
  "productId": "string",       // Reference to product
  "type": "'expiring' | 'expired'",
  "message": "string",
  "createdAt": "timestamp",
  "read": "boolean"
}
```

### Project Structure
```
src/
├── api/                    # API integration layers
│   ├── firebase.js
│   └── notifications.js
├── assets/                 # Static assets
│   ├── images/
│   └── fonts/
├── components/             # Reusable components
│   ├── common/            # Shared components
│   └── screens/           # Screen-specific components
├── constants/              # App constants
│   ├── colors.js
│   └── config.js
├── hooks/                  # Custom React hooks
├── navigation/             # Navigation configuration
│   └── NavigationStack.js
├── screens/                # Main screen components
│   ├── auth/
│   ├── home/
│   ├── products/
│   └── settings/
├── services/              # Business logic
│   ├── auth/
│   ├── products/
│   └── notifications/
├── store/                 # Redux store setup
│   ├── slices/
│   └── index.js
├── utils/                 # Helper functions
└── App.js
```

### Security Rules
Firebase security rules ensure that:
- Users can only access their own data
- Products are associated with valid users
- Notifications maintain user privacy
- Write operations validate data structure

# Development Plan

## Phase 1: Project Setup & Authentication (2 weeks)
1. Initialize React Native project with JavaScript
2. Set up development environment and tooling
3. Configure Firebase project
4. Implement basic navigation structure
5. Create authentication screens (Login/Signup)
6. Implement Firebase authentication
7. Add "Forgot Password" functionality
8. Set up basic Redux store for auth state

## Phase 2: Core UI & Navigation (2 weeks)
1. Set up bottom tab navigation
2. Create skeleton screens for all main sections
3. Implement shared components library
4. Set up theming system with Material Design
5. Create responsive layouts for different screen sizes
6. Implement basic settings screen
7. Add language switching functionality
8. Set up navigation state management

## Phase 3: Scanning & Product Management (3 weeks)
1. Integrate react-native-vision-camera
2. Implement barcode scanning functionality
3. Set up OCR with tesseract.js
4. Create product data management in Firebase
5. Implement product list views
6. Add product detail screen
7. Create product editing functionality
8. Implement product deletion

## Phase 4: Expiry Management & Notifications (2 weeks)
1. Set up Firebase Cloud Messaging
2. Implement notification permissions handling
3. Create notification scheduling system
4. Build expiry date tracking logic
5. Implement expired products screen
6. Create notification history screen
7. Add notification preferences
8. Implement notification actions

## Phase 5: Cloud Sync & Data Management (2 weeks)
1. Implement Firebase real-time sync
2. Set up offline data persistence
3. Create data backup system
4. Implement data recovery options
5. Add data export functionality
6. Create account management features
7. Implement data cleanup routines
8. Add usage analytics

## Phase 6: Polish & Testing (2 weeks)
1. Add loading states and error handling
2. Implement smooth animations
3. Add haptic feedback
4. Optimize performance
5. Conduct user testing
6. Fix bugs and UI issues
7. Add app onboarding
8. Prepare for app store submission

## Phase 7: Launch Preparation (1 week)
1. Create app store listings
2. Prepare marketing materials
3. Set up crash reporting
4. Configure analytics
5. Create support documentation
6. Set up user feedback system
7. Prepare release notes
8. Submit to app stores

## Development Guidelines

### For Each Task:
1. Create feature branch
2. Write basic tests
3. Implement functionality
4. Add error handling
5. Write documentation
6. Conduct code review
7. Test on both iOS and Android
8. Merge to development branch

### Quality Checklist:
- Error boundaries implemented
- Loading states handled
- Offline functionality tested
- Accessibility features added
- Cross-platform testing completed
- Performance metrics met
- Security rules verified

### Testing Strategy:
- Unit tests for utilities and hooks
- Integration tests for main flows
- E2E tests for critical paths
- Performance testing
- Security testing
- Usability testing
- Cross-device testing
