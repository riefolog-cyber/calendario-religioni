import React from 'react';
import {
  format,
  startOfYear,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  getDay,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Holiday, RELIGION_COLORS, RELIGION_HEX_COLORS } from '../data/holidays';
import { cn } from '../lib/utils';

interface CalendarProps {
  year: number;
  holidays: Holiday[];
  onDayClick: (date: Date, holidays: Holiday[]) => void;
}

const WEEKDAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export function Calendar({ year, holidays, onDayClick }: CalendarProps) {
  const startDate = startOfYear(new Date(year, 0, 1));
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startDate, i));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        
        // getDay returns 0 for Sunday, 1 for Monday. We want Monday to be 0.
        const startDayIndex = (getDay(monthStart) + 6) % 7;
        const emptyDays = Array.from({ length: startDayIndex }, (_, i) => i);

        return (
          <div key={month.toISOString()} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 capitalize mb-4">
              {format(month, 'MMMM', { locale: it })}
            </h3>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="h-8 w-8" />
              ))}
              
              {days.map((day) => {
                const dayHolidays = holidays.filter((h) => isSameDay(parseISO(h.date), day));
                const hasHoliday = dayHolidays.length > 0;
                const isMultiple = dayHolidays.length > 1;
                const primaryHoliday = hasHoliday ? dayHolidays[0] : null;

                let bgColorClass = "hover:bg-slate-100 text-slate-700";
                let inlineStyle: React.CSSProperties = {};

                if (isMultiple) {
                  const colors = dayHolidays.map(h => RELIGION_HEX_COLORS[h.religion]);
                  const step = 100 / colors.length;
                  const gradientStops = colors.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(', ');
                  inlineStyle = { 
                    background: `conic-gradient(${gradientStops})`, 
                    color: 'white',
                    textShadow: '0px 1px 2px rgba(0,0,0,0.8)'
                  };
                  bgColorClass = "shadow-lg font-bold ring-4 ring-white ring-offset-2 scale-110 z-10";
                } else if (primaryHoliday) {
                  bgColorClass = RELIGION_COLORS[primaryHoliday.religion];
                }

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDayClick(day, dayHolidays)}
                    style={inlineStyle}
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all relative cursor-pointer",
                      hasHoliday && !isMultiple ? "hover:scale-110 shadow-sm" : "",
                      !hasHoliday ? "hover:bg-indigo-50 hover:text-indigo-600" : "",
                      bgColorClass
                    )}
                    title={hasHoliday ? dayHolidays.map(h => `${h.name} (${h.religion})`).join(' + ') : "Spunto di riflessione quotidiana"}
                  >
                    {format(day, 'd')}
                    {isMultiple && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-white"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
