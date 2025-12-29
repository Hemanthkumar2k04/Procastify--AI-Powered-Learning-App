# Technology Stack

## Frontend Framework
- **React 19.2.3** with TypeScript
- **Vite** as build tool and dev server
- **JSX/TSX** for component development

## Build System & Development

### Commands
```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

### Configuration
- **Vite Config**: Custom port 3000, host 0.0.0.0, React plugin
- **TypeScript**: ES2022 target, bundler module resolution
- **Path Aliases**: `@/*` maps to project root

## Backend Services
- **Firebase Authentication**: User management and auth
- **Firestore**: Cloud database for authenticated users
- **Google Gemini AI**: Content summarization and quiz generation

## Key Libraries

### UI & Visualization
- **Lucide React**: Icon library
- **Recharts**: Data visualization and charts
- **React Markdown**: Markdown rendering

### AI & Content Processing
- **@google/genai**: Gemini AI integration
- **YouTube Transcript**: Video transcript extraction
- **Cheerio**: Web scraping and HTML parsing

## Environment Variables
- `VITE_GEMINI_API_KEY`: Required for AI features
- `VITE_FIREBASE_*`: Firebase configuration (optional for guest mode)

## Architecture Patterns
- **Service Layer**: Separate services for storage, AI, and content extraction
- **Dual Storage**: Local storage for guests, Firestore for authenticated users
- **Type Safety**: Comprehensive TypeScript interfaces in `types.ts`
- **Component Composition**: Page-level components with shared UI components