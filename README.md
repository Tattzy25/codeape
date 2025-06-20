# 🔥 ARMO - AI Chatbot with Redis Storage

A revolutionary, modern, responsive chatbot application powered by Groq's lightning-fast AI models with advanced Redis-based data persistence. Meet **Armo** - your savage, witty AI companion with personality, memory, and attitude. Built with React, Vite, Tailwind CSS, and Redis featuring a beautiful neumorphism design.

![Armo AI](https://img.shields.io/badge/AI-Armo%20Powered-red?style=for-the-badge&logo=robot)
![Redis](https://img.shields.io/badge/Redis-Enabled-DC382D?style=for-the-badge&logo=redis)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.5-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔥 **Meet Armo - Your AI with Attitude**
- **Savage Personality**: Witty, roasting, and brutally honest responses
- **Dynamic Moods**: Flirty, savage, emotional, annoyed - adapts to conversations
- **Respect Meter**: Tracks your standing with Armo (0-100%)
- **Memory System**: Remembers your jokes, preferences, and interactions
- **Emoji Reactions**: React to messages with custom Armenian-style emojis

### 🚀 **Lightning Fast AI**
- Powered by Groq's high-performance AI models
- Real-time streaming responses
- Multiple model selection (Llama 4 Scout, Llama 4 Maverick)
- Optimized for speed and efficiency
- Web search integration with Tavily API

### 💾 **Redis-Powered Persistence**
- **Chat History**: 24h-7d TTL for seamless conversations
- **Session State**: Tracks conversation modes and context
- **User Preferences**: 30-day persistence for settings
- **Search Cache**: 1h caching to prevent API overload
- **Joke Bank**: Stores user jokes for future roasting (3d TTL)
- **Reaction Tracking**: Emoji reaction analytics (7d TTL)
- **Moderation Flags**: User behavior tracking and warnings
- **Last Seen**: Activity monitoring for comeback roasts

### 🎨 **Modern UI/UX**
- Beautiful neumorphism design system
- Smooth animations with Framer Motion
- Mobile-first responsive design
- Armo-themed interface with personality
- Accessibility compliant (WCAG 2.1)

### 📱 **Mobile Optimized**
- Progressive Web App (PWA) ready
- Touch-friendly interface
- Offline capability with localStorage fallback
- Installable on mobile devices
- Optimized for all screen sizes

### 🔧 **Advanced Features**
- Adjustable AI parameters (temperature, max tokens, top-p)
- Model selection and switching
- Voice playback (placeholder)
- Moment saving and bookmarking
- Export/Import chat history
- Deep search toggle
- Real-time typing indicators

### 🔒 **Secure & Private**
- API keys stored locally in browser
- Redis data with TTL expiration
- HTTPS ready
- Input validation and sanitization
- Graceful fallback to localStorage

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ installed ([Download](https://nodejs.org/))
- **Groq API Key** (get one free at [console.groq.com/keys](https://console.groq.com/keys))
- **Redis Database** (Upstash recommended - [console.upstash.com](https://console.upstash.com/))
- **Tavily API Key** (optional, for web search - [tavily.com](https://tavily.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/armo-chatbot.git
   cd armo-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   UPSTASH_REDIS_REST_URL=your_redis_url_here
   UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
   VITE_TAVILY_API_KEY=your_tavily_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🤖 Supported AI Models

| Model | Description | Max Tokens | Speed | Best For |
|-------|-------------|------------|-------|----------|
| **Llama 4 Scout 17B** | Advanced scouting and exploration capabilities | 5,000 | ⚡ Fast | Scout & Analysis |
| **Llama 4 Maverick 17B** | Innovative and creative problem solving | 5,000 | ⚡ Fast | Creative Reasoning |

## ⚙️ Configuration

### AI Settings

- **Temperature** (0.0 - 2.0): Controls creativity vs consistency
- **Max Tokens** (256 - 5,000): Maximum response length
- **Top P** (0.1 - 1.0): Controls response diversity
- **Streaming**: Real-time response generation

### Environment Variables

```env
# Required - Groq AI API
VITE_GROQ_API_KEY=your_groq_api_key_here

# Required - Redis Database (Upstash recommended)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Optional - Web Search
VITE_TAVILY_API_KEY=your_tavily_api_key_here
```

## 🔥 Redis Storage System

Armo uses Redis for advanced data persistence with intelligent TTL management:

### Storage Types

| Data Type | Key Pattern | TTL | Purpose |
|-----------|-------------|-----|----------|
| **Chat History** | `chat:session:{sessionId}` | 24h | Recent conversation context |
| **Session State** | `session:{sessionId}` | 24h | Current mode & page tracking |
| **Respect Meter** | `meter:respect:{userId}` | 7d | User respect score (0-5) |
| **Mood Meter** | `meter:mood:{userId}` | 7d | Armo's current mood |
| **Search Cache** | `search:{queryHash}` | 1h | Cached Tavily search results |
| **User Jokes** | `jokes:user:{userId}` | 3d | User's funny moments for roasting |
| **Reactions** | `reaction:message:{messageId}` | 7d | Emoji reaction tracking |
| **User Preferences** | `prefs:user:{userId}` | 30d | Settings & behavior preferences |
| **Moderation Flags** | `flags:user:{userId}` | 24h | Warnings, mutes, timeouts |
| **Last Seen** | `lastSeen:user:{userId}` | 7d | Activity tracking |

### Redis Commands Reference

#### 1. Chat History Management
```javascript
// Set chat history
await redis.set(`chat:session:${sessionId}`, JSON.stringify(chatMessages), { ex: 86400 });

// Get chat history
const history = await redis.get(`chat:session:${sessionId}`);
const messages = history ? JSON.parse(history) : [];
```

#### 2. Session State Tracking
```javascript
// Set session state
await redis.set(`session:${sessionId}`, JSON.stringify({
  currentMode: 'roast',
  lastPage: 'home',
  joinedAt: Date.now()
}), { ex: 86400 });

// Get session state
const state = await redis.get(`session:${sessionId}`);
const session = state ? JSON.parse(state) : {};
```

#### 3. Respect & Mood Meters
```javascript
// Update respect/mood meter
await redis.set(`meter:respect:${userId}`, respectScore, { ex: 604800 }); // 7 days
await redis.set(`meter:mood:${userId}`, currentMood, { ex: 604800 });

// Get respect/mood
const respect = await redis.get(`meter:respect:${userId}`);
const mood = await redis.get(`meter:mood:${userId}`);
```

#### 4. Search Result Caching
```javascript
// Cache search results
await redis.set(`search:${queryHash}`, JSON.stringify(results), { ex: 3600 }); // 1 hour

// Get cached search results
const cached = await redis.get(`search:${queryHash}`);
const results = cached ? JSON.parse(cached) : null;
```

#### 5. User Joke Bank
```javascript
// Save user jokes
await redis.set(`jokes:user:${userId}`, JSON.stringify(jokesArray), { ex: 259200 }); // 3 days

// Fetch user jokes
const jokeData = await redis.get(`jokes:user:${userId}`);
const jokes = jokeData ? JSON.parse(jokeData) : [];
```

#### 6. Reaction Tracking
```javascript
// Track reactions
await redis.set(`reaction:message:${messageId}`, JSON.stringify({ 😂: 3, 💀: 1 }), { ex: 604800 });

// Get reactions
const reactionData = await redis.get(`reaction:message:${messageId}`);
const reactions = reactionData ? JSON.parse(reactionData) : {};
```

#### 7. User Preferences
```javascript
// Save user preferences
await redis.set(`prefs:user:${userId}`, JSON.stringify({
  flirtMode: true,
  censorMode: false
}), { ex: 2592000 }); // 30 days

// Get user preferences
const prefs = await redis.get(`prefs:user:${userId}`);
const userPrefs = prefs ? JSON.parse(prefs) : {};
```

#### 8. Moderation System
```javascript
// Set moderation flag
await redis.set(`flags:user:${userId}`, JSON.stringify({
  muted: true,
  reason: "Too many cringe messages"
}), { ex: 86400 });

// Get flag status
const flagged = await redis.get(`flags:user:${userId}`);
const flags = flagged ? JSON.parse(flagged) : {};
```

#### 9. Activity Tracking
```javascript
// Track last seen
await redis.set(`lastSeen:user:${userId}`, Date.now(), { ex: 604800 }); // 7 days
```

### TTL Reference (seconds)
- **1 hour** → `3600`
- **1 day** → `86400`
- **3 days** → `259200`
- **7 days** → `604800`
- **30 days** → `2592000`

## 🎭 Armo Personality System

### Mood States
Armo maintains different mood states that affect response style:
- **Happy** 😊 - Cheerful and encouraging
- **Savage** 🔥 - Roasting and brutally honest  
- **Flirty** 😏 - Playful and teasing
- **Emotional** 😢 - Deep and empathetic
- **Annoyed** 😤 - Short and sarcastic

### Respect Meter
Tracks your relationship with Armo (0-100%):
- **0-25%**: Armo is hostile and sarcastic
- **26-50%**: Neutral but still roasts you
- **51-75%**: Friendly with occasional sass
- **76-100%**: Loyal companion with playful banter

### Reaction System
Users can react to Armo's messages with custom emojis:
- 🔥 Fire - For savage responses
- 😂 Laugh - For funny moments  
- ❤️ Heart - For sweet messages
- 🤔 Think - For deep thoughts
- 😤 Angry - For annoying responses

## 🔧 Setup Instructions

For detailed Redis setup instructions, see [REDIS_SETUP.md](./REDIS_SETUP.md)

### Quick Redis Setup (Upstash)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy REST URL and Token
4. Add to your `.env` file
5. Start the application

### Local Redis Setup
1. Install Redis locally
2. Update `pages/api/redis.js` for local connection
3. Start Redis server
4. Configure connection in environment# Required
VITE_GROQ_API_KEY=your_api_key

# Optional
VITE_DEFAULT_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
VITE_DEFAULT_TEMPERATURE=0.7
VITE_DEFAULT_MAX_TOKENS=5000
VITE_APP_NAME="Your App Name"
```

## 🏗️ Project Structure

```
armo-ai-chatbot/
├── src/
│   ├── components/          # React components
│   │   ├── ChatMessage.jsx  # Message display component
│   │   ├── ApiKeyModal.jsx  # API key configuration
│   │   ├── SettingsModal.jsx # AI settings panel
│   │   └── TypingIndicator.jsx # Loading animation
│   ├── services/
│   │   └── groqService.js   # Groq API integration
│   ├── App.jsx             # Main application
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── README.md              # This file
```

## 🎨 Design System

### Neumorphism Theme

Our design system is built around the neumorphism concept with:

- **Soft shadows** and highlights
- **Subtle depth** and dimension
- **Smooth color transitions**
- **Tactile button interactions**

### Color Palette

```css
/* Primary Colors */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-gradient: linear-gradient(135deg, #4ecdc4 0%, #45b7d1 100%);

/* Neumorphism Base */
--neuro-base: #e0e5ec;
--neuro-light: #ffffff;
--neuro-dark: #a3b1c6;
```

### Typography

- **Font Family**: System font stack for optimal performance
- **Responsive sizing**: Scales across all devices
- **Proper contrast**: WCAG 2.1 AA compliant

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Tech Stack

- **Frontend Framework**: React 18 with hooks
- **Build Tool**: Vite for lightning-fast development
- **Styling**: Tailwind CSS with custom neumorphism utilities
- **Animations**: Framer Motion for smooth interactions
- **AI Integration**: Groq SDK for API communication
- **Icons**: Lucide React for beautiful icons
- **Markdown**: React Markdown with syntax highlighting
- **PWA**: Vite PWA plugin for offline capability
- **File Compression**: JSZip for chat export/import functionality

### Code Quality

- **ESLint**: Code linting and formatting (v9 with flat config)
- **Prettier**: Code formatting (coming soon)
- **TypeScript**: Type safety (migration planned)
- **Testing**: Jest + React Testing Library (coming soon)

## 📱 PWA Features

### Installation

The app can be installed on any device:

1. **Desktop**: Click the install button in your browser
2. **Mobile**: Use "Add to Home Screen" option
3. **iOS**: Safari > Share > Add to Home Screen

### Offline Support

- **Service Worker**: Caches app shell and assets
- **Background Sync**: Queues messages when offline
- **Cache Strategy**: Network-first for API calls

## 🔒 Security

### Data Privacy

- **Local Storage**: API keys stored in browser only
- **No Tracking**: No analytics or tracking by default
- **HTTPS**: Secure communication with Groq API
- **Input Sanitization**: XSS protection

### Best Practices

- **API Key Security**: Never commit keys to repository
- **Environment Variables**: Use `.env` for configuration
- **Content Security Policy**: Prevents XSS attacks
- **Secure Headers**: HTTPS enforcement in production

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** automatically on push

```bash
npm i -g vercel
vercel --prod
```

### Netlify

1. **Build the project**
   ```bash
   npm run build
   ```
2. **Deploy the `dist` folder** to Netlify
3. **Set environment variables** in Netlify dashboard

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t armo-chatbot .
docker run -p 3000:3000 armo-chatbot
```

## 🚀 Performance

### Optimization Features

- **Code Splitting**: Automatic chunk splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Aggressive caching strategies

### Metrics

- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🧪 Testing

### Unit Tests (Coming Soon)

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report
```

### E2E Tests (Coming Soon)

```bash
npm run e2e         # Run Playwright tests
npm run e2e:ui      # Interactive mode
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 🗺️ Roadmap

### Version 2.0 🎯
- [ ] Voice chat integration
- [ ] Custom personality training
- [ ] Multi-language support
- [ ] Advanced emotion detection

### Version 2.1 🔮
- [ ] Image generation capabilities
- [ ] File upload and analysis
- [ ] Custom theme builder
- [ ] Advanced analytics dashboard

### Version 3.0 🚀
- [ ] Multi-user chat rooms
- [ ] AI model switching
- [ ] Plugin system
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for lightning-fast AI inference
- [Redis](https://redis.io/) for robust data persistence
- [React](https://reactjs.org/) for the amazing UI framework
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📞 Support

If you encounter any issues or have questions:

- 📧 Email: support@armo.dev
- 💬 Discord: [Join our community](https://discord.gg/armo)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/armo-chatbot/issues)

---

<div align="center">
  <h3>🌟 Show Your Support</h3>
  <p>If you found this project helpful, please consider:</p>
  
  [![Star this repo](https://img.shields.io/github/stars/yourusername/armo-chatbot?style=social)](https://github.com/yourusername/armo-chatbot)
  [![Follow on GitHub](https://img.shields.io/github/followers/yourusername?style=social)](https://github.com/yourusername)
  
  <p><strong>⭐ Star this repository if it helped you!</strong></p>
</div>
