import type { VercelRequest, VercelResponse } from '@vercel/node';

type Part = { text: string };
type Content = { role: 'user' | 'model'; parts: Part[] };

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';

// ကန့်သတ်ချက်များ (လူတိုင်း မသုံးစားနိုင်အောင်)
const MAX_SYSTEM_CHARS = 3000;
const MAX_TOTAL_CHARS = 8000;
const MAX_TURNS = 40;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20; // IP တစ်ခုကို တစ်မိနစ် ၂၀ ကြိမ်

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

function isContent(c: unknown): c is Content {
  if (typeof c !== 'object' || c === null) return false;
  const { role, parts } = c as Record<string, unknown>;
  return (
    (role === 'user' || role === 'model') &&
    Array.isArray(parts) &&
    parts.length > 0 &&
    parts.every((p) => typeof (p as Part | null)?.text === 'string')
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is not configured' });
  }

  const ip = String(req.headers['x-forwarded-for'] ?? 'unknown')
    .split(',')[0]
    .trim();
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ error: 'Too many requests, please slow down' });
  }

  const { system, contents, json } = (req.body ?? {}) as {
    system?: unknown;
    contents?: unknown;
    json?: unknown;
  };

  if (
    typeof system !== 'string' ||
    system.length > MAX_SYSTEM_CHARS ||
    !Array.isArray(contents) ||
    contents.length === 0 ||
    contents.length > MAX_TURNS ||
    !contents.every(isContent)
  ) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const turns = contents as Content[];
  const total =
    system.length +
    turns.reduce(
      (n, c) => n + c.parts.reduce((m, p) => m + p.text.length, 0),
      0,
    );
  if (total > MAX_TOTAL_CHARS) {
    return res.status(413).json({ error: 'Request too large' });
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns,
          ...(json === true
            ? { generationConfig: { responseMimeType: 'application/json' } }
            : {}),
        }),
      },
    );

    if (!upstream.ok) {
      // အသေးစိတ်ကို server log မှာပဲထား၊ user ကို မပြဘူး
      console.error('Gemini error', upstream.status, await upstream.text());
      const status = upstream.status === 429 ? 429 : 502;
      return res.status(status).json({
        error:
          status === 429
            ? 'AI limit reached, try again later'
            : 'AI request failed',
      });
    }

    const data = await upstream.json();
    const text: string =
      data.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ?? '';

    if (!text) return res.status(502).json({ error: 'Empty AI response' });
    return res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
