import algoliasearch from 'algoliasearch/lite';
import { Project, User, Letter } from '@/types';

// Algolia configuration
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'demo-app-id';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || 'demo-api-key';

export const searchClient = algoliasearch(appId, apiKey);

// Index names
export const INDICES = {
  PROJECTS: 'revolution_projects',
  USERS: 'revolution_users',
  LETTERS: 'revolution_letters',
} as const;

// Get index instances
export const projectsIndex = searchClient.initIndex(INDICES.PROJECTS);
export const usersIndex = searchClient.initIndex(INDICES.USERS);
export const lettersIndex = searchClient.initIndex(INDICES.LETTERS);

// Search interfaces
export interface SearchFilters {
  category?: string[];
  status?: string[];
  fundingRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  userType?: string[];
  book?: string[];
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  page?: number;
  hitsPerPage?: number;
  facets?: string[];
  highlightPreTag?: string;
  highlightPostTag?: string;
}

export interface SearchResult {
  objectID: string;
  title: string;
  description: string;
  type: 'project' | 'user' | 'letter';
  _highlightResult?: any;
  _snippetResult?: any;
  [key: string]: any;
}

// Transform data for Algolia indexing
export const transformProjectForIndex = (project: Project) => ({
  objectID: project._id?.toString(),
  type: 'project',
  title: project.title,
  description: project.description,
  status: project.status,
  fundingGoal: project.fundingGoal,
  currentFunding: project.currentFunding,
  tags: project.tags,
  category: project.tags[0] || 'General',
  creatorName: '', // Will be populated when indexing
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  searchableContent: `${project.title} ${project.description} ${project.tags.join(' ')}`,
});

export const transformUserForIndex = (user: User) => ({
  objectID: user._id?.toString(),
  type: 'user',
  title: user.name,
  description: user.userType === 'creator' ? 'Project Creator' : 'Supporter',
  userType: user.userType,
  email: user.email,
  totalProjectsCreated: user.userStats.totalProjectsCreated,
  totalLettersCompleted: user.userStats.totalLettersCompleted,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  searchableContent: `${user.name} ${user.email} ${user.userType}`,
});

export const transformLetterForIndex = (letter: Letter) => ({
  objectID: letter._id?.toString(),
  type: 'letter',
  title: letter.title,
  description: letter.content.substring(0, 200) + '...',
  book: letter.book,
  letterNumber: letter.letterNumber,
  theme: letter.theme,
  assignment: letter.assignment,
  createdAt: letter.createdAt,
  updatedAt: letter.updatedAt,
  searchableContent: `${letter.title} ${letter.content} ${letter.theme} ${letter.assignment}`,
});

// Search functions
export const searchProjects = async (options: SearchOptions) => {
  const searchParams = {
    query: options.query,
    page: options.page || 0,
    hitsPerPage: options.hitsPerPage || 20,
    facets: options.facets || ['category', 'status', 'tags'],
    highlightPreTag: options.highlightPreTag || '<mark>',
    highlightPostTag: options.highlightPostTag || '</mark>',
  };

  // Add filters if provided
  if (options.filters) {
    let filterString = '';
    
    if (options.filters.category?.length) {
      filterString += `category:${options.filters.category.join(' OR category:')}`;
    }
    
    if (options.filters.status?.length) {
      if (filterString) filterString += ' AND ';
      filterString += `status:${options.filters.status.join(' OR status:')}`;
    }
    
    if (options.filters.tags?.length) {
      if (filterString) filterString += ' AND ';
      filterString += `tags:${options.filters.tags.join(' OR tags:')}`;
    }
    
    if (options.filters.fundingRange) {
      if (filterString) filterString += ' AND ';
      filterString += `currentFunding:${options.filters.fundingRange.min} TO ${options.filters.fundingRange.max}`;
    }
    
    if (filterString) {
      searchParams.filters = filterString;
    }
  }

  return await projectsIndex.search(searchParams);
};

export const searchUsers = async (options: SearchOptions) => {
  const searchParams = {
    query: options.query,
    page: options.page || 0,
    hitsPerPage: options.hitsPerPage || 20,
    facets: options.facets || ['userType'],
    highlightPreTag: options.highlightPreTag || '<mark>',
    highlightPostTag: options.highlightPostTag || '</mark>',
  };

  if (options.filters?.userType?.length) {
    searchParams.filters = `userType:${options.filters.userType.join(' OR userType:')}`;
  }

  return await usersIndex.search(searchParams);
};

export const searchLetters = async (options: SearchOptions) => {
  const searchParams = {
    query: options.query,
    page: options.page || 0,
    hitsPerPage: options.hitsPerPage || 20,
    facets: options.facets || ['book', 'theme'],
    highlightPreTag: options.highlightPreTag || '<mark>',
    highlightPostTag: options.highlightPostTag || '</mark>',
  };

  if (options.filters?.book?.length) {
    searchParams.filters = `book:${options.filters.book.join(' OR book:')}`;
  }

  return await lettersIndex.search(searchParams);
};

// Universal search across all indices
export const searchAll = async (options: SearchOptions) => {
  const [projectsResults, usersResults, lettersResults] = await Promise.all([
    searchProjects(options),
    searchUsers(options),
    searchLetters(options),
  ]);

  return {
    projects: projectsResults,
    users: usersResults,
    letters: lettersResults,
    totalHits: projectsResults.nbHits + usersResults.nbHits + lettersResults.nbHits,
  };
};

