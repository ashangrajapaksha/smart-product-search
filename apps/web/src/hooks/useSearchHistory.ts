import { useCallback, useState } from 'react';

const STORAGE_KEY = 'search_history';
const MAX_ITEMS = 5;

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useSearchHistory(): [string[], (q: string) => void, () => void] {
  const [history, setHistory] = useState<string[]>(readHistory);

  const saveQuery = useCallback((q: string) => {
    if (!q.trim()) return;
    setHistory((prev) => {
      const deduped = prev.filter((item) => item !== q);
      const updated = [q, ...deduped].slice(0, MAX_ITEMS);
      writeHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return [history, saveQuery, clearHistory];
}
