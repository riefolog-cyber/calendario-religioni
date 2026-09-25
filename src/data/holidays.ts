export type Religion = 'Cristianesimo' | 'Ebraismo' | 'Islam' | 'Induismo' | 'Buddhismo' | 'Sikhismo' | 'Taoismo' | 'Shintoismo';

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  religion: Religion;
}

export const RELIGIONS: Religion[] = ['Cristianesimo', 'Ebraismo', 'Islam', 'Induismo', 'Buddhismo', 'Sikhismo', 'Taoismo', 'Shintoismo'];

export const RELIGION_EMOJIS: Record<Religion, string> = {
  Cristianesimo: '✝️',
  Ebraismo: '✡️',
  Islam: '☪️',
  Induismo: '🕉️',
  Buddhismo: '☸️',
  Sikhismo: '🪯',
  Taoismo: '☯️',
  Shintoismo: '⛩️',
};

export const RELIGION_COLORS: Record<Religion, string> = {
  Cristianesimo: 'bg-blue-600 text-white',
  Ebraismo: 'bg-purple-600 text-white',
  Islam: 'bg-emerald-600 text-white',
  Induismo: 'bg-orange-500 text-white',
  Buddhismo: 'bg-amber-500 text-white',
  Sikhismo: 'bg-yellow-500 text-slate-950 font-semibold',
  Taoismo: 'bg-teal-600 text-white',
  Shintoismo: 'bg-rose-500 text-white',
};

export const RELIGION_HEX_COLORS: Record<Religion, string> = {
  Cristianesimo: '#2563eb',
  Ebraismo: '#9333ea',
  Islam: '#059669',
  Induismo: '#ea580c',
  Buddhismo: '#f59e0b',
  Sikhismo: '#eab308',
  Taoismo: '#0d9488',
  Shintoismo: '#f43f5e',
};

export const RELIGION_BORDER_COLORS: Record<Religion, string> = {
  Cristianesimo: 'border-blue-500 dark:border-blue-400',
  Ebraismo: 'border-purple-500 dark:border-purple-400',
  Islam: 'border-emerald-500 dark:border-emerald-400',
  Induismo: 'border-orange-500 dark:border-orange-400',
  Buddhismo: 'border-amber-400 dark:border-amber-300',
  Sikhismo: 'border-yellow-400 dark:border-yellow-300',
  Taoismo: 'border-teal-500 dark:border-teal-400',
  Shintoismo: 'border-rose-500 dark:border-rose-400',
};

export const MULTIPLE_HOLIDAYS_COLOR = 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-md';

