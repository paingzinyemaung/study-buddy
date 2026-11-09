import { useLang } from '../i18n/LanguageContext';

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => setLang(lang === 'en' ? 'my' : 'en')}
      aria-label="Change language"
    >
      {lang === 'en' ? 'မြန်မာ' : 'EN'}
    </button>
  );
}