// Get search suggestions
export const getSearchSuggestions = async (query: string, limit: number = 5) => {
  if (!query || query.length < 2) return [];

  const [projectsResults, usersResults, lettersResults] = await Promise.all([
    projectsIndex.search({
      query,
      hitsPerPage: limit,
      attributesToRetrieve: ['title'],
    }),
    usersIndex.search({
      query,
      hitsPerPage: limit,
      attributesToRetrieve: ['title'],
    }),
    lettersIndex.search({
      query,
      hitsPerPage: limit,
      attributesToRetrieve: ['title'],
    }),
  ]);

  const suggestions = [
    ...projectsResults.hits.map(hit => ({ text: hit.title, type: 'project' })),
    ...usersResults.hits.map(hit => ({ text: hit.title, type: 'user' })),
    ...lettersResults.hits.map(hit => ({ text: hit.title, type: 'letter' })),
  ];

  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    )
    .slice(0, limit);

  return uniqueSuggestions;
};

// Get facet values for filters
export const getFacetValues = async (indexName: string, facet: string) => {
  const index = searchClient.initIndex(indexName);
  const result = await index.search('', {
    facets: [facet],
    hitsPerPage: 0,
  });

  return result.facets?.[facet] || {};
};

// Index management functions
export const indexProject = async (project: Project) => {
  const transformedProject = transformProjectForIndex(project);
  return await projectsIndex.saveObject(transformedProject);
};

export const indexUser = async (user: User) => {
  const transformedUser = transformUserForIndex(user);
  return await usersIndex.saveObject(transformedUser);
};

export const indexLetter = async (letter: Letter) => {
  const transformedLetter = transformLetterForIndex(letter);
  return await lettersIndex.saveObject(transformedLetter);
};

export const removeProjectFromIndex = async (projectId: string) => {
  return await projectsIndex.deleteObject(projectId);
};

export const removeUserFromIndex = async (userId: string) => {
  return await usersIndex.deleteObject(userId);
};

export const removeLetterFromIndex = async (letterId: string) => {
  return await lettersIndex.deleteObject(letterId);
};

// Batch operations
export const batchIndexProjects = async (projects: Project[]) => {
  const transformedProjects = projects.map(transformProjectForIndex);
  return await projectsIndex.saveObjects(transformedProjects);
};

export const batchIndexUsers = async (users: User[]) => {
  const transformedUsers = users.map(transformUserForIndex);
  return await usersIndex.saveObjects(transformedUsers);
};

export const batchIndexLetters = async (letters: Letter[]) => {
  const transformedLetters = letters.map(transformLetterForIndex);
  return await lettersIndex.saveObjects(transformedLetters);
};

// Configure index settings
export const configureIndexSettings = async () => {
  // Projects index settings
  await projectsIndex.setSettings({
    searchableAttributes: [
      'title',
      'description',
      'searchableContent',
      'tags',
      'creatorName',
    ],
    attributesForFaceting: [
      'searchable(category)',
      'searchable(status)',
      'searchable(tags)',
    ],
    ranking: [
      'desc(currentFunding)',
      'desc(createdAt)',
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom',
    ],
    customRanking: ['desc(currentFunding)', 'desc(createdAt)'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    snippetEllipsisText: '...',
    hitsPerPage: 20,
    paginationLimitedTo: 1000,
  });

  // Users index settings
  await usersIndex.setSettings({
    searchableAttributes: [
      'title',
      'description',
      'searchableContent',
    ],
    attributesForFaceting: [
      'searchable(userType)',
    ],
    ranking: [
      'desc(totalProjectsCreated)',
      'desc(totalLettersCompleted)',
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom',
    ],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    hitsPerPage: 20,
    paginationLimitedTo: 1000,
  });

  // Letters index settings
  await lettersIndex.setSettings({
    searchableAttributes: [
      'title',
      'description',
      'searchableContent',
      'theme',
      'assignment',
    ],
    attributesForFaceting: [
      'searchable(book)',
      'searchable(theme)',
    ],
    ranking: [
      'asc(letterNumber)',
      'typo',
      'geo',
      'words',
      'filters',
      'proximity',
      'attribute',
      'exact',
      'custom',
    ],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    hitsPerPage: 20,
    paginationLimitedTo: 1000,
  });
};

// Search analytics
export const trackSearchQuery = async (query: string, filters?: SearchFilters, resultsCount?: number) => {
  // This would integrate with your analytics system
  console.log('Search tracked:', { query, filters, resultsCount });
  
  // Example: Send to analytics service
  // await analytics.track('search_performed', {
  //   query,
  //   filters,
  //   resultsCount,
  //   timestamp: new Date().toISOString(),
  // });
};

export default {
  searchClient,
  INDICES,
  searchProjects,
  searchUsers,
  searchLetters,
  searchAll,
  getSearchSuggestions,
  getFacetValues,
  indexProject,
  indexUser,
  indexLetter,
  removeProjectFromIndex,
  removeUserFromIndex,
  removeLetterFromIndex,
  batchIndexProjects,
  batchIndexUsers,
  batchIndexLetters,
  configureIndexSettings,
  trackSearchQuery,
};
