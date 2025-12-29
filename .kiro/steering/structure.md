# Project Structure

## Root Files
- `App.tsx` - Main application component with routing and auth logic
- `index.tsx` - React app entry point
- `types.ts` - Comprehensive TypeScript type definitions
- `firebaseConfig.ts` - Firebase initialization with fallback for guest mode

## Directory Organization

### `/components`
Reusable UI components
- `Sidebar.tsx` - Main navigation sidebar

### `/pages`
Top-level page components (one per app view)
- `Landing.tsx` - Landing page with auth options
- `Dashboard.tsx` - Main dashboard with stats and overview
- `Summarizer.tsx` - AI content summarization interface
- `Notes.tsx` - Visual note editor with canvas-style interface
- `Routine.tsx` - Adaptive routine generation and management
- `Focus.tsx` - Pomodoro-style focus session timer
- `Quiz.tsx` - AI-generated quiz interface
- `Onboarding.tsx` - User preference setup (currently skipped)

### `/services`
Business logic and external integrations
- `storageService.ts` - Dual storage abstraction (local + Firestore)
- `geminiService.ts` - Google AI integration for summarization and quiz generation
- `extractionService.ts` - Content extraction from URLs and YouTube

## Architectural Conventions

### State Management
- React useState for component-level state
- Props drilling for data flow between components
- StorageService handles persistence layer abstraction

### Data Flow
1. **App.tsx** manages global state (user, notes, summaries, stats)
2. **Pages** receive data via props and callbacks
3. **Services** handle all external API calls and data persistence

### Component Patterns
- Functional components with hooks
- TypeScript interfaces for all props
- Consistent error handling with fallbacks
- Loading states for async operations

### File Naming
- PascalCase for components (`Dashboard.tsx`)
- camelCase for services (`storageService.ts`)
- Descriptive names reflecting functionality