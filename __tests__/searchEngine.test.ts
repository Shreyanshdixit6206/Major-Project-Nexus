/**
 * @jest-environment node
 */
import { getSuggestions, runStoreSearch } from '@/lib/searchEngine';

describe('Search Engine Service', () => {
  it('should fetch PMBJP suggestions quickly', async () => {
    // Paracetamol is def in PMBJP
    const suggestions = await getSuggestions('Paracetamol', 5);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].source).toBe('PMBJP');
    expect(suggestions[0].text.toLowerCase()).toContain('paracetamol');
  });

  it('should fetch A-Z fallback suggestions if PMBJP ends', async () => {
    // A brand that likely isn't generic PMBJP
    const suggestions = await getSuggestions('Augmentin', 5);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every(s => s.source === 'A_Z')).toBe(true);
  });

  it('runStoreSearch: PMBJP Exact Match yields EXACT_PMBJP', async () => {
    const res = await runStoreSearch('Aceclofenac Tablets IP 100 mg');
    expect(res.status).toBe('EXACT_PMBJP');
    expect(res.exactMatch).toBeDefined();
    // Alternatives are provided alongside the exact match
    expect(res.pmbjpAlternatives.length).toBeGreaterThan(0);
  });

  it('runStoreSearch: A_Z branded match should trigger FOUND_AZ_WITH_ALTERNATIVES', async () => {
    // Augmentin 625 is an A_Z record
    const res = await runStoreSearch('Augmentin 625 Duo Tablet');
    expect(res.status).toBe('FOUND_AZ_WITH_ALTERNATIVES');
    expect(res.exactMatch).toBeDefined();
    console.log("AZ MATCH RESULT:", res);
    
    // Sometimes the regex might fail on specific Node versions or dataset variants
    expect(res.pmbjpAlternatives.length).toBeGreaterThan(0);
    expect(res.pmbjpAlternatives.some(a => a.generic_name.toLowerCase().includes('amoxycillin') || a.generic_name.toLowerCase().includes('amoxicillin'))).toBeTruthy();
  });
});
