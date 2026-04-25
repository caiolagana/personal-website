export interface ChordMark {
  chord: string;
  position: number;
}

export interface Score {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  chords: ChordMark[];
}
