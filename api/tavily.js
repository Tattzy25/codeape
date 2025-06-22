import { TavilySearchAPIClient } from 'tavily';

// Initialize Tavily client
const tavily = new TavilySearchAPIClient({
  apiKey: process.env.VITE_TAVILY_API_KEY || process.env.TAVILY_API_KEY
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
    const { 
      query, 
      searchDepth = 'basic', 
      includeImages = false, 
      includeAnswer = true, 
      includeImageDescriptions = false,
      chunksPerSource = 3,
      maxResults = 5,
      includeDomains = [],
      excludeDomains = [],
      includeRawContent = false
    } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!process.env.VITE_TAVILY_API_KEY && !process.env.TAVILY_API_KEY) {
      return res.status(500).json({ error: 'Tavily API key not configured' });
    }

    // Build search parameters based on advanced options
    const searchParams = {
      query,
      search_depth: searchDepth,
      include_images: includeImages,
      include_answer: includeAnswer === 'advanced' ? true : includeAnswer,
      max_results: maxResults
    };

    // Add advanced search parameters
    if (includeImageDescriptions && includeImages) {
      searchParams.include_image_descriptions = includeImageDescriptions;
    }

    if (chunksPerSource && chunksPerSource > 0) {
      searchParams.chunks_per_source = chunksPerSource;
    }

    if (includeDomains && includeDomains.length > 0) {
      searchParams.include_domains = includeDomains;
    }

    if (excludeDomains && excludeDomains.length > 0) {
      searchParams.exclude_domains = excludeDomains;
    }

    if (includeRawContent) {
      searchParams.include_raw_content = includeRawContent;
    }

    // Perform search with Tavily
    const searchResults = await tavily.search(searchParams);

    // Enhanced response with additional metadata
    const response = {
      success: true,
      query,
      searchDepth,
      results: searchResults.results || [],
      answer: searchResults.answer || null,
      images: searchResults.images || [],
      followUpQuestions: searchResults.follow_up_questions || [],
      responseTime: Date.now(),
      metadata: {
        totalResults: searchResults.results ? searchResults.results.length : 0,
        hasAnswer: !!searchResults.answer,
        hasImages: !!(searchResults.images && searchResults.images.length > 0),
        searchType: searchDepth,
        chunksPerSource: chunksPerSource
      }
    };

    // Add image descriptions if available
    if (includeImageDescriptions && searchResults.images) {
      response.imageDescriptions = searchResults.image_descriptions || [];
    }

    // Add raw content if requested
    if (includeRawContent && searchResults.raw_content) {
      response.rawContent = searchResults.raw_content;
    }

    return res.status(200).json(response);

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