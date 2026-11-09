import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVocab } from '../hooks/useVocab';
import { useLang } from '../i18n/LanguageContext';
import { buildQuiz, canQuiz, loadResults, saveResult } from '../lib/quiz';
import { speak } from '../lib/speech';
import type { QuizQuestion } from '../types';
import { logActivity } from '../lib/activity';

type Phase = 'start' | 'playing' | 'done';

export default function Quiz() {
  const { t } = useLang();
  const { items } = useVocab();

  const [phase, setPhase] = useState<Phase>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const results = loadResults();
  const best = results.length
    ? Math.max(...results.map((r) => Math.round((r.score / r.total) * 100)))
    : null;

  function start() {
    setQuestions(buildQuiz(items));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setPhase('playing');
  }

  function handleSelect(option: string) {
    if (selected !== null) return; // တစ်ကြိမ်ရွေးပြီးရင် ထပ်မရွေးရ
    setSelected(option);
    if (option === questions[index].answer) setScore((s) => s + 1);
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      saveResult({ date: Date.now(), score, total: questions.length });
      logActivity();
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  // ── စတင်မျက်နှာ ──
  if (phase === 'start') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">{t.quiz.title}</h1>
          <p className="mt-1 text-sm opacity-70">{t.quiz.subtitle}</p>
        </div>

        <div className="rounded-box bg-base-100 p-6 text-center shadow-sm">
          <div className="text-5xl">🎯</div>
          {canQuiz(items) ? (
            <>
              {best !== null && (
                <p className="mt-3 text-sm opacity-70">
                  {t.quiz.best}: {best}%
                </p>
              )}
              <button
                className="btn btn-primary mt-4 h-12 w-full"
                onClick={start}
              >
                {t.quiz.start}
              </button>
            </>
          ) : (
            <>
              <p className="mt-3">{t.quiz.notEnough}</p>
              <Link to="/vocab" className="btn btn-primary mt-4 h-12 w-full">
                {t.quiz.goVocab}
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── ရလဒ်မျက်နှာ ──
  if (phase === 'done') {
    const percent = Math.round((score / questions.length) * 100);
    const message =
      percent >= 80
        ? t.quiz.greatMsg
        : percent >= 50
          ? t.quiz.goodMsg
          : t.quiz.tryMsg;
    const emoji = percent >= 80 ? '🏆' : percent >= 50 ? '👍' : '💪';

    return (
      <div className="space-y-4">
        <div className="rounded-box bg-base-100 p-6 text-center shadow-sm">
          <div className="text-5xl">{emoji}</div>
          <p className="mt-3 text-sm opacity-70">{t.quiz.result}</p>
          <p className="text-4xl font-bold text-primary">
            {score} / {questions.length}
          </p>
          <p className="mt-1 text-lg">{percent}%</p>
          <p className="mt-3">{message}</p>
          <button className="btn btn-primary mt-5 h-12 w-full" onClick={start}>
            {t.quiz.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  // ── မေးခွန်းမျက်နှာ ──
  const q = questions[index];

  function optionClass(option: string) {
    const base =
      'btn h-auto min-h-12 w-full justify-start whitespace-normal py-3 text-left text-base font-normal';
    if (selected === null) return `${base} btn-outline`;
    if (option === q.answer) return `${base} btn-success`;
    if (option === selected) return `${base} btn-error`;
    return `${base} btn-outline opacity-50`;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-sm opacity-70">
          <span>
            {t.quiz.question} {index + 1}/{questions.length}
          </span>
          <span>⭐ {score}</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={index + (selected !== null ? 1 : 0)}
          max={questions.length}
        />
      </div>

      <div className="rounded-box bg-base-100 p-5 shadow-sm">
        <p className="text-sm opacity-70">
          {q.kind === 'meaning' ? t.quiz.meaningPrompt : t.quiz.blankPrompt}
        </p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <p
            className={
              q.kind === 'meaning'
                ? 'text-3xl font-bold text-primary'
                : 'text-xl font-medium'
            }
          >
            {q.prompt}
          </p>
          {q.kind === 'meaning' && (
            <button
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => speak(q.prompt)}
              aria-label={t.quiz.listen}
            >
              🔊
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {q.options.map((option) => (
          <button
            key={option}
            className={optionClass(option)}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="space-y-3">
          <div
            role="alert"
            className={`alert ${selected === q.answer ? 'alert-success' : 'alert-error'}`}
          >
            <span>
              {selected === q.answer
                ? t.quiz.correct
                : `${t.quiz.wrong} ${q.answer}`}
            </span>
          </div>
          <button className="btn btn-primary h-12 w-full" onClick={handleNext}>
            {index + 1 >= questions.length ? t.quiz.finish : t.quiz.next}
          </button>
        </div>
      )}
    </div>
  );
}
