import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';
import { useSearchHistory } from '../../hooks/useSearchHistory';
import { MegaMenu } from '../MegaMenu';
import { SearchHistory } from './SearchHistory';

interface SearchBarProps {
  defaultQuery?: string;
}

export function SearchBar({ defaultQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const navigate = useNavigate();

  const { data, loading, error } = useSearch(query);
  const [history, saveQuery, clearHistory] = useSearchHistory();

  // Save query to history whenever a search returns results
  useEffect(() => {
    if (data && data.total > 0) saveQuery(query.trim());
  }, [data]);

  const showHistory = open && query.trim().length === 0 && history.length > 0;
  const showMenu    = open && query.trim().length >= 2;

  // Close when clicking outside the entire search widget (input + dropdown)
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'ArrowDown' && showMenu) {
      e.preventDefault();
      const menuEl = document.getElementById(`${id}-menu`);
      const firstCard = menuEl?.querySelector<HTMLElement>('[data-card]');
      firstCard?.focus();
    }
  };

  const handleReturnFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    inputRef.current?.focus();
  }, []);

  const handleViewAll = useCallback(() => {
    saveQuery(query.trim());
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }, [query, navigate, saveQuery]);

  const handleHistorySelect = useCallback((q: string) => {
    setQuery(q);
    setOpen(true);
  }, []);

  const handleClear = () => {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* Search input */}
      <div className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-2 transition-all duration-200 shadow-sm
        ${open && query.length >= 2
          ? 'border-indigo-300 shadow-indigo-100 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search products…"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
          aria-label="Search products"
          aria-expanded={showMenu}
          aria-autocomplete="list"
          aria-controls={showMenu ? `${id}-menu` : undefined}
        />

        {loading && (
          <svg className="w-4 h-4 text-indigo-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}

        {query && !loading && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
            className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <p className="absolute top-full mt-1 left-0 text-xs text-red-500 px-1">{error}</p>
      )}

      {showHistory && (
        <SearchHistory
          history={history}
          onSelect={handleHistorySelect}
          onClear={clearHistory}
        />
      )}

      {showMenu && (
        <MegaMenu
          id={`${id}-menu`}
          data={data ?? { query, total: 0, categories: [] }}
          query={query}
          loading={loading}
          onClose={handleClose}
          onViewAll={handleViewAll}
          onReturnFocus={handleReturnFocus}
        />
      )}
    </div>
  );
}
