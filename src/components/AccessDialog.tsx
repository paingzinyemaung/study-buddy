import { useEffect, useState, type FormEvent } from 'react';
import { ACCESS_EVENT, setAccessCode } from '../lib/access';
import { useLang } from '../i18n/LanguageContext';

export default function AccessDialog() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');

  useEffect(() => {
    const onRequired = () => setOpen(true);
    window.addEventListener(ACCESS_EVENT, onRequired);
    return () => window.removeEventListener(ACCESS_EVENT, onRequired);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setAccessCode(code);
    setCode('');
    setOpen(false);
  }

  return (
    <div
      className={`modal ${open ? 'modal-open' : ''}`}
      role="dialog"
      aria-modal="true"
    >
      <form className="modal-box" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold">{t.access.title}</h3>
        <p className="py-2 text-sm opacity-80">{t.access.desc}</p>
        <input
          className="input h-12 w-full text-base"
          placeholder={t.access.placeholder}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
        />
        <p className="mt-2 text-xs opacity-60">{t.access.retry}</p>
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setOpen(false)}
          >
            {t.access.cancel}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!code.trim()}
          >
            {t.access.save}
          </button>
        </div>
      </form>
    </div>
  );
}
