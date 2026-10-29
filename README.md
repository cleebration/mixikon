# mixikon.com

Lexikon der Kofferwörter: Generator DE/EN, Lexikon, Geschichte, Shop-Link (Spreadshop cleebration), Vorschläge von Besuchern mit Freigabe.

- **Hosting:** Cloudflare Worker `mixikon` (statische Dateien aus `public/` + API in `src/index.js`), kommerziell → Cloudflare (Stack-Regel).
- **Datenbank:** D1 `mixikon` (ID `1641d492-c5d4-4aee-8102-e3b975af12ff`), Tabelle `vorschlag` (`schema.sql`).
- **Veröffentlichen:** Doppelklick `mixikon veröffentlichen.command`. Ohne Cloudflare-Zone mixikon.com fällt es auf workers.dev zurück.
- **Freigabe:** `https://mixikon.com/admin` – Schlüssel in `~/Library/Application Support/mixikon/admin.key`.
- **API:** `POST /api/vorschlag` (öffentlich, max. 20 je Besucher/Tag, Honeypot), `GET /api/lexikon` (freigegebene Wörter), `/api/admin/liste`, `/api/admin/entscheiden` (Bearer-Schlüssel).
- **Seite ändern:** `public/index.html` bearbeiten (Artifact-Fassung: https://claude.ai/artifact/GhXCg8u7EehaPrrC4WExHG), dann veröffentlichen.
- Domain liegt bei GoDaddy; für die eigene Domain mixikon.com als Zone in Cloudflare anlegen und die Nameserver bei GoDaddy umstellen.
