/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Filter,
  Info,
  BookOpen,
  Sparkles,
  Search,
  CheckCheck,
  RotateCcw,
  Compass,
  ArrowRight,
  Sun
} from 'lucide-react';
import { Calendar } from './components/Calendar';
import { HolidayModal } from './components/HolidayModal';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import {
  HOLIDAYS_2026,
  Holiday,
  Religion,
  RELIGIONS,
  RELIGION_COLORS,
  RELIGION_BORDER_COLORS,
  RELIGION_HEX_COLORS,
  RELIGION_EMOJIS
} from './data/holidays';
import { cn } from './lib/utils';
import { parseISO, isSameDay, format } from 'date-fns';
import { it } from 'date-fns/locale';

function MainApp() {
  const [selectedReligions, setSelectedReligions] = useState<Set<Religion>>(new Set(RELIGIONS));
  const [selectedDayData, setSelectedDayData] = useState<{ date: Date; holidays: Holiday[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleReligion = (religion: Religion) => {
    const newSelected = new Set(selectedReligions);
    if (newSelected.has(religion)) {
      newSelected.delete(religion);
    } else {
      newSelected.add(religion);
    }
    setSelectedReligions(newSelected);
  };

  const selectAll = () => setSelectedReligions(new Set(RELIGIONS));
  const clearAll = () => setSelectedReligions(new Set());

  // Count holidays per religion
  const holidayCounts = useMemo(() => {
    const counts: Record<Religion, number> = {
      Cristianesimo: 0,
      Ebraismo: 0,
      Islam: 0,
      Induismo: 0,
      Buddhismo: 0,
      Sikhismo: 0,
      Taoismo: 0,
      Shintoismo: 0,
    };
    HOLIDAYS_2026.forEach((h) => {
      counts[h.religion] = (counts[h.religion] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredHolidays = useMemo(() => {
    return HOLIDAYS_2026.filter((h) => selectedReligions.has(h.religion));
  }, [selectedReligions]);

  // Search results for holiday search bar
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return HOLIDAYS_2026.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.religion.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Open modal for today's date
  const handleOpenToday = () => {
    const now = new Date();
    // Default to year 2026 using current month and day for simulation, or today's exact date
    const today2026 = new Date(2026, now.getMonth(), now.getDate());
    const holidaysToday = HOLIDAYS_2026.filter((h) => isSameDay(parseISO(h.date), today2026));
    setSelectedDayData({ date: today2026, holidays: holidaysToday });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Header with Backdrop Blur */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-2.5 rounded-2xl text-white shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
                  EduReligioni
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60">
                  2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Calendario Interreligioso Didattico & Spunti Quotidiani
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Today Button */}
            <button
              onClick={handleOpenToday}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs sm:text-sm font-semibold border border-indigo-200/70 dark:border-indigo-800/60 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Apri lo spunto o festività di oggi"
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Spunto di</span> Oggi
            </button>

            {/* Dark Mode Switcher */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Banner with Interactivity Hints & Search Bar */}
        <div className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl shadow-sm shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Esplora il Patrimonio Spirituale Mondiale
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Clicca sulle date colorate per scoprire feste e tradizioni, oppure su qualsiasi giorno vuoto per una <strong>riflessione quotidiana interreligiosa con quiz</strong> per stimolare il dialogo in classe.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca festività (es. Ramadan, Pesach, Pasqua)..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-20 max-h-60 overflow-y-auto">
                <div className="p-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  {searchResults.length} {searchResults.length === 1 ? 'risultato trovato' : 'risultati trovati'}
                </div>
                {searchResults.map((holiday) => (
                  <button
                    key={holiday.id}
                    onClick={() => {
                      const dateObj = parseISO(holiday.date);
                      setSelectedDayData({ date: dateObj, holidays: [holiday] });
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center justify-between text-xs transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-none"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{holiday.name}</span>
                      <span className="ml-2 text-slate-500 dark:text-slate-400">
                        {RELIGION_EMOJIS[holiday.religion]} {holiday.religion}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      {format(parseISO(holiday.date), "d MMM", { locale: it })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters & Legend */}
          <aside className="lg:w-80 shrink-0 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 sticky top-24 transition-colors">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Tradizioni Religiose</h2>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={selectAll}
                    className="p-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                    title="Seleziona tutte le religioni"
                  >
                    Tutti
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    onClick={clearAll}
                    className="p-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="Deseleziona tutto"
                  >
                    Nessuno
                  </button>
                </div>
              </div>
              
              {/* Religions checklist */}
              <div className="space-y-2">
                {RELIGIONS.map((religion) => {
                  const isSelected = selectedReligions.has(religion);
                  const count = holidayCounts[religion] || 0;
                  return (
                    <button
                      key={religion}
                      onClick={() => toggleReligion(religion)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all text-left group cursor-pointer text-xs sm:text-sm",
                        isSelected 
                          ? cn(RELIGION_BORDER_COLORS[religion], "bg-slate-50 dark:bg-slate-800/60 shadow-xs font-semibold") 
                          : "border-slate-100 dark:border-slate-800/60 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-400 dark:text-slate-500"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{RELIGION_EMOJIS[religion]}</span>
                        <span className={cn(
                          "transition-colors",
                          isSelected ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-500"
                        )}>
                          {religion}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors",
                          isSelected
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600"
                        )}>
                          {count}
                        </span>
                        <div
                          className={cn(
                            "w-3.5 h-3.5 rounded-full transition-all flex items-center justify-center",
                            isSelected ? RELIGION_COLORS[religion] : "bg-slate-200 dark:bg-slate-700"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Visual Legend */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Legenda Calendario
                </h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      12
                    </span>
                    <span><strong>Festività Singola</strong> (colore della religione)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{ background: 'conic-gradient(#ef4444 0% 33%, #10b981 33% 66%, #3b82f6 66% 100%)' }}
                      className="w-5 h-5 rounded-full text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-xs ring-1 ring-white dark:ring-slate-900"
                    >
                      3
                    </span>
                    <span><strong>Festività Multiple</strong> (gradiente conico sovrapposto)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-indigo-50 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] shrink-0 font-medium">
                      24
                    </span>
                    <span><strong>Spunto Quotidiano</strong> (riflessione e quiz didattico)</span>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-6 p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex gap-3 text-indigo-900 dark:text-indigo-200 text-xs leading-relaxed">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                <p>
                  Questo strumento favorisce l'educazione alla cittadinanza, al rispetto della diversità e all'approfondimento interculturale per l'IRC e le materie umanistiche.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content - Calendar View */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Calendar 
                year={2026} 
                holidays={filteredHolidays} 
                onDayClick={(date, holidays) => setSelectedDayData({ date, holidays })} 
              />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Modal View for Holiday or Daily Reflection */}
      {selectedDayData && (
        <HolidayModal 
          date={selectedDayData.date}
          holidays={selectedDayData.holidays} 
          onClose={() => setSelectedDayData(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
