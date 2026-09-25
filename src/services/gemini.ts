import { GoogleGenAI, Type } from '@google/genai';

// Supporta sia l'ambiente di AI Studio (process.env) sia l'esportazione standard Vite (import.meta.env)
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // @ts-ignore - Ignora l'errore TS se import.meta.env non è tipizzato correttamente
  return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

// Modelli supportati e autorizzati
const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';

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

// -------------------------------------------------------------
// Chiamata con retry su modello secondario
// -------------------------------------------------------------
async function callGeminiApi(prompt: string, schema: any): Promise<any> {
  const currentKey = getApiKey();
  if (!currentKey || currentKey === 'dummy-key') {
    throw new Error('Chiave API Gemini mancante o non configurata.');
  }

  // 1. Prova con il modello primario (gemini-3.8-flash)
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (err: any) {
    console.warn(`Tentativo con ${PRIMARY_MODEL} non riuscito:`, err?.message || err);
    
    // 2. Prova con il modello di riserva (gemini-flash-latest)
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      if (fallbackResponse.text) {
        return JSON.parse(fallbackResponse.text);
      }
    } catch (fallbackErr: any) {
      console.warn(`Tentativo con ${FALLBACK_MODEL} non riuscito:`, fallbackErr?.message || fallbackErr);
      throw fallbackErr;
    }
  }

  throw new Error('Risposta vuota da Gemini API');
}

// -------------------------------------------------------------
// Approfondimento Festività
// -------------------------------------------------------------
export async function getHolidayInsight(holidayName: string, religion: string): Promise<HolidayInsight> {
  const prompt = `Sei un docente universitario di storia delle religioni che sta preparando una scheda didattica estremamente approfondita per la festività "${holidayName}" (${religion}).
La scheda è destinata a studenti di una scuola secondaria di secondo grado. Sii chiaro, coinvolgente, accurato e fornisci un livello di dettaglio molto elevato. Sviluppa ampiamente il contesto storico, il significato teologico/spirituale, l'analisi dei simboli e delle pratiche, e crea collegamenti interdisciplinari complessi e stimolanti. Includi anche un breve quiz a risposta multipla per verificare la comprensione.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      significato: {
        type: Type.STRING,
        description: "Il significato storico e spirituale della festività (almeno 3-4 paragrafi).",
      },
      pratiche: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Almeno 4-5 pratiche, simboli e tradizioni dettagliate con il loro significato.",
      },
      collegamento: {
        type: Type.STRING,
        description: "Collegamento interdisciplinare con arte, letteratura, filosofia o storia.",
      },
      domanda: {
        type: Type.STRING,
        description: "Domanda stimolante per il dibattito in classe.",
      },
      quiz: {
        type: Type.OBJECT,
        properties: {
          domanda: { type: Type.STRING },
          opzioni: { type: Type.ARRAY, items: { type: Type.STRING } },
          rispostaCorretta: { type: Type.INTEGER },
          spiegazione: { type: Type.STRING }
        },
        required: ["domanda", "opzioni", "rispostaCorretta", "spiegazione"]
      }
    },
    required: ["significato", "pratiche", "collegamento", "domanda", "quiz"],
  };

  try {
    return await callGeminiApi(prompt, schema);
  } catch (error) {
    console.warn(`[EduReligioni] Attivazione scheda didattica integrata per "${holidayName}":`, error);
    return getFallbackHolidayInsight(holidayName, religion);
  }
}

// -------------------------------------------------------------
// Spunto di Riflessione Quotidiano
// -------------------------------------------------------------
export async function getDailyReflection(dateStr: string): Promise<DailyReflection> {
  const seed = getDailySeed(dateStr);
  const randomTheme = THEMES[seed % THEMES.length];
  const traditionIndex = Math.floor(seed / THEMES.length) % TRADITIONS.length;
  const randomTradition = TRADITIONS[traditionIndex];

  const prompt = `Sei un esperto di dialogo interreligioso e un docente di storia delle religioni. Oggi è il ${dateStr}.
Fornisci uno "Spunto di Riflessione Quotidiana" per gli studenti di scuola secondaria.
1. Tema centrale: "${randomTheme}".
2. Prospettiva principale da cui attingere: "${randomTradition}".
3. Prospettiva secondaria: metti in dialogo con un'altra tradizione per trovare un punto in comune.
Includi una citazione, una domanda per la classe e un quiz a risposta multipla sul tema.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      tema: { type: Type.STRING },
      riflessione: { type: Type.STRING },
      citazione: {
        type: Type.OBJECT,
        properties: {
          testo: { type: Type.STRING },
          autore: { type: Type.STRING },
          tradizione: { type: Type.STRING },
        },
        required: ["testo", "autore", "tradizione"],
      },
      domanda: { type: Type.STRING },
      quiz: {
        type: Type.OBJECT,
        properties: {
          domanda: { type: Type.STRING },
          opzioni: { type: Type.ARRAY, items: { type: Type.STRING } },
          rispostaCorretta: { type: Type.INTEGER },
          spiegazione: { type: Type.STRING }
        },
        required: ["domanda", "opzioni", "rispostaCorretta", "spiegazione"]
      }
    },
    required: ["tema", "riflessione", "citazione", "domanda", "quiz"],
  };

  try {
    return await callGeminiApi(prompt, schema);
  } catch (error) {
    console.warn(`[EduReligioni] Attivazione spunto didattico integrato per "${dateStr}":`, error);
    return getFallbackDailyReflection(dateStr, randomTheme, randomTradition, seed);
  }
}

