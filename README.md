#ShemAppWeb

Plataforma para ministérios de música católicos — biblioteca de cifras, organização
litúrgica, repertórios e modo apresentação, com funcionamento **offline (PWA)**.

> **Indo para produção?** Veja `MIGRATION.md` para o passo a passo de migrar o banco
> para o Supabase e publicar o app (backend no Railway/Render, frontend na Vercel).

## O que já está implementado (núcleo)

- **Backend (FastAPI + SQLite/SQLModel)**
  - CRUD de músicas (`/songs`) com cifra em formato `[Acorde]texto`
  - Sistema de tags flexível: tempo litúrgico, tipo de celebração, momento da missa, tema
  - Busca por título/autor/trecho da letra + filtros litúrgicos combináveis
  - Transposição de cifras (`POST /songs/transpose`), incluindo baixo/inversão (`C/G`) e bemol→sustenido
  - Repertórios/playlists (`/playlists`) com músicas ordenadas por momento da missa
  - **Autenticação** (`/auth/register`, `/auth/login`, `/auth/me`) com JWT e senha em bcrypt
  - **Área do ministério** (`/users`): lista de integrantes ativos e suas funções (Vocal, Violão, Guitarra, Baixo, Teclado, Bateria, Percussão, Sopros, Som)
  - **Celebrações e escala** (`/celebracoes`): criar celebração com músicos escalados por função;
    cada músico confirma/recusa a própria presença (regra de negócio validada: ninguém confirma a presença de outra pessoa)

- **Frontend (React + TypeScript + Vite, como PWA)**
  - Login e cadastro (token JWT persistido no dispositivo)
  - Biblioteca de músicas com busca e filtro por tempo litúrgico / momento da missa
  - Visualizador de cifra com **transposição em tempo real** (funciona sem internet — lógica replicada em TS)
  - **Modo apresentação**: tela cheia, fonte grande, rolagem automática
  - **Tela de Escalas**: lista celebrações futuras, permite criar uma nova com músicos escalados,
    e cada músico confirma/recusa sua própria presença direto na lista
  - **Offline-first**: Service Worker (Workbox) + IndexedDB (Dexie) — músicas abertas ficam salvas no aparelho;
    se a API não responder, a lista vem do cache local automaticamente

## O que ainda falta (próximas fases, não implementado ainda)

Chat interno, metrônomo/afinador, player de áudio, banco de acordes visual, reconhecimento de áudio,
IA de sugestão de repertório (Planejador Litúrgico — colocado em pausa por decisão do time),
estatísticas, agenda/notificações push, compartilhamento via WhatsApp/QR/PDF,
editor colaborativo com histórico de versões.

## Como rodar localmente

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API disponível em `http://localhost:8000` (docs interativas em `/docs`).

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App disponível em `http://localhost:5173`. O Vite já faz proxy de `/api/*` para o backend
na porta 8000 (ver `vite.config.ts`).

Para testar o comportamento **offline de verdade**: rode `npm run build && npm run preview`,
abra o app, navegue até uma música (isso a salva no IndexedDB), depois desligue o backend
ou desative a rede — a música continua acessível.

## Estrutura

```
catolichord-plus/
├── backend/
│   └── app/
│       ├── main.py          # app FastAPI
│       ├── models.py        # Song, SongTag, Playlist, PlaylistItem, User, Celebracao, EscalaItem
│       ├── schemas.py       # validação de entrada/saída
│       ├── transpose.py     # lógica de transposição de cifras
│       ├── auth.py          # hash de senha (bcrypt) + JWT
│       └── routers/         # /songs, /playlists, /auth, /users, /celebracoes
└── frontend/
    └── src/
        ├── components/
        │   ├── LoginScreen.tsx       # login + cadastro
        │   ├── SongLibrary.tsx       # busca + filtros litúrgicos
        │   ├── SongViewer.tsx        # cifra + transposição + modo apresentação
        │   └── CelebracoesScreen.tsx # escalas + confirmação de presença
        └── lib/
            ├── api.ts        # fetch de músicas com fallback offline
            ├── auth.tsx      # contexto de autenticação + apiFetch autenticado
            ├── db.ts         # IndexedDB (Dexie)
            └── transpose.ts  # transposição espelhada em TS (offline)
```

## Próximo passo sugerido

Com autenticação e escalas prontas, as frentes que mais agregam a seguir são:
repertórios vinculados à celebração (tocar a playlist direto na tela de escala),
notificações quando uma escala é publicada, e o modo apresentação abrir automaticamente
a playlist do dia. O Planejador Litúrgico com IA fica pausado por enquanto, como combinado.
