import { useState } from "react";
import { useAuth } from "../lib/auth";

const FUNCOES_DISPONIVEIS = [
  "Vocal", "Violão", "Guitarra", "Baixo", "Teclado",
  "Bateria", "Percussão", "Sopros", "Som",
];

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [funcoes, setFuncoes] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function toggleFuncao(f: string) {
    setFuncoes((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (modo === "login") {
        await login(email, senha);
      } else {
        await register(nome, email, senha, funcoes);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Algo deu errado");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-brand-100 p-6"
      >
        <h1 className="text-2xl font-bold text-brand-700 mb-1">Catolichord+</h1>
        <p className="text-sm text-gray-500 mb-5">
          {modo === "login" ? "Entre com sua conta do ministério" : "Crie sua conta no ministério"}
        </p>

        {modo === "cadastro" && (
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        )}

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          minLength={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        {modo === "cadastro" && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Suas funções no ministério:</p>
            <div className="flex flex-wrap gap-2">
              {FUNCOES_DISPONIVEIS.map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFuncao(f)}
                  className={`px-2 py-1 rounded-full text-xs border ${
                    funcoes.includes(f)
                      ? "bg-brand-600 text-white border-brand-600"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {erro && <p className="text-sm text-red-600 mb-3">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-brand-600 text-white rounded-lg py-2 font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {enviando ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
        </button>

        <button
          type="button"
          onClick={() => setModo(modo === "login" ? "cadastro" : "login")}
          className="w-full text-center text-sm text-brand-600 underline mt-3"
        >
          {modo === "login" ? "Ainda não tenho conta" : "Já tenho conta, entrar"}
        </button>
      </form>
    </div>
  );
}
