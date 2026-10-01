import { useRef, useState, type ReactNode } from 'react';
import { suggestSuburbs } from './data/api';
import { MODE_LABEL } from './data/query';
import type { ListingMode } from './data/types';
import { CloseIcon, PinIcon, SearchIcon } from './Icons';
import './styles/Searchbar.css';

interface Props {
  mode: ListingMode;
  suburbs: string[];
  onSearch: (suburbs: string[], mode: ListingMode) => void;
  variant?: 'hero' | 'compact';
  showTabs?: boolean;
  children?: ReactNode;      // extra controls (e.g. Filters button) shown beside the input
}

export default function Searchbar({ mode, suburbs, onSearch, variant = 'compact', showTabs = false, children }: Props) {
  const [selected, setSelected] = useState<string[]>(suburbs);
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<ListingMode>(mode);
  const [highlight, setHighlight] = useState(0);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = suggestSuburbs(query, selected);

  const add = (name: string) => {
    const next = [...selected, name];
    setSelected(next);
    setQuery('');
    setHighlight(0);
    inputRef.current?.focus();
    if (variant === 'compact') onSearch(next, activeMode);
  };
  const remove = (name: string) => {
    const next = selected.filter(s => s !== name);
    setSelected(next);
    if (variant === 'compact') onSearch(next, activeMode);
  };
  const submit = () => {
    if (suggestions.length && query) { add(suggestions[highlight].name); if (variant === 'compact') return; }
    onSearch(query && suggestions.length ? [...selected, suggestions[highlight].name] : selected, activeMode);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    else if (e.key === 'Backspace' && !query && selected.length) remove(selected[selected.length - 1]);
    else if (e.key === 'Escape') setQuery('');
  };

  return (
    <div className={`searchbar searchbar--${variant}`}>
      {showTabs && (
        <div className="searchbar__tabs" role="tablist">
          {(Object.keys(MODE_LABEL) as ListingMode[]).map(m => (
            <button key={m} role="tab" aria-selected={activeMode === m} className={activeMode === m ? 'active' : ''}
              onClick={() => setActiveMode(m)}>{MODE_LABEL[m]}</button>
          ))}
        </div>
      )}
      <div className="searchbar__row">
        <div className={`searchbar__field${focused ? ' is-focused' : ''}`} onClick={() => inputRef.current?.focus()}>
          <SearchIcon className="searchbar__icon" />
          {selected.map(s => (
            <span className="chip" key={s}>{s}
              <button aria-label={`Remove ${s}`} onClick={e => { e.stopPropagation(); remove(s); }}><CloseIcon /></button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setHighlight(0); }}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={selected.length ? 'Add another suburb' : 'Search suburb or postcode'}
            aria-label="Search suburb or postcode"
            aria-autocomplete="list"
          />
          {focused && suggestions.length > 0 && (
            <ul className="searchbar__suggest" role="listbox">
              {suggestions.map((s, i) => (
                <li key={s.name} role="option" aria-selected={i === highlight} className={i === highlight ? 'active' : ''}
                  onMouseDown={e => { e.preventDefault(); add(s.name); }} onMouseEnter={() => setHighlight(i)}>
                  <PinIcon /> <span><strong>{s.name}</strong>, QLD {s.postcode}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {children}
        <button className="btn btn--primary searchbar__go" onClick={submit}>
          <SearchIcon /><span>Search</span>
        </button>
      </div>
    </div>
  );
}
