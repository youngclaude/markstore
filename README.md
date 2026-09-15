# MarkStore

Your AI's memory, everywhere. vinext (Next.js) on Cloudflare Workers.

Live: https://usemarkstore.com

## Auth

- **Auth.js** (`next-auth@5` beta) Credentials provider — email + password only (no OAuth)
- Users in Cloudflare **D1** (`markstore-users`)
- Passwords: **Web Crypto PBKDF2-SHA256** (Workers-safe; not Node bcrypt)
- Session: JWT (`AUTH_SECRET` Worker secret)

## Files (ALL-15 / ALL-16 / ALL-17 / ALL-7)

- Default folder per user: exactly **`general files`**
- Create Markdown (`.md`) or JSON (`.json`) files
- Editor with **Save** + **Export / Download** + version history
- Tables: `folders`, `files`, `file_versions` (see `schema.sql`)

## API keys & agent CRUD (ALL-8)

Agents authenticate with Bearer API keys (`msk_…`). Browser sessions use Auth.js cookies; keys are for the `/api/v1/*` agent path.

### Create a key (UI)

1. Sign in at https://usemarkstore.com/signin
2. Open **Settings** → https://usemarkstore.com/app/settings
3. Enter a name → **Create key**
4. Copy the plaintext secret (`msk_…`) — shown **once**. Only a SHA-256 hash is stored.

Session-backed JSON API (same cookie as the app):

```bash
# List (never returns full secrets)
curl -sS -b 'authjs.session-token=…' https://usemarkstore.com/api/keys

# Create — response includes `secret` once
curl -sS -b 'authjs.session-token=…' -H 'Content-Type: application/json' \
  -d '{"name":"my agent"}' https://usemarkstore.com/api/keys

# Revoke
curl -sS -X DELETE -b 'authjs.session-token=…' \
  https://usemarkstore.com/api/keys/<key-id>
```

### Agent file API (`Authorization: Bearer msk_…`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/files` | List files in `general files` (or `?folder=all`) |
| `POST` | `/api/v1/files` | Create `{ name, type: "md"\|"json", content? }` |
| `GET` | `/api/v1/files/:id` | Get file (+ content) |
| `PATCH` | `/api/v1/files/:id` | Update `content` and/or `name` (content save creates a version) |
| `DELETE` | `/api/v1/files/:id` | Delete file + versions |

```bash
export MSK_KEY='msk_…'
export BASE=https://usemarkstore.com

# Unauthenticated → 401
curl -sS -o /dev/null -w '%{http_code}\n' $BASE/api/v1/files

# List
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files

# Create
curl -sS -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"notes","type":"md","content":"# Hello"}' $BASE/api/v1/files

# Get / update / delete
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>
curl -sS -X PATCH -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"content":"# Updated"}' $BASE/api/v1/files/<id>
curl -sS -X DELETE -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>
```

Schema: `api_keys(id, user_id, name, key_hash, key_prefix, created_at, last_used_at, revoked_at)`.

## Scripts

- `npm run dev` — local vinext
- `npm run build` — production build
- `npm start` — wrangler dev against `dist`
