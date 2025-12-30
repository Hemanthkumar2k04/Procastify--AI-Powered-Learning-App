import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserPreferences, RoutineTask, Question, Flashcard, Note, QueueItem, Attachment } from '../types';

const getAI = () => {
  // @ts-ignore - Vite env
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. Quiz and other AI features won't work.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};


const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_MULTIMODAL = 'gemini-2.0-flash-exp';
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';


const cleanJSON = (text: string | undefined): string => {
    if (!text) return ""; 
    
    let cleaned = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    return cleaned;
};

const safeJSONParse = <T>(text: string, fallback: T): T => {
    try {
        const cleaned = cleanJSON(text);
        if (!cleaned) return fallback;
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("JSON Parse failed", e);
        
        if (e instanceof SyntaxError && text.includes('[{')) {
             try {
                 
                 const lastRightBracket = text.lastIndexOf(']');
                 const lastRightBrace = text.lastIndexOf('}');
                 const cutOff = Math.max(lastRightBracket, lastRightBrace);
                 if (cutOff > 0) {
                     const sub = text.substring(0, cutOff + 1);
                     return JSON.parse(cleanJSON(sub));
                 }
             } catch (e2) {
                 console.warn("Recovery failed", e2);
             }
        }
        return fallback;
    }
}



export const summarizeContent = async (
    textContext: string,
    attachments: Attachment[], 
    mode: 'short' | 'detailed' | 'eli5' | 'exam'
): Promise<string> => {
  const ai = getAI();
  
  
  if (!textContext.trim()) {
    return "Please enter text to summarize.";
  }

  let systemPrompt = "";
  switch(mode) {
    case 'eli5': systemPrompt = "Explain this content like I'm 5 years old. Use simple analogies."; break;
    case 'exam': systemPrompt = "Summarize for exam prep. Focus on definitions, dates, formulas, and key concepts. Use structured bullet points."; break;
    case 'detailed': systemPrompt = "Provide a comprehensive, detailed summary with examples."; break;
    case 'short': default: systemPrompt = "Concise key points only. Bullet points."; break;
  }

  try {
    const parts: any[] = [];
    parts.push({ text: `${systemPrompt}\n\nContent to summarize:\n${textContext.substring(0, 30000)}` });

    const model = MODEL_TEXT;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { 
        systemInstruction: systemPrompt
      }
    });
    
    if (!response || !response.text) {
      return "Failed to generate summary. Please try again.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Summary error:", error);
    
    if (error.status === 'RESOURCE_EXHAUSTED' || error.code === 429) {
      return "Rate limited. Please try again in a moment.";
    }
    
    return `Error: ${error.message || "Unknown error"}. Please try again.`;
  }
};



