# 2020 Character Vault (Characters + Tasks)

A small, full-stack JavaScript app that demonstrates **authentication + CRUD** in a clean, beginner-friendly way.

Built as an in-class app for my **MSSE 661 Web Software Development** course at **Regis University**.

After a user registers and logs in, they can:
- Create and delete **RPG-style characters**
- Create and delete **to-do tasks**
- Update basic **account settings** (username/email/password)

This project is designed as a portfolio item: it’s intentionally simple, readable, and easy to run locally.

---

## 2026 Updates

This project received a 2026 refresh focused on UX polish and smoother deployment.

- **UI refresh + dark theme:** updated global styling and page layouts, with a theme-friendly design (Bootstrap + custom CSS).
- **More robust Tasks UI:** fixed initialization issues, “Add” button handling, and duplicate task rendering.
- **Production-friendly server:** HTTPS listener is optional (most hosts terminate TLS at a reverse proxy).
- **Dev workflow improvements:** VS Code tasks to open the app and run the server more easily.
- **Reverse-proxy hosting notes:** guidance for running Node behind Apache (e.g., Webuzo) with a subdomain.

## Features

- **Auth**
  - Register + login
  - JWT-based authentication stored in browser `localStorage`
  - Route guarding (redirects unauthenticated users to login)

- **Characters CRUD**
  - Add characters with: name, race, class, level, build, sheet, image
  - List characters per user
  - Delete characters

- **Tasks CRUD**
  - Add tasks with: name + status (pending/completed)
  - List tasks per user
  - Delete tasks

- **Settings**
  - Update username/email/password

---

## Tech Stack

- **Frontend:** HTML + CSS + vanilla JS (Bootstrap 4 styling)
- **Backend:** Node.js + Express
- **Auth:** JWT (`jsonwebtoken`)
- **Password hashing:** `bcryptjs`
- **Persistence:** simple JSON file database (`server/data/db.json`) for easy local use

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

## Getting Started (Local)

### Prerequisites

- **Node.js (LTS)** installed (Windows/macOS/Linux)

### Install

From the `server/` folder:

```bash
cd server
npm install
```

### Run

```bash
cd server
npm start
```

Then open:

- http://localhost:4000/

### VS Code Tasks (optional)

If you open this repo in VS Code, the workspace includes tasks to speed up common actions:

- **Install (server)**: runs `npm install` in `server/`
- **Start Server**: runs `npm start` in `server/`
- **Open in Browser**: opens the app URL in Chrome

If your local setup uses the custom hostname `http://2020CharacterVault.localhost:4000/`, the task opens that URL instead of `localhost`.

Note: the Node server serves the frontend from the `public/` folder. If you open the repo-root `index.html` directly, you’ll see a small landing page that links you to the correct entry point.

This single server:
- Hosts the frontend at `http://localhost:4000/`
- Exposes the API at `http://localhost:4000/api/...`

---

## API Overview

The frontend calls the API using a same-origin base URL:

- `BASE_API_URL = ${window.location.origin}/api`

Key routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/user/me`
- `PUT /api/user/me/update`

- `GET /api/tasks`
- `POST /api/tasks`
- `DELETE /api/tasks/:taskId`

- `GET /api/characters`
- `POST /api/characters`
- `DELETE /api/characters/:characterId`

---

## Data Storage

For local simplicity, the backend stores data in:

- `server/data/db.json`

This includes users, tasks, characters, and ID counters. If you want a clean slate, you can stop the server and reset `db.json` back to an empty structure.

---

## Configuration

Optional environment variables:

- `PORT` (default `4000`) — HTTP server port
- `HTTPS_PORT` (default `4443`) — HTTPS server port
- `JWT_SECRET` (default `dev-secret-change-me`) — JWT signing secret
- `ACCESS_TOKEN_EXPIRES_IN_SECONDS` (default `3600`) — token lifetime

Example (PowerShell):

```powershell
$env:PORT=4000
$env:JWT_SECRET="replace-this"
cd server
npm start
```

---

## Deploying to Production

This app is a single Node/Express server that serves the frontend (`public/`) and API (`/api`).

### 1) Decide where to host

The easiest “first production” options are platforms like **Render**, **Railway**, or **Fly.io**.

Important note: the backend stores data in a local JSON file (`server/data/db.json`). Many hosts use **ephemeral filesystems**, so data will reset on redeploy unless you configure a **persistent disk/volume** or migrate to a real database.

### 2) Set environment variables (required)

- `JWT_SECRET` — set to a strong random string (do not use the default)
- `PORT` — most platforms set this automatically

Recommended:

- `NODE_ENV=production`
- `ACCESS_TOKEN_EXPIRES_IN_SECONDS=3600` (or your preferred value)

### 3) Use the correct start command

Deploy the `server/` folder as the Node app.

- Install: `npm install` (or `npm ci`)
- Start: `npm start`

The server automatically serves the frontend from `../public`.

### 4) HTTPS / TLS

Most production hosts terminate HTTPS for you.

- Leave `ENABLE_HTTPS` unset/false in production (default)
- If you *really* want the app to bind its own HTTPS port, set:
  - `ENABLE_HTTPS=true`
  - `HTTPS_PORT=4443` (or similar)
  - and provide valid `server/server.key` + `server/server.cert`

### 5) Hosting behind Apache (reverse proxy)

If you’re hosting on a traditional server where **Apache fronts traffic** (including Webuzo/cPanel-like setups), point the domain/subdomain to Apache and configure a reverse proxy to the Node app (example assumes Node listens on `127.0.0.1:4000`):

- Enable proxy modules (`proxy`, `proxy_http`, and usually `headers`)
- Configure:
  - `ProxyPreserveHost On`
  - `ProxyPass / http://127.0.0.1:4000/`
  - `ProxyPassReverse / http://127.0.0.1:4000/`

TLS certificates typically live on Apache in this setup; Node can remain HTTP-only behind the proxy.

Note: on some control-panel managed servers (e.g., Webuzo), Apache may be managed outside systemd; automated installers like `certbot --apache` may not work. In that case, issue the cert with `certbot certonly` (standalone/webroot) and install the resulting PEM files into the panel’s expected certificate paths.

### Example: Render (simple approach)

Create a new **Web Service** and point it at this repo.

- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:**
  - `JWT_SECRET` = (generate a strong secret)
  - `NODE_ENV` = `production`

If you want persistence for `server/data/db.json`, add a **Persistent Disk** and mount it so that `server/data/` is stored on the disk.

---

## Common Issues / Troubleshooting

### “Cannot GET /”

Make sure the Node server is running from `server/` and you’re visiting:

- `http://localhost:4000/`

### “Failed to register” or “Failed to login”

This usually means the API is unreachable. In this project, the API is hosted by the same Node server:

- `http://localhost:4000/api/...`

Also ensure your browser isn’t accidentally calling a different port.

### “Could not get the current user”

This message comes from a frontend helper that tries to display the signed-in username. If you are logged out, log in again; if you’re logged in and still see it, clear `localStorage` and retry.

---

## Notes (Portfolio Context)

- This is a learning-focused project: clarity and approachability are prioritized over advanced patterns.
- The JSON file database is intentional for easy setup; in a production app you’d likely use a real database and stronger session/token handling.

---

## Author

- Frank Jamison — https://fcjamison.com
