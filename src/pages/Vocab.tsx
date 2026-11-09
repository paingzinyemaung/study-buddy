import { useState, type FormEvent } from 'react';
import { explainWord } from '../lib/ai';
import { speak } from '../lib/speech';
import { useVocab } from '../hooks/useVocab';
import { useLang } from '../i18n/LanguageContext';

type Notice = { type: 'info' | 'warning'; text: string };

export default function Vocab() {
  const { t, lang } = useLang();
  const { items, add, remove } = useVocab();
  const [word, setWord] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const w = word.trim();
    if (!w || loading) return;

    if (items.some((i) => i.word.toLowerCase() === w.toLowerCase())) {
      setNotice({ type: 'warning', text: t.vocab.exists });
      return;
    }

    setLoading(true);
    setNotice(null);
    try {
      const info = await explainWord(w, lang);
      add({ word: w, ...info });
    } catch (err) {
      console.error(err);
      add({ word: w, partOfSpeech: '', meaning: '', examples: [] });
      setNotice({ type: 'info', text: t.vocab.savedWithoutAI });
    } finally {
      setLoading(false);
      setWord('');
    }
  }

  function handleDelete(id: string) {
    if (confirm(t.vocab.confirmDelete)) remove(id);
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (i) =>
          i.word.toLowerCase().includes(q) ||
          i.meaning.toLowerCase().includes(q),
      )
    : items;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">{t.vocab.title}</h1>
        <p className="mt-1 text-sm opacity-70">{t.vocab.subtitle}</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className="input h-12 w-full flex-1 text-base"
          placeholder={t.vocab.placeholder}
          value={word}
          maxLength={60}
          onChange={(e) => setWord(e.target.value)}
          disabled={loading}
          autoCapitalize="none"
          enterKeyHint="done"
        />
        <button
          type="submit"
          className="btn btn-primary h-12"
          disabled={loading || !word.trim()}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            t.vocab.add
          )}
        </button>
      </form>

      {notice && (
        <div
          role="alert"
          className={`alert ${notice.type === 'warning' ? 'alert-warning' : 'alert-info'}`}
        >
          <span>{notice.text}</span>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            className="input input-sm h-10 flex-1 text-base"
            placeholder={t.vocab.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="shrink-0 text-sm opacity-70">
            {items.length} {t.vocab.count}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-10 text-center opacity-60">{t.vocab.empty}</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center opacity-60">{t.vocab.noResults}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => (
            <li key={item.id} className="rounded-box bg-base-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {item.word}
                  </span>
                  {item.partOfSpeech && (
                    <span className="badge badge-outline badge-sm">
                      {item.partOfSpeech}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => speak(item.word)}
                    aria-label={t.vocab.listen}
                  >
                    🔊
                  </button>
                  <button
                    className="btn btn-ghost btn-circle btn-sm"
                    onClick={() => handleDelete(item.id)}
                    aria-label={t.vocab.delete}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {item.meaning && <p className="mt-1 text-base">{item.meaning}</p>}

              {item.examples.length > 0 && (
                <ul className="mt-2 space-y-1 border-l-2 border-primary/30 pl-3 text-sm opacity-80">
                  {item.examples.map((ex, i) => (
                    <li key={i}>
                      <button
                        className="text-left"
                        onClick={() => speak(ex)}
                        aria-label={t.vocab.listen}
                      >
                        🔊 {ex}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
