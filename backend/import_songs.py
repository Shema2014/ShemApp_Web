#!/usr/bin/env python3
"""
Importa em massa as músicas do arquivo musicas.json para o ShemApp,
via API (POST /songs).

Uso:
    python3 import_songs.py musicas.json --url http://127.0.0.1:8000
    python3 import_songs.py musicas.json --url https://shemappweb-production.up.railway.app

Por padrão faz uma pausa pequena entre cada requisição para não sobrecarregar
o servidor gratuito. Gera um relatório no final com sucessos e falhas.
"""
import argparse
import json
import time
import sys
import urllib.request
import urllib.error


def post_song(base_url: str, song: dict) -> tuple[bool, str]:
    url = f"{base_url.rstrip('/')}/songs"
    data = json.dumps(song).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            resp.read()
            return True, ""
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return False, f"HTTP {e.code}: {body[:200]}"
    except Exception as e:
        return False, str(e)


def main():
    parser = argparse.ArgumentParser(description="Importa músicas em massa para o ShemApp")
    parser.add_argument("json_path", help="Caminho do arquivo musicas.json")
    parser.add_argument("--url", required=True, help="URL base da API (sem /songs no final)")
    parser.add_argument("--delay", type=float, default=0.15, help="Pausa entre requisições (segundos)")
    parser.add_argument("--start", type=int, default=0, help="Índice para retomar uma importação interrompida")
    args = parser.parse_args()

    with open(args.json_path, "r", encoding="utf-8") as f:
        songs = json.load(f)

    total = len(songs)
    sucesso = 0
    falhas = []

    print(f"Importando {total - args.start} músicas para {args.url} ...")

    for i, song in enumerate(songs[args.start:], start=args.start):
        ok, erro = post_song(args.url, song)
        if ok:
            sucesso += 1
            status = "OK"
        else:
            falhas.append({"indice": i, "titulo": song.get("titulo"), "erro": erro})
            status = f"FALHOU ({erro})"

        print(f"[{i + 1}/{total}] {song.get('titulo', '?')[:50]:<50} {status}")
        time.sleep(args.delay)

    print("\n" + "=" * 60)
    print(f"Concluído: {sucesso} sucesso(s), {len(falhas)} falha(s) de {total} músicas")

    if falhas:
        report_path = "import_falhas.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(falhas, f, ensure_ascii=False, indent=2)
        print(f"Detalhes das falhas salvos em: {report_path}")
        print(f"Para retomar a partir da última música com sucesso, use --start {falhas[0]['indice']}")


if __name__ == "__main__":
    main()
