'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Search } from 'lucide-react';
import { getSearchSuggestions } from '@/lib/algolia';

interface SearchSuggestionsProps {
  query: string;
  maxSuggestions?: number;
  onSuggestionSelect?: (suggestion: string) => void;
}

interface Suggestion {
  text: string;
  type: 'project' | 'user' | 'letter';
}

export default function SearchSuggestions({ 
  query, 
  maxSuggestions = 5,
  onSuggestionSelect 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    'Political Campaign',
    'Community Organization',
    'Grassroots Movement',
    'Environmental Protection',
    'Social Justice',
    'Education Reform',
    'Healthcare Access',
    'Economic Justice',
    'Civil Rights',
    'Climate Change',
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load suggestions when query changes
  useEffect(() => {
    if (query.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const searchSuggestions = await getSearchSuggestions(query, maxSuggestions);
      setSuggestions(searchSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      // Fallback to mock suggestions
      setSuggestions([
        { text: `${query} Campaign`, type: 'project' },
        { text: `${query} Organization`, type: 'project' },
        { text: `${query} Movement`, type: 'project' },
        { text: `${query} Initiative`, type: 'project' },
        { text: `${query} Project`, type: 'project' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion);
    
    // Save to recent searches
    const newRecentSearches = [suggestion, ...recentSearches.filter(s => s !== suggestion)].slice(0, 10);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📋';
      case 'user':
        return '👤';
      case 'letter':
        return '📜';
      default:
        return '🔍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'text-terminal-purple';
      case 'user':
        return 'text-terminal-cyan';
      case 'letter':
        return 'text-terminal-green';
      default:
        return 'text-terminal-green';
    }
  };

  if (query.length < 2) {
    return (
      <div className="space-y-6">
        {/* Popular Searches */}
        <div>
          <h3 className="text-terminal-green font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular Searches
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {popularSearches.slice(0, 6).map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(search)}
                className="text-left px-3 py-2 bg-black/20 border border-terminal-green/20 rounded text-terminal-cyan hover:bg-terminal-green/10 hover:border-terminal-green transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3 h-3" />
                  <span className="text-sm">{search}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <h3 className="text-terminal-cyan font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches
            </h3>
            <div className="space-y-1">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="block w-full text-left px-3 py-2 text-terminal-cyan hover:bg-black/20 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm">{search}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Tips */}
        <div className="pt-4 border-t border-terminal-green/20">
          <h4 className="text-terminal-green font-semibold mb-2">Search Tips</h4>
          <ul className="text-terminal-cyan text-sm space-y-1">
            <li>• Search for project titles, descriptions, or tags</li>
            <li>• Use filters to narrow down results</li>
            <li>• Try searching by category or status</li>
            <li>• Look for specific letter themes or books</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-terminal-cyan" />
        <h3 className="text-terminal-green font-semibold">
          Suggestions for "{query}"
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-terminal-green border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-terminal-cyan">Loading suggestions...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="block w-full text-left px-3 py-2 bg-black/20 border border-terminal-green/20 rounded hover:bg-terminal-green/10 hover:border-terminal-green transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-terminal-green font-medium">
                      {suggestion.text}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(suggestion.type)} bg-black/20`}>
                      {suggestion.type}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-terminal-cyan">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No suggestions found</p>
          <p className="text-sm mt-2">Try a different search term</p>
        </div>
      )}

      {/* Related Searches */}
      {query.length >= 3 && (
        <div className="pt-4 border-t border-terminal-green/20">
          <h4 className="text-terminal-green font-semibold mb-2">Related Searches</h4>
          <div className="flex flex-wrap gap-2">
            {[
              `${query} campaign`,
              `${query} organization`,
              `${query} movement`,
              `${query} initiative`,
            ].map((relatedSearch, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(relatedSearch)}
                className="px-3 py-1 text-sm bg-terminal-green/10 text-terminal-green rounded hover:bg-terminal-green hover:text-black transition-colors"
              >
                {relatedSearch}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
