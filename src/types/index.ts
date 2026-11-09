export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type Level = 'beginner' | 'intermediate';

export type GrammarMistake = {
  wrong: string;
  right: string;
  reason: string;
};

export type GrammarResult = {
  isCorrect: boolean;
  corrected: string;
  explanation: string;
  mistakes: GrammarMistake[];
};

export type WordInfo = {
  partOfSpeech: string;
  meaning: string;
  examples: string[];
};

export type VocabItem = WordInfo & {
  id: string;
  word: string;
  createdAt: number;
};
