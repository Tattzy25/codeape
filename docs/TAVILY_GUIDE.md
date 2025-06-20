# 🔍 Armo Tavily Search Complete Guide

Comprehensive guide for Tavily search integration with advanced features, matching the provided example implementation.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Key Setup](#api-key-setup)
- [Search Types](#search-types)
- [Advanced Features](#advanced-features)
- [Usage Examples](#usage-examples)
- [Configuration Options](#configuration-options)
- [Response Format](#response-format)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Automated Setup
```bash
npm run setup:tavily
```

This script will:
- Check environment configuration
- Validate API key setup
- Test search functionality
- Generate usage examples

### 2. Get Tavily API Key
1. Visit [tavily.com](https://tavily.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add to your `.env` file:

```env
TAVILY_API_KEY=tvly-prod*********************************
```

## 🔑 API Key Setup

### Environment Configuration

Add your Tavily API key to `.env`:

```env
# Tavily Search Configuration
TAVILY_API_KEY=your_tavily_api_key_here

# Optional: Search preferences
TAVILY_DEFAULT_SEARCH_DEPTH=basic
TAVILY_DEFAULT_MAX_RESULTS=5
TAVILY_ENABLE_IMAGES=true
TAVILY_ENABLE_DESCRIPTIONS=true
```

### Verification

Test your setup:
```bash
npm run tavily:test
```

## 🔍 Search Types

### 1. Basic Search
```javascript
import tavilyService from './src/services/tavilyService.js';

const result = await tavilyService.search('What is machine learning?');
console.log(result);
```

### 2. Advanced Search (Matches Example)
```javascript
// Equivalent to the provided Python example
const result = await tavilyService.advancedSearch(
  'What are AI startups that are based in NYC?'
);

// This automatically includes:
// - search_depth: "advanced"
// - include_answer: "advanced" 
// - include_images: true
// - include_image_descriptions: true
// - chunks_per_source: 5
```

### 3. Comprehensive Search
```javascript
// Maximum detail with all features
const result = await tavilyService.comprehensiveSearch(
  'Latest AI technology trends'
);
```

### 4. Image Search
```javascript
// Focus on images with descriptions
const images = await tavilyService.imageSearch(
  'neural network architecture diagrams'
);
```

### 5. Domain-Filtered Search
```javascript
// Include specific domains
const academic = await tavilyService.searchWithDomains(
  'machine learning research',
  ['arxiv.org', 'scholar.google.com'],
  true // include these domains
);

// Exclude specific domains
const filtered = await tavilyService.searchWithDomains(
  'AI news',
  ['example.com', 'spam-site.com'],
  false // exclude these domains
);
```

## ⚡ Advanced Features

### Custom Search Configuration

```javascript
const customResult = await tavilyService.search('AI startups NYC', {
  searchDepth: 'advanced',
  includeAnswer: 'advanced',
  includeImages: true,
  includeImageDescriptions: true,
  chunksPerSource: 8,
  maxResults: 15,
  includeDomains: ['techcrunch.com', 'venturebeat.com'],
  excludeDomains: ['spam-site.com'],
  includeRawContent: true
});
```

### Response Processing

```javascript
// Format for display
const formatted = tavilyService.formatAdvancedResults(result);
console.log(formatted.formatted); // Markdown formatted

// Extract key insights
const insights = tavilyService.extractInsights(result);
console.log(insights.summary);
insights.insights.forEach(insight => {
  console.log(`${insight.source}: ${insight.insight}`);
});
```

## 📊 Configuration Options

### Search Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `searchDepth` | string | 'basic' | 'basic' or 'advanced' |
| `includeAnswer` | boolean/string | true | true, false, or 'advanced' |
| `includeImages` | boolean | false | Include image results |
| `includeImageDescriptions` | boolean | false | Include image descriptions |
| `chunksPerSource` | number | 3 | Content chunks per source |
| `maxResults` | number | 5 | Maximum number of results |
| `includeDomains` | array | [] | Domains to include |
| `excludeDomains` | array | [] | Domains to exclude |
| `includeRawContent` | boolean | false | Include raw HTML content |

### Advanced Search Presets

```javascript
// Quick answer search
const quickAnswer = await tavilyService.getQuickAnswer('What is AI?');

// Academic research search
const academic = await tavilyService.search('quantum computing', {
  searchDepth: 'advanced',
  includeDomains: ['arxiv.org', 'nature.com', 'science.org'],
  chunksPerSource: 8,
  maxResults: 20
});

// News search
const news = await tavilyService.search('AI breakthrough 2024', {
  searchDepth: 'advanced',
  includeDomains: ['reuters.com', 'bbc.com', 'cnn.com'],
  maxResults: 15
});

// Visual search
const visual = await tavilyService.search('data visualization examples', {
  includeImages: true,
  includeImageDescriptions: true,
  maxResults: 25
});
```

## 📋 Response Format

### Standard Response

```javascript
{
  "success": true,
  "query": "AI startups in NYC",
  "searchDepth": "advanced",
  "results": [
    {
      "title": "Top AI Startups in New York City",
      "url": "https://example.com/ai-startups-nyc",
      "content": "New York City has become a hub for AI innovation...",
      "score": 0.95
    }
  ],
  "answer": "New York City hosts numerous AI startups including...",
  "images": [
    {
      "title": "AI Startup Ecosystem NYC",
      "url": "https://example.com/image.jpg"
    }
  ],
  "imageDescriptions": [
    "A visualization showing the AI startup ecosystem in NYC"
  ],
  "followUpQuestions": [
    "What are the top funded AI startups in NYC?",
    "Which NYC AI startups are hiring?"
  ],
  "metadata": {
    "totalResults": 10,
    "hasAnswer": true,
    "hasImages": true,
    "searchType": "advanced",
    "chunksPerSource": 5
  }
}
```

### Formatted Display

```javascript
const formatted = tavilyService.formatAdvancedResults(result);

// formatted.formatted contains:
/*
## Search Results for: "AI startups in NYC"

*Search Type: advanced | Results: 10*

### 🎯 Quick Answer
New York City hosts numerous AI startups including...

### 🌐 Web Results

**1. [Top AI Startups in New York City](https://example.com/ai-startups-nyc)**
New York City has become a hub for AI innovation...
*Relevance: 95.0%*

### 🖼️ Related Images

**Image 1:** [AI Startup Ecosystem NYC](https://example.com/image.jpg)
*Description:* A visualization showing the AI startup ecosystem in NYC

### 🤔 Related Questions

1. What are the top funded AI startups in NYC?
2. Which NYC AI startups are hiring?
*/
```

## 🎯 Best Practices

### 1. Query Optimization

```javascript
// Good: Specific and clear
const good = await tavilyService.advancedSearch(
  'machine learning frameworks comparison 2024'
);

// Better: Include context
const better = await tavilyService.advancedSearch(
  'best machine learning frameworks for beginners Python TensorFlow PyTorch'
);
```

### 2. Result Processing

```javascript
// Always check for results
const result = await tavilyService.search(query);
if (result.success && result.results.length > 0) {
  const formatted = tavilyService.formatAdvancedResults(result);
  // Process results
} else {
  console.log('No results found');
}
```

### 3. Error Handling

```javascript
try {
  const result = await tavilyService.advancedSearch(query);
  return result;
} catch (error) {
  console.error('Search failed:', error.message);
  // Fallback to basic search or cached results
  return await tavilyService.search(query, { searchDepth: 'basic' });
}
```

### 4. Performance Optimization

```javascript
// Use appropriate search depth
const quick = await tavilyService.search(query, { 
  searchDepth: 'basic',
  maxResults: 3 
}); // Fast

const detailed = await tavilyService.comprehensiveSearch(query); // Thorough

// Cache frequently searched queries
const cacheKey = `search:${query}`;
let result = await redis.get(cacheKey);
if (!result) {
  result = await tavilyService.advancedSearch(query);
  await redis.set(cacheKey, JSON.stringify(result), { ex: 3600 }); // 1 hour
}
```

## 🔧 NPM Scripts

```bash
# Setup and testing
npm run setup:tavily          # Interactive setup wizard
npm run tavily:test           # Test basic search
npm run tavily:advanced       # Test advanced search with formatting

# Manual testing
node -e "require('./src/services/tavilyService.js').default.imageSearch('AI diagrams').then(console.log)"
```

## 🐛 Troubleshooting

### Common Issues

#### API Key Not Working
```
Error: Tavily API key not configured
```
**Solution:**
- Check `.env` file has `TAVILY_API_KEY=your_key`
- Verify API key is valid at tavily.com
- Restart your development server

#### No Results Returned
```
{ success: true, results: [] }
```
**Solution:**
- Try broader search terms
- Reduce domain restrictions
- Check if query is too specific
- Use basic search depth first

#### Rate Limiting
```
Error: Rate limit exceeded
```
**Solution:**
- Implement request throttling
- Cache search results
- Use appropriate search depth
- Consider upgrading Tavily plan

#### Image Search Not Working
```
{ images: [] }
```
**Solution:**
- Ensure `includeImages: true`
- Use image-related search terms
- Try different search queries
- Check Tavily plan supports images

### Debug Mode

```javascript
// Enable detailed logging
const result = await tavilyService.search(query, {
  searchDepth: 'advanced',
  debug: true // If implemented
});

// Check response metadata
console.log('Search metadata:', result.metadata);
console.log('Response time:', result.responseTime);
```

### Health Check

```bash
# Run comprehensive health check
npm run setup:tavily

# Quick connection test
npm run tavily:test
```

## 📚 Integration Examples

### React Component

```jsx
import { useState } from 'react';
import tavilyService from '../services/tavilyService';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await tavilyService.advancedSearch(query);
      const formatted = tavilyService.formatAdvancedResults(searchResults);
      setResults(formatted);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search anything..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {results && (
        <div dangerouslySetInnerHTML={{ __html: results.formatted }} />
      )}
    </div>
  );
}
```

### Chat Integration

```javascript
// In your chat service
class ChatService {
  async handleSearchQuery(userMessage) {
    if (userMessage.startsWith('/search ')) {
      const query = userMessage.replace('/search ', '');
      
      try {
        const results = await tavilyService.advancedSearch(query);
        const insights = tavilyService.extractInsights(results);
        
        return {
          type: 'search_results',
          summary: insights.summary,
          results: results.results.slice(0, 3), // Top 3 results
          answer: results.answer
        };
      } catch (error) {
        return {
          type: 'error',
          message: 'Search failed. Please try again.'
        };
      }
    }
  }
}
```

---

**Need help?** Run `npm run setup:tavily` for guided setup and testing.