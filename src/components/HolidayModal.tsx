import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  MessageCircleQuestion,
  Loader2,
  CheckCircle2,
  XCircle,
  Quote,
  Sun,
  Share2,
  Check,
  Calendar as CalendarIcon,
  HelpCircle
} from 'lucide-react';
import { Holiday, RELIGION_COLORS, RELIGION_EMOJIS } from '../data/holidays';
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
  const [copied, setCopied] = useState(false);
  
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
    setCopied(false);

    if (isDailyReflection) {
      const dateStr = format(date, "d MMMM yyyy", { locale: it });
      getDailyReflection(dateStr)
        .then((data) => {
          if (isMounted) {
            setDailyReflection(data);
            setLoading(false);
          }
        })
        .catch(() => {
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
        .catch(() => {
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

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleQuizSubmit = () => {
    if (selectedOption !== null) {
      setShowResult(true);
    }
  };

  const handleCopySummary = () => {
    const dateFormatted = format(date, "d MMMM yyyy", { locale: it });
    let textToCopy = '';

    if (isDailyReflection && dailyReflection) {
      textToCopy = `✨ SPUNTO INTERRELIGIOSO DEL GIORNO (${dateFormatted})\nTema: ${dailyReflection.tema}\n\n"${dailyReflection.citazione.testo}"\n— ${dailyReflection.citazione.autore} (${dailyReflection.citazione.tradizione})\n\n💡 Domanda per la classe:\n"${dailyReflection.domanda}"\n\n(Dall'app didattica EduReligioni)`;
    } else if (activeHoliday && insight) {
      textToCopy = `🕌 FESTIVITÀ: ${activeHoliday.name} (${activeHoliday.religion}) - ${dateFormatted}\n\n📖 Significato:\n${insight.significato.substring(0, 300)}...\n\n💡 Spunto di riflessione per la classe:\n"${insight.domanda}"\n\n(Dall'app didattica EduReligioni)`;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const headerColorClass = isDailyReflection 
    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md" 
    : `${RELIGION_COLORS[activeHoliday!.religion]} shadow-md`;

  const headerTitle = isDailyReflection ? "Spunto Quotidiano" : activeHoliday!.name;
  const headerSubtitle = isDailyReflection 
    ? "Riflessione & Quiz Interreligioso" 
    : `${activeHoliday!.religion} ${RELIGION_EMOJIS[activeHoliday!.religion] || ''}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className={cn("p-6 sm:p-7 flex items-start justify-between relative transition-colors duration-300", headerColorClass)}>
            <div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider opacity-90 mb-1 flex items-center gap-2">
                {isDailyReflection ? <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" /> : <CalendarIcon className="w-4 h-4" />}
                {headerSubtitle}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">{headerTitle}</h2>
              <div className="text-xs sm:text-sm font-medium opacity-90 mt-1.5 flex items-center gap-2">
                <span>{format(date, "EEEE d MMMM yyyy", { locale: it })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Copy / Share button */}
              <button
                onClick={handleCopySummary}
                className="p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full transition-all text-white"
                title="Copia spunto per la classe"
                aria-label="Copia spunto per la classe"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Share2 className="w-5 h-5" />}
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2.5 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full transition-all text-white"
                title="Chiudi (Esc)"
                aria-label="Chiudi finestra"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copied toast notification */}
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-2 right-6 px-3 py-1 bg-slate-900/90 text-white text-xs font-semibold rounded-full shadow-lg border border-white/20 backdrop-blur-md"
              >
                ✓ Spunto copiato negli appunti!
              </motion.div>
            )}
          </div>

          {/* Multiple holidays tabs navigation */}
          {!isDailyReflection && holidays.length > 1 && (
            <div className="bg-slate-100 dark:bg-slate-800/90 px-6 pt-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-700/80">
              {holidays.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    "px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                    activeIndex === idx 
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border-t border-x border-slate-200/80 dark:border-slate-700/80" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <span>{RELIGION_EMOJIS[h.religion]}</span>
                  <span>{h.name}</span>
                  <span className="text-xs opacity-70">({h.religion})</span>
                </button>
              ))}
            </div>
          )}

          {/* Content Scroll Container */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100">
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-9 h-9 animate-spin mb-4 text-indigo-500" />
                <p className="font-medium text-sm">Elaborazione spunto pedagogico con IA...</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Approfondimenti storici e quiz interattivo</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900/60 text-sm">
                {error}
              </div>
            )}

            {/* Daily Reflection View */}
            {isDailyReflection && dailyReflection && !loading && (
              <div className="space-y-7">
                {/* Thematic Image Header */}
                <div className="w-full h-48 sm:h-64 rounded-3xl overflow-hidden shadow-sm relative border border-slate-200/60 dark:border-slate-800 group">
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(dailyReflection.tema)}/800/400`} 
                    alt={dailyReflection.tema}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end justify-between p-5">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 dark:bg-slate-900/50 backdrop-blur-md text-white rounded-full text-xs font-bold tracking-wider uppercase border border-white/30 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Tema: {dailyReflection.tema}
                    </span>
                  </div>
                </div>

                {/* Reflection Text */}
                <section>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 text-base sm:text-lg">
                    {dailyReflection.riflessione.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {/* Quote Box */}
                <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <Quote className="absolute top-4 left-4 w-12 h-12 text-slate-100 dark:text-slate-800/60 -z-10" />
                  <blockquote className="relative z-10">
                    <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 italic mb-4 leading-relaxed font-serif">
                      "{dailyReflection.citazione.testo}"
                    </p>
                    <footer className="text-sm flex flex-wrap items-center gap-2">
                      <strong className="text-slate-900 dark:text-white font-semibold">{dailyReflection.citazione.autore}</strong>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {dailyReflection.citazione.tradizione}
                      </span>
                    </footer>
                  </blockquote>
                </section>

                {/* Classroom Reflection Prompt */}
                <section className="bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/30 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold mb-2">
                    <MessageCircleQuestion className="w-5 h-5" />
                    <h3 className="text-base tracking-tight">Spunto di Riflessione per la Classe</h3>
                  </div>
                  <p className="text-indigo-950 dark:text-indigo-100 font-medium text-base sm:text-lg leading-relaxed">
                    "{dailyReflection.domanda}"
                  </p>
                </section>

                {/* Daily Quiz */}
                {dailyReflection.quiz && (
                  <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="mb-5 flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quiz del Giorno</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{dailyReflection.quiz.domanda}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      {dailyReflection.quiz.opzioni.map((opzione, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === dailyReflection.quiz.rispostaCorretta;
                        
                        let optionClass = "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900";
                        
                        if (showResult) {
                          if (isCorrect) {
                            optionClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium";
                          } else if (isSelected && !isCorrect) {
                            optionClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium";
                          } else {
                            optionClass = "border-slate-200 dark:border-slate-800 opacity-40";
                          }
                        } else if (isSelected) {
                          optionClass = "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && setSelectedOption(idx)}
                            disabled={showResult}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-sm sm:text-base font-medium cursor-pointer disabled:cursor-default",
                              optionClass
                            )}
                          >
                            <span>{opzione}</span>
                            {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {!showResult ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedOption === null}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
                      >
                        Verifica Risposta
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn(
                          "p-4 rounded-2xl mt-4 text-sm border",
                          selectedOption === dailyReflection.quiz.rispostaCorretta 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60" 
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60"
                        )}
                      >
                        <p className="font-bold mb-1 flex items-center gap-1.5">
                          {selectedOption === dailyReflection.quiz.rispostaCorretta ? "Esatto! Ottimo lavoro! 🎉" : "Non corretto. Ecco la spiegazione:"}
                        </p>
                        <p className="leading-relaxed opacity-95">{dailyReflection.quiz.spiegazione}</p>
                      </motion.div>
                    )}
                  </section>
                )}
              </div>
            )}

            {/* Holiday Insight View */}
            {!isDailyReflection && insight && !loading && (
              <div className="space-y-7">
                {/* Historical and Spiritual Significance */}
                <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold mb-3.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="text-base tracking-tight">Significato Storico e Spirituale</h3>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-3.5 text-sm sm:text-base">
                    {insight.significato.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {/* Practices and Traditions */}
                <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold mb-3.5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-base tracking-tight">Pratiche e Tradizioni</h3>
                  </div>
                  <ul className="space-y-3">
                    {insight.pratiche.map((pratica, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 mt-2 shrink-0" />
                        <span className="leading-relaxed">{pratica}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Interdisciplinary Connections */}
                <section className="bg-amber-50/60 dark:bg-amber-950/30 p-6 rounded-3xl border border-amber-200/60 dark:border-amber-900/50 shadow-sm">
                  <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold mb-3">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-base tracking-tight">Collegamento Interdisciplinare</h3>
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 text-sm sm:text-base italic">
                    {insight.collegamento.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                {/* Reflection Question */}
                <section className="bg-gradient-to-br from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/30 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold mb-2">
                    <MessageCircleQuestion className="w-5 h-5" />
                    <h3 className="text-base tracking-tight">Spunto di Riflessione per la Classe</h3>
                  </div>
                  <p className="text-indigo-950 dark:text-indigo-100 font-medium text-base sm:text-lg leading-relaxed">
                    "{insight.domanda}"
                  </p>
                </section>

                {/* Quiz Section */}
                {insight.quiz && (
                  <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="mb-5 flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quiz Rapido</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{insight.quiz.domanda}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      {insight.quiz.opzioni.map((opzione, idx) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === insight.quiz.rispostaCorretta;
                        
                        let optionClass = "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900";
                        
                        if (showResult) {
                          if (isCorrect) {
                            optionClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium";
                          } else if (isSelected && !isCorrect) {
                            optionClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium";
                          } else {
                            optionClass = "border-slate-200 dark:border-slate-800 opacity-40";
                          }
                        } else if (isSelected) {
                          optionClass = "border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => !showResult && setSelectedOption(idx)}
                            disabled={showResult}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-sm sm:text-base font-medium cursor-pointer disabled:cursor-default",
                              optionClass
                            )}
                          >
                            <span>{opzione}</span>
                            {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
                            {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>

                    {!showResult ? (
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedOption === null}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
                      >
                        Verifica Risposta
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn(
                          "p-4 rounded-2xl mt-4 text-sm border",
                          selectedOption === insight.quiz.rispostaCorretta 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60" 
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60"
                        )}
                      >
                        <p className="font-bold mb-1 flex items-center gap-1.5">
                          {selectedOption === insight.quiz.rispostaCorretta ? "Esatto! Ottimo lavoro! 🎉" : "Non corretto. Ecco la spiegazione:"}
                        </p>
                        <p className="leading-relaxed opacity-95">{insight.quiz.spiegazione}</p>
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