// -------------------------------------------------------------
// Temi e Tradizioni per il Calendario Didattico
// -------------------------------------------------------------
export const THEMES = [
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
  "creatività e ispirazione interiore",
  "il bilanciamento tra impegno e riposo",
  "l'accettazione e il rispetto per se stessi",
  "il valore della sincerità e della verità",
  "il dono della libertà e le sue responsabilità",
  "il superamento delle prove e la resilienza",
  "la ricerca del proprio senso profondo e vocazione",
  "il sacro valore dell'ospitalità verso lo straniero",
  "il dialogo autentico e fecondo tra culture diverse",
  "il mistero dell'invisibile e del trascendente",
  "l'importanza del rito come collante sociale",
  "la via della sobrietà e il rifiuto del superfluo",
  "il rispetto incondizionato per ogni forma di vita",
  "l'azione disinteressata e il servizio per gli altri",
  "la via di mezzo e l'armonia interiore",
  "il rinnovamento personale e la rinascita interiore",
  "la consapevolezza del momento presente (qui e ora)",
  "la bellezza artistica come porta verso il divino",
  "la condivisione dei beni con chi ha meno",
  "il distacco dall'egoismo e dall'attaccamento materiale",
  "il valore dello studio e della formazione continua",
  "la perseveranza davanti agli ostacoli",
  "la cura per le parole e il peso del linguaggio",
  "l'amore universale che supera i confini",
  "l'essere luce e ispirazione nel quotidiano",
  "il cammino della vita come pellegrinaggio interiore",
  "la difesa dei diritti degli ultimi e degli indifesi",
  "la ricerca dell'armonia cosmica e dell'equilibrio",
  "la riparazione del mondo (Tikkun Olam)",
  "la non-violenza attiva (Ahimsa) in pensieri e azioni"
];

export const TRADITIONS = [
  "il Cristianesimo",
  "l'Ebraismo",
  "l'Islam",
  "l'Induismo",
  "il Buddhismo",
  "il Taoismo",
  "il Sikhismo",
  "lo Shintoismo",
  "le tradizioni Indigene e concetti sapienziali (es. Ubuntu)",
  "le antiche filosofie stoiche e umanistiche"
];

function getDailySeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// -------------------------------------------------------------
// Fallback Didattico Garantito per Festività
// -------------------------------------------------------------
function getFallbackHolidayInsight(name: string, religion: string): HolidayInsight {
  const commonFallbacks: Record<string, Partial<HolidayInsight>> = {
    'Natale': {
      significato: `Il Natale celebra nella tradizione cristiana la nascita di Gesù di Nazareth a Betlemme, evento teologicamente inteso come l'Incarnazione: Dio che entra nella storia umana facendosi bambino vulnerabile.\n\nQuesta solennità, istituita a Roma nel IV secolo (attorno al 336 d.C.) in corrispondenza del solstizio d'inverno, ha assorbito e trasformato preesistenti feste della luce come il Dies Natalis Solis Invicti, ribadendo la vittoria simbolica della luce sulle tenebre interiori e del mondo.\n\nDal punto di vista spirituale, il messaggio centrale risiede nella proclamazione della pace universale, della fratellanza tra gli uomini e nella vicinanza agli umili, rappresentati dai pastori che per primi accolsero l'annuncio.`,
      pratiche: [
        "Il Presepe: tradizione avviata da San Francesco d'Assisi nel 1223 a Greccio, per visualizzare la povertà evangelica.",
        "La Veglia e la Messa di Mezzanotte: rito liturgico che accoglie la luce nel cuore della notte.",
        "L'Albero di Natale: simbolo ancestrale di vita che resiste ai rigori dell'inverno, ornato di luci.",
        "La condivisione del pasto e i doni: gesto rituale che incarna l'amore gratuito e la carità verso i bisognosi."
      ],
      collegamento: `Nella storia dell'arte, la Natività ha ispirato capolavori immortali (da Giotto alla Cappella degli Scrovegni, fino a Caravaggio). In letteratura, l'opera "Canto di Natale" di Charles Dickens ha fissato l'etica moderna della solidarietà, mostrando come il Natale sia un catalizzatore di conversione morale contro l'avidità capitalista.`,
      domanda: "In che modo l'idea di una divinità che si fa fragile e bisognosa interroga la nostra concezione del potere, del successo e della cura verso i più vulnerabili?",
      quiz: {
        domanda: "Chi realizzò la prima rappresentazione vivente del Presepe a Greccio nel 1223?",
        opzioni: ["San Benedetto da Norcia", "San Francesco d'Assisi", "Sant'Agostino", "San Tommaso d'Aquino"],
        rispostaCorretta: 1,
        spiegazione: "Fu San Francesco d'Assisi a Greccio nel 1223 a realizzare la prima rappresentazione plastica della Natività per rendere tangibile la povertà della nascita di Cristo."
      }
    },
    'Inizio Ramadan': {
      significato: `Il Ramadan è il nono mese del calendario lunare islamico ed è il periodo sacro per eccellenza, durante il quale i musulmani credono che il Corano sia stato rivelato per la prima volta al Profeta Muhammad attraverso l'arcangelo Gabriele durante la 'Notte del Destino' (Laylat al-Qadr).\n\nIl digiuno (Sawm), uno dei cinque pilastri dell'Islam, è prescritto dall'alba al tramonto per tutti gli adulti in salute. Non si tratta solo di astenersi da cibo e bevande, ma di un radicale percorso di purificazione del linguaggio, della mente e del cuore da ogni egoismo e maldicenza.\n\nIl Ramadan rafforza l'autodisciplina e avvicina i credenti all'esperienza di chi soffre la fame quotidianamente, rinnovando il dovere della solidarietà e della generosità verso i meno fortunati.`,
      pratiche: [
        "Il digiuno quotidiano (Sawm) dall'aurora (Fajr) al tramonto (Maghrib).",
        "Il pasto serale di rottura del digiuno (Iftar), spesso condiviso in famiglia o con la comunità aprendo con datteri e acqua.",
        "La recita delle preghiere notturne straordinarie chiamate Tarawih.",
        "L'intensificazione della beneficenza (Zakat e Sadaqah) verso i poveri."
      ],
      collegamento: `Il digiuno ha una forte risonanza nella storia delle religioni comparate: la Quaresima cristiana, lo Yom Kippur ebraico o il Vrata induista condividono lo stesso fine di distacco materiale per riscoprire la dimensione spirituale ed etica della persona.`,
      domanda: "Qual è il valore educativo del saper rinunciare volontariamente a un bene immediato in una società improntata al consumo e alla gratificazione istantanea?",
      quiz: {
        domanda: "Quale evento fondamentale della storia islamica viene ricordato durante il mese di Ramadan?",
        opzioni: [
          "L'Egira del Profeta da La Mecca a Medina",
          "La prima rivelazione del Corano al Profeta Muhammad",
          "La costruzione della Ka'ba",
          "La conquista pacifica di La Mecca"
        ],
        rispostaCorretta: 1,
        spiegazione: "Durante il mese di Ramadan si celebra la discesa della prima rivelazione del sacro Corano al Profeta Muhammad nella Notte del Destino."
      }
    },
    'Pesach (Inizio)': {
      significato: `Pesach (la Pasqua ebraica) celebra la liberazione del popolo d'Israele dalla schiavitù d'Egitto sotto la guida di Mosè, evento fondante narrato nel libro dell'Esodo.\n\nLa festività dura otto giorni (sette in Israele) ed è incentrata sul passaggio (il termine 'Pesach' significa 'passare oltre') dalla condizione servile alla libertà spirituale e politica, istituendo il patto tra Dio e il popolo eletto.\n\nOgni generazione ebrea è chiamata a vivere il racconto dell'Esodo come se essa stessa fosse appena uscita dall'Egitto, rendendo la memoria un atto vitale di responsabilità etica contro ogni forma di oppressione nel mondo contemporaneo.`,
      pratiche: [
        "La cena rituale del Seder, scandita dalla lettura dell'Haggadah e dalla recita di inni.",
        "Il consumo di pane azzimo (Matzah), simbolo della fretta con cui gli Israeliti fuggirono dall'Egitto.",
        "Il divieto rigoroso di possedere e consumare lievito (Chametz), metafora dell'orgoglio da eliminare.",
        "L'erbe amare (Maror) sul piatto del Seder, per ricordare la durezza della schiavitù passata."
      ],
      collegamento: `Il concetto di Esodo ha permeato la storia politica e filosofica moderna, ispirando i movimenti per i diritti civili dei neri d'America guidati da Martin Luther King e la teologia della liberazione in America Latina.`,
      domanda: "Che cosa significa essere veramente 'liberi' oggi? In che modo la memoria storica della schiavitù può proteggerci dalle nuove forme di sottomissione culturale o sociale?",
      quiz: {
        domanda: "Quale testo guida viene letto durante la cena rituale del Seder di Pesach?",
        opzioni: ["Il Talmud", "L'Haggadah", "La Mishnah", "Lo Zohar"],
        rispostaCorretta: 1,
        spiegazione: "L'Haggadah è il libro liturgico che contiene la narrazione dell'uscita dall'Egitto, i canti, i commenti e l'ordine delle benedizioni del Seder."
      }
    },
    'Diwali': {
      significato: `Diwali, la celebre 'Festa delle Luci' (Deepavali), è una delle festività più gioiose e sentite dell'Induismo, celebrata anche da Giainisti e Sikh.\n\nSimboleggia la vittoria spirituale della luce sulle tenebre, del bene sul male, della conoscenza sull'ignoranza. Nella tradizione classica induista commemora il ritorno trionfale del principe Rama a Ayodhya dopo 14 anni di esilio e la sconfitta del re demone Ravana.\n\nDurante i giorni di festa viene invocata in modo particolare Lakshmi, dea della prosperità, della grazia e della fortuna interiore, affinché porti armonia in ogni dimora.`,
      pratiche: [
        "L'accensione di migliaia di lampade a olio di terracotta (Diyas) poste su balconi e davanzali.",
        "La creazione di colorati disegni geometrici di benvenuto sul pavimento con polveri e petali (Rangoli).",
        "La pulizia profonda e il rinnovo delle case per accogliere l'energia positiva.",
        "Lo scambio di dolci tradizionali (Mithai) e la riconciliazione tra amici e parenti."
      ],
      collegamento: `La metafora della luce come conoscenza e risveglio interiore è universale: dal mito della caverna di Platone all'Illuminismo europeo, la lampada che arde rappresenta il rischiaramento della ragione e della coscienza contro l'oscurantismo.`,
      domanda: "Ciascuno di noi possiede una 'luce interiore': quali azioni concrete possiamo compiere a scuola per rischiarare l'isolamento o le difficoltà di un compagno?",
      quiz: {
        domanda: "Quale divinità della prosperità e della grazia viene tradizionalmente invocata durante la festa di Diwali?",
        opzioni: ["Saraswati", "Lakshmi", "Durga", "Kali"],
        rispostaCorretta: 1,
        spiegazione: "Durante Diwali si accolgono le benedizioni di Lakshmi, consorte di Vishnu, apportatrice di prosperità spirituale e materiale."
      }
    }
  };

  if (commonFallbacks[name]) {
    const item = commonFallbacks[name];
    return {
      significato: item.significato!,
      pratiche: item.pratiche!,
      collegamento: item.collegamento!,
      domanda: item.domanda!,
      quiz: item.quiz!
    };
  }

  // Fallback generico ma dettagliato per ogni altra festività
  return {
    significato: `La celebrazione di "${name}" rappresenta una pietra miliare all'interno della tradizione del ${religion}.\n\nRadicata in antichi testi e vicende spirituali, questa ricorrenza rinnova l'alleanza tra la comunità dei credenti e la dimensione del sacro, offrendo un momento privilegiato per la meditazione sul senso ultimo dell'esistenza e sulle responsabilità morali dell'individuo.\n\nAttraverso la liturgia e il ricordo, la festa non è solo una rievocazione nostalgica del passato, ma un'attualizzazione viva dei valori fondanti di pace, comunione fraterna e rinnovamento interiore.`,
    pratiche: [
      "Momenti di preghiera comunitaria e meditazione guidata nei luoghi sacri.",
      "Pratiche di condivisione di cibi tipici e gesti di ospitalità tra famiglie.",
      "Riti di purificazione simbolica e lettura dei testi sacri di riferimento.",
      "Atti di carità e solidarietà verso le persone più fragili della comunità."
    ],
    collegamento: `Questa festività evidenzia come il calendario religioso abbia storicamente scandito i ritmi civili, agricoli e artistici dei popoli, lasciando tracce profonde nella poesia, nella musica sacra e nella filosofia morale universale.`,
    domanda: `Quale insegnamento etico tramandato dalla festa di ${name} può ispirare le relazioni quotidiane e la convivenza civile tra persone di convinzioni diverse?`,
    quiz: {
      domanda: `A quale tradizione religiosa o spirituale appartiene la festività di "${name}"?`,
      opzioni: [religion, "Tradizione secolare moderna", "Misticismo filosofico antico", "Nessuna delle precedenti"],
      rispostaCorretta: 0,
      spiegazione: `"${name}" è una ricorrenza centrale custodita e celebrata all'interno della tradizione del ${religion}.`
    }
  };
}

