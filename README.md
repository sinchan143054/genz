# Gen Z Growth Companion

An AI-powered personal growth platform built with Next.js, TypeScript, Tailwind CSS, Framer Motion, FastAPI, and PostgreSQL. The experience includes secure email/password authentication, a supportive AI companion, a polished journal, an animated life tree, insights dashboards, and customizable settings.

## Features
- Landing page, sign up, sign in
- Email/password authentication with JWT and protected dashboard routes
- AI companion chat with streaming assistant responses, voice input, and file upload support
- Journal with rich UI, search, archive, restore, and soft delete
- Animated life tree that reflects journal mood data
- Insights with happiness score, streaks, emotion timeline, and top moods
- Settings page for profile, theme, accent color, language, and password change
- Backend API with FastAPI, PostgreSQL, OpenAI integration, and file uploads
- Docker Compose deployment for frontend, backend, and database

## Project Structure
- `frontend/` — Next.js client application
- `backend/` — FastAPI backend service
- `docker-compose.yml` — Development containers for PostgreSQL, backend, and frontend

## Setup

### 1. Clone the repository

```bash
cd /path/to/project
```

### 2. Backend

Copy the backend environment example and set secrets:

```bash
cd backend
copy .env.example .env
```

Update `.env` with your values:
- `DATABASE_URL` for PostgreSQL
- `JWT_SECRET_KEY` for JWT signing
- `OPENAI_API_KEY` for OpenAI access
- `BACKEND_URL` for local backend host
- `FRONTEND_URL` for the browser origin that will call the API (for Docker, this should be `http://localhost:3002`)

Install backend dependencies:

```bash
python -m pip install -r requirements.txt
```

### 3. Frontend

Copy the frontend environment example:

```bash
cd ../frontend
copy .env.example .env
```

Install frontend dependencies:

```bash
npm install
```

### 4. Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

Frontend will be available at `http://localhost:3002`, backend at `http://localhost:8002`, and PostgreSQL on host port `5435`.

### 5. Seed sample data

From the backend directory:

```bash
python seed.py
```

The sample user is:
- Email: `hello@genzgrowth.app`
- Password: `Growth2026!`

## Development

- `frontend/` contains the Next.js app
- `backend/` contains the FastAPI API and database models
- `backend/app/main.py` initializes the API and includes all routes
- `frontend/app` contains the React pages and protected dashboard UI

## Notes

- The backend uses modern JWT auth with password hashing and email/password registration.
- The AI companion sends streaming responses from OpenAI using an SSE-style endpoint.
- The project is designed with a premium glassmorphism aesthetic, animated transitions, and responsive layout.

## Validation

- Frontend build passed successfully with `npm run build`.
- Backend Python files compile successfully with `python -m py_compile`.

Enjoy building and expanding the Gen Z Growth Companion experience.
