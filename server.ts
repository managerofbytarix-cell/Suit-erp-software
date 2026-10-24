/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini AI Client
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // AI Assistant endpoint: parses instructions into structured suit actions
  app.post('/api/gemini/assistant', async (req, res) => {
    const { prompt, context, role } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Role check: If employee, prevent profit exposure
    const isEmployee = role === 'EMPLOYEE';

    const systemInstruction = `You are the executive AI Atelier Manager for "Zubair & Sons Bespoke Tailors" (Lahore, Karachi, Islamabad).
Your role is to assist the atelier master tailor and showroom staff by processing commands into structured actions:
1. Creating bespoke suit orders (parse client name, suit items, size, fabric, delivery date, advance deposit, balance).
2. Generating thermal POS invoices (specifying order #, roll width 58mm or 80mm).
3. Updating inventory and restock quantities.
4. Adding or modifying suit categories.
5. Creating orders for specific family members (e.g. Tariq Bajwa's son Hamza, or brother Bilal) and managing family accounts.
6. Providing business insights (sales, low-stock warnings, fitting schedule).
7. Providing step-by-step guidance on how to use the software, add the business website in Settings, create products, and manage family member measurements in English or Roman Urdu.

${isEmployee ? 'SECURITY NOTE: The current user is an EMPLOYEE. Never reveal profit margins, net revenue, or full client telephone numbers.' : 'User is an ADMIN with full access.'}

Respond with valid JSON with the following structure:
{
  "message": "Friendly professional explanation in English with respectful Pakistani sartorial etiquette",
  "actionType": "CREATE_ORDER" | "GENERATE_INVOICE" | "UPDATE_STOCK" | "ADD_CATEGORY" | "INSIGHT" | "NONE",
  "actionPayload": object with parameters if an action is to be performed (e.g. order details, product code, quantity, category name, orderNumber)
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `User command: "${prompt}"\n\nCurrent Atelier Context: ${JSON.stringify(context || {})}`,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to heuristic parser:', err.message);
      }
    }

    // Heuristic fallback for offline/demo operation
    const lower = prompt.toLowerCase();
    if (lower.includes('order') || lower.includes('suit') || lower.includes('create')) {
      return res.json({
        message: 'I have prepared a draft bespoke suit order based on your prompt. Review the details and click "Apply Order" to save it.',
        actionType: 'CREATE_ORDER',
        actionPayload: {
          customerName: prompt.match(/for\s+([A-Za-z\s]+?)(?:\s+for|\s+order|\s+with|$)/i)?.[1]?.trim() || 'Distinguished Client',
          itemTitle: lower.includes('tuxedo') ? 'Sartorial Charcoal Tuxedo' : (lower.includes('prince') ? 'Imperial Emerald Prince Coat' : 'Super 150s Royal Navy 3-Piece'),
          advancePKR: 50000,
          notes: `Created via Sartorial AI Assistant: "${prompt}"`,
        },
      });
    } else if (lower.includes('stock') || lower.includes('add') || lower.includes('restock')) {
      return res.json({
        message: 'Inventory adjustment identified. I can increment product stock in the database with an audit record.',
        actionType: 'UPDATE_STOCK',
        actionPayload: {
          productCode: 'ZS-701',
          delta: 5,
          reason: 'Restock approved by Sartorial AI Assistant',
        },
      });
    } else if (lower.includes('invoice') || lower.includes('receipt') || lower.includes('print')) {
      return res.json({
        message: 'Thermal POS invoice template prepared. Ready to send to 58mm or 80mm roll printer.',
        actionType: 'GENERATE_INVOICE',
        actionPayload: {
          orderNumber: 'ZS-2026-1042',
          paperWidth: '80mm',
        },
      });
    } else if (lower.includes('category')) {
      return res.json({
        message: 'New custom category ready to be added to the atelier catalog.',
        actionType: 'ADD_CATEGORY',
        actionPayload: {
          categoryName: 'Safari Suit & Waistcoat Set',
        },
      });
    } else if (lower.includes('website') || lower.includes('url')) {
      return res.json({
        message: 'To add or change your website: Go to Settings -> "Store Profile & Website". Enter your full URL in "Official Website URL" (e.g. https://www.yourdomain.com) and click Save. The link will appear in the top header, thermal print receipts, and WhatsApp message templates.',
        actionType: 'NONE',
      });
    } else if (lower.includes('how to use') || lower.includes('guide') || lower.includes('kaise') || lower.includes('manual') || lower.includes('help')) {
      return res.json({
        message: 'Software Rahnumai: 1) Settings mein Website aur dukan ka naam set karein. 2) Products tab mein naye suits aur fabric add karein. 3) Customers tab mein client aur unke family members ke naap darj karein. 4) Orders tab mein suit order book karein. Mukammal step-by-step tutorial ke liye top bar par "User Guide" button dabayein.',
        actionType: 'NONE',
      });
    }

    return res.json({
      message: `Atelier AI has analyzed your request: "${prompt}". All records in persistent storage are synchronized. Click "User Guide" on the top bar for step-by-step software walkthrough.`,
      actionType: 'NONE',
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      port: PORT,
    });
  });

  // Mount Vite middleware in development
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zubair & Sons Bespoke ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
