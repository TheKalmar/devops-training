# DevOps Training: Task Management API

A small REST API for a beginner to run and configure locally. There is no frontend, authentication or infrastructure configuration. Read **STUDENT_TASK.md** for the assignment.

**Stack:** Next.js App Router, TypeScript, Node.js 24 LTS, npm, MySQL 8 and mysql2. SQL is written directly, with parameterized values. React is installed because Next.js requires it; no UI is included.

## Run locally

1. Have Node.js 24 LTS and a reachable MySQL 8 database ready.
2. Create a database and a database user with permission to create its table and perform CRUD operations. Database setup is the student's task.
3. Copy `.env.example` to `.env.local`. Replace all example values with your local connection settings. `DB_HOST` and `DB_PORT` must be reachable from the machine running Node.js. Never commit `.env.local`.
4. Initialize the selected empty database using the MySQL client (replace the placeholders):

   ```sh
   mysql -h <host> -P <port> -u <user> -p <database_name> < database/init.sql
   ```

   This prompts for the password. Alternatively, in a MySQL client connected to the selected database, execute the contents of `database/init.sql`. The script creates one table and three tasks. Run it once: rerunning it intentionally fails rather than modifying existing data.
5. Install the locked dependencies and start the app:

   ```sh
   npm ci
   npm run dev
   ```

The API runs at `http://localhost:3000`. Restart it after changing environment variables. For production mode locally, run `npm run build` followed by `npm start`. Building does not require a database connection.

## API

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/health` | API and database connectivity, 200 or 503 |
| GET | `/api/tasks` | All tasks, ordered by ID |
| GET | `/api/tasks/:id` | One task, or 404 |
| POST | `/api/tasks` | Create a task, 201 |
| PUT | `/api/tasks/:id` | Replace title and completed, 200 or 404 |
| DELETE | `/api/tasks/:id` | Delete a task, 200 or 404 |

Send JSON with `Content-Type: application/json`. Titles are trimmed and must have 1–255 characters. `completed` is a JSON boolean, not a string. POST defaults it to false; PUT requires both fields. IDs are positive integers. Unknown body fields, malformed JSON and invalid values return 400. Database failures return 503 with a generic JSON error. No credentials are returned.

POST `/api/tasks` request:

```json
{ "title": "Learn environment variables" }
```

Response (201, with a `Location` header):

```json
{ "id": 4, "title": "Learn environment variables", "completed": false }
```

PUT `/api/tasks/4` request and response (200):

```json
{ "title": "Learn environment variables", "completed": true }
```

```json
{ "id": 4, "title": "Learn environment variables", "completed": true }
```

GET `/api/tasks` returns an array of these task objects. GET `/api/tasks/4` returns one object. DELETE returns `{"message":"Task deleted."}`. A missing task returns `{"error":"Task not found."}` (404). Health returns `{"status":"ok","database":"connected"}` when MySQL responds; it checks connectivity, not whether the tasks table has been initialized.

Example terminal requests (POSIX shell; Postman also works):

```sh
curl http://localhost:3000/api/health
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks -H 'Content-Type: application/json' -d '{"title":"My first task"}'
```

## Automated checks

```sh
npm run typecheck
npm run build
npm test
```

`npm test` runs validation tests without MySQL, using Node's built-in test runner. No test framework is needed.

For real HTTP/database integration tests, create a **separate empty test database** whose name ends in `_test`, initialize it with `database/init.sql`, and make `.env.test` with the same five variables as `.env.example`, pointing to that test database. Never point tests to your regular database. Then:

```sh
npm run build
npm run test:api
```

The API tests start and stop a production-mode server on port 3100 themselves. Leave that port free. They use the real database, cover health, all CRUD operations, unchanged updates, not-found responses, validation and SQL-looking titles. They remove only tasks they create, not pre-existing records. An interrupted test can leave its test tasks behind. Missing `.env.test`, an uninitialized database, or unavailable MySQL causes failure, not a fake pass.

No Docker, CI/CD, Kubernetes, Terraform or cloud deployment solution is included. This API is for local training, not public production exposure.
