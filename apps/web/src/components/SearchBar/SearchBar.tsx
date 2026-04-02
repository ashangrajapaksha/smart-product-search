import { useState, useRef, useCallback, useId } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { MegaMenu } from '../MegaMenu';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const { data, loading, error } = useSearch(query);

  const showMenu = open && query.trim().length >= 2 && (loading || data !== null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClose = useCallback(() => setOpen(false), []);

  const handleClear = () => {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search input */}
      <div className={`flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border-2 transition-all duration-200 shadow-sm
        ${open && query.length >= 2
          ? 'border-indigo-300 shadow-indigo-100 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Search icon */}
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          ref={inputRef}
          id={id}
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search products… try 'wirelss', 'samsng', or 'headphones'"
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

        {/* Loading spinner */}
        {loading && (
          <svg className="w-4 h-4 text-indigo-400 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}

        {/* Clear button */}
        {query && !loading && (
          <button
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

      {/* Error state */}
      {error && (
        <p className="absolute top-full mt-1 left-0 text-xs text-red-500 px-1">{error}</p>
      )}

      {/* Mega menu */}
      {showMenu && data && (
        <MegaMenu
          id={`${id}-menu`}
          data={data}
          query={query}
          loading={loading}
          onClose={handleClose}
        />
      )}
      {showMenu && !data && loading && (
        <MegaMenu
          id={`${id}-menu`}
          data={{ query, total: 0, categories: [] }}
          query={query}
          loading={true}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
