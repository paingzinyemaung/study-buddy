import { useEffect, useState } from 'react';
import type { VocabItem } from '../types';
import { loadJSON, saveJSON } from '../lib/storage';
import { uid } from '../lib/id';

const KEY = 'vocab';

export function useVocab() {
  const [items, setItems] = useState<VocabItem[]>(() =>
    loadJSON<VocabItem[]>(KEY, []),
  );

  useEffect(() => {
    saveJSON(KEY, items);
  }, [items]);

  const add = (item: Omit<VocabItem, 'id' | 'createdAt'>) =>
    setItems((prev) => [
      { ...item, id: uid(), createdAt: Date.now() },
      ...prev,
    ]);

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  return { items, add, remove };
}
