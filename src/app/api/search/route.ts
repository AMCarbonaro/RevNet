import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchAll, SearchOptions } from '@/lib/algolia';
import { logError, logInfo } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Optional: Require authentication for search
    // if (!session) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const hitsPerPage = parseInt(searchParams.get('hitsPerPage') || '20');
    const type = searchParams.get('type') || 'all';
    
    // Parse filters from query params
    const filters: any = {};
    
    const category = searchParams.get('category');
    if (category) {
      filters.category = category.split(',');
    }
    
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',');
    }
    
    const tags = searchParams.get('tags');
    if (tags) {
      filters.tags = tags.split(',');
    }
    
    const userType = searchParams.get('userType');
    if (userType) {
      filters.userType = userType.split(',');
    }
    
    const book = searchParams.get('book');
    if (book) {
      filters.book = book.split(',');
    }
    
    const theme = searchParams.get('theme');
    if (theme) {
      filters.theme = theme.split(',');
    }
    
    const minFunding = searchParams.get('minFunding');
    const maxFunding = searchParams.get('maxFunding');
    if (minFunding || maxFunding) {
      filters.fundingRange = {
        min: parseInt(minFunding || '0'),
        max: parseInt(maxFunding || '1000000'),
      };
    }

    if (!query.trim()) {
      return NextResponse.json({
        projects: { hits: [], nbHits: 0, page: 0, nbPages: 0 },
        users: { hits: [], nbHits: 0, page: 0, nbPages: 0 },
        letters: { hits: [], nbHits: 0, page: 0, nbPages: 0 },
        totalHits: 0,
      });
    }

    const searchOptions: SearchOptions = {
      query: query.trim(),
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      page,
      hitsPerPage,
      facets: ['category', 'status', 'tags', 'userType', 'book', 'theme'],
    };

    const results = await searchAll(searchOptions);

    // Log search for analytics
    logInfo('Search performed', {
      query: query.trim(),
      filters,
      resultsCount: results.totalHits,
      userId: session?.user?.id,
    });

    return NextResponse.json(results);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/search' });
    return NextResponse.json(
      { message: 'Search failed', error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { query, filters, page = 0, hitsPerPage = 20 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { message: 'Invalid query parameter' },
        { status: 400 }
      );
    }

    const searchOptions: SearchOptions = {
      query: query.trim(),
      filters,
      page,
      hitsPerPage,
      facets: ['category', 'status', 'tags', 'userType', 'book', 'theme'],
    };

    const results = await searchAll(searchOptions);

    // Log search for analytics
    logInfo('Search performed via POST', {
      query: query.trim(),
      filters,
      resultsCount: results.totalHits,
      userId: session.user.id,
    });

    return NextResponse.json(results);
  } catch (error) {
    logError(error as Error, { endpoint: '/api/search POST' });
    return NextResponse.json(
      { message: 'Search failed', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
