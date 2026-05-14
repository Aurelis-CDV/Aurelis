# Aurelis

Web app for monitoring and managing greenhouses: dashboards with plant status, sensors, charts, and guides. Built with **Angular 21**, **Auth0** for sign-in, and **Chart.js** for trends.

## Requirements

- **Node.js** (LTS recommended)
- **npm** (see `packageManager` in `package.json` for the version used in this repo)

## Getting started

```bash
git clone <repository-url>
cd Aurelis
npm install
```

### Environment variables

The app is wired for **@ngx-env/builder**: create a **`.env`** file in the project root (it is not committed). At minimum, for the authenticated dashboard you need:

| Variable | Purpose |
|----------|---------|
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |

Optional:

| Variable | Purpose |
|----------|---------|
| `AUTH0_DATABASE_CONNECTION` | Auth0 database connection name (if used) |
| `WEATHER_API_KEY` | Weather data for location parameters |
| `GUIDES_BASE_API_URL` | Base URL for the plant guides API |
| `GUIDES_API_KEY` | API key for the guides service |

The dev server injects these at build time. `redirect_uri` for Auth0 is `window.location.origin` (e.g. `http://localhost:4200` locally).

### Greenhouse API

Base URL and server id live in `src/environments/` (`environment.ts`, `environment.development.ts`, `environment.production.ts`). Adjust them if you point the app at another backend.

### Run locally

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). Public routes include the home page and guides; **`/dashboard`** requires a successful Auth0 login.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server (`ng serve`) |
| `npm run build` | Production build (output under `dist/aurelis/browser`) |
| `npm run watch` | Development build in watch mode |
| `npm test` | Unit tests (`ng test` / Vitest) |

## Tech stack

- Angular (standalone components, SCSS)
- Auth0 (`@auth0/auth0-angular`)
- Chart.js
- RxJS
