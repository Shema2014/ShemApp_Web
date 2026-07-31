# Guia de Migração: Supabase + Deploy

Este guia assume que você já criou (ou vai criar) uma conta/projeto exclusivo do
ministério no Supabase.

## 1. Banco de dados (Supabase)

1. Em [supabase.com](https://supabase.com), crie um novo projeto para o ministério.
2. Anote a senha do banco que você definir na criação — vai precisar dela.
3. Vá em **Project Settings → Database → Connection string → URI**. Copie a string
   (algo como `postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres`).
4. Cole essa string como `DATABASE_URL` no `.env` do backend (veja `.env.example`).

O código já está pronto para isso: não precisa alterar nenhum modelo ou rota — o
SQLModel cria as tabelas automaticamente na primeira vez que o backend sobe (função
`init_db()` em `main.py`), tanto em SQLite quanto em Postgres.

**Recomendação:** rode localmente uma vez com essa `DATABASE_URL` do Supabase antes do
deploy, só para confirmar que a conexão funciona:
```bash
cd backend
pip install -r requirements.txt
# crie o .env com a DATABASE_URL do Supabase
uvicorn app.main:app --reload
```
Se subir sem erro, as tabelas já foram criadas no Supabase — você pode conferir em
**Table Editor** no painel do Supabase.

## 2. Backend (Railway ou Render)

Ambos têm plano gratuito e deploy automático a partir do GitHub.

1. Suba o repositório para o GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. No Railway/Render, crie um novo serviço apontando para a pasta `backend/`.
3. Configure as variáveis de ambiente do serviço (mesmas do `.env.example`):
   - `DATABASE_URL` → a connection string do Supabase
   - `SECRET_KEY` → gere uma nova: `python3 -c "import secrets; print(secrets.token_hex(32))"`
   - `ALLOWED_ORIGINS` → a URL do frontend depois do deploy (ajuste depois do passo 3)
4. O `Procfile` e o `railway.json` já dizem como rodar (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
5. Depois do deploy, anote a URL pública do backend (ex: `https://catolichord-api.up.railway.app`).

## 3. Frontend (Vercel)

1. No Vercel, importe o mesmo repositório, apontando para a pasta `frontend/`.
2. Configure a variável de ambiente `VITE_API_URL` com a URL do backend do passo 2.
3. Deploy. O `vercel.json` já está configurado para servir o app corretamente como SPA.
4. Volte no Railway/Render e atualize `ALLOWED_ORIGINS` com a URL final do Vercel
   (ex: `https://catolichord-plus.vercel.app`), para o CORS liberar o frontend.

## 4. Checklist final

- [ ] Backend responde em `https://SEU-BACKEND/` com `{"status": "ok", ...}`
- [ ] Frontend carrega e a tela de login aparece
- [ ] Cadastro de um usuário funciona (grava no Supabase — confira em Table Editor)
- [ ] Login funciona e mantém sessão ao recarregar a página
- [ ] Criar uma celebração com escala funciona
- [ ] Testar offline: abrir uma música, desligar o wifi, reabrir o app — a música
      continua acessível

## Custos (planos gratuitos, referência geral)

Supabase, Railway/Render e Vercel têm planos gratuitos que cobrem bem o uso de um
ministério (poucas dezenas de usuários, uso esporádico em finais de semana). Se o
ministério crescer bastante ou o backend "dormir" por inatividade nos planos free
(comum no Render), pode valer considerar um plano pago mais adiante — mas não é
necessário para começar.
