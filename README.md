# MarkStore

Your AI's memory, everywhere. vinext (Next.js) on Cloudflare Workers.

Live: https://usemarkstore.com

## Auth

- **Auth.js** (`next-auth@5` beta) Credentials provider — email + password only (no OAuth)
- Users in Cloudflare **D1** (`markstore-users`)
- Passwords: **Web Crypto PBKDF2-SHA256** (Workers-safe; not Node bcrypt)
- Session: JWT (`AUTH_SECRET` Worker secret)

## Projects (ALL-11)

- Create projects to organize AI context (name + optional description)
- Each project gets a default `general files` folder on creation
- Create additional folders within projects
- Browse projects at `/app/projects`, detail at `/app/projects/:id`
- Legacy files in "General Files" remain accessible at `/app`
- Tables: `projects`, `folders` (with `project_id`), `files`

## Files (ALL-15 / ALL-16 / ALL-17 / ALL-7)

- Default folder per user: exactly **`general files`** (legacy, non-project)
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

### Agent API (`Authorization: Bearer msk_…`)

All agent API endpoints require a valid `msk_…` Bearer token. Unauthenticated or invalid requests return `401`.

#### Files

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/files` | List files in `general files` (or `?folder=all`, `?project=<id\|name>`) |
| `POST` | `/api/v1/files` | Create `{ name, type, content?, projectId?, projectName?, folderName? }` |
| `GET` | `/api/v1/files/:id` | Get file (+ content) |
| `PATCH` | `/api/v1/files/:id` | Update `content` and/or `name` (content save creates a version) |
| `DELETE` | `/api/v1/files/:id` | Delete file + versions |

#### Folders (legacy, non-project)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/folders` | List folders |
| `POST` | `/api/v1/folders` | Create `{ name }` |
| `GET` | `/api/v1/folders/:id` | Get folder |
| `PATCH` | `/api/v1/folders/:id` | Rename `{ name }` |
| `DELETE` | `/api/v1/folders/:id` | Delete folder (cannot delete `general files`) |

#### Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/projects` | List projects |
| `POST` | `/api/v1/projects` | Create `{ name, description? }` |
| `GET` | `/api/v1/projects/:id` | Get project |
| `PATCH` | `/api/v1/projects/:id` | Update `{ name?, description? }` |
| `DELETE` | `/api/v1/projects/:id` | Delete project + folders + files |

#### Project Folders

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/projects/:id/folders` | List folders in project |
| `POST` | `/api/v1/projects/:id/folders` | Create `{ name }` |
| `GET` | `/api/v1/projects/:id/folders/:folderId` | Get folder |
| `PATCH` | `/api/v1/projects/:id/folders/:folderId` | Rename `{ name }` |
| `DELETE` | `/api/v1/projects/:id/folders/:folderId` | Delete folder (cannot delete `general files`) |

#### File Versions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/files/:id/versions` | List versions for a file |
| `GET` | `/api/v1/files/:id/versions/:version` | Get version content (+ previous) |
| `POST` | `/api/v1/files/:id/versions/:version` | Restore version `{ "action": "restore" }` |

#### File Sharing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/files/:id/share` | Get share status |
| `POST` | `/api/v1/files/:id/share` | Create/enable public share link |
| `DELETE` | `/api/v1/files/:id/share` | Revoke public share link |

#### Examples

```bash
export MSK_KEY='msk_…'
export BASE=https://usemarkstore.com

# Unauthenticated → 401
curl -sS -o /dev/null -w '%{http_code}\n' $BASE/api/v1/files

# --- Files ---

# List general files
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files

# List files in a project (by id or name)
curl -sS -H "Authorization: Bearer $MSK_KEY" "$BASE/api/v1/files?project=My%20Project"

# Create in general files
curl -sS -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"notes","type":"md","content":"# Hello"}' $BASE/api/v1/files

# Create in a project folder
curl -sS -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"config","type":"json","projectName":"My Project","folderName":"general files"}' \
  $BASE/api/v1/files

# Get / update / delete
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>
curl -sS -X PATCH -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"content":"# Updated"}' $BASE/api/v1/files/<id>
curl -sS -X DELETE -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>

# --- Folders (legacy) ---

# List folders
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/folders

# Create folder
curl -sS -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"my-folder"}' $BASE/api/v1/folders

# Rename folder
curl -sS -X PATCH -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"renamed-folder"}' $BASE/api/v1/folders/<id>

# Delete folder
curl -sS -X DELETE -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/folders/<id>

# --- Projects ---

# List projects
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/projects

# Create project
curl -sS -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"My Project","description":"Optional description"}' $BASE/api/v1/projects

# Get / update / delete project
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/projects/<id>
curl -sS -X PATCH -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"Renamed Project"}' $BASE/api/v1/projects/<id>
curl -sS -X DELETE -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/projects/<id>

# --- Project Folders ---

# List project folders
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/projects/<projectId>/folders

# Create project folder
curl -sS -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"src"}' $BASE/api/v1/projects/<projectId>/folders

# Rename project folder
curl -sS -X PATCH -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"name":"source"}' $BASE/api/v1/projects/<projectId>/folders/<folderId>

# Delete project folder
curl -sS -X DELETE -H "Authorization: Bearer $MSK_KEY" \
  $BASE/api/v1/projects/<projectId>/folders/<folderId>

# --- Versions ---

# List file versions
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>/versions

# Get specific version
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>/versions/1

# Restore version
curl -sS -X POST -H "Authorization: Bearer $MSK_KEY" -H 'Content-Type: application/json' \
  -d '{"action":"restore"}' $BASE/api/v1/files/<id>/versions/1

# --- Sharing ---

# Get share status
curl -sS -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>/share

# Enable public share
curl -sS -X POST -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>/share

# Revoke share
curl -sS -X DELETE -H "Authorization: Bearer $MSK_KEY" $BASE/api/v1/files/<id>/share
```

Schema: `api_keys(id, user_id, name, key_hash, key_prefix, created_at, last_used_at, revoked_at)`.

## Public shares (ALL-9)

Share any file via a read-only public link. Links never expire until explicitly revoked.

1. Open a file in the editor
2. Click **Share** button in the header
3. Toggle sharing on to generate a link
4. Copy the URL (`https://usemarkstore.com/s/<slug>`)
5. Revoke anytime to disable access

Public viewers see rendered Markdown or syntax-highlighted JSON. The page prompts visitors to sign up.

Schema: `file_shares(id, file_id, user_id, slug UNIQUE, created_at, revoked_at)`.

## Scripts

- `npm run dev` — local vinext
- `npm run build` — production build
- `npm start` — wrangler dev against `dist`
