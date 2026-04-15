import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { SearchSuggestion } from '@/lib/searchEngine';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export default function SearchAutocomplete({ onSearch, initialValue = '' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (data.suggestions) {
            setSuggestions(data.suggestions);
            setIsOpen(true);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onSearch(query.trim());
    }
  };

  const handleSelect = (text: string) => {
    setQuery(text);
    setIsOpen(false);
    onSearch(text);
  };

  return (
    <div ref={wrapperRef} className="relative flex-grow">
      <form onSubmit={handleSubmit} className="flex gap-4 w-full">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
            placeholder="Search by generic (e.g., Paracetamol) or brand (e.g., Dolo)..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-india-green focus:border-india-green sm:text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="bg-india-green hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shrink-0"
        >
          Search
        </button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full translate-x-0 translate-y-0 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(s.text)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 border-b border-gray-100 hover:bg-green-50 hover:text-green-900 transition-colors"
            >
              <div className="flex justify-between">
                <span className="font-medium truncate">{s.text}</span>
                <span className="text-xs text-gray-400 font-normal">
                  {s.source === 'PMBJP' ? 'Generic (PMBJP)' : 'Brand Name'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
