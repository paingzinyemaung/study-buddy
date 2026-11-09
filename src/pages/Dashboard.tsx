import { Link } from 'react-router-dom';
import { useVocab } from '../hooks/useVocab';
import { useLang } from '../i18n/LanguageContext';
import { getStreak, getTodayCount } from '../lib/activity';
import { loadResults } from '../lib/quiz';
import { speak } from '../lib/speech';

const actions = [
  { to: '/chat', icon: '💬', key: 'chat', desc: 'chatDesc' },
  { to: '/grammar', icon: '✏️', key: 'grammar', desc: 'grammarDesc' },
  { to: '/vocab', icon: '📖', key: 'vocab', desc: 'vocabDesc' },
  { to: '/quiz', icon: '🎯', key: 'quiz', desc: 'quizDesc' },
] as const;

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-box bg-base-100 p-4 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <div className="mt-1 text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm opacity-70">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const { items } = useVocab();

  const streak = getStreak();
  const today = getTodayCount();
  const results = loadResults();
  const best = results.length
    ? Math.max(...results.map((r) => Math.round((r.score / r.total) * 100)))
    : null;

  return (
    <div className="space-y-5">
      <div className="rounded-box bg-primary p-5 text-primary-content shadow-sm">
        <h1 className="text-xl font-bold md:text-2xl">{t.dashboard.welcome}</h1>
        <p className="mt-1 opacity-90">{t.dashboard.tagline}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon="🔥"
          value={`${streak} ${t.dashboard.streakUnit}`}
          label={t.dashboard.streak}
        />
        <StatCard icon="📝" value={today} label={t.dashboard.today} />
        <StatCard icon="📖" value={items.length} label={t.dashboard.words} />
        <StatCard
          icon="🎯"
          value={best !== null ? `${best}%` : '-'}
          label={t.dashboard.best}
        />
      </div>

      <section>
        <h2 className="mb-2 font-semibold">{t.dashboard.quick}</h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-box bg-base-100 p-4 shadow-sm transition active:scale-95"
            >
              <div className="text-2xl">{a.icon}</div>
              <div className="mt-1 font-semibold">{t.nav[a.key]}</div>
              <div className="text-sm opacity-70">{t.dashboard[a.desc]}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">{t.dashboard.recent}</h2>
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm opacity-60">
            {t.dashboard.noWords}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-box bg-base-100 p-3 shadow-sm"
              >
                <div className="min-w-0">
                  <span className="font-bold text-primary">{item.word}</span>
                  {item.meaning && (
                    <span className="ml-2 text-sm opacity-80">
                      {item.meaning}
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-circle btn-sm"
                  onClick={() => speak(item.word)}
                  aria-label="Listen"
                >
                  🔊
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
