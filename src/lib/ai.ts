import type { Message, Level, GrammarResult, WordInfo } from '../types';
import type { Lang } from '../i18n/translations';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ??
  'gemini-3.5-flash-lite';

type GeminiContent = { role: 'user' | 'model'; parts: { text: string }[] };

// ── Gemini ကို ခေါ်တဲ့ အခြေခံ function (အားလုံးက ဒီကနေတစ်ဆင့် သွားမယ်) ──
async function generate(
  system: string,
  contents: GeminiContent[],
  json = false,
): Promise<string> {
  if (!API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY in .env');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        ...(json
          ? { generationConfig: { responseMimeType: 'application/json' } }
          : {}),
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('');

  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ── Chat ──
const CHAT_PROMPTS: Record<Level, string> = {
  beginner:
    'You are a friendly English speaking partner for a Burmese beginner. ' +
    'Use very simple words and short sentences (max 2-3 sentences). ' +
    'Ask one easy question at the end to keep the conversation going. ' +
    'If the user made a grammar mistake, add one short correction at the end in this format: ' +
    "'Correction: <corrected sentence>'.",
  intermediate:
    'You are a friendly English conversation partner for an intermediate learner. ' +
    'Use natural everyday English and keep replies short (3-4 sentences). ' +
    'Ask a follow-up question. If the user made a mistake, ' +
    "add a brief note at the end in this format: 'Tip: <explanation>'.",
};

export async function askAI(
  messages: Message[],
  level: Level,
): Promise<string> {
  // Gemini က ပထမဆုံး message ကို user ဖြစ်ရမယ်
  const firstUser = messages.findIndex((m) => m.role === 'user');
  const history = firstUser === -1 ? [] : messages.slice(firstUser);

  return generate(
    CHAT_PROMPTS[level],
    history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  );
}

// ── Grammar Check ──
const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  my: 'Burmese (Myanmar language, written in Myanmar Unicode script)',
};

function parseJson(raw: string): unknown {
  // Model က တခါတလေ ```json ... ``` နဲ့ ထုတ်တတ်လို့ ဖယ်ပေးတာ
  return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

export async function checkGrammar(
  text: string,
  lang: Lang,
): Promise<GrammarResult> {
  const system =
    'You are a kind English grammar teacher for a Burmese learner. ' +
    "Check the user's English text. Respond with ONLY a JSON object, no markdown, " +
    'in exactly this shape: {"isCorrect": boolean, "corrected": string, ' +
    '"explanation": string, "mistakes": [{"wrong": string, "right": string, "reason": string}]}. ' +
    '"corrected" is the fixed version of the whole text (identical to the input if it is already correct). ' +
    '"mistakes" lists each error separately (empty array if none). ' +
    '"explanation" is a one or two sentence summary, and each "reason" explains one mistake simply. ' +
    `Write "explanation" and every "reason" in ${LANG_NAMES[lang]}. ` +
    'Keep "wrong", "right" and "corrected" in English.';

  const raw = await generate(
    system,
    [{ role: 'user', parts: [{ text }] }],
    true,
  );

  const p = parseJson(raw) as Partial<GrammarResult>;
  return {
    isCorrect: Boolean(p.isCorrect),
    corrected: String(p.corrected ?? text),
    explanation: String(p.explanation ?? ''),
    mistakes: Array.isArray(p.mistakes) ? p.mistakes : [],
  };
}

// ── Vocabulary ──
export async function explainWord(word: string, lang: Lang): Promise<WordInfo> {
  const system =
    'You are an English vocabulary teacher for a Burmese learner. ' +
    'Given an English word or short phrase, respond with ONLY a JSON object, no markdown, ' +
    'in exactly this shape: {"partOfSpeech": string, "meaning": string, "examples": [string, string]}. ' +
    '"partOfSpeech" is in English (for example: noun, verb, adjective, phrase). ' +
    `"meaning" is a short, simple meaning written in ${LANG_NAMES[lang]}. ` +
    '"examples" are exactly two short, simple English sentences that use the word.';

  const raw = await generate(
    system,
    [{ role: 'user', parts: [{ text: word }] }],
    true,
  );

  const p = parseJson(raw) as Partial<WordInfo>;
  return {
    partOfSpeech: String(p.partOfSpeech ?? ''),
    meaning: String(p.meaning ?? ''),
    examples: Array.isArray(p.examples)
      ? p.examples.map(String).slice(0, 3)
      : [],
  };
}
