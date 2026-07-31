// Transposição de cifras — mesma lógica do backend (app/transpose.py),
// reimplementada em TS para funcionar 100% offline no cliente.

const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#", Cb: "B", Fb: "E",
};

const CHORD_RE = /\[([A-G](?:#|b)?)([^/\]]*)(?:\/([A-G](?:#|b)?))?\]/g;

function normalize(note: string): string {
  return FLAT_TO_SHARP[note] ?? note;
}

function shift(note: string, semitons: number): string {
  const norm = normalize(note);
  const idx = NOTES_SHARP.indexOf(norm);
  const newIdx = ((idx + semitons) % 12 + 12) % 12;
  return NOTES_SHARP[newIdx];
}

export function transposeCifra(cifra: string, semitons: number): string {
  if (semitons % 12 === 0) return cifra;
  return cifra.replace(CHORD_RE, (_match, root: string, suffix: string, bass?: string) => {
    const newRoot = shift(root, semitons);
    let result = `[${newRoot}${suffix}`;
    if (bass) result += `/${shift(bass, semitons)}`;
    result += "]";
    return result;
  });
}

export function transposeKey(tom: string, semitons: number): string {
  return shift(tom, semitons);
}

/** Renderiza a cifra em texto (com [Acordes]) como blocos {chord, lyric} para exibição. */
export function parseCifraLine(line: string): { chord: string | null; lyric: string }[] {
  const parts: { chord: string | null; lyric: string }[] = [];
  let lastIndex = 0;
  let currentChord: string | null = null;
  const re = /\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    const textBefore = line.slice(lastIndex, match.index);
    if (textBefore) parts.push({ chord: currentChord, lyric: textBefore });
    currentChord = match[1];
    lastIndex = re.lastIndex;
  }
  const rest = line.slice(lastIndex);
  parts.push({ chord: currentChord, lyric: rest });
  return parts;
}
