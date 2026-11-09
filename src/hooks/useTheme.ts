import { useEffect, useState } from 'react';

export type Theme = 'studybuddy' | 'studybuddy-dark';

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved === 'studybuddy' || saved === 'studybuddy-dark') return saved;
  return matchMedia('(prefers-color-scheme: dark)').matches
    ? 'studybuddy-dark'
    : 'studybuddy';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () =>
    setTheme((t) => (t === 'studybuddy' ? 'studybuddy-dark' : 'studybuddy'));

  return { theme, toggle };
}
