'use server';

import { GoogleGenAI } from '@google/genai';
import { findGenericAlternatives, Medicine } from './actions';
import { getDb } from '@/lib/db';
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

export async function analyzePrescriptionText(prescriptionText: string, attachedFile?: { mimeType: string, base64: string }): Promise<AnalysisResult | null> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API Key is missing or invalid.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const hashData = prescriptionText + (attachedFile?.base64 || '');
    const hashKey = crypto.createHash('md5').update(hashData).digest('hex');
    const db = getDb();
    
    // Check Cache First
    const cached = db.prepare('SELECT response_json FROM ai_cache WHERE hash_key = ?').get(hashKey) as any;
    
    let outputText = "[]";
    if (cached) {
      console.log('Serving from AI DB Cache! Cost: $0');
      outputText = cached.response_json;
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', // Using stable model version
        contents: payloadContents,
        config: {
          maxOutputTokens: 600,
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });
      outputText = response.text || "[]";
      try {
        db.prepare('INSERT INTO ai_cache (hash_key, response_json) VALUES (?, ?)').run(hashKey, outputText);
      } catch (e) {
        console.error('Failed to cache AI response', e);
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
        // Find generic alternatives
        const generics = await findGenericAlternatives(drug.activeIngredient);
        identifiedDrugs.push({
          name: drug.name,
          reasoning: `Prescribed for typical indications of ${drug.activeIngredient}.`,
          genericsFound: generics
        });
        
        // Mock a savings calculation based on top generic found
        if (generics.length > 0) {
          // Assume branded was expensive
          savings += Math.floor(Math.random() * 200) + 50; 
        }
      }
    }

    return {
      extractedText: prescriptionText,
      identifiedDrugs,
      overallCostSavings: savings
    };

  } catch (error) {
    console.error("AI Analysis error:", error);
    throw error;
  }
}
