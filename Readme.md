# Eventim Backend Test

Express API for the Eventim hiring assessment. Events and Tickets live in PostgreSQL (Knex). Settings live in MongoDB (native MongoDB driver).

Routes follow **Controller → DAL → Entity**.

## Tech Stack

- Node 22
- Express JS
- PostgreSQL (Knex)
- MongoDB (native driver)
- Docker

## Requirements

- Docker with Docker Compose (databases only; Express is not a Compose service)
- NVM (run `nvm use` so Node matches `.nvmrc`)
- Yarn (not npm). This repo uses the committed Yarn 3.6.1 binary.

## Setup

1. Clone this repository
2. Run `nvm use` to switch to the Node version in `.nvmrc`
3. Run `yarn install` to install dependencies
4. Copy `.env.example` to `.env`. The defaults match Docker Compose and work out of the box.
5. Run `docker compose up -d` to start PostgreSQL, MongoDB, and the optional database UIs (Adminer, mongo-express)

Express is a local Node process, not a Docker Compose service.

### Database setup

```bash
yarn migrations:latest   # run PostgreSQL migrations
yarn db:seed             # seed the database. Run this multiple times to populate more data.
```

### Start the API

```bash
yarn start   # nodemon, listens on port 3000
```

Verify: `GET http://localhost:3000/health` should return `{ "status": "ok" }`.

The frontend is a separate repository. After this API is running, start it with Vite and open [http://localhost:5173](http://localhost:5173). Both processes must run at the same time. The browser talks to Vite; Vite proxies `/events` and `/settings` to this API on port 3000.

## API

- `GET /health` - `{ "status": "ok" }`
- `GET /events` - events and tickets from PostgreSQL
- `GET /settings` and `POST /settings` - see Settings API below

## Settings API

### Settings data model

Public Settings JSON has exactly these fields:

| Field | Type | Description |
|---|---|---|
| `siteName` | string | Required. |
| `contactEmail` | string | Required. Backend checks that the value is a string, not that it is a valid email. |
| `maintenanceMode` | boolean | Required. `false` is valid. |

### Persistence

MongoDB collection `settings` stores one document:

```json
{
  "_id": "current",
  "siteName": "See Tickets",
  "contactEmail": "test@example.com",
  "maintenanceMode": false
}
```

`_id = "current"` is the singleton key. It is not part of the public API. Responses omit `_id` and return only the three fields above.

### GET /settings

Returns the current Settings object.

| Status | When |
|---|---|
| 200 | Document exists |
| 404 | No Settings document yet (before the first successful `POST /settings`) |
| 500 | Database or server error |

200:

```json
{
  "siteName": "See Tickets",
  "contactEmail": "test@example.com",
  "maintenanceMode": false
}
```

404:

```json
{ "error": "Settings not found" }
```

500:

```json
{ "error": "Internal server error" }
```

### POST /settings

JSON body must include all three fields with the types above. Extra persistence keys such as `_id` are not part of the accepted Settings object.

| Status | When |
|---|---|
| 200 | Saved. Response is the saved Settings object (no `_id`) |
| 400 | Missing fields, wrong types (for example `maintenanceMode` as a string), or a non-object body |
| 500 | Database or server error |

Request body (and 200 response):

```json
{
  "siteName": "GTS Assessment",
  "contactEmail": "test@example.com",
  "maintenanceMode": true
}
```

400:

```json
{ "error": "Invalid request" }
```

500:

```json
{ "error": "Internal server error" }
```

### API response shape

Public JSON is only:

```json
{
  "siteName": "...",
  "contactEmail": "...",
  "maintenanceMode": false
}
```

`_id` is never returned.

## Tests

```bash
yarn test
```

## Architecture Decisions

**Database separation.** Events and Tickets stay on PostgreSQL through Knex. Settings uses MongoDB through the native driver. The Events stack was already Knex/Postgres; Settings was added as a document store without migrating or rewriting Events.

**Settings singleton.** The app has one Settings record, stored as MongoDB `_id = "current"`. That id is a persistence key only. The API returns `siteName`, `contactEmail`, and `maintenanceMode`. It does not expose `_id`.

**Layering.** `index.ts` boots the process and registers routes. Controllers own HTTP and validation. DALs own database access. Entities own shapes. Settings follows the existing Controller → DAL → Entity layout. A service, repository, or DI container would add types without changing the request path.

**MongoDB connection.** One `MongoClient` is created, connected at startup, and the connected `Db` is passed into the Settings DAL. Settings routes are registered only after `connect()` succeeds, so those handlers never run against a closed client. If MongoDB is down, the process exits instead of serving a half-ready API.

**Error responses.** Controllers return generic JSON such as `{ "error": "Invalid request" }` or `{ "error": "Internal server error" }`. Driver errors stay on the server so connection details and stack traces do not reach the browser.
