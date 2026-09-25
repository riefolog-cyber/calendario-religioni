import { GoogleGenAI, Type } from '@google/genai';

// Supporta sia l'ambiente di AI Studio (process.env) sia l'esportazione standard Vite (import.meta.env)
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // @ts-ignore - Ignora l'errore TS se import.meta.env non è tipizzato correttamente
  return import.meta.env.VITE_GEMINI_API_KEY;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export interface HolidayInsight {
  significato: string;
  pratiche: string[];
  collegamento: string;
  domanda: string;
  quiz: {
    domanda: string;
    opzioni: string[];
    rispostaCorretta: number;
    spiegazione: string;
  };
}

export interface DailyReflection {
  tema: string;
  riflessione: string;
  citazione: {
    testo: string;
    autore: string;
    tradizione: string;
  };
  domanda: string;
  quiz: {
    domanda: string;
    opzioni: string[];
    rispostaCorretta: number;
    spiegazione: string;
  };
}

export async function getHolidayInsight(holidayName: string, religion: string): Promise<HolidayInsight> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sei un docente universitario di storia delle religioni che sta preparando una scheda didattica estremamente approfondita per la festività "${holidayName}" (${religion}).
La scheda è destinata a studenti di una scuola secondaria di secondo grado. Sii chiaro, coinvolgente, accurato e fornisci un livello di dettaglio molto elevato. Sviluppa ampiamente il contesto storico, il significato teologico/spirituale, l'analisi dei simboli e delle pratiche, e crea collegamenti interdisciplinari complessi e stimolanti. Includi anche un breve quiz a risposta multipla per verificare la comprensione.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          significato: {
            type: Type.STRING,
            description: "Il significato storico e spirituale della festività. Fornisci un'analisi estesa e dettagliata (almeno 4-5 paragrafi ricchi di contenuto), includendo le origini storiche, l'evoluzione nel tempo e il profondo significato teologico o spirituale per i fedeli.",
          },
          pratiche: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Le pratiche, i simboli e le tradizioni principali. Descrivi in modo minuzioso ed esaustivo almeno 5-6 elementi, spiegando per ciascuno non solo 'cosa' si fa, ma 'perché' (il significato simbolico e rituale profondo).",
          },
          collegamento: {
            type: Type.STRING,
            description: "Un collegamento interdisciplinare (es. arte, letteratura, storia, geopolitica, filosofia) per contestualizzare l'evento. Sviluppa questo collegamento in modo ampio, articolato e critico (almeno 2-3 paragrafi), mostrando come la festività si intrecci con altre discipline.",
          },
          domanda: {
            type: Type.STRING,
            description: "Una 'Domanda di riflessione' complessa e aperta, formulata per stimolare un dibattito critico e profondo in classe tra ragazzi.",
          },
          quiz: {
            type: Type.OBJECT,
            description: "Un quiz a risposta multipla sulla festività.",
            properties: {
              domanda: { type: Type.STRING, description: "La domanda del quiz." },
              opzioni: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Le 4 opzioni di risposta." 
              },
              rispostaCorretta: { 
                type: Type.INTEGER, 
                description: "L'indice (0-3) dell'opzione corretta." 
              },
              spiegazione: { 
                type: Type.STRING, 
                description: "Breve spiegazione del perché la risposta è corretta." 
              }
            },
            required: ["domanda", "opzioni", "rispostaCorretta", "spiegazione"]
          }
        },
        required: ["significato", "pratiche", "collegamento", "domanda", "quiz"],
      },
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as HolidayInsight;
}

const THEMES = [
  "la pace interiore e globale", 
  "il perdono e la riconciliazione", 
  "il rispetto per la natura e la cura del creato", 
  "la luce come metafora di consapevolezza e verità", 
  "la compassione e l'empatia verso gli altri", 
  "il valore dell'attesa e della pazienza", 
  "la giustizia sociale e l'equità", 
  "la gratitudine e il riconoscimento", 
  "la speranza nei momenti d'ombra", 
  "il coraggio di affrontare le sfide", 
  "la fratellanza e la solidarietà umana", 
  "l'accettazione dell'impermanenza e del cambiamento", 
  "la curiosità e la ricerca della saggezza", 
  "il rispetto per gli anziani e la memoria storica", 
  "il valore della comunità e dello stare insieme", 
  "l'umiltà di fronte all'infinito o al divino", 
  "la gioia condivisa", 
  "il superamento dei propri pregiudizi", 
  "la forza e l'onestà della vulnerabilità",
  "la dignità inalienabile di ogni essere umano",
  "il ruolo del silenzio e dell'ascolto profondo",
  "creatività e ispirazione divina/interiore",
  "il bilanciamento tra lavoro e riposo",
  "l'accettazione e l'amore per se stessi",
  "il valore della verità e l'onestà",
  "il dono della libertà e le sue responsabilità",
  "il superamento del dolore e la resilienza",
  "la ricerca di un senso profondo o vocazione",
  "il valore dell'ospitalità verso lo straniero",
  "il dialogo autentico tra culture diverse",
  "il valore dell'invisibile e del trascendente",
  "l'importanza del rito e della tradizione inculturata",
  "la moderazione e il rifiuto degli eccessi",
  "il rispetto incondizionato per la vita",
  "l'azione disinteressata e il servizio (Carità / Karma Yoga)",
  "la via di mezzo e l'equilibrio psicofisico",
  "il rinnovamento interiore e la rinascita personale",
  "l'armonia tra mente, corpo e spirito",
  "la consapevolezza del presente (mindfulness)",
  "la bellezza dell'arte come riflesso del divino",
  "l'equità e la condivisione della ricchezza",
  "il distacco dall'ego e dal possesso materiale",
  "l'importanza dello studio intellettuale e spirituale",
  "la perseveranza di fronte ai fallimenti",
  "il valore della parola e il pericolo della maldicenza",
  "l'amore universale incondizionato",
  "essere luce e guida nel mondo per gli altri",
  "il perdono verso i propri errori passati",
  "il viaggio come pellegrinaggio interiore",
  "il dovere morale di proteggere i deboli e gli oppressi",
  "la ricerca dell'armonia cosmica (Tao / Dharma)",
  "la riparazione del mondo (Tikkun Olam)",
  "la non violenza integrale (Ahimsa) in pensieri e azioni"
];

