import { NavLink } from 'react-router-dom';
import { navLinks } from './navLinks';

export default function BottomNav() {
  return (
    <nav className="dock dock-sm border-t border-base-300 bg-base-100 md:hidden">
      {navLinks.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            isActive ? 'dock-active text-primary' : ''
          }
        >
          <span className="text-xl leading-none">{l.icon}</span>
          <span className="dock-label">{l.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
