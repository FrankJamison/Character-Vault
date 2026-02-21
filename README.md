# The Character Vault

Full-stack JavaScript demo app (vanilla JS frontend + Node/Express backend) showcasing **JWT auth** and **CRUD** for:

- RPG-style **Characters**
- **Tasks** (to-do list)
- Basic **Account settings**

This codebase is intentionally simple and readable: it’s designed for local dev, classroom use, and lightweight portfolio hosting.

**Live Preview:** https://charactervault.fcjamison.com/

---

## Quickstart (Local)

### Prerequisites

- Node.js (LTS)

### Install

```bash
cd server
npm install
```

### Run

```bash
cd server
npm start
```

Open:

- http://localhost:4000/

---

## Developer Workflow

### What you run

All runtime code lives under `server/`.

- `npm start` runs `node index.js` from `server/`
- There is no frontend build step: the server serves static files from `public/`

### What you edit

- Frontend pages + JS: `public/`
- Backend API and auth: `server/api.js`
- Server boot + static hosting: `server/index.js`
- Local persistence: `server/data/db.json`

Changes to frontend files are reflected on refresh. Backend changes require restarting the Node server.

---

## VS Code Tasks

This repo includes a few tasks in `.vscode/tasks.json`:

- **Install (server)** — runs `npm install` in `server/`
- **Start Server** — starts the Node server from `server/`
- **Open in Browser** — opens the app URL in Chrome
- **Run App (server + open site)** — runs install → start → open

The **Open in Browser** task opens:

- http://charactervault.localhost:4000/

If that hostname doesn’t resolve on your machine, either:

- use `http://localhost:4000/`, or
- add a hosts entry mapping it to loopback (Windows: `C:\Windows\System32\drivers\etc\hosts`):
  - `127.0.0.1 charactervault.localhost`

---

## How It Works

### App shape

This is a single Node/Express server that:

- serves the frontend static files from `public/`
- exposes JSON APIs under `/api/...`

The frontend uses same-origin API calls:

- `BASE_API_URL = ${window.location.origin}/api`

### Auth (JWT)

- The server issues JWT access tokens on login
- The frontend stores the access token in `localStorage`
- Authenticated requests include an `Authorization` header:
  - `Authorization: Bearer <access_token>`

Note: the login response also includes a `refresh_token`, and the server stores refresh tokens in `server/data/db.json`, but this demo app does not currently expose a refresh endpoint.

---

## Project Structure

```
public/                 # Frontend pages + JS modules
  index.html
  login.html
  about.html
  characters/
  todo/
  settings/
  lib/
  tests/
server/                 # Node server (static + API)
  index.js              # Serves /public and mounts /api
  api.js                # API routes
  data/db.json          # JSON persistence
```

---

## Configuration

Environment variables (all optional unless you’re deploying):

- `PORT` (default: `4000`) — HTTP port
- `HTTPS_PORT` (default: `4443`) — HTTPS port (only used when HTTPS is enabled)
- `JWT_SECRET` (default: `dev-secret-change-me`) — JWT signing secret (set this in production)
- `ACCESS_TOKEN_EXPIRES_IN_SECONDS` (default: `3600`) — token lifetime
- `ENABLE_HTTPS` (default: unset/false) — enable the HTTPS listener

PowerShell example:

```powershell
$env:PORT=4000
$env:JWT_SECRET="replace-this"
cd server
npm start
```

---

## API Reference

All APIs are served from the same origin as the frontend:

- Base URL: `http://localhost:4000/api`

### Auth / user

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/me` (requires `Authorization: Bearer ...`)
- `PUT /api/user/me/update` (requires `Authorization: Bearer ...`)

Login example:

```bash
curl -s http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"<password>"}'
```

Successful login response:

```json
{
  "auth": true,
  "expires_in": 3600,
  "access_token": "...",
  "refresh_token": "..."
}
```

Get current user example:

```bash
curl -s http://localhost:4000/api/user/me \
  -H "Authorization: Bearer <access_token>"
```

Note: `GET /api/user/me` returns an array (the frontend expects `[user]`).

### Tasks

- `GET /api/tasks` (auth)
- `POST /api/tasks` (auth)
- `DELETE /api/tasks/:taskId` (auth)

Create task example:

```bash
curl -s http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"task_name":"Buy rations","status":"pending"}'
```

### Characters

- `GET /api/characters` (auth)
- `POST /api/characters` (auth)
- `DELETE /api/characters/:characterId` (auth)

Create character example:

```bash
curl -s http://localhost:4000/api/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "character_name":"Elandra",
    "character_race":"Elf",
    "character_class":"Ranger",
    "character_build":"Archer",
    "character_level":"5",
    "character_sheet":"https://example.com/sheet",
    "character_image":"https://example.com/image.png"
  }'
```

---

## Data Model (Server)

This project uses a JSON file DB at `server/data/db.json`.

Key shapes:

- `users[]`: `{ user_id, username, email, password_hash, refresh_tokens[], created_date }`
- `tasks[]`: `{ task_id, user_id, task_name, status, created_date }`
- `characters[]`: `{ character_id, user_id, character_name, character_race, character_class, character_build, character_level, character_sheet, character_image, created_date }`

### Reset local data

Stop the server and replace `server/data/db.json` with a clean/empty structure (the API expects this file to exist):

```json
{
  "nextIds": { "user": 1, "task": 1, "character": 1 },
  "users": [],
  "tasks": [],
  "characters": []
}
```

---

## Testing

This repo includes a small Jasmine spec runner for the to-do module.

Recommended way to run it (served by the Node server):

1. Start the server (`cd server && npm start`)
2. Open: http://localhost:4000/tests/specrunner.html

The spec files live under `public/tests/`.

Note: the Jasmine runner assets are loaded from a CDN, so the test page requires an internet connection.

---

## Deployment Notes

### Recommended deployment model

Deploy the `server/` folder as the Node app.

- Install: `npm install` (or `npm ci`)
- Start: `npm start`

The server serves the frontend from `../public`.

### HTTPS / TLS

Most hosts terminate TLS for you (reverse proxy / load balancer). In that case, keep Node running HTTP-only.

If you intentionally want Node to bind HTTPS itself:

- set `ENABLE_HTTPS=true`
- set `HTTPS_PORT`
- provide `server/server.key` and `server/server.cert`

If `ENABLE_HTTPS=true` but the key/cert files are missing, the server will log a warning and skip starting the HTTPS listener.

### Apache reverse proxy (example)

If Apache fronts the site and Node listens on `127.0.0.1:4000`:

- `ProxyPreserveHost On`
- `ProxyPass / http://127.0.0.1:4000/`
- `ProxyPassReverse / http://127.0.0.1:4000/`

---

## Troubleshooting

### “Cannot GET /”

Make sure you started the server from `server/` and you’re visiting:

- http://localhost:4000/

### Register/login failing

In this project, the API is hosted by the same Node server:

- http://localhost:4000/api/...

If API calls are failing, confirm your browser is hitting the same origin/port and that you’re sending `Authorization: Bearer ...` for protected routes.

### “Could not get the current user”

Clear `localStorage`, then log in again.

---

## Author

Frank Jamison — https://fcjamison.com
