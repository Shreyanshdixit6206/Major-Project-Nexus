/**
 * @jest-environment node
 */
import { GET } from '@/app/api/suggestions/route';

if (typeof global.Request === 'undefined') {
  global.Request = class Request {} as any;
  (global as any).Response = class Response {
    static json(data: any) { return { status: 200, json: async () => data } }
  };
}

// Mock the search engine
jest.mock('@/lib/searchEngine', () => ({
  getSuggestions: jest.fn().mockResolvedValue([
    { text: 'Amoxicillin IP', source: 'PMBJP' }
  ])
}));

describe('Suggestions API Route', () => {
  it('returns an empty array when query is less than 2 characters', async () => {
    const mockRequest: any = {
      nextUrl: {
        searchParams: new URLSearchParams('?q=A')
      }
    };
    
    const res = await GET(mockRequest);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.suggestions).toEqual([]);
  });

  it('calls getSuggestions and returns formatted results when query is valid', async () => {
    const mockRequest: any = {
      nextUrl: {
        searchParams: new URLSearchParams('?q=Amo')
      }
    };
    
    const res = await GET(mockRequest);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.suggestions.length).toBe(1);
    expect(data.suggestions[0].text).toBe('Amoxicillin IP');
  });
});
