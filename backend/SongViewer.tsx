import { useMemo, useState } from "react";
import { parseCifraLine, transposeCifra, transposeKey } from "../lib/transpose";
import type { Song } from "../lib/db";

interface Props {
  song: Song;
  onEdit?: () => void;
}

export default function SongViewer({ song, onEdit }: Props) {
  const [semitons, setSemitons] = useState(0);
  const [modoApresentacao, setModoApresentacao] = useState(false);
  const [fonteGrande, setFonteGrande] = useState(false);
  const [rolagemAtiva, setRolagemAtiva] = useState(false);
  const [somenteLetra, setSomenteLetra] = useState(false);

  const cifraTransposta = useMemo(
    () => transposeCifra(song.cifra, semitons),
    [song.cifra, semitons]
  );
  const tomAtual = useMemo(
    () => transposeKey(song.tom_original, semitons),
    [song.tom_original, semitons]
  );

  const linhasParseadas = useMemo(() => {
    const linhas = cifraTransposta.split("\n").map((linha) => parseCifraLine(linha));
    if (!somenteLetra) return linhas;
    // no modo "só letra", remove linhas que só tinham acorde (sem nenhuma letra)
    return linhas.filter((partes) => partes.some((p) => p.lyric.trim() !== ""));
  }, [cifraTransposta, somenteLetra]);

  return (
    <div
      className={
        modoApresentacao
          ? "fixed inset-0 z-50 bg-black text-white overflow-y-auto p-6"
          : "bg-white rounded-xl shadow-sm border border-brand-100 p-6"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className={modoApresentacao ? "text-2xl font-bold" : "text-xl font-bold text-brand-700"}>
            {song.titulo}
          </h2>
          {song.autor && (
            <p className={modoApresentacao ? "text-gray-300" : "text-gray-500 text-sm"}>{song.autor}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-brand-50 text-brand-700 font-mono">
            Tom: {tomAtual}
          </span>
          {song.bpm && (
            <span className="px-2 py-1 rounded bg-brand-50 text-brand-700">BPM {song.bpm}</span>
          )}
          {song.capotraste > 0 && (
            <span className="px-2 py-1 rounded bg-brand-50 text-brand-700">
              Capo {song.capotraste}ª
            </span>
          )}
          {!modoApresentacao && onEdit && (
            <button
              onClick={onEdit}
              className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setSemitons((s) => s - 1)}
          disabled={somenteLetra}
          className="px-3 py-1 rounded border border-brand-400 text-brand-600 hover:bg-brand-50 disabled:opacity-40"
          aria-label="Transpor um semitom abaixo"
        >
          −1
        </button>
        <button
          onClick={() => setSemitons(0)}
          disabled={somenteLetra}
          className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 text-xs disabled:opacity-40"
        >
          original
        </button>
        <button
          onClick={() => setSemitons((s) => s + 1)}
          disabled={somenteLetra}
          className="px-3 py-1 rounded border border-brand-400 text-brand-600 hover:bg-brand-50 disabled:opacity-40"
          aria-label="Transpor um semitom acima"
        >
          +1
        </button>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <button
          onClick={() => setSomenteLetra((v) => !v)}
          className={`px-3 py-1 rounded border text-sm ${
            somenteLetra
              ? "bg-brand-600 text-white border-brand-600"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {somenteLetra ? "Mostrar cifra" : "Só letra"}
        </button>
        <button
          onClick={() => setFonteGrande((v) => !v)}
          className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
        >
          {fonteGrande ? "Fonte normal" : "Fonte grande"}
        </button>
        <button
          onClick={() => setRolagemAtiva((v) => !v)}
          className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
        >
          {rolagemAtiva ? "Parar rolagem" : "Rolagem automática"}
        </button>
        <button
          onClick={() => setModoApresentacao((v) => !v)}
          className="px-3 py-1 rounded bg-brand-600 text-white text-sm hover:bg-brand-700"
        >
          {modoApresentacao ? "Sair do modo apresentação" : "Modo apresentação"}
        </button>
      </div>

      <div
        className={`font-mono whitespace-pre-wrap leading-8 ${
          fonteGrande ? "text-2xl" : "text-base"
        }`}
        style={
          rolagemAtiva
            ? { animation: "autoscroll 60s linear forwards" }
            : undefined
        }
      >
        {linhasParseadas.map((partes, i) => (
          <div key={i} className="mb-1">
            {partes.map((part, j) => (
              <span key={j}>
                {part.chord && !somenteLetra && (
                  <sup
                    className={
                      modoApresentacao
                        ? "text-brand-400 font-bold mr-0.5"
                        : "text-brand-600 font-bold mr-0.5"
                    }
                  >
                    {part.chord}
                  </sup>
                )}
                {part.lyric}
              </span>
            ))}
          </div>
        ))}
      </div>

      {song.observacoes && !modoApresentacao && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <strong>Observações:</strong> {song.observacoes}
        </div>
      )}

      <style>{`
        @keyframes autoscroll {
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
