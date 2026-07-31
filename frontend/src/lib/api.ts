import { cacheSongs, getCachedSongs, type Song } from "./db";
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