export const analyzeNoteWorkload = async (noteContent: string): Promise<Note['aiAnalysis']> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Analyze this study material. Estimate the difficulty, time required to study it effectively, and cognitive load. Return JSON.
      Material: ${noteContent.substring(0, 10000)}`, // Truncate to prevent token overflow
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
            estimatedMinutes: { type: Type.NUMBER },
            cognitiveLoad: { type: Type.STRING, enum: ['light', 'medium', 'heavy'] },
            summary: { type: Type.STRING }
          }
        }
      }
    });
    
   
    if (!response || !response.text) throw new Error("No response text");
    
    return safeJSONParse(response.text, {
        difficulty: 'medium',
        estimatedMinutes: 30,
        cognitiveLoad: 'medium',
        summary: 'Analysis failed (JSON Parse Error).'
    });

  } catch (error) {
    console.error("Note Analysis Error", error);
    
    return {
        difficulty: 'medium',
        estimatedMinutes: 30,
        cognitiveLoad: 'medium',
        summary: 'Analysis failed.'
    };
  }
};



export const generateAdaptiveRoutine = async (
    queue: QueueItem[], 
    notes: Note[], 
    prefs: UserPreferences
): Promise<{ tasks: RoutineTask[], projection: string, confidence: 'high' | 'medium' | 'low' }> => {
  const ai = getAI();
  
  
  const queueContext = queue.map(q => {
      const note = notes.find(n => n.id === q.noteId);
      return {
          title: note?.title || 'Unknown Note',
          priority: q.priority,
          estimatedMinutes: note?.aiAnalysis?.estimatedMinutes || 30,
          difficulty: note?.aiAnalysis?.difficulty || 'medium'
      };
  });

  const prompt = `
    Create a REALISTIC study routine.
    User Profile: ${prefs.freeTimeHours}h free, Peak Energy: ${prefs.energyPeak}, Distraction Level: ${prefs.distractionLevel}.
    
    Tasks to schedule: ${JSON.stringify(queueContext)}.
    
    Rules:
    1. Do NOT schedule back-to-back heavy tasks.
    2. Include "Procastify Breaks" (guilt-free 10-15m) after difficult blocks.
    3. Include "Chill Breaks" (5-8m) after lighter blocks.
    4. Leave a buffer at the end of the day.
    5. If total time exceeds free time, only schedule what is realistic and prioritize High priority items.
    
    Return JSON with tasks, a short text projection (e.g., "You'll likely finish Note A and B today"), and a confidence score.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        durationMinutes: { type: Type.NUMBER },
                        type: { type: Type.STRING, enum: ["focus", "break", "procastify", "buffer"] },
                        completed: { type: Type.BOOLEAN },
                        noteId: { type: Type.STRING, nullable: true },
                        confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
                    }
                }
            },
            projection: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["high", "medium", "low"] }
          }
        }
      }
    });

    if (!response || !response.text) throw new Error("Empty response");

    const fallback: { tasks: RoutineTask[], projection: string, confidence: 'high' | 'medium' | 'low' } = { 
        tasks: [], 
        projection: "Failed to parse routine.", 
        confidence: 'low' 
    };

    const data = safeJSONParse(response.text, fallback);
    
    
    if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks = data.tasks.map((t: any) => ({ ...t, id: Math.random().toString(36).substr(2, 9), completed: false }));
    } else {
        data.tasks = [];
    }
    return data;
  } catch (error) {
    console.error("Routine Gen Error", error);
    return {
        tasks: [],
        projection: "Could not generate routine. Try adding items to your queue.",
        confidence: 'low'
    };
  }
};




export const generateFlashcards = async (content: string): Promise<Flashcard[]> => {
  const ai = getAI();
  try {
   
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [
          { text: "Extract 5-8 key learning chunks, definitions, or core concepts from the content below.\nReturn JSON array with 'front' (The Concept/Term) and 'back' (The Definition/Explanation/Detail).\nDo NOT create questions. Create knowledge pairings that directly reflect the summary.\n\nCONTENT TO PROCESS:" },
          { text: content.substring(0, 15000) } // Truncate
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING, description: "The concept, term, or headline" },
              back: { type: Type.STRING, description: "The explanation, definition, or key fact" },
              status: { type: Type.STRING, enum: ['new'] }
            }
          }
        }
      }
    });
    
    if (!response || !response.text) return [];

    const cards = safeJSONParse(response.text, []);
    if (!Array.isArray(cards)) return [];

    return cards.map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9), status: 'new' }));
  } catch (error) {
    console.error("Flashcard error:", error);
    return [];
  }
};



