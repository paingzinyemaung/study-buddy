import { NavLink } from 'react-router-dom';
import { navLinks } from './navLinks';
import { useLang } from '../i18n/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LangToggle from './LangToggle';

export default function Navbar() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="navbar mx-auto max-w-3xl gap-1 px-4">
        <div className="flex-1">
          <span className="text-lg font-bold text-primary">📚 Study Buddy</span>
        </div>

        <nav className="hidden md:block">
          <ul className="menu menu-horizontal gap-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    isActive ? 'menu-active text-primary' : ''
                  }
                >
                  {t.nav[l.key]}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
