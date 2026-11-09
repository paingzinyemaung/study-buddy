import type { Message, Level } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
// console.log('env keys:', Object.keys(import.meta.env));
const MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ??
  'gemini-3.5-flash-lite';

const SYSTEM_PROMPTS: Record<Level, string> = {
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
  if (!API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY in .env');

  // Gemini ကို ပထမဆုံး message က user ဖြစ်ရမယ်၊
  // ဒါကြောင့် အစက assistant greeting ကို ချန်ထားမယ်
  const firstUser = messages.findIndex((m) => m.role === 'user');
  const history = firstUser === -1 ? [] : messages.slice(firstUser);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPTS[level] }] },
        contents: history.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
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