export const generateSpeech = async (text: string): Promise<string | null> => {
  const ai = getAI();
  try {
    
    const safeText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};


export const generateSingleQuestion = async (
    notesContent: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    questionIndex: number = 0
): Promise<Question> => {
  const ai = getAI();
  const safeContent = notesContent.substring(0, 15000); // Match flashcard limit

  
  let conceptPrompt = "";
  if (difficulty === 'easy') {
    conceptPrompt = "Focus on basic definitions and direct recall. What is X? Which statement defines Y?";
  } else if (difficulty === 'hard') {
    conceptPrompt = "Focus on application and reasoning. How does X relate to Y? Which scenario demonstrates Z?";
  } else {
    conceptPrompt = "Focus on understanding and distinction. What best explains X? Which option correctly describes Y?";
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [
        { text: `Extract 1 key concept from the content below and create a focused multiple choice question about it.\n${conceptPrompt}\nReturn JSON with exactly 4 plausible options.\nDo NOT create trivia questions. Focus on core learning concepts.\n\nCONTENT TO PROCESS:` },
        { text: safeContent }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: "Clear, focused question about one concept" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "4 plausible options with similar wording"
            },
            correctIndex: { type: Type.INTEGER, description: "Index of correct answer (0-3)" },
            explanation: { type: Type.STRING, description: "Why the correct answer is right" }
          }
        }
      }
    });

    if (!response || !response.text) {
      throw new Error("Empty response from AI");
    }

    const data = safeJSONParse<any>(response.text, null);

    if (!data || !data.text || !Array.isArray(data.options) || data.options.length !== 4 || typeof data.correctIndex !== 'number') {
      throw new Error("Invalid question format from AI");
    }

    return {
      id: data.id || `q_${Date.now()}_${questionIndex}`,
      text: data.text,
      options: data.options,
      correctIndex: data.correctIndex,
      explanation: data.explanation || "No explanation provided"
    };
  } catch (error) {
    console.error("Single Question Gen Error:", error);
    throw error;
  }
};

export const generateQuizFromNotes = async (
    notesContent: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Question[]> => {
  const ai = getAI();
  
  
  const safeContent = notesContent.substring(0, 15000);

  
  let conceptPrompt = "";
  if (difficulty === 'easy') {
    conceptPrompt = "Focus on basic definitions and direct recall. Create questions like: 'What is X?' 'Which statement defines Y?'";
  } else if (difficulty === 'hard') {
    conceptPrompt = "Focus on application and reasoning. Create questions like: 'How does X relate to Y?' 'Which scenario demonstrates Z?'";
  } else {
    conceptPrompt = "Focus on understanding and distinction. Create questions like: 'What best explains X?' 'Which option correctly describes Y?'";
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: [
        { text: `Extract 5 key concepts from the content below and create focused multiple choice questions about them.\n${conceptPrompt}\nReturn JSON array with exactly 4 plausible options per question.\nDo NOT create trivia questions. Focus on core learning concepts.\n\nCONTENT TO PROCESS:` },
        { text: safeContent }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING, description: "Clear, focused question about one concept" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 plausible options with similar wording"
              },
              correctIndex: { type: Type.INTEGER, description: "Index of correct answer (0-3)" },
              explanation: { type: Type.STRING, description: "Why the correct answer is right" }
            }
          }
        }
      }
    });
    
    if (!response || !response.text) {
        console.warn("Quiz generation returned empty response.");
        return [];
    }

    const data = safeJSONParse<any[]>(response.text, []);
    
    
    if (Array.isArray(data)) {
        return data.filter(q => 
            q.text && 
            Array.isArray(q.options) && 
            q.options.length === 4 && 
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex < 4
        ).map((q, i) => ({
            ...q,
            id: q.id || `q_${Date.now()}_${i}`,
            explanation: q.explanation || "No explanation provided"
        }));
    }
    
    return [];
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return [];
  }
};


export const generateRoutine = async (prefs: UserPreferences): Promise<RoutineTask[]> => {
    return []; // Deprecated
};


export const generateQuiz = async (note: Note): Promise<Question[]> => {
  
  const textContent = note.elements
    .filter(el => el.type === 'text' && el.content)
    .map(el => el.content)
    .join('\n\n');
  
  if (!textContent.trim()) {
    throw new Error('No text content found in note to generate quiz from');
  }
  
  return generateQuizFromNotes(textContent, 'medium');
};


export const playAudioBlob = async (base64Audio: string) => {
    try {
        const audioStr = atob(base64Audio);
        const len = audioStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = audioStr.charCodeAt(i);
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    } catch (e) {
        console.error("Audio Playback Error", e);
    }
}
