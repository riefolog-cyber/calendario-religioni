import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, effectiveTheme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-colors shadow-inner",
        className
      )}
      role="radiogroup"
      aria-label="Seleziona tema"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200",
          theme === 'light'
            ? "bg-white text-amber-500 shadow-sm ring-1 ring-slate-200 dark:ring-transparent scale-105"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        )}
        title="Tema chiaro"
        aria-label="Attiva tema chiaro"
      >
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200",
          theme === 'dark'
            ? "bg-slate-900 text-indigo-400 shadow-sm ring-1 ring-slate-700 scale-105"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        )}
        title="Tema scuro"
        aria-label="Attiva tema scuro"
      >
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200",
          theme === 'system'
            ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm scale-105"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        )}
        title={`Tema di sistema (ora ${effectiveTheme === 'dark' ? 'scuro' : 'chiaro'})`}
        aria-label="Segui tema di sistema"
      >
        <Laptop className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
