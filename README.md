# Academy Tracker

Academy Tracker is a React/Vite, Spring Boot, PostgreSQL and pgAdmin project managed with Docker Compose.

## Clean start

From the project root:

```bash
docker compose down -v --remove-orphans
docker compose up -d --build
```

The backend Docker image compiles the Spring Boot application automatically. You do not need to run Maven manually before `docker compose up`.

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- pgAdmin: http://localhost:5050

Local development values are stored in `.env`. Change every password and secret before sharing or deploying the project.

## Local credentials

The included `.env` uses these local-only values:

- pgAdmin email: `admin@example.com`
- pgAdmin password: `admin123`
- Instructor registration code: `Secret_Code`
- PostgreSQL database: `academy_tracker`
- PostgreSQL user: `vladi`
- PostgreSQL password: `password123`

## pgAdmin database connection

After signing in to pgAdmin, add a server with:

- Host: `db`
- Port: `5432`
- Maintenance database: value of `POSTGRES_DB`
- Username: value of `POSTGRES_USER`
- Password: value of `POSTGRES_PASSWORD`

## Local frontend development

Start the backend and database first, then:

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8080`.

## Backend tests

```bash
cd backend/tracker
./mvnw test
```

On Windows use:

```cmd
mvnw.cmd test
```
