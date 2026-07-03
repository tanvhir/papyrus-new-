import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

// Ensure storage directory exists
const STORAGE_DIR = path.join(process.cwd(), 'storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Local mock database paths
const MOCK_DB_FILE = path.join(STORAGE_DIR, 'mock_db.json');

// Initialize mock DB
if (!fs.existsSync(MOCK_DB_FILE)) {
  fs.writeFileSync(MOCK_DB_FILE, JSON.stringify({
    user: {
      id: 1,
      email: 'admin@domain.com',
      username: 'Administrator',
      role: 'admin'
    },
    loggedIn: false,
    subjects: [
      {
        id: 'math-101',
        name: 'Mathematics',
        notes: [
          {
            id: 'note-math-intro',
            title: 'Welcome to Linear Algebra',
            content: '<h1>Linear Algebra Fundamentals</h1><p>Let\'s study matrix operations and quadratic equations...</p>',
            stickies: [
              { id: 'st-1', text: 'Review vector operations before Friday test!', color: 'yellow', position: { x: 50, y: 150 }, isPinned: true }
            ],
            arrows: [],
            dividers: [],
            texture: 'linen',
            themeId: 'classic',
            isHandwriting: false,
            fontSize: 16,
            pageLayout: 'pageless',
            pageMargin: 'normal',
            pageLayoutMode: 'single',
            flashcardIds: ['fc-math-1']
          }
        ]
      }
    ],
    activeNoteId: 'note-math-intro',
    studyStats: {
      totalStudied: 1,
      streak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      weakConceptIds: []
    },
    flashcards: [
      {
        id: 'fc-math-1',
        type: 'basic',
        front: 'What is an Identity Matrix?',
        back: 'A square matrix in which all the elements of the principal diagonal are ones and all other elements are zeros.',
        clozeData: '',
        points: [],
        subjectId: 'math-101',
        chapterId: '1',
        sourceNoteId: 'note-math-intro',
        sourceBlockId: '',
        tags: ['linear-algebra', 'matrices'],
        createdAt: new Date().toISOString(),
        interval: 1,
        easeFactor: 2.50,
        reviewCount: 1,
        difficulty: 0,
        nextReviewDate: new Date().toISOString(),
        lastStudiedAt: null
      }
    ]
  }, null, 2));
}

// Read database from disk helper
function readMockDB() {
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

// Write database to disk helper
function writeMockDB(data: any) {
  fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve request body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // --- Mock Authentication API ---
  app.get('/api/auth/me.php', (req, res) => {
    const db = readMockDB();
    res.json({
      success: true,
      loggedIn: db.loggedIn,
      installed: true,
      user: db.loggedIn ? db.user : null
    });
  });

  app.post('/api/auth/login.php', (req, res) => {
    const { email, password } = req.body;
    // For local preview, accept password to make sandbox intuitive and pleasant
    if (email === 'admin@domain.com' && password) {
      const db = readMockDB();
      db.loggedIn = true;
      writeMockDB(db);
      res.json({
        success: true,
        user: db.user,
        message: 'Authenticated successfully in dev preview mode.'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please use admin@domain.com and any password in development sandbox.',
        code: 'INVALID_CREDENTIALS'
      });
    }
  });

  app.post('/api/auth/logout.php', (req, res) => {
    const db = readMockDB();
    db.loggedIn = false;
    writeMockDB(db);
    res.json({
      success: true,
      message: 'Session revoked and logged out successfully.'
    });
  });

  // --- Mock Notes API ---
  app.get('/api/notes/list.php', (req, res) => {
    const db = readMockDB();
    res.json({
      success: true,
      subjects: db.subjects || [],
      activeNoteId: db.activeNoteId || '',
      studyStats: db.studyStats || {}
    });
  });

  app.post('/api/notes/save.php', (req, res) => {
    const { subjects, activeNoteId, studyStats } = req.body;
    const db = readMockDB();
    
    if (subjects !== undefined) db.subjects = subjects;
    if (activeNoteId !== undefined) db.activeNoteId = activeNoteId;
    if (studyStats !== undefined) db.studyStats = studyStats;
    
    writeMockDB(db);
    res.json({
      success: true,
      message: 'Dev workspace cloud sync saved.'
    });
  });

  // --- Mock Flashcards API ---
  app.get('/api/flashcards/list.php', (req, res) => {
    const db = readMockDB();
    res.json({
      success: true,
      flashcards: db.flashcards || []
    });
  });

  app.post('/api/flashcards/save.php', (req, res) => {
    const { flashcards } = req.body;
    const db = readMockDB();
    if (flashcards !== undefined) {
      db.flashcards = flashcards;
    }
    writeMockDB(db);
    res.json({
      success: true,
      message: 'Dev cards cloud sync saved.'
    });
  });

  app.post('/api/flashcards/review.php', (req, res) => {
    const { cardId, interval, easeFactor, reviewCount, difficulty, nextReviewDate, lastStudiedAt } = req.body;
    const db = readMockDB();
    
    const cardIdx = (db.flashcards || []).findIndex((fc: any) => fc.id === cardId);
    if (cardIdx !== -1) {
      db.flashcards[cardIdx].interval = interval;
      db.flashcards[cardIdx].easeFactor = easeFactor;
      db.flashcards[cardIdx].reviewCount = reviewCount;
      if (difficulty !== undefined) db.flashcards[cardIdx].difficulty = difficulty;
      db.flashcards[cardIdx].nextReviewDate = nextReviewDate;
      db.flashcards[cardIdx].lastStudiedAt = lastStudiedAt;
      writeMockDB(db);
      res.json({
        success: true,
        message: 'Dev preview card review processed.'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Card not found in dev database.'
      });
    }
  });

  // --- AI Format Note Endpoint (Proxied/Emulated for Dev mode) ---
  app.post('/api/ai/format.php', async (req, res) => {
    const apiKey = (req.headers['x-gemini-api-key'] as string) || req.body.customApiKey || process.env.GEMINI_API_KEY;
    const modelName = (req.headers['x-gemini-model'] as string) || req.body.customModel || 'gemini-2.5-flash';
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured. Please set it in Settings or your environment.',
        code: 'MISSING_API_KEY'
      });
    }

    const { 
      title, 
      content, 
      stickies, 
      arrows, 
      dividers, 
      pageLayout, 
      highlightStyle,
      disableAIFlashcards,
      disableAIArrows,
      disableAIStickies,
      disableAIDividers
    } = req.body;

    let highlightInstruction = '';
    if (highlightStyle === 'generous') {
      highlightInstruction = `2. GENEROUS HIGHLIGHTING:
   - Highlight all key terms, critical definitions, formulas, and important concepts generously to make the document extremely scan-friendly and visual. Use approved highlight colors (Yellow, Blue, Deep green, Pink, Orange) cleanly.`;
    } else if (highlightStyle === 'none') {
      highlightInstruction = `2. NO HIGHLIGHTING:
   - Do not generate any highlights (<mark>) at all. Keep the text format clean and un-highlighted.`;
    } else {
      highlightInstruction = `2. NO RANDOM HIGHLIGHTS:
   - Do not highlight random individual words. Only use highlights (<mark>) for critical definitions, formulas, or key terms (maximum of 3 to 5 highlights per page). Use deep green (#15803d) or other approved highlight colors cleanly.`;
    }

    let strictDisableInstructions = '';
    if (disableAIArrows) {
      strictDisableInstructions += '\n- DO NOT generate any connection or callout arrows in the "arrows" array. Keep the "arrows" array completely empty ([]) in your response.';
    }
    if (disableAIStickies) {
      strictDisableInstructions += '\n- DO NOT generate any margin sticky notes in the "stickies" array. Keep the "stickies" array completely empty ([]) in your response.';
    }
    if (disableAIDividers) {
      strictDisableInstructions += '\n- DO NOT generate any canvas dividers in the "dividers" array. Keep the "dividers" array completely empty ([]) in your response.';
    }
    if (disableAIFlashcards) {
      strictDisableInstructions += '\n- DO NOT generate any flashcard-style inline question or answer suggestions.';
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert academic scribe and content designer. Your task is to take the following rough, unformatted, or raw note titled "${title}" and format it beautifully.

CRITICAL INSTRUCTIONS FOR HIGH-QUALITY FORMATTING:
1. STRICT SPARSITY RULE FOR STICKIES & ARROWS:
   - Only generate stickies or arrows if they are absolutely necessary as highly relevant callouts (e.g. key summaries, formulas, or mnemonic definitions).
   - If not absolutely essential, the "stickies" and "arrows" arrays MUST be empty ([]). Do not generate random definitions in stickies unless specifically requested or highly valuable! Limit stickies to a maximum of 1 or 2.
2. ${highlightInstruction}
${strictDisableInstructions}
3. STICKY PLACEMENT ALGORITHM:
   - Place all generated stickies in the right-hand margin area.
   - Set "x" between 850 and 920.
   - Stagger "y" values by at least 250px starting from 150 (e.g., y=150, 400, 650) to prevent overlapping.
4. ARROW ALGORITHM:
   - Connection arrows must start at a logical body coordinate on the page (e.g., x=600, y close to the relevant text) and end precisely at the target sticky's left edge (e.g., end.x = sticky_x - 10, end.y = sticky_y).
   - The "mid" coordinate MUST represent a slight, elegant curved bend to make it look hand-drawn and beautiful:
     mid.x = (start.x + end.x) / 2
     mid.y = (start.y + end.y) / 2 - 30

You must return a structured JSON object with the following fields:
1. "title": A polished, clear title for the note.
2. "content": A beautifully structured HTML string that uses rich formatting features supported by our editor:
   - Use headings (h1, h2, h3) and paragraph blocks.
   - Use lists (ul, ol) to organize lists of items.
   - Apply inline styles like bold (strong), italics (em), underlines (u).
   - Use highlights via \`<mark data-color="#ffff00" style="background-color: rgb(255, 255, 0); color: inherit;">text</mark>\`. (Highlight colors allowed: Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa)
   - Use side-by-side columns whenever information fits comparison or dual-structure layouts:
     \`<div data-type="columns"><div data-type="column"><h3>Left</h3><p>...</p></div><div data-type="column"><h3>Right</h3><p>...</p></div></div>\`
   - Render mathematical equations or numerical derivations using \`<math-node data-latex="LaTeX_Formula"></math-node>\`. E.g., \`<math-node data-latex="E = mc^2"></math-node>\`.
   - Embed decorative separation lines between thematic sections using: \`<decorative-divider data-type="solid|dashed|dotted|zigzag|wave" data-color="#15803d" data-size="2" data-length="100%"></decorative-divider>\`.
   - Group page boundaries inside \`<div data-type="page">...</div>\` containers.
3. "stickies": An array of sticky notes for key Callouts, Reminders, definitions, or Quick Flashcards (following the placement algorithm).
4. "arrows": An array of curved connection or callout arrows pointing from main concepts in the text block to relevant stickies (following the arrow algorithm).
5. "dividers": An array of decorative background canvas dividers (keep empty unless requested).

Rough note to format:
Title: ${title}
Content: ${content || ''}

Always keep the response as valid, pure JSON according to the requested schema. Do not include markdown codeblocks around the JSON response.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              content: { type: 'STRING' },
              stickies: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'STRING' },
                    text: { type: 'STRING' },
                    color: { type: 'STRING' },
                    position: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    fontSize: { type: 'NUMBER' }
                  },
                  required: ['id', 'text', 'color', 'position']
                }
              },
              arrows: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'STRING' },
                    start: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    end: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    mid: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    color: { type: 'STRING' }
                  },
                  required: ['id', 'start', 'end', 'mid', 'color']
                }
              },
              dividers: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'STRING' },
                    type: { type: 'STRING', enum: ['solid', 'dashed', 'zigzag', 'dotted', 'wave'] },
                    orientation: { type: 'STRING', enum: ['horizontal', 'vertical'] },
                    size: { type: 'NUMBER' },
                    length: { type: 'STRING' },
                    color: { type: 'STRING' },
                    position: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    }
                  },
                  required: ['id', 'type', 'orientation', 'size', 'length', 'color', 'position']
                }
              }
            },
            required: ['title', 'content', 'stickies', 'arrows', 'dividers']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsedData = JSON.parse(responseText);
      res.json({
        success: true,
        message: 'Note formatted successfully by Gemini AI!',
        ...parsedData
      });
    } catch (error: any) {
      console.error('AI Formatter error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to format note: ' + (error.message || error),
        code: 'AI_FORMATTER_ERROR'
      });
    }
  });

  // --- AI Format Selection Endpoint (Proxied/Emulated for Dev mode) ---
  app.post('/api/ai/format-selection.php', async (req, res) => {
    const apiKey = (req.headers['x-gemini-api-key'] as string) || req.body.customApiKey || process.env.GEMINI_API_KEY;
    const modelName = (req.headers['x-gemini-model'] as string) || req.body.customModel || 'gemini-2.5-flash';
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY is not configured. Please set it in Settings or your environment.',
        code: 'MISSING_API_KEY'
      });
    }

    const { 
      selectionText, 
      selectionHTML, 
      instruction, 
      centerY, 
      highlightStyle,
      disableAIFlashcards,
      disableAIArrows,
      disableAIStickies,
      disableAIDividers
    } = req.body;
    const targetCenterY = parseFloat(centerY || '300');

    let highlightInstruction = '';
    if (highlightStyle === 'generous') {
      highlightInstruction = `- Use highlights generously with <mark data-color="#ffff00" style="background-color: rgb(255, 255, 0); color: inherit;">text</mark> to highlight key terms, critical definitions, formulas, and important concepts to make the document extremely scan-friendly and visual. (Highlight colors allowed: Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa)`;
    } else if (highlightStyle === 'none') {
      highlightInstruction = `- Do NOT use any highlights (<mark>) at all. Keep everything un-highlighted.`;
    } else {
      highlightInstruction = `- Use highlights sparingly with <mark data-color="#ffff00" style="background-color: rgb(255, 255, 0); color: inherit;">text</mark> ONLY for critical definitions, formulas, or key terms (maximum of 3 to 5 highlights per page). (Highlight colors allowed: Yellow: #ffff00, Blue: #bfdbfe, Deep green: #15803d, Pink: #f9a8d4, Orange: #fed7aa)`;
    }

    let strictDisableInstructions = '';
    if (disableAIArrows) {
      strictDisableInstructions = `\n- DO NOT generate any connection or callout arrows in the "arrows" array. Keep the "arrows" array completely empty ([]) in your response.`;
    }
    if (disableAIStickies) {
      strictDisableInstructions += `\n- DO NOT generate any margin sticky notes in the "stickies" array. Keep the "stickies" array completely empty ([]) in your response.`;
    }
    if (disableAIDividers) {
      strictDisableInstructions += `\n- DO NOT generate any canvas dividers in the "dividers" array. Keep the "dividers" array completely empty ([]) in your response.`;
    }
    if (disableAIFlashcards) {
      strictDisableInstructions += `\n- DO NOT generate any flashcard-style inline question or answer suggestions.`;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert academic content designer. Your task is to format a SPECIFIC portion of a note based on the user's instructions.

CRITICAL INSTRUCTIONS FOR HIGH-QUALITY FORMATTING:
1. STRICT SPARSITY RULE FOR STICKIES & ARROWS:
   - Only generate stickies or arrows if they are absolutely necessary as highly relevant callouts (e.g. key summaries, formulas, or mnemonic definitions).
   - If not absolutely essential, the "stickies" and "arrows" arrays MUST be empty ([]). Limit stickies to a maximum of 1 or 2.
2. ${highlightInstruction}
${strictDisableInstructions}
3. CRITICAL: Only use multi-column layouts when the user EXPLICITLY requests columns, side-by-side layout, comparison tables, or mnemonic layouts. DO NOT use columns for simple formatting requests like centering, highlighting, or basic text styling.

User's custom formatting instruction: "${instruction}"

Selected text to format:
${selectionText}

Selected HTML of selection (if any structure exists):
${selectionHTML}

Current visual page line height (centerY): ${targetCenterY}

Your response MUST be a single structured JSON object with the following fields:
1. "formattedHTML": The beautifully formatted HTML representing ONLY the replacement for the selected portion.
   - You should restructure the HTML inline.
   - Use headings (h1, h2, h3), paragraphs (p), list items (li), and inline styles like strong, em, u as needed.
   - If requested or suitable, use multi-column elements:
     <div data-type="columns"><div data-type="column"><h3>Left Column</h3><p>...</p></div><div data-type="column"><h3>Right Column</h3><p>...</p></div></div>
   - CRITICAL VISUAL MNEMONIC / DOWNWARD ARROW RESTRUCTURING PATTERN:
     If the user wants a vertical mnemonic layout (like a letter/prefix/symbol on top, an arrow pointing down, and its meaning or full word directly below, side-by-side across multiple columns as in "E -> Ellipse, A -> Area, T -> Time"):
     You MUST generate a responsive multi-column element <div data-type="columns">.
     Inside, each column (<div data-type="column">) must have:
       1) A beautifully formatted top item (usually a single letter, prefix, or word, e.g., <p style="text-align: center; font-size: 1.25rem; font-weight: bold; margin-bottom: 2px;">E</p>).
       2) An elegant, curved inline vertical SVG arrow pointing down (e.g., <svg viewBox="0 0 24 32" width="20" height="28" style="margin: 4px auto; display: block; overflow: visible;"><path d="M12,2 Q14,14 12,26" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/><path d="M8,21 L12,26 L16,21" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>). Ensure you use correct SVG coordinates to render a clean downward curved path with an arrowhead! Use any vibrant color or note theme color.
       3) A beautifully formatted bottom item containing the meaning or full word centered (e.g., <p style="text-align: center; font-size: 0.85rem; color: #4b5563;">Ellipse</p>).
     This creates a gorgeous, perfectly aligned vertical hierarchy exactly like high-end visual student notes!
   - Use LaTeX formulas via <math-node data-latex="formula_here"></math-node> if there are mathematical equations or terms.
   - Embed decorative horizontal lines via: <decorative-divider data-type="solid|dashed|dotted|zigzag|wave" data-color="#15803d" data-size="2" data-length="100%"></decorative-divider>.
2. "stickies": An array of optional staggered callout sticky notes ONLY if requested by the user's prompt or highly necessary (limit to 1 or 2 max):
   - Format: { "id": "string", "text": "string", "color": "#ffff99|#ffccff|#ccffff|#ffcc99", "position": { "x": number, "y": number }, "fontSize": number }
   - Placement: Best placed on the right margin side of the page (x between 850 and 920). Set 'y' coordinate close to centerY (e.g. centerY, centerY + 220, etc.) to match where the selection is located.
3. "arrows": An array of connection arrows pointing from the main text body to the generated stickies:
   - Format: { "id": "string", "start": { "x": number, "y": number }, "end": { "x": number, "y": number }, "mid": { "x": number, "y": number }, "color": "string" }
   - Alignment: Arrow should start around x: 600, y: centerY. It should end at the sticky note's position (e.g. x: 840, y: centerY). The 'mid' coordinate must have a slight curved bend (e.g., mid.x = (start.x + end.x) / 2, mid.y = (start.y + end.y) / 2 - 30).
4. "dividers": An array of background dividers if relevant (usually empty [] unless explicitly requested).

Keep the content highly polished, academic, and extremely accurate to the user's instruction. Do not wrap the JSON output in markdown backticks.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              formattedHTML: { type: 'STRING' },
              stickies: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'STRING' },
                    text: { type: 'STRING' },
                    color: { type: 'STRING' },
                    position: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    fontSize: { type: 'NUMBER' }
                  },
                  required: ['id', 'text', 'color', 'position']
                }
              },
              arrows: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'STRING' },
                    start: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    end: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    mid: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    },
                    color: { type: 'STRING' }
                  },
                  required: ['id', 'start', 'end', 'mid', 'color']
                }
              },
              dividers: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    id: { type: 'STRING' },
                    type: { type: 'STRING', enum: ['solid', 'dashed', 'zigzag', 'dotted', 'wave'] },
                    orientation: { type: 'STRING', enum: ['horizontal', 'vertical'] },
                    size: { type: 'NUMBER' },
                    length: { type: 'STRING' },
                    color: { type: 'STRING' },
                    position: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' }
                      },
                      required: ['x', 'y']
                    }
                  },
                  required: ['id', 'type', 'orientation', 'size', 'length', 'color', 'position']
                }
              }
            },
            required: ['formattedHTML', 'stickies', 'arrows', 'dividers']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini API');
      }

      const parsedData = JSON.parse(responseText);
      res.json({
        success: true,
        message: 'Selection formatted successfully by Gemini AI!',
        ...parsedData
      });
    } catch (error: any) {
      console.error('AI Selection Formatter error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to format selection: ' + (error.message || error),
        code: 'AI_FORMATTER_ERROR'
      });
    }
  });

  // --- Integration with Vite Dev Server / Static Assets in Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for all other entries (SPA Routing fallback)
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Development Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
