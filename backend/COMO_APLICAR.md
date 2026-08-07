# Como aplicar: edição de cifras + modo "só letra"

## 1. Copie cada arquivo pro lugar certo

| Arquivo que você baixou | Copiar/substituir em |
|---|---|
| `schemas.py` | `backend/app/schemas.py` |
| `songs.py` | `backend/app/routers/songs.py` |
| `api.ts` | `frontend/src/lib/api.ts` |
| `SongViewer.tsx` | `frontend/src/components/SongViewer.tsx` |
| `SongEditor.tsx` | `frontend/src/components/SongEditor.tsx` (arquivo **novo**) |
| `App.tsx` | `frontend/src/App.tsx` |

Pode simplesmente arrastar e soltar cada um por cima do arquivo antigo (confirma "substituir" quando o Windows perguntar), exceto o `SongEditor.tsx`, que é novo — só coloca ele dentro da pasta `frontend/src/components/`.

## 2. Testa local antes de subir

Com os dois terminais de sempre (backend numa janela, frontend na outra):
```powershell
python -m uvicorn app.main:app --reload
```
```powershell
npm run dev
```

Abre uma música na Biblioteca, testa o botão **"Editar"** e o botão **"Só letra"**.

## 3. Sobe pro GitHub

Se estiver tudo funcionando, no terminal, dentro da pasta raiz do projeto (`ShemApp`):
```powershell
git add .
git commit -m "feat: edição de músicas e modo somente letra"
git push
```

## 4. Deploy automático

Como o Railway e a Vercel já estão conectados ao seu GitHub, esse `git push` já dispara sozinho um novo deploy nos dois — não precisa fazer mais nada. Só acompanha as abas "Deployments" de cada um até ficarem verdes de novo (leva 1-2 minutos).

Depois disso, testa direto em produção (`https://shem-app-web.vercel.app`) editando alguma música de verdade.
