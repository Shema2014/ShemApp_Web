import { useState } from "react";
import SongLibrary from "./components/SongLibrary";
import SongViewer from "./components/SongViewer";
import LoginScreen from "./components/LoginScreen";
import CelebracoesScreen from "./components/CelebracoesScreen";
import { AuthProvider, useAuth } from "./lib/auth";
import type { Song } from "./lib/db";

type Aba = "biblioteca" | "escalas";

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [aba, setAba] = useState<Aba>("biblioteca");
  const [selected, setSelected] = useState<Song | null>(null);

  if (loading) return null;
  if (!user) return <LoginScreen />;

  if (selected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-4">
          <button
            onClick={() => setSelected(null)}
            className="mb-4 text-brand-600 text-sm underline"
          >
            ← voltar para a biblioteca
          </button>
          <SongViewer song={selected} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-brand-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setAba("biblioteca")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                aba === "biblioteca" ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Biblioteca
            </button>
            <button
              onClick={() => setAba("escalas")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                aba === "escalas" ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Escalas
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{user.nome}</span>
            <button onClick={logout} className="text-xs text-brand-600 underline">
              sair
            </button>
          </div>
        </div>
      </nav>

      {aba === "biblioteca" ? (
        <SongLibrary onSelect={setSelected} />
      ) : (
        <CelebracoesScreen />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
