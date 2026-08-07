import { cacheSongs, getCachedSongs, type Song, type SongTag } from "./db";
import { API_BASE } from "./apiBase";

export async function fetchSongs(params?: Record<string, string>): Promise<Song[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  try {
    const res = await fetch(`${API_BASE}/songs${qs}`);
    if (!res.ok) throw new Error("Falha na API");
    const songs: Song[] = await res.json();
    // Só cacheia a lista completa (sem filtro) pra não sobrescrever o acervo offline
    if (!params || Object.keys(params).length === 0) {
      await cacheSongs(songs);
    }
    return songs;
  } catch {
    // Offline: serve do IndexedDB local
    const cached = await getCachedSongs();
    return cached;
  }
}

export async function fetchSong(id: number): Promise<Song | undefined> {
  try {
    const res = await fetch(`${API_BASE}/songs/${id}`);
    if (!res.ok) throw new Error("Falha na API");
    const song: Song = await res.json();
    await cacheSongs([song]);
    return song;
  } catch {
    const cached = await getCachedSongs();
    return cached.find((s) => s.id === id);
  }
}

export interface SongUpdatePayload {
  titulo?: string;
  autor?: string | null;
  tom_original?: string;
  capotraste?: number;
  bpm?: number | null;
  compasso?: string;
  introducao?: string | null;
  finalizacao?: string | null;
  cifra?: string;
  observacoes?: string | null;
  tags?: SongTag[];
}

export async function updateSong(id: number, payload: SongUpdatePayload): Promise<Song> {
  const res = await fetch(`${API_BASE}/songs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Não foi possível salvar as alterações");
  }
  const song: Song = await res.json();
  await cacheSongs([song]);
  return song;
}
