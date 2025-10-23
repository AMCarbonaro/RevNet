'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { getFacetValues, INDICES } from '@/lib/algolia';

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void;
}

interface FilterOption {
  value: string;
  count: number;
}

interface FilterState {
  category: string[];
  status: string[];
  tags: string[];
  userType: string[];
  book: string[];
  theme: string[];
  fundingRange: {
    min: number;
    max: number;
  } | null;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    status: [],
    tags: [],
    userType: [],
    book: [],
    theme: [],
    fundingRange: null,
  });

  const [facetOptions, setFacetOptions] = useState<{
    category: FilterOption[];
    status: FilterOption[];
    tags: FilterOption[];
    userType: FilterOption[];
    book: FilterOption[];
    theme: FilterOption[];
  }>({
    category: [],
    status: [],
    tags: [],
    userType: [],
    book: [],
    theme: [],
  });

  // Load facet options
  useEffect(() => {
    const loadFacetOptions = async () => {
      try {
        const [categoryFacets, statusFacets, userTypeFacets, bookFacets, themeFacets] = await Promise.all([
          getFacetValues(INDICES.PROJECTS, 'category'),
          getFacetValues(INDICES.PROJECTS, 'status'),
          getFacetValues(INDICES.USERS, 'userType'),
          getFacetValues(INDICES.LETTERS, 'book'),
          getFacetValues(INDICES.LETTERS, 'theme'),
        ]);

        setFacetOptions({
          category: Object.entries(categoryFacets).map(([value, count]) => ({ value, count: count as number })),
          status: Object.entries(statusFacets).map(([value, count]) => ({ value, count: count as number })),
          tags: [], // Will be populated dynamically
          userType: Object.entries(userTypeFacets).map(([value, count]) => ({ value, count: count as number })),
          book: Object.entries(bookFacets).map(([value, count]) => ({ value, count: count as number })),
          theme: Object.entries(themeFacets).map(([value, count]) => ({ value, count: count as number })),
        });
      } catch (error) {
        console.error('Error loading facet options:', error);
        // Set mock data for development
        setFacetOptions({
          category: [
            { value: 'Political Campaign', count: 15 },
            { value: 'Community Organization', count: 12 },
            { value: 'Grassroots Movement', count: 8 },
            { value: 'Environmental Protection', count: 6 },
            { value: 'Social Justice', count: 10 },
          ],
          status: [
            { value: 'active', count: 25 },
            { value: 'completed', count: 18 },
            { value: 'pending', count: 7 },
            { value: 'draft', count: 5 },
          ],
          tags: [
            { value: 'activism', count: 20 },
            { value: 'politics', count: 15 },
            { value: 'environment', count: 12 },
            { value: 'education', count: 8 },
            { value: 'healthcare', count: 6 },
          ],
          userType: [
            { value: 'creator', count: 45 },
            { value: 'supporter', count: 120 },
          ],
          book: [
            { value: 'The Awakening', count: 10 },
            { value: 'The Foundation', count: 10 },
            { value: 'The Arsenal', count: 10 },
            { value: 'The Revolution', count: 10 },
          ],
          theme: [
            { value: 'Deception & Awareness', count: 3 },
            { value: 'Power & Control', count: 3 },
            { value: 'Resistance & Rebellion', count: 3 },
            { value: 'Unity & Solidarity', count: 3 },
          ],
        });
      }
    };

    loadFacetOptions();
  }, []);

  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'fundingRange') {
        // Handle funding range separately
        return prev;
      }
      
      const currentValues = newFilters[filterType] as string[];
      if (checked) {
        newFilters[filterType] = [...currentValues, value];
      } else {
        newFilters[filterType] = currentValues.filter(v => v !== value);
      }
      
      return newFilters;
    });
  };

  const handleFundingRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      fundingRange: { min, max },
    }));
  };

  const clearFilter = (filterType: keyof FilterState, value?: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value) {
        const currentValues = newFilters[filterType] as string[];
        newFilters[filterType] = currentValues.filter(v => v !== value);
      } else {
        if (filterType === 'fundingRange') {
          newFilters[filterType] = null;
        } else {
          newFilters[filterType] = [];
        }
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      category: [],
      status: [],
      tags: [],
      userType: [],
      book: [],
      theme: [],
      fundingRange: null,
    });
  };

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterValue) => {
      if (Array.isArray(filterValue)) {
        return count + filterValue.length;
      } else if (filterValue !== null) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const renderFilterSection = (
    title: string,
    filterType: keyof FilterState,
    options: FilterOption[]
  ) => (
    <div className="mb-6">
      <h4 className="text-terminal-green font-semibold mb-3">{title}</h4>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {options.map(option => {
          const isSelected = (filters[filterType] as string[])?.includes(option.value);
          return (
            <label key={option.value} className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleFilterChange(filterType, option.value, e.target.checked)}
                  className="mr-3 w-4 h-4 text-terminal-green bg-black border-terminal-green rounded focus:ring-terminal-green focus:ring-2"
                />
                <span className="text-terminal-cyan text-sm capitalize">
                  {option.value}
                </span>
              </div>
              <span className="text-terminal-green text-xs">
                {option.count}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const renderFundingRangeFilter = () => (
    <div className="mb-6">
      <h4 className="text-terminal-green font-semibold mb-3">Funding Range</h4>
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-terminal-cyan text-sm mb-1">Min ($)</label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              onChange={(e) => {
                const min = parseInt(e.target.value) || 0;
                const max = filters.fundingRange?.max || 100000;
                handleFundingRangeChange(min, max);
              }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-terminal-cyan text-sm mb-1">Max ($)</label>
            <input
              type="number"
              placeholder="100000"
              className="w-full px-3 py-2 bg-black border border-terminal-green rounded text-terminal-green focus:outline-none focus:ring-2 focus:ring-terminal-green"
              onChange={(e) => {
                const max = parseInt(e.target.value) || 100000;
                const min = filters.fundingRange?.min || 0;
                handleFundingRangeChange(min, max);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black border border-terminal-green rounded-lg text-terminal-green hover:bg-terminal-green hover:text-black transition-colors"
      >
        <span>Filters</span>
        {getActiveFiltersCount() > 0 && (
          <span className="px-2 py-1 bg-terminal-green text-black text-xs rounded-full">
            {getActiveFiltersCount()}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(filters).map(([filterType, filterValue]) => {
            if (Array.isArray(filterValue)) {
              return filterValue.map((value) => (
                <span
                  key={`${filterType}-${value}`}
                  className="flex items-center gap-1 px-3 py-1 bg-terminal-green text-black text-sm rounded-full"
                >
                  <span className="capitalize">{filterType}: {value}</span>
                  <button
                    onClick={() => clearFilter(filterType as keyof FilterState, value)}
                    className="hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ));
            } else if (filterValue !== null) {
              return (
                <span
                  key={filterType}
                  className="flex items-center gap-1 px-3 py-1 bg-terminal-green text-black text-sm rounded-full"
                >
                  <span className="capitalize">{filterType}: {filterValue.min}-{filterValue.max}</span>
                  <button
                    onClick={() => clearFilter(filterType as keyof FilterState)}
                    className="hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            }
            return null;
          })}
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-terminal-cyan text-sm hover:text-terminal-green transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-matrix-dark border border-terminal-green rounded-lg shadow-lg z-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-terminal-green font-semibold">Filter Results</h3>
            <button
              onClick={clearAllFilters}
              className="text-terminal-cyan text-sm hover:text-terminal-green transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {renderFilterSection('Category', 'category', facetOptions.category)}
            {renderFilterSection('Status', 'status', facetOptions.status)}
            {renderFilterSection('User Type', 'userType', facetOptions.userType)}
            {renderFilterSection('Book', 'book', facetOptions.book)}
            {renderFilterSection('Theme', 'theme', facetOptions.theme)}
            {renderFundingRangeFilter()}
          </div>

          <div className="mt-6 pt-4 border-t border-terminal-green/20">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-terminal-green text-black rounded-lg hover:bg-terminal-green/80 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
