import React, { useState } from 'react';
import {
  format,
  startOfYear,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  getDay,
  isToday,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Holiday, RELIGION_COLORS, RELIGION_HEX_COLORS, RELIGION_EMOJIS } from '../data/holidays';
import { cn } from '../lib/utils';
import { Sparkles, CalendarDays } from 'lucide-react';

interface CalendarProps {
  year: number;
  holidays: Holiday[];
  onDayClick: (date: Date, holidays: Holiday[]) => void;
}

const WEEKDAYS = [
  { label: 'L', name: 'Lunedì' },
  { label: 'M', name: 'Martedì' },
  { label: 'M', name: 'Mercoledì' },
  { label: 'G', name: 'Giovedì' },
  { label: 'V', name: 'Venerdì' },
  { label: 'S', name: 'Sabato', isWeekend: true },
  { label: 'D', name: 'Domenica', isWeekend: true },
];

type PeriodFilter = 'all' | 'q1' | 'q2' | 'summer';

export function Calendar({ year, holidays, onDayClick }: CalendarProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [activeMonthFilter, setActiveMonthFilter] = useState<number | null>(null);

  const startDate = startOfYear(new Date(year, 0, 1));
  const allMonths = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));

  // Filter months based on user selection
  const filteredMonths = allMonths.filter((month) => {
    const monthIndex = month.getMonth(); // 0 to 11
    if (activeMonthFilter !== null) {
      return monthIndex === activeMonthFilter;
    }
    if (period === 'q1') {
      // 1° Quadrimestre scolastico (Settembre - Gennaio)
      return [8, 9, 10, 11, 0].includes(monthIndex);
    }
    if (period === 'q2') {
      // 2° Quadrimestre scolastico (Febbraio - Giugno)
      return [1, 2, 3, 4, 5].includes(monthIndex);
    }
    if (period === 'summer') {
      // Periodo estivo (Luglio - Agosto)
      return [6, 7].includes(monthIndex);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Visual Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <CalendarDays className="w-4 h-4 text-indigo-500" />
          <span>Vista Mesi:</span>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <button
            onClick={() => { setPeriod('all'); setActiveMonthFilter(null); }}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              period === 'all' && activeMonthFilter === null
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            Tutto l'Anno (12 Mesi)
          </button>
          <button
            onClick={() => { setPeriod('q1'); setActiveMonthFilter(null); }}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              period === 'q1' && activeMonthFilter === null
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            1° Quadrimestre (Set - Gen)
          </button>
          <button
            onClick={() => { setPeriod('q2'); setActiveMonthFilter(null); }}
            className={cn(
              "px-3 py-1.5 rounded-xl transition-all",
              period === 'q2' && activeMonthFilter === null
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            2° Quadrimestre (Feb - Giu)
          </button>
        </div>

        {/* Quick Month Select Dropdown for Mobile / Direct selection */}
        <div className="flex items-center gap-2">
          <select
            value={activeMonthFilter === null ? '' : activeMonthFilter}
            onChange={(e) => {
              if (e.target.value === '') {
                setActiveMonthFilter(null);
              } else {
                setActiveMonthFilter(Number(e.target.value));
              }
            }}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-3 py-1.5 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label="Filtra per mese specifico"
          >
            <option value="">Tutti i mesi del periodo</option>
            {allMonths.map((m, idx) => (
              <option key={idx} value={idx}>
                {format(m, 'MMMM', { locale: it }).toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Months */}
      <div className={cn(
        "grid gap-6 transition-all",
        activeMonthFilter !== null
          ? "grid-cols-1 max-w-xl mx-auto"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}>
        {filteredMonths.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
          
          // getDay returns 0 for Sunday, 1 for Monday. We want Monday to be 0.
          const startDayIndex = (getDay(monthStart) + 6) % 7;
          const emptyDays = Array.from({ length: startDayIndex }, (_, i) => i);

          // Find all holidays in this month
          const monthHolidays = holidays.filter((h) => {
            const hDate = parseISO(h.date);
            return hDate.getMonth() === month.getMonth() && hDate.getFullYear() === year;
          });

          return (
            <div
              key={month.toISOString()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group"
            >
              <div>
                {/* Month Title Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize tracking-tight flex items-center gap-2">
                    {format(month, 'MMMM', { locale: it })}
                  </h3>

                  {monthHolidays.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      {monthHolidays.length} {monthHolidays.length === 1 ? 'festa' : 'feste'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Spunti didattici
                    </span>
                  )}
                </div>
                
                {/* Weekdays Header */}
                <div className="grid grid-cols-7 gap-1 mb-2.5">
                  {WEEKDAYS.map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-center text-xs font-semibold tracking-wider",
                        day.isWeekend ? "text-slate-400/80 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"
                      )}
                      title={day.name}
                    >
                      {day.label}
                    </div>
                  ))}
                </div>
                
                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="h-8 w-8" />
                  ))}
                  
                  {days.map((day) => {
                    const dayHolidays = holidays.filter((h) => isSameDay(parseISO(h.date), day));
                    const hasHoliday = dayHolidays.length > 0;
                    const isMultiple = dayHolidays.length > 1;
                    const primaryHoliday = hasHoliday ? dayHolidays[0] : null;
                    const isTodayDate = isToday(day);

                    let bgColorClass = "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300";
                    let inlineStyle: React.CSSProperties = {};

                    if (isMultiple) {
                      const colors = dayHolidays.map(h => RELIGION_HEX_COLORS[h.religion]);
                      const step = 100 / colors.length;
                      const gradientStops = colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(', ');
                      inlineStyle = { 
                        background: `conic-gradient(${gradientStops})`, 
                        color: 'white',
                        textShadow: '0px 1px 2px rgba(0,0,0,0.85)'
                      };
                      bgColorClass = "shadow-md font-bold ring-2 ring-white dark:ring-slate-900 scale-105 z-10 hover:scale-115";
                    } else if (primaryHoliday) {
                      bgColorClass = `${RELIGION_COLORS[primaryHoliday.religion]} font-semibold shadow-sm hover:scale-110`;
                    }

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => onDayClick(day, dayHolidays)}
                        style={inlineStyle}
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs sm:text-sm transition-all relative cursor-pointer select-none",
                          isTodayDate ? "ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 font-extrabold" : "",
                          !hasHoliday ? "hover:scale-110" : "",
                          bgColorClass
                        )}
                        title={
                          hasHoliday
                            ? dayHolidays.map(h => `${h.name} (${h.religion} ${RELIGION_EMOJIS[h.religion]})`).join(' + ')
                            : `Riflessione & Quiz del ${format(day, 'd MMMM', { locale: it })}`
                        }
                      >
                        {format(day, 'd')}
                        
                        {/* Multiple holidays indicator beacon */}
                        {isMultiple && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-white dark:border-slate-900"></span>
                          </span>
                        )}

                        {/* Subtle indicator for today if not a holiday */}
                        {isTodayDate && !hasHoliday && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
