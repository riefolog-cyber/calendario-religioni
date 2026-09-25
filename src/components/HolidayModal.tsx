import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, Link as LinkIcon, MessageCircleQuestion, Loader2, CheckCircle2, XCircle, Quote, Sun } from 'lucide-react';
import { Holiday, RELIGION_COLORS } from '../data/holidays';
import { getHolidayInsight, HolidayInsight, getDailyReflection, DailyReflection } from '../services/gemini';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface HolidayModalProps {
  date: Date;
  holidays: Holiday[];
  onClose: () => void;
}

export function HolidayModal({ date, holidays, onClose }: HolidayModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [insight, setInsight] = useState<HolidayInsight | null>(null);
  const [dailyReflection, setDailyReflection] = useState<DailyReflection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const isDailyReflection = holidays.length === 0;
  const activeHoliday = isDailyReflection ? null : holidays[activeIndex];

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setInsight(null);
    setDailyReflection(null);
    setSelectedOption(null);
    setShowResult(false);

    if (isDailyReflection) {
      const dateStr = format(date, "d MMMM yyyy", { locale: it });
      getDailyReflection(dateStr)
        .then((data) => {
          if (isMounted) {
            setDailyReflection(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError('Errore durante il caricamento della riflessione quotidiana. Riprova più tardi.');
            setLoading(false);
          }
        });
    } else if (activeHoliday) {
      getHolidayInsight(activeHoliday.name, activeHoliday.religion)
        .then((data) => {
          if (isMounted) {
            setInsight(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError('Errore durante il caricamento degli approfondimenti. Riprova più tardi.');
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeHoliday, date, isDailyReflection]);

  const handleQuizSubmit = () => {
    if (selectedOption !== null) {
      setShowResult(true);
    }
  };

  const headerColorClass = isDailyReflection 
    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white" 
    : RELIGION_COLORS[activeHoliday!.religion];

  const headerTitle = isDailyReflection ? "Spunto Quotidiano" : activeHoliday!.name;
  const headerSubtitle = isDailyReflection ? "Riflessione Interreligiosa" : activeHoliday!.religion;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className={cn("p-6 sm:p-8 flex items-start justify-between transition-colors duration-500", headerColorClass)}>
            <div>
              <div className="text-sm font-medium uppercase tracking-wider opacity-80 mb-1 flex items-center gap-2">
                {isDailyReflection && <Sun className="w-4 h-4" />}
                {headerSubtitle}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{headerTitle}</h2>
              <div className="text-sm opacity-90 mt-2">
                {format(date, "EEEE d MMMM yyyy", { locale: it })}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs for multiple holidays */}
          {!isDailyReflection && holidays.length > 1 && (
            <div className="bg-slate-100 px-6 pt-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200">
              {holidays.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "px-4 py-2 rounded-t-xl text-sm font-medium whitespace-nowrap transition-colors",
                    activeIndex === idx 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  )}
                >
                  {h.name} ({h.religion})
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                <p>Generazione approfondimenti IA in corso...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Daily Reflection Content */}
            {isDailyReflection && dailyReflection && !loading && (
              <div className="space-y-8">
                {/* Immagine a tema */}
                <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden shadow-sm relative">
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(dailyReflection.tema)}/800/400`} 
                    alt={dailyReflection.tema}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end justify-center pb-6">
                    <span className="inline-block px-5 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold tracking-wide uppercase border border-white/30 shadow-lg">
                      Tema: {dailyReflection.tema}
                    </span>
                  </div>
                </div>

                <section>
                  <div className="text-slate-700 leading-relaxed space-y-4 text-lg">
                    {dailyReflection.riflessione.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <Quote className="absolute top-4 left-4 w-12 h-12 text-slate-100 -z-10" />
                  <blockquote className="relative z-10">
                    <p className="text-xl font-medium text-slate-800 italic mb-4">
                      "{dailyReflection.citazione.testo}"
                    </p>
                    <footer className="text-sm">
                      <strong className="text-slate-900">{dailyReflection.citazione.autore}</strong>
                      <span className="text-slate-500 ml-2">({dailyReflection.citazione.tradizione})</span>
                    </footer>
                  </blockquote>
                </section>

                <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                    <MessageCircleQuestion className="w-5 h-5" />
                    <h3>Spunto di Riflessione per la Classe</h3>
                  </div>
                  <p className="text-indigo-900 font-medium text-lg leading-relaxed">
                    "{dailyReflection.domanda}"
                  </p>
                </section>

                {/* Quiz Section for Daily Reflection */}
                {dailyReflection.quiz && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-800">Quiz Quotidiano</h3>
                      <p className="text-slate-600 mt-1">{dailyReflection.quiz.domanda}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {dailyReflection.quiz.opzioni.map((opzione, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === dailyReflection.quiz.rispostaCorretta;
                        
                        let optionClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700";
                        
                        if (showResult) {
                          if (isCorrect) {
                            optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                          } else if (isSelected && !isCorrect) {
                            optionClass = "border-red-500 bg-red-50 text-red-800";
                          } else {
                            optionClass = "border-slate-200 opacity-50";
                          }
                        } else if (isSelected) {
                          optionClass = "border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-500";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && setSelectedOption(idx)}
                            disabled={showResult}
                            className={cn(
                              "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                              optionClass
                            )}
                          >
                            <span>{opzione}</span>
                            {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {!showResult ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedOption === null}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                      >
                        Verifica Risposta
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn(
                          "p-4 rounded-xl mt-4 text-sm",
                          selectedOption === dailyReflection.quiz.rispostaCorretta 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        <p className="font-semibold mb-1">
                          {selectedOption === dailyReflection.quiz.rispostaCorretta ? "Esatto! 🎉" : "Non proprio."}
                        </p>
                        <p>{dailyReflection.quiz.spiegazione}</p>
                      </motion.div>
                    )}
                  </section>
                )}
              </div>
            )}

            {/* Holiday Content */}
            {!isDailyReflection && insight && !loading && (
              <div className="space-y-8">
                {/* Significato */}
                <section>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-3">
                    <BookOpen className="w-5 h-5" />
                    <h3>Significato Storico e Spirituale</h3>
                  </div>
                  <div className="text-slate-700 leading-relaxed space-y-4">
                    {insight.significato.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {/* Pratiche */}
                <section>
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-3">
                    <Sparkles className="w-5 h-5" />
                    <h3>Pratiche e Tradizioni</h3>
                  </div>
                  <ul className="space-y-3">
                    {insight.pratiche.map((pratica, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0" />
                        <span className="leading-relaxed">{pratica}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Collegamento Interdisciplinare */}
                <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-600 font-semibold mb-3">
                    <LinkIcon className="w-5 h-5" />
                    <h3>Collegamento Interdisciplinare</h3>
                  </div>
                  <div className="text-slate-700 leading-relaxed italic space-y-4">
                    {insight.collegamento.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {/* Domanda di Riflessione */}
                <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold mb-3">
                    <MessageCircleQuestion className="w-5 h-5" />
                    <h3>Spunto di Riflessione per la Classe</h3>
                  </div>
                  <p className="text-indigo-900 font-medium text-lg leading-relaxed">
                    "{insight.domanda}"
                  </p>
                </section>

                {/* Quiz Section */}
                {insight.quiz && (
                  <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-800">Quiz Rapido</h3>
                      <p className="text-slate-600 mt-1">{insight.quiz.domanda}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {insight.quiz.opzioni.map((opzione, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === insight.quiz.rispostaCorretta;
                        
                        let optionClass = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700";
                        
                        if (showResult) {
                          if (isCorrect) {
                            optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                          } else if (isSelected && !isCorrect) {
                            optionClass = "border-red-500 bg-red-50 text-red-800";
                          } else {
                            optionClass = "border-slate-200 opacity-50";
                          }
                        } else if (isSelected) {
                          optionClass = "border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-500";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && setSelectedOption(idx)}
                            disabled={showResult}
                            className={cn(
                              "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between",
                              optionClass
                            )}
                          >
                            <span>{opzione}</span>
                            {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {!showResult ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedOption === null}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                      >
                        Verifica Risposta
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn(
                          "p-4 rounded-xl mt-4 text-sm",
                          selectedOption === insight.quiz.rispostaCorretta 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        <p className="font-semibold mb-1">
                          {selectedOption === insight.quiz.rispostaCorretta ? "Esatto! 🎉" : "Non proprio."}
                        </p>
                        <p>{insight.quiz.spiegazione}</p>
                      </motion.div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
