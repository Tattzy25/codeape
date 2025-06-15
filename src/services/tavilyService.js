/**
 * Tavily Search Service
 * Handles web search functionality using Tavily API
 */

class TavilyService {
  constructor() {
    this.baseURL = '/api/tavily';
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
      maxResults = 5
    } = options;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          searchDepth,
          includeImages,
          includeAnswer,
          maxResults
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Tavily search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Perform an advanced search with more detailed results
   * @param {string} query - The search query
   * @returns {Promise<Object>} Advanced search results
   */
  async advancedSearch(query) {
    return this.search(query, {
      searchDepth: 'advanced',
      includeImages: true,
      includeAnswer: true,
      maxResults: 10
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
   * @param {Object} searchData - Raw search results
   * @returns {Object} Formatted results
   */
  formatResults(searchData) {
    if (!searchData || !searchData.results) {
      return { formatted: 'No results found', hasResults: false };
    }

    const { results, answer, query } = searchData;
    
    let formatted = `## Search Results for: "${query}"\n\n`;
    
    if (answer) {
      formatted += `**Quick Answer:** ${answer}\n\n`;
    }
    
    if (results && results.length > 0) {
      formatted += `### Web Results:\n\n`;
      results.forEach((result, index) => {
        formatted += `**${index + 1}. [${result.title}](${result.url})**\n`;
        formatted += `${result.content}\n\n`;
      });
    }
    
    return {
      formatted,
      hasResults: results && results.length > 0,
      resultCount: results ? results.length : 0
    };
  }
}

// Create and export a singleton instance
const tavilyService = new TavilyService();
export default tavilyService;

// Also export the class for testing
export { TavilyService };