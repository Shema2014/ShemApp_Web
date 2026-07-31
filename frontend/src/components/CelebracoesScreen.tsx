import { useEffect, useState } from "react";
import { useAuth, apiFetch } from "../lib/auth";

interface EscalaItem {
  id: number;
  user_id: number;
  nome_usuario: string;
  funcao: string;
  status: "pendente" | "confirmado" | "recusado";
}

interface Celebracao {
  id: number;
  titulo: string;
  tipo_celebracao: string | null;
  data_hora: string;
  local: string | null;
  escala: EscalaItem[];
}

interface Membro {
  id: number;
  nome: string;
  funcoes: string[];
}

const FUNCOES = ["Vocal", "Violão", "Guitarra", "Baixo", "Teclado", "Bateria", "Percussão", "Sopros", "Som"];

const STATUS_STYLE: Record<string, string> = {
  pendente: "bg-gray-100 text-gray-600",
  confirmado: "bg-green-100 text-green-700",
  recusado: "bg-red-100 text-red-700",
};

export default function CelebracoesScreen() {
  const { user, token } = useAuth();
  const [celebracoes, setCelebracoes] = useState<Celebracao[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  async function carregar() {
    setCarregando(true);
    const [cels, users] = await Promise.all([
      apiFetch(token, "/celebracoes"),
      apiFetch(token, "/users"),
    ]);
    setCelebracoes(cels);
    setMembros(users);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmarPresenca(celebracaoId: number, itemId: number, status: string) {
    await apiFetch(token, `/celebracoes/${celebracaoId}/escala/${itemId}?status=${status}`, {
      method: "PATCH",
    });
    carregar();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-brand-700">Escalas</h1>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700"
        >
          {mostrarForm ? "Cancelar" : "+ Nova celebração"}
        </button>
      </div>

      {mostrarForm && (
        <NovaCelebracaoForm
          membros={membros}
          onCriada={() => {
            setMostrarForm(false);
            carregar();
          }}
        />
      )}

      {carregando ? (
        <p className="text-gray-400 text-sm">Carregando...</p>
      ) : celebracoes.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma celebração futura agendada.</p>
      ) : (
        <div className="space-y-4">
          {celebracoes.map((cel) => (
            <div key={cel.id} className="bg-white rounded-xl border border-brand-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-gray-800">{cel.titulo}</h2>
                <span className="text-xs text-gray-500">
                  {new Date(cel.data_hora).toLocaleString("pt-BR", {
                    weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              {cel.local && <p className="text-xs text-gray-500 mb-3">{cel.local}</p>}

              <ul className="divide-y divide-gray-100">
                {cel.escala.map((item) => (
                  <li key={item.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">{item.nome_usuario}</span>
                      <span className="text-gray-400"> — {item.funcao}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[item.status]}`}>
                        {item.status}
                      </span>

                      {user?.id === item.user_id && item.status === "pendente" && (
                        <>
                          <button
                            onClick={() => confirmarPresenca(cel.id, item.id, "confirmado")}
                            className="text-xs px-2 py-0.5 rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => confirmarPresenca(cel.id, item.id, "recusado")}
                            className="text-xs px-2 py-0.5 rounded border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Recusar
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NovaCelebracaoForm({ membros, onCriada }: { membros: Membro[]; onCriada: () => void }) {
  const { token } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [local, setLocal] = useState("");
  const [escala, setEscala] = useState<{ user_id: number; funcao: string }[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function addEscalaItem() {
    if (membros.length === 0) return;
    setEscala((prev) => [...prev, { user_id: membros[0].id, funcao: FUNCOES[0] }]);
  }

  function updateEscalaItem(idx: number, field: "user_id" | "funcao", value: string) {
    setEscala((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: field === "user_id" ? Number(value) : value } : item
      )
    );
  }

  function removeEscalaItem(idx: number) {
    setEscala((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await apiFetch(token, "/celebracoes", {
        method: "POST",
        body: JSON.stringify({
          titulo,
          data_hora: new Date(dataHora).toISOString(),
          local,
          escala,
        }),
      });
      onCriada();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao criar celebração");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-brand-100 shadow-sm p-4 mb-4">
      <input
        type="text"
        placeholder="Título (ex: Missa Domingo 19h)"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 text-sm"
      />
      <div className="flex gap-2 mb-2">
        <input
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          required
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Local"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <p className="text-xs text-gray-500 mb-2 mt-3">Escalar músicos:</p>
      {escala.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <select
            value={item.user_id}
            onChange={(e) => updateEscalaItem(idx, "user_id", e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {membros.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          <select
            value={item.funcao}
            onChange={(e) => updateEscalaItem(idx, "funcao", e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {FUNCOES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeEscalaItem(idx)}
            className="text-red-500 text-sm px-2"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addEscalaItem}
        className="text-xs text-brand-600 underline mb-3"
      >
        + adicionar músico à escala
      </button>

      {erro && <p className="text-sm text-red-600 mb-2">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {enviando ? "Salvando..." : "Criar celebração"}
      </button>
    </form>
  );
}
