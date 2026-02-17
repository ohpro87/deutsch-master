
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Topic, Question, VocabPair, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExercises = async (topic: Topic): Promise<Question[]> => {
  const prompt = `
    Generate 5 high-quality B1 German exercises for Hebrew speakers on the topic: "${topic}".
    
    SPECIAL RULES FOR TOPICS:
    - If topic is "Focus: ihr (Plural)": Every single sentence MUST use "ihr" as the subject. Focus on verb conjugations (e.g., lernt, seid, habt), possessives (euer/eure), and imperative form for ihr.
    - If topic is "Pronoun Cases (er/sie/es)": Focus on the changes of personal and possessive pronouns for 3rd person singular (er/sie/es) across Nominativ, Akkusativ, and Dativ. Use cases like "ihn", "ihm", "ihr", "ihre", "seiner", etc.
    - If topic is "Verbs with Prepositions": Focus on verbs like "träumen von", "warten auf", "denken an", "sich freuen auf/über". Include the correct case (Akkusativ or Dativ) that the preposition requires.
    - If topic is "Reflexive Verbs": Focus on sich/mich/dich and Akkusativ vs Dativ reflexive pronouns.
    
    Return ONLY a JSON array of objects:
    - sentence: array of {word: string, translation: string}. Use '____' for the blank.
    - fullTranslation: string (Hebrew)
    - options: array of 4 strings (German)
    - correctAnswer: string
    - explanation: string (Detailed Hebrew grammar rule explaining why this is the correct answer)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sentence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    translation: { type: Type.STRING }
                  },
                  required: ["word", "translation"]
                }
              },
              fullTranslation: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["sentence", "fullTranslation", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    let data = JSON.parse(response.text || '[]');
    if (!Array.isArray(data)) data = (data as any).questions || [];
    return data.map((item: any, idx: number) => ({
      ...item,
      id: `q-${idx}-${Date.now()}`,
      sentence: Array.isArray(item.sentence) ? item.sentence : [],
      options: Array.isArray(item.options) ? item.options : []
    }));
  } catch (error) {
    console.error("Failed to generate exercises:", error);
    return [];
  }
};

export const createFreeChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `You are a helpful German B1 teacher. 
      When the user writes something in German:
      1. Respond naturally in German to keep the conversation going.
      2. Analyze their German for grammar errors and context appropriateness.
      3. Return a JSON object with:
         - reply: Your response in German.
         - feedback: { isCorrect: boolean, grammarCorrection: string (null if correct), contextRating: string (Hebrew description), explanation: string (Hebrew explanation) }
      
      Always provide feedback in Hebrew. Keep your 'reply' friendly and relevant to B1 level.`
    }
  });
};

export const processChatMessage = async (chat: Chat, message: string): Promise<ChatMessage> => {
  const result = await chat.sendMessage({ message });
  try {
    const data = JSON.parse(result.text || '{}');
    return {
      role: 'model',
      text: data.reply || "Ich verstehe nicht ganz, kannst du das nochmal sagen?",
      feedback: data.feedback
    };
  } catch (e) {
    return {
      role: 'model',
      text: result.text || "Entschuldigung, ich habe einen Fehler gemacht."
    };
  }
};

export const generateConversationScenario = async (): Promise<any[]> => {
  const scenarios = ["At a Restaurant", "Meeting a new friend", "Booking a hotel", "Doctor's appointment"];
  const chosen = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  const prompt = `Create an interactive 5-turn German conversation scenario for B1 level: "${chosen}".
  Return a JSON array of steps. Each step has:
  - aiPrompt: German string
  - type: 'multiple_choice' or 'fill_gap'
  - if 'multiple_choice': provide 'options' (array of 4) and 'correctAnswer'
  - if 'fill_gap': provide 'sentence' (with ____) and 'correctAnswer' (one word)
  - explanation: Hebrew grammar/context tip.
  - translation: Hebrew translation of AI prompt.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });

  return JSON.parse(response.text || '[]');
};

export const generateVocab = async (): Promise<VocabPair[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "8 B1 German vocabulary pairs (german, hebrew) with a simple German example sentence.",
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              german: { type: Type.STRING },
              hebrew: { type: Type.STRING },
              example: { type: Type.STRING }
            },
            required: ["german", "hebrew"]
          }
        }
      }
    });

    let data = JSON.parse(response.text || '[]');
    if (!Array.isArray(data)) data = (data as any).vocab || [];
    return data;
  } catch (error) {
    return [];
  }
};

export const speakText = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly in German: ${text}` }] }],
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
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const bufferLen = bytes.length - (bytes.length % 2);
      const dataInt16 = new Int16Array(bytes.buffer, 0, bufferLen / 2);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (e) {}
};
