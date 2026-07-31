import { useEffect, useState } from "react";
import { fetchSongs } from "../lib/api";
import type { Song } from "../lib/db";

const TEMPOS_LITURGICOS = ["Advento", "Natal", "Quaresma", "Páscoa", "Tempo Comum", "Pentecostes"];
const MOMENTOS_MISSA = [
  "Entrada", "Ato Penitencial", "Glória", "Salmo", "Aclamação",
  "Ofertório", "Santo", "Comunhão", "Pós-Comunhão", "Final",
];

interface Props {
  onSelect: (song: Song) => void;
}

export default function SongLibrary({ onSelect }: Props) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [busca, setBusca] = useState("");
  const [tempoLiturgico, setTempoLiturgico] = useState("");
  const [momento, setMomento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params: Record<string, string> = {};
    if (busca) params.busca = busca;
    if (tempoLiturgico) params.tempo_liturgico = tempoLiturgico;
    if (momento) params.momento_missa = momento;
    fetchSongs(params).then((data) => {
      setSongs(data);
      setCarregando(false);
    });
  }, [busca, tempoLiturgico, momento]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {offline && (
        <div className="mb-4 px-3 py-2 rounded bg-amber-100 text-amber-800 text-sm text-center">
          Você está offline — mostrando músicas salvas no dispositivo.
        </div>
      )}

      <h1 className="text-2xl font-bold text-brand-700 mb-4">Catolichord+</h1>

      <input
        type="text"
        placeholder="Buscar por título, autor ou trecho da letra..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={tempoLiturgico}
          onChange={(e) => setTempoLiturgico(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="">Tempo litúrgico</option>
          {TEMPOS_LITURGICOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={momento}
          onChange={(e) => setMomento(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="">Momento da missa</option>
          {MOMENTOS_MISSA.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {(tempoLiturgico || momento || busca) && (
          <button
            onClick={() => { setTempoLiturgico(""); setMomento(""); setBusca(""); }}
            className="text-sm text-brand-600 underline"
          >
            limpar filtros
          </button>
        )}
      </div>

      {carregando ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : songs.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma música encontrada.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {songs.map((song) => (
            <li
              key={song.id}
              onClick={() => onSelect(song)}
              className="p-3 hover:bg-brand-50 cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-800">{song.titulo}</p>
                {song.autor && <p className="text-xs text-gray-500">{song.autor}</p>}
              </div>
              <span className="text-xs font-mono text-brand-600">{song.tom_original}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
