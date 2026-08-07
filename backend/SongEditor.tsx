import { useState } from "react";
import { updateSong } from "../lib/api";
import type { Song, SongTag } from "../lib/db";

interface Props {
  song: Song;
  onSaved: (updated: Song) => void;
  onCancel: () => void;
}

const TEMPOS_LITURGICOS = ["Advento", "Natal", "Quaresma", "Páscoa", "Tempo Comum", "Pentecostes"];
const MOMENTOS_MISSA = [
  "Entrada", "Ato Penitencial", "Glória", "Salmo", "Aclamação",
  "Ofertório", "Santo", "Comunhão", "Pós-Comunhão", "Final",
];
const TIPOS_CELEBRACAO = [
  "Missa", "Casamento", "Batizado", "Crisma", "Adoração",
  "Via Sacra", "Grupo de oração", "ECC", "Encontro de Jovens",
];

export default function SongEditor({ song, onSaved, onCancel }: Props) {
  const [titulo, setTitulo] = useState(song.titulo);
  const [autor, setAutor] = useState(song.autor ?? "");
  const [tom, setTom] = useState(song.tom_original);
  const [capo, setCapo] = useState(song.capotraste);
  const [bpm, setBpm] = useState(song.bpm?.toString() ?? "");
  const [introducao, setIntroducao] = useState(song.introducao ?? "");
  const [cifra, setCifra] = useState(song.cifra);
  const [observacoes, setObservacoes] = useState(song.observacoes ?? "");
  const [tags, setTags] = useState<SongTag[]>(song.tags ?? []);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function tagAtiva(categoria: string, valor: string) {
    return tags.some((t) => t.categoria === categoria && t.valor === valor);
  }

  function toggleTag(categoria: string, valor: string) {
    setTags((prev) => {
      const existe = prev.some((t) => t.categoria === categoria && t.valor === valor);
      if (existe) return prev.filter((t) => !(t.categoria === categoria && t.valor === valor));
      // pra tempo_liturgico, tipo_celebracao e momento_missa, só uma seleção por categoria
      const semCategoria = prev.filter((t) => t.categoria !== categoria);
      return [...semCategoria, { categoria, valor }];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      const atualizado = await updateSong(song.id, {
        titulo,
        autor: autor || null,
        tom_original: tom,
        capotraste: capo,
        bpm: bpm ? Number(bpm) : null,
        introducao: introducao || null,
        cifra,
        observacoes: observacoes || null,
        tags,
      });
      onSaved(atualizado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
      <h2 className="text-xl font-bold text-brand-700 mb-4">Editar música</h2>

      <label className="block text-xs text-gray-500 mb-1">Título</label>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm"
      />

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Autor</label>
          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tom original</label>
          <input
            type="text"
            value={tom}
            onChange={(e) => setTom(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Capotraste</label>
          <input
            type="number"
            min={0}
            max={11}
            value={capo}
            onChange={(e) => setCapo(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Introdução</label>
          <input
            type="text"
            value={introducao}
            onChange={(e) => setIntroducao(e.target.value)}
            placeholder="ex: 4 compassos"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="block text-xs text-gray-500 mb-1">
        Cifra (use colchetes para acordes, ex: <code>[C]Vem, ó [G]Espírito</code>)
      </label>
      <textarea
        value={cifra}
        onChange={(e) => setCifra(e.target.value)}
        rows={12}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm font-mono"
      />

      <label className="block text-xs text-gray-500 mb-1">Observações</label>
      <textarea
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        rows={2}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm"
      />

      <div className="mb-2">
        <p className="text-xs text-gray-500 mb-1">Tempo litúrgico</p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPOS_LITURGICOS.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => toggleTag("tempo_liturgico", v)}
              className={`px-2 py-1 rounded-full text-xs border ${
                tagAtiva("tempo_liturgico", v)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-gray-500 mb-1">Momento da missa</p>
        <div className="flex flex-wrap gap-1.5">
          {MOMENTOS_MISSA.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => toggleTag("momento_missa", v)}
              className={`px-2 py-1 rounded-full text-xs border ${
                tagAtiva("momento_missa", v)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Tipo de celebração</p>
        <div className="flex flex-wrap gap-1.5">
          {TIPOS_CELEBRACAO.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => toggleTag("tipo_celebracao", v)}
              className={`px-2 py-1 rounded-full text-xs border ${
                tagAtiva("tipo_celebracao", v)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {erro && <p className="text-sm text-red-600 mb-3">{erro}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
