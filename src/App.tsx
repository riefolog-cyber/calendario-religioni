/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Filter, Info, BookOpen } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { HolidayModal } from './components/HolidayModal';
import { HOLIDAYS_2026, Holiday, Religion, RELIGIONS, RELIGION_COLORS, RELIGION_BORDER_COLORS } from './data/holidays';
import { cn } from './lib/utils';

export default function App() {
  const [selectedReligions, setSelectedReligions] = useState<Set<Religion>>(new Set(RELIGIONS));
  const [selectedDayData, setSelectedDayData] = useState<{ date: Date, holidays: Holiday[] } | null>(null);

  const toggleReligion = (religion: Religion) => {
    const newSelected = new Set(selectedReligions);
    if (newSelected.has(religion)) {
      newSelected.delete(religion);
    } else {
      newSelected.add(religion);
    }
    setSelectedReligions(newSelected);
  };

  const filteredHolidays = HOLIDAYS_2026.filter((h) => selectedReligions.has(h.religion));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">EduReligioni</h1>
              <p className="text-xs text-slate-500 font-medium">Dashboard Didattica Interattiva</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <CalendarIcon className="w-4 h-4" />
              Anno Scolastico 2026
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Filters */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-slate-400" />
                <h2 className="text-lg font-semibold">Filtri Religioni</h2>
              </div>
              
              <div className="space-y-3">
                {RELIGIONS.map((religion) => {
                  const isSelected = selectedReligions.has(religion);
                  return (
                    <button
                      key={religion}
                      onClick={() => toggleReligion(religion)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left",
                        isSelected 
                          ? cn(RELIGION_BORDER_COLORS[religion], "bg-slate-50") 
                          : "border-transparent bg-slate-50 hover:bg-slate-100 text-slate-500"
                      )}
                    >
                      <span className="font-medium">{religion}</span>
                      <div className={cn(
                        "w-4 h-4 rounded-full transition-colors",
                        isSelected ? RELIGION_COLORS[religion] : "bg-slate-200"
                      )} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3 text-indigo-800 text-sm">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Clicca su una data evidenziata nel calendario per scoprire approfondimenti storici, pratiche e spunti di riflessione per la classe. Clicca su qualsiasi altro giorno per uno spunto di riflessione quotidiana interreligiosa.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content - Calendar */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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

      {/* Modal */}
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
