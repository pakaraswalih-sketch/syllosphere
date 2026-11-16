import { GoogleGenAI, Type, Chat, GenerateContentResponse, ThinkingLevel } from "@google/genai";
import { QuizQuestion, LessonContent } from "../types";

const MODEL_NAME = 'gemini-3-flash-preview';

// Simple in-memory cache to prevent redundant slow API calls
const lessonCache: Record<string, LessonContent> = {};
const quizCache: Record<string, QuizQuestion[]> = {};
const visualCache: Record<string, string> = {};

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY.');
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLessonContent = async (topic: string, description: string): Promise<LessonContent> => {
    const cacheKey = `lesson-${topic}`;
    if (lessonCache[cacheKey]) return lessonCache[cacheKey];

    const ai = getAIClient();
    const prompt = `Topic: ${topic}. 
    Instruction: Based on "Tasrih al-Mantiq", write a concise lesson (max 300 words).
    Structure:
    - History (1 para)
    - Key Concept (1 para)
    - 2 Examples.
    Use <h3 class="text-gold-400 font-serif mt-4 mb-2 uppercase text-sm tracking-widest"> for headers.
    Return JSON: {htmlContent: string, summary: string}`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        htmlContent: { type: Type.STRING },
                        summary: { type: Type.STRING }
                    },
                    required: ["htmlContent", "summary"]
                }
            }
        });
        
        const text = response.text?.trim();
        if (!text) throw new Error("Empty response from AI");
        
        const result = JSON.parse(text) as LessonContent;
        lessonCache[cacheKey] = result;
        return result;
    } catch (error) {
        console.error("Lesson generation failed:", error);
        throw error;
    }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
    if (quizCache[topic]) return quizCache[topic];

    const ai = getAIClient();
    const prompt = `Create 3 simple MCQs for Logic: "${topic}". JSON array format. Short questions, 4 options each.`;
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.INTEGER },
                            explanation: { type: Type.STRING }
                        },
                        required: ["question", "options", "correctAnswer", "explanation"]
                    }
                }
            }
        });
        const result = JSON.parse(response.text || "[]") as QuizQuestion[];
        quizCache[topic] = result;
        return result;
    } catch (error) {
        console.error("Quiz generation failed:", error);
        throw error;
    }
};

export const generateVisualConcept = async (topic: string): Promise<string> => {
    if (visualCache[topic]) return visualCache[topic];

    const ai = getAIClient();
    const prompt = `Generate a very simple SVG diagram for "${topic}". Path color #fbbf24. No text labels inside SVG. Just geometric representation. Raw SVG only.`;
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
        });
        const cleaned = (response.text || "").replace(/```svg|```xml|```/g, '').trim();
        if (cleaned.toLowerCase().includes('<svg')) {
            const svgMatch = cleaned.match(/<svg[\s\S]*<\/svg>/i);
            const finalSvg = svgMatch ? svgMatch[0] : cleaned;
            visualCache[topic] = finalSvg;
            return finalSvg;
        }
        return "<div class='text-slate-600'>Visual schematic unavailable</div>";
    } catch (error) {
        console.error("Visual generation failed:", error);
        return "";
    }
};

export const generatePuzzle = async (topic: string, difficulty: string): Promise<any> => {
    const ai = getAIClient();
    const prompt = `Topic: ${topic}, Difficulty: ${difficulty}.
    Create a logic puzzle based on "Tasrih al-Mantiq".
    Return JSON: { question: string, options: string[], correctAnswer: string, explanation: string }`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer", "explanation"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Puzzle generation failed:", error);
        throw error;
    }
};

export const getLogicExplanation = async (query: string): Promise<string> => {
    const ai = getAIClient();
    const prompt = `User Query: ${query}. 
    Instruction: Explain this logic concept based on "Tasrih al-Mantiq" in under 100 words. Use simple terms.`;
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
        });
        return response.text || "I am unable to process this inquiry at the moment.";
    } catch (error) {
        console.error("Explanation failed:", error);
        return "The Sage is currently deep in meditation. Please try again soon.";
    }
};

export class ChatService {
    private chat: Chat;
    constructor() {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        this.chat = ai.chats.create({
            model: MODEL_NAME,
            config: {
                systemInstruction: "You are the 'SylloSphere Tutor'. Expert in 'Tasrih al-Mantiq'. Keep answers under 50 words. Be fast.",
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
            }
        });
    }
    async sendMessageStream(message: string, onChunk: (text: string) => void) {
        try {
            const result = await this.chat.sendMessageStream({ message });
            let fullText = "";
            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                if (c.text) {
                    fullText += c.text;
                    onChunk(fullText);
                }
            }
            return fullText;
        } catch (e) {
            onChunk("Connection interrupted. Re-establishing...");
            return "Error";
        }
    }
}
