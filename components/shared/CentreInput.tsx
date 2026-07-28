'use client';

import React, { useMemo, useState } from 'react';
import { ALL_CENTRES, CENTRES } from '@/lib/constants';

interface CentreInputProps {
  value: string;
  onChange: (value: string) => void;
  zone?: string;
  className?: string;
  placeholder?: string;
}

export function CentreInput({ value, onChange, zone, className, placeholder = 'Type to search centres...' }: CentreInputProps) {
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const matches = (list: string[]) => list.filter((c) => !q || c.toLowerCase().includes(q));
    const zoneCentres = zone ? CENTRES[zone] || [] : [];
    const zoneMatches = matches(zoneCentres);
    const otherMatches = matches(ALL_CENTRES).filter((c) => !zoneCentres.includes(c));
    return [...zoneMatches, ...otherMatches].slice(0, 8);
  }, [value, zone]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(c); setOpen(false); }}
              className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
