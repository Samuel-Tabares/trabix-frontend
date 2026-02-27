'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: SearchInputProps) {
  const [internal, setInternal] = useState(value);

  // Sync si el padre limpia el valor externamente
  useEffect(() => {
    setInternal(value);
  }, [value]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={internal}
        onChange={(e) => setInternal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onChange(internal);
        }}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {internal && (
        <button
          type="button"
          onClick={() => {
            setInternal('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
