import { NavLink } from 'react-router-dom';
import { navLinks } from './navLinks';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="navbar mx-auto max-w-3xl px-4">
        <div className="flex-1">
          <span className="text-lg font-bold text-primary">📚 Study Buddy</span>
        </div>

        {/* Desktop only */}
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
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
