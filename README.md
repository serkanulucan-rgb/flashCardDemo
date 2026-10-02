# Flashcard App

A lightweight flashcard application built from the project specification in `flashcard-app-spec.md`.

## Features
- Deck management
- Card creation and deletion
- Intent-based categorization
- Category filtering
- Study mode by full deck or selected category
- Local persistence using `localStorage`

## Run locally
The app now uses the MySQL API server. Do not open `index.html` directly because browser requests need to go through the server.

1. Copy `.env.example` to `.env` and set the MySQL connection values.
2. Install dependencies:

```bash
npm install
```

3. Start the app:

```bash
npm start
```

The server creates the `flashcards` database and its `decks` and `cards` tables automatically if they do not already exist. The equivalent SQL is available in `schema.sql`.

Then open:

```text
http://localhost:3000
```

## Project files
- `index.html` – app structure
- `styles.css` – styling
- `app.js` – browser UI state and API calls
- `server.js` – Express API and MySQL connection
- `schema.sql` – database schema reference
- `.env.example` – required connection settings template
- `flashcard-app-spec.md` – product specification
