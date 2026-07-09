# Eventim Backend Test

Welcome to the Eventim backend test for new hires (Senior Level). The purpose of this test is to evaluate how you work with an existing codebase, extend it with new functionality, and take ownership of code quality.

## Tech Stack

- Node 22
- Express JS
- PostgreSQL
- MongoDB
- Docker

This API uses two data sources: Events and Tickets are stored in PostgreSQL, and settings should be stored as documents in MongoDB.

## Requirements

- Docker with Docker Compose (to run the databases)
- NVM (to switch to the Node version used in the project)

## Setup

1. Fork this repository into your own GitHub account
2. Clone the fork to your machine
3. Run `nvm use` to switch to the correct Node version
4. Run `yarn install` to install dependencies (we use Yarn, not npm)
5. Copy `.env.example` to `.env` — the defaults match the Docker Compose config and work out of the box
6. Run `docker compose up -d` to start the databases

### Database setup

```bash
yarn migrations:latest   # run PostgreSQL migrations
yarn db:seed             # seed the database — run this multiple times to populate more data
```

### Start the API

```bash
yarn start   # starts the server with nodemon on port 3000
```

Verify it's running: `GET http://localhost:3000/health` should return `{ "status": "ok" }`.

## Tasks

### 1. Settings feature

Implement a settings feature backed by MongoDB (the Mongo instance is already running via Docker Compose):

- `GET /settings` — return the current settings document
- `POST /settings` — create or update the settings document

You decide the shape of the settings document. Look at the existing code structure to understand how the project is organized and follow the same patterns.

### 2. Pagination

`GET /events` currently returns a hardcoded number of results. Implement proper pagination support — the consumer should be able to request a specific page and page size. Think about the response shape and how the frontend would use it.

### 3. Code quality

Review the existing codebase before submitting. If you find any bugs, performance issues, or code quality concerns, fix them. In your pull request description, explain what you changed and why.

### 4. Tests

All new code must be unit tested. Any existing code you modify should also have tests.
