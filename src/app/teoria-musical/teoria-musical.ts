import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  NOTE_GROUPS,
  SCALE_FORMULAS,
  CHORD_FORMULAS,
  TUNINGS,
  MAX_FRET,
  buildScale,
  buildChord,
  intervalBetween,
  intervalName,
  buildFretboardDiagram,
  chordFrets,
  type FretboardDiagram,
  type ChordFrets,
  type NoteGroup,
} from './music-theory';
import { ScoreService } from './score.service';
import { Score, ChordMark } from './score.model';

type Mode = 'scale' | 'chord' | 'interval';
type Tab = 'teoria' | 'scores';

interface ScoreLine {
  chordLine: string;
  lyricLine: string;
}

@Component({
  selector: 'app-teoria-musical',
  imports: [RouterLink],
  templateUrl: './teoria-musical.html',
  styleUrl: './teoria-musical.scss',
})
export class TeoriaMusical implements OnInit {
  private scoreService = inject(ScoreService);

  scores = signal<Score[]>([]);
  selectedScore = signal<Score | null>(null);
  scoreLines = signal<ScoreLine[]>([]);

  readonly noteGroups: NoteGroup[] = NOTE_GROUPS;
  readonly scaleNames = Object.keys(SCALE_FORMULAS);
  readonly chordNames = Object.keys(CHORD_FORMULAS);
  readonly maxFret = MAX_FRET;
  readonly fretNumbers = Array.from({ length: MAX_FRET + 1 }, (_, i) => i);

  readonly tab = signal<Tab>('teoria');
  readonly mode = signal<Mode>('scale');
  readonly selectedNote = signal<string | null>(null);
  readonly selectedNote2 = signal<string | null>(null);
  readonly selectedScale = signal<string | null>(null);
  readonly selectedChord = signal<string | null>(null);

  readonly scaleResult = computed(() => {
    const root = this.selectedNote();
    const formula = this.selectedScale();
    if (!root || !formula) return null;
    const notes = buildScale(root, formula);
    const diagrams = TUNINGS.map(t => buildFretboardDiagram(t, notes, root));
    return { notes, diagrams, title: `Escala ${formula} de ${root}` };
  });

  readonly chordResult = computed(() => {
    const root = this.selectedNote();
    const formula = this.selectedChord();
    if (!root || !formula) return null;
    const notes = buildChord(root, formula);
    const frets = TUNINGS.map(t => chordFrets(t, notes));
    const diagrams = TUNINGS.map(t => buildFretboardDiagram(t, notes, root));
    return { notes, frets, diagrams, title: `Acorde ${root} ${formula}` };
  });

  readonly intervalResult = computed(() => {
    const n1 = this.selectedNote();
    const n2 = this.selectedNote2();
    if (!n1 || !n2) return null;
    const semitones = intervalBetween(n1, n2);
    const name = intervalName(semitones);
    return { semitones, name, note1: n1, note2: n2 };
  });

  setMode(mode: Mode) {
    this.mode.set(mode);
    this.selectedNote.set(null);
    this.selectedNote2.set(null);
    this.selectedScale.set(null);
    this.selectedChord.set(null);
  }

  selectNote(note: string) {
    this.selectedNote.set(note);
  }

  selectNote2(note: string) {
    this.selectedNote2.set(note);
  }

  selectScale(name: string) {
    this.selectedScale.set(name);
  }

  selectChord(name: string) {
    this.selectedChord.set(name);
  }

  formatFret(fret: number | null): string {
    return fret === null ? 'X' : String(fret);
  }

  ngOnInit() {
    this.scoreService.getScores().subscribe(scores => this.scores.set(scores));
  }

  openScore(score: Score) {
    this.selectedScore.set(score);
    this.scoreLines.set(this.buildScoreLines(score));
  }

  closeScore() {
    this.selectedScore.set(null);
    this.scoreLines.set([]);
  }

  private buildScoreLines(score: Score): ScoreLine[] {
    const lines = score.lyrics.split('\n');
    const chordsByLine: Map<number, ChordMark[]> = new Map();

    let globalPos = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineStart = globalPos;
      const lineEnd = globalPos + lines[i].length;
      const lineChords = score.chords
        .filter(c => c.position >= lineStart && c.position < lineEnd)
        .map(c => ({ ...c, position: c.position - lineStart }));
      if (lineChords.length > 0) {
        chordsByLine.set(i, lineChords);
      }
      globalPos = lineEnd + 1;
    }

    return lines.map((line, i) => {
      const lineChords = chordsByLine.get(i) || [];
      let chordLine = '';
      if (lineChords.length > 0) {
        const chars = new Array(line.length).fill(' ');
        for (const cm of lineChords) {
          const name = cm.chord;
          for (let j = 0; j < name.length && cm.position + j < chars.length; j++) {
            chars[cm.position + j] = name[j];
          }
        }
        chordLine = chars.join('').trimEnd();
      }
      return { chordLine, lyricLine: line };
    });
  }
}
