import { getDb } from '@/lib/db';

export interface PmbjpMedicine {
  id: number;
  drug_code: string;
  generic_name: string;
  unit_size: string;
  mrp: number;
  group_name: string;
}

export interface AzMedicine {
  id: number;
  name: string;
  price: number;
  is_discontinued: string;
  manufacturer: string;
  type: string;
  pack_size_label: string;
  composition1: string;
  composition2: string;
}

export interface SearchSuggestion {
  text: string;
  source: 'PMBJP' | 'A_Z';
}

export interface SearchEngineResult {
  searchedTerm: string;
  status: 'EXACT_PMBJP' | 'FOUND_AZ_WITH_ALTERNATIVES' | 'NOT_FOUND';
  exactMatch?: PmbjpMedicine | AzMedicine;
  pmbjpAlternatives: PmbjpMedicine[];
}

/**
 * Gets auto-fill suggestions combining both databases
 * Gives priority to PMBJP medicines (Generic) 
 */
export async function getSuggestions(query: string, limit: number = 8): Promise<SearchSuggestion[]> {
  try {
    const db = getDb();
    const searchTerm = `%${query}%`;
    const results: SearchSuggestion[] = [];

    const pmbjpStmt = db.prepare(`
      SELECT generic_name FROM pmbjp_medicines 
      WHERE generic_name LIKE ? 
      LIMIT ?
    `);
    const pmbjpRows = pmbjpStmt.all(searchTerm, limit) as { generic_name: string }[];
    pmbjpRows.forEach(row => results.push({ text: row.generic_name, source: 'PMBJP' }));

    // 2. If short of limit, fallback to A-Z
    const remaining = limit - results.length;
    if (remaining > 0) {
      const azStmt = db.prepare(`
        SELECT name FROM a_z_medicines
        WHERE name LIKE ?
        LIMIT ?
      `);
      const azRows = azStmt.all(searchTerm, remaining) as { name: string }[];
      azRows.forEach(row => results.push({ text: row.name, source: 'A_Z' }));
    }

    return results;
  } catch (error) {
    console.error("Suggestion fetch error:", error);
    return [];
  }
}

/**
 * Fuzzy searches to find PMBJP alternatives given an active ingredient/composition string
 */
function findPmbjpAlternativesForComposition(db: any, composition: string): PmbjpMedicine[] {
  // Very simplistic NLP: clean the string by removing brackets and mg counts
  const cleaned = composition.replace(/\([^)]+\)/g, '').trim().split(/\s+/);
  
  if (cleaned.length === 0 || cleaned[0] === '') return [];

  // Try to match the first significant word (assuming primary active ingredient is listed first)
  const primaryIngredient = cleaned[0].replace(/[^a-zA-Z]/g, ''); 
  
  if (primaryIngredient.length < 3) return [];

  const stmt = db.prepare(`
    SELECT * FROM pmbjp_medicines 
    WHERE generic_name LIKE ?
    LIMIT 5
  `);
  
  return stmt.all(`%${primaryIngredient}%`) as PmbjpMedicine[];
}

/**
 * Main search function driving the Store page UI
 */
export async function runStoreSearch(query: string): Promise<SearchEngineResult> {
  try {
    const db = getDb();
    
    // 1. Check if direct match in PMBJP (Generic First!)
    const pmbjpStmt = db.prepare(`
      SELECT * FROM pmbjp_medicines 
      WHERE generic_name LIKE ? 
      LIMIT 1
    `);
    // First try exact or near-exact match
    const pmbjpMatch = pmbjpStmt.get(`${query}%`) as PmbjpMedicine | undefined;

    if (pmbjpMatch) {
      // Find a few more similar PMBJP medicines for alternatives list
      const alternativesStmt = db.prepare(`SELECT * FROM pmbjp_medicines WHERE generic_name LIKE ? AND id != ? LIMIT 4`);
      const alternatives = alternativesStmt.all(`%${query}%`, pmbjpMatch.id) as PmbjpMedicine[];

      return {
        searchedTerm: query,
        status: 'EXACT_PMBJP',
        exactMatch: pmbjpMatch,
        pmbjpAlternatives: [pmbjpMatch, ...alternatives]
      };
    }

    // 2. If no PMBJP match, check A_Z database (mostly Branded ones)
    const azStmt = db.prepare(`
      SELECT * FROM a_z_medicines 
      WHERE name LIKE ? 
      LIMIT 1
    `);
    const azMatch = azStmt.get(`${query}%`) as AzMedicine | undefined;

    if (azMatch) {
      // Branded medicine found! Let's find alternatives in PMBJP
      let matchedAlternatives: PmbjpMedicine[] = [];
      if (azMatch.composition1) {
        matchedAlternatives = findPmbjpAlternativesForComposition(db, azMatch.composition1);
      }
      
      return {
        searchedTerm: query,
        status: 'FOUND_AZ_WITH_ALTERNATIVES',
        exactMatch: azMatch,
        pmbjpAlternatives: matchedAlternatives
      };
    }

    // 3. Complete miss
    return {
      searchedTerm: query,
      status: 'NOT_FOUND',
      pmbjpAlternatives: []
    };

  } catch (error) {
    console.error("Search engine error:", error);
    return {
      searchedTerm: query,
      status: 'NOT_FOUND',
      pmbjpAlternatives: []
    };
  }
}

/**
 * Fetch a few common PMBJP medicines to display as default recommendations
 */
export async function getCommonMedicines(): Promise<PmbjpMedicine[]> {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM pmbjp_medicines 
      WHERE generic_name LIKE '%Paracetamol%' 
         OR generic_name LIKE '%Cetirizine%' 
         OR generic_name LIKE '%Amoxicillin%' 
         OR generic_name LIKE '%Pantoprazole%' 
         OR generic_name LIKE '%Azithromycin%'
         OR generic_name LIKE '%Diclofenac%'
      LIMIT 6
    `);
    let results = stmt.all() as PmbjpMedicine[];
    
    if (results.length < 3) {
       results = db.prepare('SELECT * FROM pmbjp_medicines LIMIT 6').all() as PmbjpMedicine[];
    }
    
    return results;
  } catch (error) {
    console.error("Fetch common medicines error:", error);
    return [];
  }
}