// -------------------------------------------------------------
// Fallback Didattico Garantito per Riflessione Quotidiana
// -------------------------------------------------------------
function getFallbackDailyReflection(dateStr: string, theme: string, tradition: string, seed: number): DailyReflection {
  const quotesPool = [
    {
      testo: "La pace non è assenza di conflitti, ma la presenza di un'alternativa creativa per affrontarli.",
      autore: "Danilo Dolci",
      tradizione: "Pedagogia della nonviolenza"
    },
    {
      testo: "Ama il prossimo tuo come te stesso.",
      autore: "Levitico 19,18 / Vangelo di Matteo 22,39",
      tradizione: "Ebraismo e Cristianesimo"
    },
    {
      testo: "Il bene che fai a un altro uomo riflette la luce che hai trovato dentro di te.",
      autore: "Gialal al-Din Rumi",
      tradizione: "Sufismo / Islam"
    },
    {
      testo: "Non ferire gli altri con ciò che fa soffrire te stesso.",
      autore: "Siddharta Gautama Buddha (Udanavarga)",
      tradizione: "Buddhismo"
    },
    {
      testo: "La verità è una, ma i saggi la chiamano con molti nomi.",
      autore: "Rig Veda (I, 164, 46)",
      tradizione: "Induismo"
    },
    {
      testo: "Un viaggio di mille miglia comincia sempre con un singolo passo.",
      autore: "Laozi (Daodejing)",
      tradizione: "Taoismo"
    },
    {
      testo: "Io sono perché noi siamo: l'umanità di ciascuno è legata indissolubilmente a quella degli altri.",
      autore: "Filosofia Ubuntu",
      tradizione: "Saggezza Africana"
    }
  ];

  const selectedQuote = quotesPool[seed % quotesPool.length];

  return {
    tema: theme,
    riflessione: `Oggi la riflessione interreligiosa ci invita a soffermarci su un valore fondamentale per la convivenza umana: ${theme}.\n\nAttingendo alla sapienza custodita da ${tradition}, scopriamo che questa dimensione non è un concetto astratto o lontano, ma una forza viva che trasforma le nostre scelte quotidiane. Quando impariamo a guardare l'altro con ascolto autentico, superiamo le barriere della fretta e del pregiudizio, riconoscendo la preziosità di ogni persona.\n\nMettere in dialogo le diverse tradizioni spirituali ci rivela che, al di là dei diversi linguaggi storici, vi è un nucleo condiviso di umanità: il desiderio di giustizia, la ricerca di senso e l'impegno a costruire comunità accoglienti.`,
    citazione: selectedQuote,
    domanda: `In che modo il tema di oggi ("${theme}") può concretizzarsi in un gesto semplice ma significativo tra i banchi di scuola o in famiglia?`,
    quiz: {
      domanda: `Quale grande principio etico universale è racchiuso nella celebre 'Regola d'Oro' presente in quasi tutte le religioni?`,
      opzioni: [
        "Fai agli altri ciò che vorresti fosse fatto a te",
        "Accumula sapere per primeggiare sui tuoi compagni",
        "Evita ogni confronto per non incorrere in conflitti",
        "Segui esclusivamente i dettami della maggioranza"
      ],
      rispostaCorretta: 0,
      spiegazione: "La Regola d'Oro, presente in forme equivalenti nel Cristianesimo, Ebraismo, Islam, Induismo, Buddhismo e Confucianesimo, prescrive di trattare gli altri come vorremmo essere trattati noi stessi."
    }
  };
}
