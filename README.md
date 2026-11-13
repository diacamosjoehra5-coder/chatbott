# CampusGuide AI

A document-based chatbot for the Income-Generating Project Manual. The React app calls an Express API, which uploads the PDF to Gemini and grounds answers in the uploaded manual. The API key stays on the server.

## Run locally

1. Use Node.js 22 or later.
2. Set `GEMINI_API_KEY` in `.env`. Optionally set `GEMINI_MODEL` (defaults to `gemini-2.5-flash`) and `PORT` (defaults to `3001`).
3. Run `npm run dev` to start both the API and web app. Open the Vite URL shown in the terminal.

The PDF is stored at `documents/Income-Generating-Project-Manual.pdf`. The server uploads it on the first chat request and waits for Gemini to finish processing it. The initial request can take longer than later questions.

## API

- `GET /api/health` reports that the API is running.
- `POST /api/chat` accepts `{ "message": "...", "history": [{ "role": "user" | "model", "text": "..." }] }` and returns `{ "answer": "..." }`.
