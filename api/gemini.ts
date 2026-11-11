import type { VercelRequest, VercelResponse } from '@vercel/node';

type Part = { text: string };
type Content = { role: 'user' | 'model'; parts: Part[] };
type Result = { ok: true; text: string } | { ok: false; status: number };

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
const OPENROUTER_MODELS = (process.env.OPENROUTER_MODELS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .slice(0, 3);

// ကန့်သတ်ချက်များ
const MAX_SYSTEM_CHARS = 3000;
const MAX_TOTAL_CHARS = 8000;
const MAX_TURNS = 40;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;

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

// ── Provider ၁: Gemini ──
async function callGemini(
  apiKey: string,
  system: string,
  turns: Content[],
  json: boolean,
): Promise<Result> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns,
          ...(json
            ? { generationConfig: { responseMimeType: 'application/json' } }
            : {}),
        }),
      },
    );

    if (!res.ok) {
      console.error('Gemini error', res.status, await res.text());
      return { ok: false, status: res.status };
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ??
      '';
    return text ? { ok: true, text } : { ok: false, status: 502 };
  } catch (err) {
    console.error('Gemini fetch failed', err);
    return { ok: false, status: 502 };
  }
}

// ── Provider ၂: OpenRouter (အရန်) ──
async function callOpenRouter(
  apiKey: string,
  system: string,
  turns: Content[],
): Promise<Result> {
  try {
    const messages = [
      { role: 'system', content: system },
      ...turns.map((c) => ({
        role: c.role === 'model' ? 'assistant' : 'user',
        content: c.parts.map((p) => p.text).join(''),
      })),
    ];

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ models: OPENROUTER_MODELS, messages }),
    });

    if (!res.ok) {
      console.error('OpenRouter error', res.status, await res.text());
      return { ok: false, status: res.status };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content ?? '';
    return text ? { ok: true, text } : { ok: false, status: 502 };
  } catch (err) {
    console.error('OpenRouter fetch failed', err);
    return { ok: false, status: 502 };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!geminiKey && !openRouterKey) {
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

  let provider: 'gemini' | 'openrouter' = 'gemini';
  let result: Result = geminiKey
    ? await callGemini(geminiKey, system, turns, json === true)
    : { ok: false, status: 500 };

  // Gemini ပျက်ရင် OpenRouter ကို ကူးခေါ်မယ်
  if (!result.ok && openRouterKey && OPENROUTER_MODELS.length > 0) {
    console.warn('Falling back to OpenRouter, Gemini status:', result.status);
    provider = 'openrouter';
    result = await callOpenRouter(openRouterKey, system, turns);
  }

  if (result.ok) {
    return res.status(200).json({ text: result.text, provider });
  }

  const status = result.status === 429 ? 429 : 502;
  return res.status(status).json({
    error:
      status === 429
        ? 'AI limit reached, try again later'
        : 'AI request failed',
  });
}
