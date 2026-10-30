# Restaurant Management

Vue 3 / Vite frontend and Express / PostgreSQL backend. Each owner manages their own restaurants, menu items, tables, and orders. Restaurant browsing and public menus do not require an account.

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
    src/
      config/       Environment loading and PostgreSQL pool creation
      controllers/  Authentication, restaurants, menus, tables, orders, reviews, and health handlers
      middleware/   Authentication, rate limits, body validation, and error handling
      routes/       Express route definitions by feature
      utils/        Validation, restaurant ownership checks, and schema setup
      app.js        Express application factory
      server.js     Database initialization, server startup, and shutdown
    test/           PostgreSQL workflow and rate limit tests
    schema.sql
    package.json
    package-lock.json
  README.md
```

Frontend dependencies and build output live in `frontend/node_modules` and `frontend/dist`. Backend files and database configuration stay in `backend`.

## Local setup

Use Node.js 20.19+ or 22.12+, and PostgreSQL. Create a database named `restaurant_management` in pgAdmin. The configured local PostgreSQL instance for this workspace uses port 5434.

### Backend

Run `npm install` inside `backend`. Copy `.env.example` to `.env.local`, set the PostgreSQL connection values, and generate a strong `JWT_SECRET` (for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). Keep `.env.local` private; it is ignored by Git.

Run `npm run dev` or `npm start` inside `backend`. Both use `src/server.js`; environment files remain in the backend root. The API defaults to http://localhost:3001. Startup checks PostgreSQL and applies the idempotent table schema before accepting requests. `GET /health` verifies database readiness.

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

Run `npm run test:structure` inside `backend` for the backend restructuring regression tests without PostgreSQL. These exercise public and protected routes through HTTP, invalid/expired tokens, deleted users, private-field filtering, nested menu routing, shared database error handling, and independent app databases, JWT secrets, and rate limits. Configuration tests use temporary fixture files to verify environment precedence, invalid settings, and schema loading from unrelated working directories. `npm test` includes these tests alongside the PostgreSQL workflow suite, which also exercises the extracted schema helper against the local database.

## Database schema

`backend/schema.sql` is the single PostgreSQL schema used by startup and workflow tests. The application uses PostgreSQL only. Existing database records are preserved when the API starts.

## Tables and orders

Restart the backend after updating to load the new routes. Startup automatically creates the additional `restaurant_tables`, `orders`, and `order_items` tables using the existing schema setup. Existing restaurants, menus, users, and reviews are preserved.

Open **Tables** in the owner workspace, select a restaurant, and create tables with a name and seating capacity. Table names must be unique within that restaurant. A table is available when it has no active order. Occupied tables cannot be renamed, resized, or deleted until their order is completed or cancelled.

Open **Orders** or choose **Start an order** on a table. Select dishes, set quantities, enter the number of guests, and optionally add notes. Orders can also be created without a table for takeaway. Guest counts cannot exceed the assigned table’s capacity. Each table can have only one active order; concurrent requests are checked inside a database transaction and protected by a unique index.

Order totals are calculated on the backend using PostgreSQL decimal arithmetic and current menu prices. Prices and dish names are stored on the order so later menu edits or deletion do not change the saved order. Pending orders allow item/quantity replacement; saving an edit reapplies current menu prices to all items. Once preparation starts, items are locked.

The order workflow is **Pending → Preparing → Ready → Served → Completed**. Active orders may also be cancelled. Completed and cancelled orders appear under **Order history**, and their tables become available. Completion records the service state; it does not record or process a payment. Deleted tables retain their names on historical orders. Deleting a restaurant deletes its tables and order history as well as its menu items. Use the refresh buttons to see changes made from another session.

All table and order endpoints require a bearer token and verify restaurant ownership:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/tables?restaurant_id=ID` | List tables with availability and active order IDs |
| POST | `/tables` | Create a table with `restaurant_id`, `name`, and `capacity` |
| PUT | `/tables/:id` | Update an available table’s `name` and `capacity` |
| DELETE | `/tables/:id` | Delete an available table |
| GET | `/orders?restaurant_id=ID` | List orders and their item snapshots, newest first |
| POST | `/orders` | Create an order with `restaurant_id`, optional `table_id`, `guests`, `notes`, and `items` |
| PUT | `/orders/:id/items` | Replace a pending order’s `items` |
| PATCH | `/orders/:id/status` | Advance or cancel an order using `status` |

Order items use `{ "menu_id": 1, "quantity": 2 }`. An order requires 1–100 distinct dishes, with integer quantities from 1–99. Table capacity and guest counts range from 1–500; notes allow up to 2,000 characters.

`npm test` inside `backend` includes PostgreSQL tests for table CRUD, ownership, capacity, price snapshots, item editing, status transitions, rollback, and simultaneous table bookings. Suites run sequentially to avoid racing schema initialization on a fresh database. `npm test` inside `frontend` also covers order previews, draft recovery, restaurant-switch races, and table availability refreshes.

## Authentication and deployment

The management dashboard is an owner workspace; each owner manages their own restaurants. A separate platform administrator dashboard is not implemented.

Signup and login return an eight-hour signed access token. Passwords are hashed with bcrypt and never returned. Login uses `POST /auth/login`; password-in-URL login is disabled. Protected mutations verify the user against PostgreSQL and check the restaurant owner. Client-supplied ownership or role fields cannot grant access.

For deployment, configure backend `DATABASE_URL` or `DB_*` values, `JWT_SECRET`, `PORT`, and the comma-separated allowed `FRONTEND_URL` origins. Set `VITE_API_URL` in the frontend environment before building, deploy `frontend/dist`, and configure the frontend host to serve its `index.html` for SPA routes. Use HTTPS and regular PostgreSQL backups. Public restaurant/menu images support local asset paths, HTTPS/HTTP URLs, or uploaded PNG/JPEG/WebP/GIF data up to the existing 5 MB frontend limit.
