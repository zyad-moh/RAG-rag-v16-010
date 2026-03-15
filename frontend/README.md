# CareerAI Frontend

This repository contains a React-based frontend for the CareerAI web application.

## Getting Started

1. Ensure you have Node.js and npm installed on your machine.
2. Run `npm install` to install dependencies.
3. Start the development server:
   ```bash
   npm run start
   ```
4. The app will open at http://localhost:3000.

## Project Structure

- `public/` – static HTML file.
- `src/` – React source code.
  - `App.jsx` – main application and routing.
  - `pages/` – individual page components.
  - `styles.css` – basic styles.

## API Endpoints

The frontend expects the following backend paths:

- `POST /api/cv/analyze` – upload resume for analysis
- `GET /api/jobs` – fetch job matches with optional query parameters
- `GET /api/skill-gap` – retrieve skill gap data
- `POST /api/resume/optimize` – optimize a resume
- `GET /api/learning/courses` – get recommended courses
- `GET /api/learning/projects` – get recommended projects

Modify these endpoints according to your backend implementation.

## Backend Stub (optional)

A very small FastAPI stub lives in `backend/main.py` and can be started with:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Replace the stub logic with your RAG/AI integration.

## Notes

This project uses a minimal Webpack setup. Feel free to replace with Create React App, Vite, Next.js, or your preferred tooling.
