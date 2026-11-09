import type { VocabItem, QuizQuestion, QuizResult } from '../types';
import { uid } from './id';
import { loadJSON, saveJSON } from './storage';

export const MIN_WORDS = 3;
const RESULTS_KEY = 'quizResults';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function canQuiz(items: VocabItem[]) {
  return items.filter((i) => i.meaning).length >= MIN_WORDS;
}

export function buildQuiz(items: VocabItem[], count = 10): QuizQuestion[] {
  const usable = items.filter((i) => i.meaning);
  if (usable.length < MIN_WORDS) return [];

  return shuffle(usable)
    .slice(0, count)
    .map((item): QuizQuestion => {
      const others = shuffle(usable.filter((i) => i.id !== item.id));

      // ဥပမာဝါကျထဲမှာ စကားလုံးအတိအကျပါရင် blank မေးခွန်းလုပ်လို့ရတယ်
      const regex = new RegExp(`\\b${escapeRegExp(item.word)}\\b`, 'i');
      const sentence = item.examples.find((ex) => regex.test(ex));

      if (sentence && Math.random() < 0.5) {
        const wrong = others.slice(0, 3).map((i) => i.word);
        return {
          id: uid(),
          kind: 'blank',
          prompt: sentence.replace(regex, '_____'),
          options: shuffle(Array.from(new Set([item.word, ...wrong]))),
          answer: item.word,
          wordId: item.id,
        };
      }

      const wrong = others.slice(0, 3).map((i) => i.meaning);
      return {
        id: uid(),
        kind: 'meaning',
        prompt: item.word,
        options: shuffle(Array.from(new Set([item.meaning, ...wrong]))),
        answer: item.meaning,
        wordId: item.id,
      };
    });
}

export function loadResults(): QuizResult[] {
  return loadJSON<QuizResult[]>(RESULTS_KEY, []);
}

export function saveResult(result: QuizResult) {
  saveJSON(RESULTS_KEY, [...loadResults(), result].slice(-30));
}
