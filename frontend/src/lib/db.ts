import Dexie, { type Table } from "dexie";

export interface SongTag {
  categoria: string;
  valor: string;
}

export interface Song {
  id: number;
  titulo: string;
  autor?: string;
  tom_original: string;
  capotraste: number;
  bpm?: number;
  compasso?: string;
  introducao?: string;
  finalizacao?: string;
  cifra: string;
  observacoes?: string;
  tags: SongTag[];
  favorito?: boolean;
  atualizado_em?: string;
}

export interface PendingChange {
  id?: number;
  tipo: "nota" | "favorito";
  song_id: number;
  payload: string;
  criado_em: string;
}

class CatolichordDB extends Dexie {
  songs!: Table<Song, number>;
  pendingChanges!: Table<PendingChange, number>;

  constructor() {
    super("catolichord-plus");
    this.version(1).stores({
      songs: "id, titulo, autor, favorito",
      pendingChanges: "++id, song_id, tipo",
    });
  }
}

export const db = new CatolichordDB();

/** Salva/atualiza músicas localmente para acesso 100% offline. */
export async function cacheSongs(songs: Song[]): Promise<void> {
  await db.songs.bulkPut(songs);
}

export async function getCachedSongs(): Promise<Song[]> {
  return db.songs.toArray();
}

export async function toggleFavorito(songId: number, favorito: boolean): Promise<void> {
  await db.songs.update(songId, { favorito });
  await db.pendingChanges.add({
    tipo: "favorito",
    song_id: songId,
    payload: JSON.stringify({ favorito }),
    criado_em: new Date().toISOString(),
  });
}
