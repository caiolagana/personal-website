export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

export const NOTE_TO_VALUE: Record<string, number> = {};
CHROMATIC_SHARPS.forEach((name, i) => NOTE_TO_VALUE[name] = i);
CHROMATIC_FLATS.forEach((name, i) => NOTE_TO_VALUE[name] = i);

export const ALL_NOTE_NAMES = [...new Set([...CHROMATIC_SHARPS, ...CHROMATIC_FLATS])];

export const INTERVALS: Record<string, number> = {
  'uníssono': 0,
  'segunda menor': 1,
  'segunda maior': 2,
  'terça menor': 3,
  'terça maior': 4,
  'quarta justa': 5,
  'quarta aumentada': 6,
  'quinta diminuta': 6,
  'quinta justa': 7,
  'quinta aumentada': 8,
  'sexta menor': 8,
  'sexta maior': 9,
  'sétima menor': 10,
  'sétima maior': 11,
  'oitava': 12,
};

const T = 2;
const S = 1;

export const SCALE_FORMULAS: Record<string, number[]> = {
  'maior': [T, T, S, T, T, T, S],
  'menor natural': [T, S, T, T, S, T, T],
  'menor harmônica': [T, S, T, T, S, T + S, S],
  'menor melódica': [T, S, T, T, T, T, S],
  'pentatônica maior': [T, T, T + S, T, T + S],
  'pentatônica menor': [T + S, T, T, T + S, T],
  'blues': [T + S, T, S, S, T + S, T],
  'cromática': Array(12).fill(S),
  'dórica': [T, S, T, T, T, S, T],
  'frígia': [S, T, T, T, S, T, T],
  'lídia': [T, T, T, S, T, T, S],
  'mixolídia': [T, T, S, T, T, S, T],
  'lócria': [S, T, T, S, T, T, T],
};

export const CHORD_FORMULAS: Record<string, number[]> = {
  'maior': [0, 4, 7],
  'menor': [0, 3, 7],
  'diminuto': [0, 3, 6],
  'aumentado': [0, 4, 8],
  'maior com sétima maior': [0, 4, 7, 11],
  'dominante (7)': [0, 4, 7, 10],
  'menor com sétima': [0, 3, 7, 10],
  'meio-diminuto': [0, 3, 6, 10],
  'diminuto com sétima': [0, 3, 6, 9],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  'maior com nona': [0, 4, 7, 11, 14],
  'dominante com nona': [0, 4, 7, 10, 14],
  'menor com nona': [0, 3, 7, 10, 14],
};

export interface Tuning {
  name: string;
  label: string;
  strings: string[];
}

export const TUNINGS: Tuning[] = [
  { name: 'viola_caipira_rio_abaixo', label: 'Viola Caipira (Rio Abaixo)', strings: ['G', 'D', 'G', 'B', 'D'] },
  { name: 'viola_caipira_cebolao_D', label: 'Viola Caipira (Cebolão em D)', strings: ['A', 'D', 'F#', 'A', 'D'] },
  { name: 'viola_caipira_cebolao_E', label: 'Viola Caipira (Cebolão em E)', strings: ['E', 'B', 'G#', 'E', 'B'] },
];

export const MAX_FRET = 14;

function chromaticFor(root: string): string[] {
  if (FLAT_KEYS.has(root) || root.includes('b')) {
    return CHROMATIC_FLATS;
  }
  return CHROMATIC_SHARPS;
}

export function noteValue(name: string): number {
  return NOTE_TO_VALUE[name];
}

export function noteName(value: number, root: string = 'C'): string {
  return chromaticFor(root)[((value % 12) + 12) % 12];
}

export function buildScale(root: string, formulaName: string): string[] {
  const formula = SCALE_FORMULAS[formulaName];
  let value = noteValue(root);
  const chromatic = chromaticFor(root);
  const notes = [chromatic[value % 12]];
  for (const step of formula) {
    value += step;
    notes.push(chromatic[value % 12]);
  }
  return notes;
}

export function buildChord(root: string, formulaName: string): string[] {
  const formula = CHORD_FORMULAS[formulaName];
  const base = noteValue(root);
  const chromatic = chromaticFor(root);
  return formula.map(interval => chromatic[(base + interval) % 12]);
}

export function intervalBetween(note1: string, note2: string): number {
  return ((noteValue(note2) - noteValue(note1)) % 12 + 12) % 12;
}

export function intervalName(semitones: number): string {
  semitones = ((semitones % 12) + 12) % 12;
  for (const [name, value] of Object.entries(INTERVALS)) {
    if (value === semitones) {
      return name;
    }
  }
  return `${semitones} semitons`;
}

export interface FretboardCell {
  note: string | null;
  isRoot: boolean;
  fret: number;
}

export interface FretboardRow {
  openNote: string;
  stringNumber: number;
  cells: FretboardCell[];
}

export interface FretboardDiagram {
  tuningName: string;
  tuningLabel: string;
  root: string;
  rows: FretboardRow[];
}

export function buildFretboardDiagram(tuning: Tuning, scaleNotes: string[], root: string): FretboardDiagram {
  const scaleValues = new Set(scaleNotes.map(n => noteValue(n)));
  const rootValue = noteValue(root);
  const chromatic = chromaticFor(root);

  const rows: FretboardRow[] = tuning.strings.map((openNote, i) => {
    const openVal = noteValue(openNote);
    const cells: FretboardCell[] = [];
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      const val = (openVal + fret) % 12;
      if (scaleValues.has(val)) {
        cells.push({ note: chromatic[val], isRoot: val === rootValue, fret });
      } else {
        cells.push({ note: null, isRoot: false, fret });
      }
    }
    return { openNote, stringNumber: i + 1, cells };
  });

  return { tuningName: tuning.name, tuningLabel: tuning.label, root, rows };
}

export interface ChordFrets {
  tuningLabel: string;
  tuningStrings: string[];
  frets: (number | null)[];
}

export function chordFrets(tuning: Tuning, chordNotes: string[]): ChordFrets {
  const chordValues = new Set(chordNotes.map(n => noteValue(n)));
  const frets: (number | null)[] = tuning.strings.map(openNote => {
    const openVal = noteValue(openNote);
    for (let fret = 0; fret <= MAX_FRET; fret++) {
      if (chordValues.has((openVal + fret) % 12)) {
        return fret;
      }
    }
    return null;
  });
  return { tuningLabel: tuning.label, tuningStrings: tuning.strings, frets };
}

export interface NoteGroup {
  natural: string | null;
  sharp: string | null;
  flat: string | null;
}

export const NOTE_GROUPS: NoteGroup[] = [
  { natural: 'C', sharp: null, flat: null },
  { natural: null, sharp: 'C#', flat: 'Db' },
  { natural: 'D', sharp: null, flat: null },
  { natural: null, sharp: 'D#', flat: 'Eb' },
  { natural: 'E', sharp: null, flat: null },
  { natural: 'F', sharp: null, flat: null },
  { natural: null, sharp: 'F#', flat: 'Gb' },
  { natural: 'G', sharp: null, flat: null },
  { natural: null, sharp: 'G#', flat: 'Ab' },
  { natural: 'A', sharp: null, flat: null },
  { natural: null, sharp: 'A#', flat: 'Bb' },
  { natural: 'B', sharp: null, flat: null },
];
