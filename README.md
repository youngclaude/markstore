# MarkStore

Your AI's memory, everywhere. vinext (Next.js) on Cloudflare Workers.

## Auth

- **Auth.js** (`next-auth@5` beta) Credentials provider — email + password only (no OAuth)
- Users in Cloudflare **D1** (`markstore-users`)
- Passwords: **Web Crypto PBKDF2-SHA256** (Workers-safe; not Node bcrypt)
- Session: JWT (`AUTH_SECRET` Worker secret)

## Files (ALL-15 / ALL-16 / ALL-17)

- Default folder per user: exactly **`general files`**
- Create Markdown (`.md`) or JSON (`.json`) files
- Editor with **Save** + **Export / Download**
- Tables: `folders`, `files` (see `schema.sql`)

## Scripts

- `npm run dev` — local vinext
- `npm run build` — production build
- `npm start` — wrangler dev against `dist`
