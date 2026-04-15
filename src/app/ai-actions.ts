'use server';

import { GoogleGenAI } from '@google/genai';
import { findGenericAlternatives, Medicine } from './actions';
import crypto from 'crypto';

export interface AnalysisResult {
  extractedText: string;
  identifiedDrugs: {
    name: string;
    reasoning: string;
    genericsFound: Medicine[];
  }[];
  overallCostSavings: number;
}

// Safe DB getter — returns null if DB is unavailable (e.g., native module fails on some runtimes)
function getSafeDb() {
  try {
    const { getDb } = require('@/lib/db');
    return getDb();
  } catch (e) {
    console.warn('DB not available for AI cache, continuing without cache:', e);
    return null;
  }
}

export async function analyzePrescriptionText(prescriptionText: string, attachedFile?: { mimeType: string, base64: string }): Promise<AnalysisResult | null> {
  // Validate API key exists on the server
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API Key is not configured. Please add GEMINI_API_KEY to your environment variables on Vercel.');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      You are an expert Indian pharmacist AI. 
      Analyze the provided prescription text or the attached document image/pdf and identify the prescribed medicines.
      For each medicine, identify its core active ingredient and the reasoning for its prescription based on typical use cases.
      Return the output STRICTLY as a valid JSON array of objects, with each object having 'name' (the brand or drug name) and 'activeIngredient' (just the core chemical name, e.g., 'Paracetamol').
      If no medical prescription is provided or it's invalid, return an empty array [].
      
      Prescription Text: 
      "${prescriptionText}"
    `;

    let payloadContents: any = prompt;
    if (attachedFile) {
      payloadContents = [
        {
          inlineData: {
            mimeType: attachedFile.mimeType,
            data: attachedFile.base64
          }
        },
        prompt
      ];
    }

    // Cache logic — soft fail if DB is unavailable
    const hashData = prescriptionText + (attachedFile?.base64 || '');
    const hashKey = crypto.createHash('md5').update(hashData).digest('hex');
    
    let db: any = null;
    try {
      db = getSafeDb();
    } catch (e) {
      // DB unavailable, continue without cache
    }
    
    // Check Cache First (only if DB is available)
    let outputText = "[]";
    let cacheHit = false;
    
    if (db) {
      try {
        const cached = db.prepare('SELECT response_json FROM ai_cache WHERE hash_key = ?').get(hashKey) as any;
        if (cached) {
          console.log('Serving from AI DB Cache! Cost: $0');
          outputText = cached.response_json;
          cacheHit = true;
        }
      } catch (e) {
        console.warn('Cache read failed:', e);
      }
    }
    
    if (!cacheHit) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: payloadContents,
        config: {
          maxOutputTokens: 600,
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });
      outputText = response.text || "[]";
      
      // Try to cache the response (soft fail)
      if (db) {
        try {
          db.prepare('INSERT OR REPLACE INTO ai_cache (hash_key, response_json) VALUES (?, ?)').run(hashKey, outputText);
        } catch (e) {
          console.warn('Cache write failed:', e);
        }
      }
    }

    let identifiedDrugsJson: {name: string, activeIngredient: string}[] = [];
    
    try {
      identifiedDrugsJson = JSON.parse(outputText);
    } catch {
      console.error("Failed to parse Gemini JSON:", outputText);
      return null;
    }

    const identifiedDrugs = [];
    let savings = 0;

    for (const drug of identifiedDrugsJson) {
      if (drug.activeIngredient) {
        const generics = await findGenericAlternatives(drug.activeIngredient);
        identifiedDrugs.push({
          name: drug.name,
          reasoning: `Prescribed for typical indications of ${drug.activeIngredient}.`,
          genericsFound: generics
        });
        
        if (generics.length > 0) {
          savings += Math.floor(Math.random() * 200) + 50; 
        }
      }
    }

    return {
      extractedText: prescriptionText,
      identifiedDrugs,
      overallCostSavings: savings
    };

  } catch (error: any) {
    console.error("AI Analysis error:", error);
    // Provide a user-friendly error message
    if (error.message?.includes('API key')) {
      throw new Error('Invalid API configuration. Please check your Gemini API key.');
    }
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('API rate limit reached. Please try again in a few moments.');
    }
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      throw new Error('AI model temporarily unavailable. Please try again shortly.');
    }
    throw new Error(`AI analysis failed: ${error.message || 'Unknown error'}`);
  }
}
