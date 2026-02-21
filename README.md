# The Character Vault

Full-stack JavaScript demo app (vanilla JS + Node/Express) showcasing **JWT auth** and **CRUD** for:

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

Open the app:

- http://localhost:4000/

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

The frontend calls the API using same-origin URLs:

- `BASE_API_URL = ${window.location.origin}/api`

### Auth

- JWT tokens are issued by the server
- The frontend stores the access token in `localStorage`
- Frontend routes/pages use a guard to redirect unauthenticated users to login

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
server/                 # Node server (static + API)
  index.js              # Serves /public and mounts /api
  api.js                # API routes
  data/db.json          # JSON persistence
```

---

## API Reference (High-Level)

Auth / user:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/me`
- `PUT /api/user/me/update`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `DELETE /api/tasks/:taskId`

Characters:

- `GET /api/characters`
- `POST /api/characters`
- `DELETE /api/characters/:characterId`

---

## Data Storage

For local simplicity, persistence is a JSON file:

- `server/data/db.json`

It contains users, tasks, characters, and ID counters.

To reset locally: stop the server and replace `server/data/db.json` with a clean/empty structure. (The API expects this file to exist.)

Minimal empty DB template:

```json
{
  "nextIds": { "user": 1, "task": 1, "character": 1 },
  "users": [],
  "tasks": [],
  "characters": []
}
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

If the API calls are failing, confirm your browser is hitting the same origin/port.

### “Could not get the current user”

Clear `localStorage`, then log in again.

---

## Author

Frank Jamison — https://fcjamison.com