export const HOLIDAYS_2026: Holiday[] = [
  // Cristianesimo
  { id: 'c1', date: '2026-01-06', name: 'Epifania', religion: 'Cristianesimo' },
  { id: 'c2', date: '2026-02-18', name: 'Mercoledì delle Ceneri', religion: 'Cristianesimo' },
  { id: 'c3', date: '2026-04-03', name: 'Venerdì Santo', religion: 'Cristianesimo' },
  { id: 'c4', date: '2026-04-05', name: 'Pasqua', religion: 'Cristianesimo' },
  { id: 'c7', date: '2026-05-24', name: 'Pentecoste', religion: 'Cristianesimo' },
  { id: 'c8', date: '2026-08-15', name: 'Assunzione (Ferragosto)', religion: 'Cristianesimo' },
  { id: 'c5', date: '2026-11-01', name: 'Tutti i Santi', religion: 'Cristianesimo' },
  { id: 'c9', date: '2026-12-08', name: 'Immacolata Concezione', religion: 'Cristianesimo' },
  { id: 'c6', date: '2026-12-25', name: 'Natale', religion: 'Cristianesimo' },

  // Ebraismo
  { id: 'e1', date: '2026-03-03', name: 'Purim', religion: 'Ebraismo' },
  { id: 'e2', date: '2026-04-02', name: 'Pesach (Inizio)', religion: 'Ebraismo' },
  { id: 'e6', date: '2026-05-22', name: 'Shavuot', religion: 'Ebraismo' },
  { id: 'e7', date: '2026-07-23', name: 'Tisha B\'Av', religion: 'Ebraismo' },
  { id: 'e3', date: '2026-09-12', name: 'Rosh Hashanah', religion: 'Ebraismo' },
  { id: 'e4', date: '2026-09-21', name: 'Yom Kippur', religion: 'Ebraismo' },
  { id: 'e8', date: '2026-09-26', name: 'Sukkot (Inizio)', religion: 'Ebraismo' },
  { id: 'e5', date: '2026-12-05', name: 'Hanukkah (Inizio)', religion: 'Ebraismo' },

  // Islam
  { id: 'i1', date: '2026-02-18', name: 'Inizio Ramadan', religion: 'Islam' },
  { id: 'i5', date: '2026-03-15', name: 'Laylat al-Qadr', religion: 'Islam' },
  { id: 'i2', date: '2026-03-20', name: 'Eid al-Fitr', religion: 'Islam' },
  { id: 'i3', date: '2026-05-27', name: 'Eid al-Adha', religion: 'Islam' },
  { id: 'i4', date: '2026-06-16', name: 'Capodanno Islamico', religion: 'Islam' },
  { id: 'i6', date: '2026-08-26', name: 'Mawlid al-Nabi', religion: 'Islam' },

  // Induismo
  { id: 'h1', date: '2026-01-14', name: 'Makar Sankranti', religion: 'Induismo' },
  { id: 'h5', date: '2026-02-15', name: 'Maha Shivaratri', religion: 'Induismo' },
  { id: 'h2', date: '2026-03-03', name: 'Holi', religion: 'Induismo' },
  { id: 'h6', date: '2026-08-28', name: 'Raksha Bandhan', religion: 'Induismo' },
  { id: 'h3', date: '2026-09-04', name: 'Krishna Janmashtami', religion: 'Induismo' },
  { id: 'h7', date: '2026-10-18', name: 'Navaratri (Inizio)', religion: 'Induismo' },
  { id: 'h4', date: '2026-11-08', name: 'Diwali', religion: 'Induismo' },

  // Buddhismo
  { id: 'b1', date: '2026-02-17', name: 'Capodanno Lunare (Mahaayana)', religion: 'Buddhismo' },
  { id: 'b5', date: '2026-03-03', name: 'Magha Puja', religion: 'Buddhismo' },
  { id: 'b2', date: '2026-05-31', name: 'Vesak', religion: 'Buddhismo' },
  { id: 'b3', date: '2026-07-29', name: 'Asalha Puja', religion: 'Buddhismo' },
  { id: 'b6', date: '2026-08-13', name: 'Obon (Inizio)', religion: 'Buddhismo' },
  { id: 'b4', date: '2026-12-08', name: 'Giorno della Bodhi', religion: 'Buddhismo' },

  // Sikhismo
  { id: 's1', date: '2026-04-14', name: 'Vaisakhi', religion: 'Sikhismo' },
  { id: 's3', date: '2026-10-20', name: 'Bandi Chhor Divas', religion: 'Sikhismo' },
  { id: 's2', date: '2026-11-24', name: 'Guru Nanak Gurpurab', religion: 'Sikhismo' },

  // Taoismo
  { id: 't1', date: '2026-02-17', name: 'Capodanno Cinese', religion: 'Taoismo' },
  { id: 't3', date: '2026-04-05', name: 'Qingming', religion: 'Taoismo' },
  { id: 't2', date: '2026-09-25', name: 'Festa di Metà Autunno', religion: 'Taoismo' },

  // Shintoismo
  { id: 'sh1', date: '2026-01-01', name: 'Oshogatsu (Capodanno)', religion: 'Shintoismo' },
  { id: 'sh2', date: '2026-03-20', name: 'Shunbun no Hi', religion: 'Shintoismo' },
  { id: 'sh3', date: '2026-11-15', name: 'Shichi-Go-San', religion: 'Shintoismo' },
];