const TRADITIONS = [
  "il Cristianesimo (Vangeli, padri della Chiesa o spiritualità contemporanea)",
  "l'Ebraismo (Torah, Talmud, saggezza rabbinica o chassidica)",
  "l'Islam (Corano o poesia spirituale Sufi)",
  "l'Induismo (Veda, Upanishad, Bhagavad Gita o maestri moderni)",
  "il Buddhismo (testi Theravada, ideali Mahayana o saggezza Zen)",
  "il Taoismo o il Confucianesimo",
  "il Sikhismo o la via del Jainismo",
  "lo Shintoismo e il suo rispetto animista/naturale",
  "le spiritualità Indigene (es. tradizioni nativo-americane o concetto africano di Ubuntu)",
  "le antiche filosofie (Stoicismo, Neoplatonismo) in dialogo con il pensiero religioso"
];

// Genera un seed deterministico a partire dalla data (es. "5 marzo 2026")
function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function getDailyReflection(dateStr: string): Promise<DailyReflection> {
  const seed = getDailySeed(dateStr);
  const randomTheme = THEMES[seed % THEMES.length];
  // Usiamo un offset per combinare temi e tradizioni in modo pseudocasuale ma coerente per quella data
  const traditionIndex = Math.floor(seed / THEMES.length) % TRADITIONS.length;
  const randomTradition = TRADITIONS[traditionIndex];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sei un esperto di dialogo interreligioso e un docente appassionato di storia delle religioni. Oggi è il ${dateStr}.
Fornisci uno "Spunto di Riflessione Quotidiana" per gli studenti di una scuola secondaria.

ATTENZIONE - ISTRUZIONI FONDAMENTALI PER GARANTIRE VARIETÀ:
1. Tema centrale OBBLIGATORIO di oggi: "${randomTheme}".
2. Prospettiva principale: Inizia e centra gran parte della riflessione attingendo specificamente da: "${randomTradition}".
3. Prospettiva secondaria: Metti in dialogo la prospettiva principale con un'ALTRA tradizione religiosa o filosofica a tua scelta, individuando un affascinante punto in comune o una prospettiva complementare.

Sviluppa una breve ma profonda riflessione (2-3 paragrafi) seguendo scrupolosamente questi punti.
Includi una citazione ispirante inerente al tema, tratta dalla prospettiva principale (specificando in modo accurato autore, testo o figura spirituale).
Poni una domanda aperta, provocatoria e intelligente, per stimolare il dibattito critico in classe.
Infine, crea un breve quiz a risposta multipla su un concetto chiave legato al tema trattato o alle logiche delle tradizioni spiegate nel testo.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tema: {
            type: Type.STRING,
            description: "Il tema universale scelto (es. 'La Compassione', 'Il Rispetto per la Natura').",
          },
          riflessione: {
            type: Type.STRING,
            description: "Una riflessione profonda e coinvolgente che esplora il tema da una prospettiva interreligiosa (2-3 paragrafi).",
          },
          citazione: {
            type: Type.OBJECT,
            properties: {
              testo: { type: Type.STRING, description: "Il testo della citazione." },
              autore: { type: Type.STRING, description: "L'autore o il testo sacro da cui è tratta." },
              tradizione: { type: Type.STRING, description: "La tradizione religiosa o filosofica di appartenenza." },
            },
            required: ["testo", "autore", "tradizione"],
          },
          domanda: {
            type: Type.STRING,
            description: "Una domanda aperta e stimolante per i ragazzi.",
          },
          quiz: {
            type: Type.OBJECT,
            description: "Un quiz a risposta multipla sul tema o sulle tradizioni citate.",
            properties: {
              domanda: { type: Type.STRING, description: "La domanda del quiz." },
              opzioni: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Le 4 opzioni di risposta." 
              },
              rispostaCorretta: { 
                type: Type.INTEGER, 
                description: "L'indice (0-3) dell'opzione corretta." 
              },
              spiegazione: { 
                type: Type.STRING, 
                description: "Breve spiegazione del perché la risposta è corretta." 
              }
            },
            required: ["domanda", "opzioni", "rispostaCorretta", "spiegazione"]
          }
        },
        required: ["tema", "riflessione", "citazione", "domanda", "quiz"],
      },
    },
  });

  const text = response.text || '{}';
  return JSON.parse(text) as DailyReflection;
}
