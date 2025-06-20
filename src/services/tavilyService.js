/**
 * Tavily Search Service
 * Handles web search functionality using Tavily API
 */

class TavilyService {
  constructor() {
    this.baseURL = '/api/tavily';
  }

  /**
   * Perform a basic web search using Tavily (matches the basic search example)
   * @param {string} query - The search query
   * @param {Object} options - Basic search options
   * @returns {Promise<Object>} Basic search results
   */
  async basicSearch(query, options = {}) {
    const {
      max_results = 2,
      include_answer = "basic",
      include_images = true,
      country = "united states"
    } = options;

    try {
      const requestBody = {
        query,
        max_results,
        include_answer,
        include_images,
        country
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        query: data.query || query,
        follow_up_questions: data.follow_up_questions || null,
        answer: data.answer || null,
        images: data.images || [],
        results: data.results || [],
        response_time: data.response_time
      };
    } catch (error) {
      console.error('Tavily basic search error:', error);
      throw new Error(`Basic search failed: ${error.message}`);
    }
  }

  /**
   * Perform a web search using Tavily
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async search(query, options = {}) {
    const {
      searchDepth = 'basic',
      includeImages = false,
      includeAnswer = true,
      includeImageDescriptions = false,
      chunksPerSource = 3,
      maxResults = 5,
      includeDomains = [],
      excludeDomains = [],
      includeRawContent = false
    } = options;

    try {
      const requestBody = {
        query,
        searchDepth,
        includeImages,
        includeAnswer,
        maxResults
      };

      // Add advanced options if specified
      if (includeImageDescriptions) {
        requestBody.includeImageDescriptions = includeImageDescriptions;
      }
      
      if (chunksPerSource > 3) {
        requestBody.chunksPerSource = chunksPerSource;
      }
      
      if (includeDomains.length > 0) {
        requestBody.includeDomains = includeDomains;
      }
      
      if (excludeDomains.length > 0) {
        requestBody.excludeDomains = excludeDomains;
      }
      
      if (includeRawContent) {
        requestBody.includeRawContent = includeRawContent;
      }

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.normalizeResponse(data, query, options);
    } catch (error) {
      console.error('Tavily search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Perform an advanced search with comprehensive results (matches the example)
   * @param {string} query - The search query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Advanced search results
   */
  async advancedSearch(query, options = {}) {
    const result = await this.search(query, {
      searchDepth: 'advanced',
      includeAnswer: 'advanced',
      includeImages: true,
      includeImageDescriptions: true,
      chunksPerSource: 5,
      maxResults: 10,
      ...options
    });
    
    // Ensure the response exactly matches the example format
    return {
      query: result.query,
      follow_up_questions: result.follow_up_questions,
      answer: result.answer,
      images: result.images || [],
      results: result.results || []
    };
  }

  /**
   * Perform a comprehensive search with all advanced features enabled
   * @param {string} query - The search query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Comprehensive search results
   */
  async comprehensiveSearch(query, options = {}) {
    return this.search(query, {
      searchDepth: 'advanced',
      includeAnswer: 'advanced',
      includeImages: true,
      includeImageDescriptions: true,
      chunksPerSource: 8,
      maxResults: 15,
      includeRawContent: true,
      ...options
    });
  }

  /**
   * Search with domain filtering
   * @param {string} query - The search query
   * @param {Array} domains - Domains to include or exclude
   * @param {boolean} include - Whether to include (true) or exclude (false) domains
   * @returns {Promise<Object>} Filtered search results
   */
  async searchWithDomains(query, domains = [], include = true) {
    const options = {
      searchDepth: 'advanced',
      includeAnswer: true,
      maxResults: 10
    };

    if (include) {
      options.includeDomains = domains;
    } else {
      options.excludeDomains = domains;
    }

    return this.search(query, options);
  }

  /**
   * Search for images with descriptions
   * @param {string} query - The search query
   * @returns {Promise<Object>} Image search results
   */
  async imageSearch(query) {
    return this.search(query, {
      searchDepth: 'advanced',
      includeImages: true,
      includeImageDescriptions: true,
      includeAnswer: false,
      maxResults: 20,
      chunksPerSource: 2
    });
  }

  /**
   * Get quick answer for a query
   * @param {string} query - The search query
   * @returns {Promise<string>} Quick answer
   */
  async getQuickAnswer(query) {
    try {
      const results = await this.search(query, {
        searchDepth: 'basic',
        includeAnswer: true,
        maxResults: 3
      });
      return results.answer || 'No answer found';
    } catch (error) {
      throw new Error(`Failed to get quick answer: ${error.message}`);
    }
  }

