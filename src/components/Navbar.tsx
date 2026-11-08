import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/chat', label: 'Chat' },
  { to: '/grammar', label: 'Grammar' },
  { to: '/vocab', label: 'Vocab' },
  { to: '/quiz', label: 'Quiz' },
];

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <span className="text-xl font-bold px-4">📚 Study Buddy</span>
      </div>
      <ul className="menu menu-horizontal px-1">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'menu-active' : '')}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
