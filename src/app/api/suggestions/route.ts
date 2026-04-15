import { NextRequest, NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/searchEngine';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getSuggestions(query, 10);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('API Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
