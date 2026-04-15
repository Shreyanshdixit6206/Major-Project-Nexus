'use server';

import { getDb } from '@/lib/db';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('nexus-super-secret-key-for-prototype');

export async function signJwt(abhaId: string): Promise<string> {
  return await new SignJWT({ abhaId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyJwt(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.abhaId as string;
  } catch {
    return null;
  }
}

export interface Medicine {
  id: number;
  brand_name: string;
  manufacturer: string;
  price_inr: number;
  is_discontinued: string;
  dosage_form: string;
  primary_ingredient: string;
  primary_strength: string;
  therapeutic_class: string;
}

import { runStoreSearch, SearchEngineResult, getCommonMedicines as engineGetCommonMedicines } from '@/lib/searchEngine';

export async function executeSearch(query: string): Promise<SearchEngineResult> {
  return await runStoreSearch(query);
}

export async function getCommonMedicines() {
  return await engineGetCommonMedicines();
}

export async function saveHealthDocument(token: string, documentName: string, documentText: string): Promise<boolean> {
  try {
    const abhaId = await verifyJwt(token);
    if (!abhaId) return false;

    const db = getDb();
    const stmt = db.prepare(`INSERT INTO health_vault (abha_id, document_name, document_text) VALUES (?, ?, ?)`);
    stmt.run(abhaId, documentName, documentText);
    return true;
  } catch (error) {
    console.error("Vault save error:", error);
    return false;
  }
}

export async function getHealthDocuments(token: string): Promise<{id: number, document_name: string, uploaded_at: string}[]> {
  try {
    const abhaId = await verifyJwt(token);
    if (!abhaId) return [];

    const db = getDb();
    const stmt = db.prepare(`SELECT id, document_name, uploaded_at FROM health_vault WHERE abha_id = ? ORDER BY uploaded_at DESC`);
    return stmt.all(abhaId) as {id: number, document_name: string, uploaded_at: string}[];
  } catch (error) {
    console.error("Vault fetch error:", error);
    return [];
  }
}

export async function getHealthDocumentContent(token: string, id: number): Promise<{document_name: string, document_text: string} | null> {
  try {
    const abhaId = await verifyJwt(token);
    if (!abhaId) return null;

    const db = getDb();
    const stmt = db.prepare(`SELECT document_name, document_text FROM health_vault WHERE id = ? AND abha_id = ? LIMIT 1`);
    return stmt.get(id, abhaId) as {document_name: string, document_text: string};
  } catch (error) {
    console.error("Vault download error:", error);
    return null;
  }
}

export async function deleteHealthDocument(token: string, id: number): Promise<boolean> {
  try {
    const abhaId = await verifyJwt(token);
    if (!abhaId) return false;

    const db = getDb();
    const stmt = db.prepare(`DELETE FROM health_vault WHERE id = ? AND abha_id = ?`);
    stmt.run(id, abhaId);
    return true;
  } catch (error) {
    console.error("Vault deletion error:", error);
    return false;
  }
}

export async function findGenericAlternatives(ingredient: string, currentPrice?: number): Promise<Medicine[]> {
  try {
    const db = getDb();
    const searchTerm = `%${ingredient}%`;
    
    // Find matching ingredients and sort by price descending
    // If a current price is given, mostly look for cheaper ones
    let sql = `
      SELECT * FROM medicines 
      WHERE primary_ingredient LIKE ? AND is_discontinued != 'True'
    `;

    if (currentPrice) {
      sql += ` AND price_inr < ? ORDER BY price_inr ASC LIMIT 10`;
      const stmt = db.prepare(sql);
      return stmt.all(searchTerm, currentPrice) as Medicine[];
    } else {
      sql += ` ORDER BY price_inr ASC LIMIT 10`;
      const stmt = db.prepare(sql);
      return stmt.all(searchTerm) as Medicine[];
    }
  } catch (error) {
    console.error("Generic finding error:", error);
    return [];
  }
}

export async function createOrder(totalAmount: number, items: any[], userName: string = '', address: string = '', phone: string = '', abhaId: string = ''): Promise<string | null> {
  try {
    const db = getDb();
    const orderId = "ORD-NX-" + Math.floor(Math.random() * 1000000);
    const stmt = db.prepare(`INSERT INTO orders (order_id, status, total_amount, items_json, user_name, address, phone, abha_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(orderId, 'PROCESSING', totalAmount, JSON.stringify(items), userName, address, phone, abhaId);
    return orderId;
  } catch (error) {
    console.error("Order creation error:", error);
    return null;
  }
}

export async function getOrder(orderId: string): Promise<any | null> {
  try {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM orders WHERE order_id = ? LIMIT 1`);
    const order = stmt.get(orderId) as any;
    if (order) {
      // Parse items back into object
      return {
        ...order,
        items: JSON.parse(order.items_json)
      };
    }
    return null;
  } catch (error) {
    console.error("Order fetch error:", error);
    return null;
  }
}

export async function getUserOrders(abhaId: string): Promise<any[]> {
  try {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM orders WHERE abha_id = ? ORDER BY created_at DESC`);
    const results = stmt.all(abhaId) as any[];
    
    return results.map(order => ({
      ...order,
      items: JSON.parse(order.items_json)
    }));
  } catch (error) {
    console.error("User orders fetch error:", error);
    return [];
  }
}
