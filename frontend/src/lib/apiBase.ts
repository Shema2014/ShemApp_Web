// Em desenvolvimento local, o Vite faz proxy de "/api" para o backend (ver vite.config.ts).
// Em produção, defina VITE_API_URL com a URL pública do backend
// (ex: https://catolichord-api.up.railway.app) nas variáveis de ambiente do Vercel/Netlify.
export const API_BASE = import.meta.env.VITE_API_URL || "/api";
