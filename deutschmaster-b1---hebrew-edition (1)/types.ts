
export enum Topic {
  MODAL_VERBS = 'Modal Verbs',
  CONJUNCTIONS = 'Conjunctions',
  PARTIZIP_2 = 'Partizip 2',
  REFLEXIVE = 'Reflexive Verbs',
  LASSEN = 'Lassen Constructions',
  PREPOSITIONS = 'Verbs with Prepositions',
  IHR_SPECIAL = 'Focus: ihr (Plural)',
  PRONOUN_CASES = 'Pronoun Cases (er/sie/es)',
  VOCABULARY = 'Vocabulary',
  CONVERSATION = 'Guided Conversation',
  FREE_CHAT = 'Advanced AI Chat'
}

export interface WordToken {
  word: string;
  translation: string;
}

export interface Question {
  id: string;
  sentence: WordToken[];
  fullTranslation: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface VocabPair {
  german: string;
  hebrew: string;
  example?: string;
}

export interface UserStats {
  points: number;
  streak: number;
  completedExercises: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  feedback?: {
    isCorrect: boolean;
    grammarCorrection?: string;
    contextRating: string; // e.g. "Perfect", "A bit formal", "Incorrect context"
    explanation: string;
  };
}
