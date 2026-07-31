"""
Transposição de cifras no padrão brasileiro: acordes marcados entre colchetes
dentro do texto da letra, ex: "[C]Vem, ó [G]Espírito de [Am/E]Deus".

Suporta: nota base (A-G), sustenido (#) ou bemol (b), sufixos (m, 7, maj7, sus4,
dim, aug, 9, 11, 13, add9 ...) e baixo/inversão após "/".
"""
import re

NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
FLAT_TO_SHARP = {
    "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#",
    "Cb": "B", "Fb": "E",
}

# Captura: nota raiz [A-G](#|b)? + resto do acorde (sufixo) + baixo opcional (/nota)
CHORD_RE = re.compile(
    r"\[([A-G](?:#|b)?)([^/\]]*)(?:/([A-G](?:#|b)?))?\]"
)


def _normalize(note: str) -> str:
    return FLAT_TO_SHARP.get(note, note)


def _shift(note: str, semitons: int) -> str:
    note = _normalize(note)
    idx = NOTES_SHARP.index(note)
    new_idx = (idx + semitons) % 12
    return NOTES_SHARP[new_idx]


def transpose_chord(match: re.Match, semitons: int) -> str:
    root, suffix, bass = match.group(1), match.group(2), match.group(3)
    new_root = _shift(root, semitons)
    result = f"[{new_root}{suffix}"
    if bass:
        result += f"/{_shift(bass, semitons)}"
    result += "]"
    return result


def transpose_cifra(cifra: str, semitons: int) -> str:
    if semitons % 12 == 0:
        return cifra
    return CHORD_RE.sub(lambda m: transpose_chord(m, semitons), cifra)


def transpose_key(tom: str, semitons: int) -> str:
    """Transpõe apenas o nome de um tom, ex: 'D' + 2 -> 'E'."""
    return _shift(tom, semitons)
