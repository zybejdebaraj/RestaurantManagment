# Restaurant Management

Vue 3 / Vite frontend and Express / PostgreSQL backend. Each owner manages their own restaurants and menu items. Restaurant browsing and public menus do not require an account.

## Project structure

```text
RestaurantManagment/
  frontend/         Vue application, public images, Vite config, and frontend environment
    src/
    public/
    index.html
    package.json
    package-lock.json
  backend/          Express API, PostgreSQL schema, and workflow tests
  README.md
```

Frontend dependencies and build output live in `frontend/node_modules` and `frontend/dist`. Backend files and database configuration stay in `backend`.

## Local setup

Use Node.js 20.19+ or 22.12+, and PostgreSQL. Create a database named `restaurant_management` in pgAdmin. The configured local PostgreSQL instance for this workspace uses port 5434.

### Backend

Run `npm install` inside `backend`. Copy `.env.example` to `.env.local`, set the PostgreSQL connection values, and generate a strong `JWT_SECRET` (for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). Keep `.env.local` private; it is ignored by Git.

Run `npm run dev` or `npm start` inside `backend`. The API defaults to http://localhost:3001. Startup checks PostgreSQL and applies the idempotent table schema before accepting requests. `GET /health` verifies database readiness.

### Frontend

Run `npm install` inside `frontend`. Copy `frontend/.env.example` to `frontend/.env.local` if needed and set `VITE_API_URL=http://localhost:3001`. Run `npm run dev` or `npm run serve` inside `frontend`, and open http://localhost:8081. Use the signup page to create an owner account. If port 8081 is busy, Vite may use 8082; both are allowed by the local backend configuration. For a different frontend address, add its exact origin to backend `FRONTEND_URL` and restart the backend.

### Start each application

Frontend terminal, from the project root:

```powershell
cd frontend
npm run dev
```

Backend terminal, from the project root:

```powershell
cd backend
npm run dev
```

Each application has its own `package.json` and `package-lock.json`. Run npm commands inside the relevant folder. From the project root you can also use `npm --prefix frontend run dev` or `npm --prefix backend run dev`.

## Verification

- `npm run lint` inside `frontend` checks frontend code.
- `npm run build` inside `frontend` builds the production frontend into `frontend/dist`.
- `npm test` inside `frontend` runs regression tests for switching menus and review drafts. `npm test` inside `backend` runs the PostgreSQL workflow tests. They require local PostgreSQL and the `restaurant_management` database, create isolated QA accounts/restaurants, and remove their fixtures afterward.
- `npm audit` in `frontend` and `backend` checks dependency advisories.

The workflow suite covers signup, login, hashed passwords, ownership isolation, restaurant/menu creation and editing, zero/invalid prices, reviews, deletion with dependent menu items, port 8082 CORS, malformed and oversized requests, and sign-in rate limits.

## Database schema

`backend/schema.sql` is the single PostgreSQL schema used by startup and workflow tests. The application uses PostgreSQL only. Existing database records are preserved when the API starts.

## Authentication and deployment

The management dashboard is an owner workspace; each owner manages their own restaurants. A separate platform administrator dashboard is not implemented.

Signup and login return an eight-hour signed access token. Passwords are hashed with bcrypt and never returned. Login uses `POST /auth/login`; password-in-URL login is disabled. Protected mutations verify the user against PostgreSQL and check the restaurant owner. Client-supplied ownership or role fields cannot grant access.

For deployment, configure backend `DATABASE_URL` or `DB_*` values, `JWT_SECRET`, `PORT`, and the comma-separated allowed `FRONTEND_URL` origins. Set `VITE_API_URL` in the frontend environment before building, deploy `frontend/dist`, and configure the frontend host to serve its `index.html` for SPA routes. Use HTTPS and regular PostgreSQL backups. Public restaurant/menu images support local asset paths, HTTPS/HTTP URLs, or uploaded PNG/JPEG/WebP/GIF data up to the existing 5 MB frontend limit.
