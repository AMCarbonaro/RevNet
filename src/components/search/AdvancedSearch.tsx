'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, TrendingUp } from 'lucide-react';
import { searchAll, SearchOptions, SearchResult } from '@/lib/algolia';
import SearchFilters from './SearchFilters';
import SearchSuggestions from './SearchSuggestions';

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showFilters?: boolean;
  maxSuggestions?: number;
}

export default function AdvancedSearch({
  onResultSelect,
  placeholder = "Search projects, users, and letters...",
  autoFocus = false,
  showFilters = true,
  maxSuggestions = 8
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    projects: any;
    users: any;
    letters: any;
    totalHits: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'users' | 'letters'>('all');
  const [filters, setFilters] = useState<any>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    'Political Campaign',
    'Community Organization',
    'Grassroots Movement',
    'Environmental Protection',
    'Social Justice',
    'Education Reform',
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.length >= 2) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults(null);
      setShowResults(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchOptions: SearchOptions = {
        query: query.trim(),
        filters,
        page: 0,
        hitsPerPage: 20,
        facets: ['category', 'status', 'tags', 'userType', 'book', 'theme'],
      };

      const searchResults = await searchAll(searchOptions);
      setResults(searchResults);
      setShowResults(true);

      // Save to recent searches
      const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recent-searches', JSON.stringify(newRecentSearches));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
      searchInputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
    setShowResults(false);
    searchInputRef.current?.blur();
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setShowResults(false);
    setFilters({});
    searchInputRef.current?.focus();
  };

  const getTabResults = () => {
    if (!results) return { hits: [], nbHits: 0 };
    
    switch (activeTab) {
      case 'projects':
        return results.projects;
      case 'users':
        return results.users;
      case 'letters':
        return results.letters;
      default:
        return {
          hits: [
            ...results.projects.hits.map((hit: any) => ({ ...hit, _type: 'project' })),
            ...results.users.hits.map((hit: any) => ({ ...hit, _type: 'user' })),
            ...results.letters.hits.map((hit: any) => ({ ...hit, _type: 'letter' })),
          ],
          nbHits: results.totalHits,
        };
    }
  };

  const renderResult = (hit: any, index: number) => {
    const type = hit._type || activeTab.slice(0, -1); // Remove 's' from plural
    const typeColor = {
      project: 'text-terminal-purple',
      user: 'text-terminal-cyan',
      letter: 'text-terminal-green',
    }[type] || 'text-terminal-green';

    return (
      <div
        key={hit.objectID || index}
        className="p-4 border-b border-terminal-green/20 hover:bg-black/20 cursor-pointer transition-colors"
        onClick={() => handleResultClick(hit)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold uppercase ${typeColor}`}>
                {type}
              </span>
              {hit.status && (
                <span className="text-xs px-2 py-1 bg-terminal-green/20 text-terminal-green rounded">
                  {hit.status}
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-terminal-green mb-2">
              {hit._highlightResult?.title?.value || hit.title}
            </h3>
            
            <p className="text-terminal-cyan text-sm mb-2">
              {hit._snippetResult?.description?.value || hit.description}
            </p>
            
            {hit.tags && hit.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {hit.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                  <span
                    key={tagIndex}
                    className="text-xs px-2 py-1 bg-terminal-green/10 text-terminal-green rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-terminal-cyan">
              {hit.currentFunding && hit.fundingGoal && (
                <span>
                  ${hit.currentFunding.toLocaleString()} / ${hit.fundingGoal.toLocaleString()}
                </span>
              )}
              {hit.letterNumber && (
                <span>Letter {hit.letterNumber}</span>
              )}
              {hit.userType && (
                <span className="capitalize">{hit.userType}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentResults = getTabResults();

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-terminal-cyan" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-12 pr-12 py-4 bg-black border border-terminal-green rounded-lg text-terminal-green placeholder-terminal-cyan focus:outline-none focus:ring-2 focus:ring-terminal-green focus:border-transparent"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-terminal-cyan hover:text-terminal-green transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {isSearching && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-terminal-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-4">
          <SearchFilters onFiltersChange={handleFilterChange} />
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-matrix-dark border border-terminal-green rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {query.length < 2 ? (
            // Show suggestions when no query
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-terminal-green font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="text-sm px-3 py-1 bg-terminal-green/10 text-terminal-green rounded hover:bg-terminal-green hover:text-black transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
              
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-terminal-cyan font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="block w-full text-left text-sm px-3 py-2 text-terminal-cyan hover:bg-black/20 rounded transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : results ? (
            // Show search results
            <div>
              {/* Results Header */}
              <div className="p-4 border-b border-terminal-green/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-terminal-green font-semibold">
                    {currentResults.nbHits} result{currentResults.nbHits !== 1 ? 's' : ''} found
                  </h3>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-terminal-cyan" />
                    <span className="text-terminal-cyan text-sm">Filters applied</span>
                  </div>
                </div>
                
                {/* Result Type Tabs */}
                <div className="flex gap-1">
                  {[
                    { key: 'all', label: 'All', count: results.totalHits },
                    { key: 'projects', label: 'Projects', count: results.projects.nbHits },
                    { key: 'users', label: 'Users', count: results.users.nbHits },
                    { key: 'letters', label: 'Letters', count: results.letters.nbHits },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        activeTab === tab.key
                          ? 'bg-terminal-green text-black'
                          : 'text-terminal-cyan hover:bg-terminal-green/20'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Results List */}
              <div className="max-h-64 overflow-y-auto">
                {currentResults.hits.length > 0 ? (
                  currentResults.hits.map((hit: any, index: number) => renderResult(hit, index))
                ) : (
                  <div className="p-8 text-center text-terminal-cyan">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-2">Try different keywords or check your filters</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Show suggestions while searching
            <div className="p-4">
              <SearchSuggestions query={query} maxSuggestions={maxSuggestions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
