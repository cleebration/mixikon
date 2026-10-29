#!/bin/zsh
# Doppelklick: veröffentlicht mixikon.com (Cloudflare Worker "mixikon" mit Website, Freigabe-Seite /admin und Datenbank D1 "mixikon").
# Beim ersten Lauf wird ein Admin-Schlüssel erzeugt und in ~/Library/Application Support/mixikon/admin.key abgelegt.
# Mehrfach ausführbar. Projekt "MyProj Mixikon", Claude, 28.10.2026.
cd "$(dirname "$0")" || exit 1
export npm_config_cache="$HOME/.npm-redaktion"
halt() { echo "\n✗ $1 — Claude fragen (Ausgabe oben kopieren)."; read "?Enter zum Schließen"; exit 1; }
KEYDIR="$HOME/Library/Application Support/mixikon"; KEYFILE="$KEYDIR/admin.key"
mkdir -p "$KEYDIR"
NEU=0
if [ ! -s "$KEYFILE" ]; then openssl rand -hex 24 > "$KEYFILE"; chmod 600 "$KEYFILE"; NEU=1; fi

echo "→ Veröffentlichen mit eigener Domain mixikon.com …"
if npx --yes wrangler@4 deploy; then
  ZIEL="https://mixikon.com"
else
  echo "\n! Eigene Domain noch nicht möglich (mixikon.com ist wohl noch keine Zone in Cloudflare)."
  echo "→ Veröffentliche vorerst auf workers.dev …"
  npx --yes wrangler@4 deploy -c wrangler.ohne-domain.toml || halt "Veröffentlichen"
  ZIEL="(Adresse *.workers.dev siehe oben)"
fi

if [ $NEU = 1 ] || [ "$1" = "--schluessel" ]; then
  echo "→ Admin-Schlüssel hinterlegen …"
  cat "$KEYFILE" | npx --yes wrangler@4 secret put ADMIN_KEY || halt "Schlüssel hinterlegen"
  openssl rand -hex 16 | npx --yes wrangler@4 secret put SALT >/dev/null || true
fi
cat "$KEYFILE" | pbcopy
echo "\n✓ Fertig: $ZIEL"
echo "  Freigabe-Seite: $ZIEL/admin  – Admin-Schlüssel liegt in der Zwischenablage (und in $KEYFILE)."
read "?Enter zum Schließen"
