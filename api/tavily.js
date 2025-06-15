import { TavilySearchAPIClient } from 'tavily';

// Initialize Tavily client
const tavily = new TavilySearchAPIClient({
  apiKey: process.env.TAVILY_API_KEY
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, searchDepth = 'basic', includeImages = false, includeAnswer = true, maxResults = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!process.env.TAVILY_API_KEY) {
      return res.status(500).json({ error: 'Tavily API key not configured' });
    }

    // Perform search with Tavily
    const searchResults = await tavily.search({
      query,
      searchDepth,
      includeImages,
      includeAnswer,
      maxResults
    });

    return res.status(200).json({
      success: true,
      query,
      results: searchResults.results,
      answer: searchResults.answer,
      images: searchResults.images || [],
      followUpQuestions: searchResults.followUpQuestions || []
    });

  } catch (error) {
    console.error('Tavily search error:', error);
    return res.status(500).json({
      error: 'Failed to perform search',
      message: error.message
    });
  }
}

// Alternative export for different environments
export { handler };