  /**
   * Format search results for display
   * @param {Object} results - Raw search results
   * @returns {Object} Formatted results
   */
  formatResults(results) {
    if (!results || !results.success) {
      return {
        formatted: '## Search Results\n\n*No results found*',
        summary: 'No results available'
      };
    }

    let formatted = `## Search Results for: "${results.query}"\n\n`;
    
    if (results.metadata) {
      formatted += `*Search Type: ${results.metadata.searchType || 'basic'} | Results: ${results.metadata.totalResults || results.results?.length || 0}*\n\n`;
    }

    // Add quick answer if available
    if (results.answer) {
      formatted += `### 🎯 Quick Answer\n${results.answer}\n\n`;
    }

    // Add web results
    if (results.results && results.results.length > 0) {
      formatted += `### 🌐 Web Results\n\n`;
      results.results.forEach((result, index) => {
        formatted += `**${index + 1}. [${result.title}](${result.url})**\n`;
        formatted += `${result.content}\n`;
        if (result.score) {
          formatted += `*Relevance: ${(result.score * 100).toFixed(1)}%*\n\n`;
        } else {
          formatted += '\n';
        }
      });
    }

    // Add images if available
    if (results.images && results.images.length > 0) {
      formatted += `### 🖼️ Related Images\n\n`;
      results.images.forEach((image, index) => {
        formatted += `**Image ${index + 1}:** [${image.title || 'Image'}](${image.url})\n`;
        if (results.imageDescriptions && results.imageDescriptions[index]) {
          formatted += `*Description:* ${results.imageDescriptions[index]}\n\n`;
        } else if (image.description) {
          formatted += `*Description:* ${image.description}\n\n`;
        } else {
          formatted += '\n';
        }
      });
    }

    // Add follow-up questions
    if (results.followUpQuestions && results.followUpQuestions.length > 0) {
      formatted += `### 🤔 Related Questions\n\n`;
      results.followUpQuestions.forEach((question, index) => {
        formatted += `${index + 1}. ${question}\n`;
      });
    }

    return {
      formatted,
      summary: results.answer || `Found ${results.results?.length || 0} results for "${results.query}"`
    };
  }

  /**
   * Normalize response to match example format
   * @param {Object} response - Raw API response
   * @param {string} query - Original search query
   * @param {Object} options - Search options
   * @returns {Object} Normalized response matching example format
   */
  normalizeResponse(response, query, options = {}) {
    // Ensure response matches the exact format from the example
    const normalized = {
      query: query,
      follow_up_questions: response.follow_up_questions || null,
      answer: response.answer || null,
      images: [],
      results: []
    };

    // Process images to match example format
    if (response.images && Array.isArray(response.images)) {
      normalized.images = response.images.map((image, index) => ({
        url: image.url || image,
        description: response.image_descriptions?.[index] || image.description || null
      }));
    }

    // Process results to match example format
    if (response.results && Array.isArray(response.results)) {
      normalized.results = response.results.map(result => ({
        url: result.url,
        title: result.title,
        content: result.content,
        score: result.score,
        raw_content: result.raw_content || null
      }));
    }

    return normalized;
  }

  /**
   * Format results specifically for advanced search display
   * @param {Object} searchData - Raw search results
   * @returns {Object} Formatted advanced results
   */
  formatAdvancedResults(searchData) {
    return this.formatResults(searchData, {
      includeMetadata: true,
      includeImages: true,
      includeFollowUp: true
    });
  }

  /**
   * Extract key insights from search results
   * @param {Object} searchData - Raw search results
   * @returns {Object} Key insights
   */
  extractInsights(searchData) {
    if (!searchData || !searchData.results) {
      return { insights: [], summary: 'No insights available' };
    }

    const insights = [];
    const { results, answer, metadata = {} } = searchData;

    // Extract key points from results
    if (results && results.length > 0) {
      results.forEach((result, index) => {
        if (result.content && result.content.length > 100) {
          // Extract first sentence or key point
          const sentences = result.content.split('. ');
          if (sentences.length > 0) {
            insights.push({
              source: result.title || `Source ${index + 1}`,
              url: result.url,
              insight: sentences[0] + (sentences[0].endsWith('.') ? '' : '.')
            });
          }
        }
      });
    }

    const summary = answer || 
      (insights.length > 0 ? `Found ${insights.length} key insights from ${results.length} sources.` : 'No insights available');

    return {
      insights: insights.slice(0, 5), // Limit to top 5 insights
      summary,
      totalSources: results ? results.length : 0,
      searchQuality: metadata.hasAnswer ? 'High' : metadata.totalResults > 5 ? 'Medium' : 'Low'
    };
  }
}

// Create and export a singleton instance
const tavilyService = new TavilyService();
export default tavilyService;

// Also export the class for testing
export { TavilyService };