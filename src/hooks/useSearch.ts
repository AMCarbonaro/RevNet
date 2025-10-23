import { useState, useCallback, useRef } from 'react';
import { SearchOptions, SearchResult } from '@/lib/algolia';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  initialFilters?: any;
}

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult | null;
  isSearching: boolean;
  error: string | null;
  filters: any;
  setFilters: (filters: any) => void;
  performSearch: () => Promise<void>;
  clearSearch: () => void;
  hasResults: boolean;
  totalHits: number;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    initialFilters = {},
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!query.trim() || query.trim().length < minQueryLength) {
      setResults(null);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchOptions: SearchOptions = {
        query: query.trim(),
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        page: 0,
        hitsPerPage: 20,
        facets: ['category', 'status', 'tags', 'userType', 'book', 'theme'],
      };

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchOptions),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const searchResults = await response.json();
      setResults(searchResults);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setError(error.message || 'Search failed');
        console.error('Search error:', error);
      }
    } finally {
      setIsSearching(false);
    }
  }, [query, filters, minQueryLength]);

  const debouncedSearch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, debounceMs);
  }, [performSearch, debounceMs]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedSearch();
  }, [debouncedSearch]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    debouncedSearch();
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
    setFilters(initialFilters);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [initialFilters]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    isSearching,
    error,
    filters,
    setFilters: handleFiltersChange,
    performSearch,
    clearSearch,
    hasResults: results !== null && results.totalHits > 0,
    totalHits: results?.totalHits || 0,
    cleanup,
  };
}

// Hook for search suggestions
export function useSearchSuggestions(query: string, maxSuggestions = 5) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`);
      
      if (!response.ok) {
        throw new Error('Failed to load suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Suggestions error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [query, maxSuggestions]);

  // Debounced suggestions loading
  const debouncedLoadSuggestions = useCallback(() => {
    const timeoutId = setTimeout(loadSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [loadSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    loadSuggestions: debouncedLoadSuggestions,
  };
}

// Hook for search history
export function useSearchHistory(maxItems = 10) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setRecentSearches(prev => {
      const newSearches = [query.trim(), ...prev.filter(s => s !== query.trim())].slice(0, maxItems);
      localStorage.setItem('recent-searches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, [maxItems]);

  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  }, []);

  const removeSearch = useCallback((queryToRemove: string) => {
    setRecentSearches(prev => {
      const newSearches = prev.filter(s => s !== queryToRemove);
      localStorage.setItem('recent-searches', JSON.stringify(newSearches));
      return newSearches;
    });
  }, []);

  // Load from localStorage on mount
  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        const parsedSearches = JSON.parse(saved);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(parsedSearches.slice(0, maxItems));
        }
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, [maxItems]);

  return {
    recentSearches,
    addSearch,
    clearHistory,
    removeSearch,
    loadFromStorage,
  };
}

// Hook for search analytics
export function useSearchAnalytics() {
  const trackSearch = useCallback((query: string, filters: any, resultsCount: number) => {
    // Track search event
    console.log('Search tracked:', { query, filters, resultsCount });
    
    // Here you would integrate with your analytics service
    // Example: analytics.track('search_performed', {
    //   query,
    //   filters,
    //   resultsCount,
    //   timestamp: new Date().toISOString(),
    // });
  }, []);

  const trackSuggestionClick = useCallback((suggestion: string, position: number) => {
    console.log('Suggestion clicked:', { suggestion, position });
    
    // Example: analytics.track('search_suggestion_clicked', {
    //   suggestion,
    //   position,
    //   timestamp: new Date().toISOString(),
    // });
  }, []);

  const trackFilterUsage = useCallback((filterType: string, filterValue: string) => {
    console.log('Filter used:', { filterType, filterValue });
    
    // Example: analytics.track('search_filter_used', {
    //   filterType,
    //   filterValue,
    //   timestamp: new Date().toISOString(),
    // });
  }, []);

  return {
    trackSearch,
    trackSuggestionClick,
    trackFilterUsage,
  };
}

export default useSearch;
