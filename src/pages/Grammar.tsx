import { useState } from 'react';
import { checkGrammar } from '../lib/ai';
import { useLang } from '../i18n/LanguageContext';
import type { GrammarResult } from '../types';

const MAX_LENGTH = 500;

export default function Grammar() {
  const { t, lang } = useLang();
  const [text, setText] = useState('');
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleCheck() {
    const input = text.trim();
    if (!input || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await checkGrammar(input, lang));
    } catch (e) {
      console.error(e);
      setError(t.grammar.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.corrected);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard မရတဲ့ browser/http ဆိုရင် ကျော်သွားမယ် */
    }
  }

  function handleClear() {
    setText('');
    setResult(null);
    setError('');
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">{t.grammar.title}</h1>
        <p className="mt-1 text-sm opacity-70">{t.grammar.subtitle}</p>
      </div>

      <div className="space-y-2">
        <textarea
          className="textarea min-h-32 w-full text-base"
          placeholder={t.grammar.placeholder}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <div className="flex items-center justify-between text-xs opacity-60">
          <span>
            {text.length}/{MAX_LENGTH}
          </span>
          {(text || result) && (
            <button className="btn btn-ghost btn-xs" onClick={handleClear}>
              {t.grammar.clear}
            </button>
          )}
        </div>
        <button
          className="btn btn-primary h-12 w-full"
          onClick={handleCheck}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              {t.grammar.checking}
            </>
          ) : (
            t.grammar.check
          )}
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <span
            className={`badge badge-lg ${
              result.isCorrect ? 'badge-success' : 'badge-warning'
            }`}
          >
            {result.isCorrect
              ? `✅ ${t.grammar.correct}`
              : `✏️ ${t.grammar.needsFix}`}
          </span>

          <div className="rounded-box bg-base-100 p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold opacity-70">
                {t.grammar.corrected}
              </h2>
              <button className="btn btn-ghost btn-xs" onClick={handleCopy}>
                {copied ? t.grammar.copied : t.grammar.copy}
              </button>
            </div>
            <p className="text-lg font-medium text-primary">
              {result.corrected}
            </p>
          </div>

          {result.explanation && (
            <div className="rounded-box bg-base-100 p-4 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold opacity-70">
                {t.grammar.explanation}
              </h2>
              <p className="text-base">{result.explanation}</p>
            </div>
          )}

          {result.mistakes.length > 0 && (
            <div className="rounded-box bg-base-100 p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold opacity-70">
                {t.grammar.mistakes}
              </h2>
              <ul className="space-y-2">
                {result.mistakes.map((m, i) => (
                  <li key={i} className="rounded-field bg-base-200 p-3">
                    <p className="text-base">
                      <span className="text-error line-through">{m.wrong}</span>
                      <span className="mx-2" aria-hidden>
                        →
                      </span>
                      <span className="font-semibold text-primary">
                        {m.right}
                      </span>
                    </p>
                    <p className="mt-1 text-sm opacity-80">{m.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
