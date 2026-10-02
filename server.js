require('dotenv').config();

const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3000);
const databaseName = process.env.DB_NAME || 'flashcards';

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
};

let pool;

function quoteIdentifier(identifier) {
  return `\`${identifier.replaceAll('`', '``')}\``;
}

async function initializeDatabase() {
  const bootstrap = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(databaseName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await bootstrap.end();

  pool = mysql.createPool(dbConfig);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS decks (
      id CHAR(36) NOT NULL,
      name VARCHAR(60) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_decks_name (name)
    ) ENGINE=InnoDB
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cards (
      id CHAR(36) NOT NULL,
      deck_id CHAR(36) NOT NULL,
      front VARCHAR(200) NOT NULL,
      back TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      review_count INT UNSIGNED NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      KEY idx_cards_deck_id (deck_id),
      KEY idx_cards_due_date (due_date),
      CONSTRAINT fk_cards_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);
}

function mapCard(row) {
  return {
    id: row.id,
    front: row.front,
    back: row.back,
    createdAt: row.created_at,
    dueDate: row.due_date,
    reviewCount: row.review_count,
  };
}

async function getState() {
  const [decks] = await pool.query('SELECT id, name FROM decks ORDER BY created_at, name');
  const [cards] = await pool.query(
    'SELECT id, deck_id, front, back, created_at, due_date, review_count FROM cards ORDER BY created_at',
  );

  return {
    decks: decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      cards: cards.filter((card) => card.deck_id === deck.id).map(mapCard),
    })),
  };
}

function requireText(value, field, maxLength) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    const error = new Error(`${field} is required and must be at most ${maxLength} characters.`);
    error.status = 400;
    throw error;
  }
  return value.trim();
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: databaseName });
  } catch (error) {
    next(error);
  }
});

app.get('/api/state', async (req, res, next) => {
  try {
    res.json(await getState());
  } catch (error) {
    next(error);
  }
});

app.post('/api/decks', async (req, res, next) => {
  try {
    const name = requireText(req.body.name, 'Deck name', 60);
    const id = crypto.randomUUID();
    await pool.execute('INSERT INTO decks (id, name) VALUES (?, ?)', [id, name]);
    res.status(201).json({ id, name, cards: [] });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/decks/:deckId', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM decks WHERE id = ?', [req.params.deckId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Deck not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post('/api/decks/:deckId/cards', async (req, res, next) => {
  try {
    const front = requireText(req.body.front, 'Card front', 200);
    const back = requireText(req.body.back, 'Card back', 500);
    const id = crypto.randomUUID();
    const [decks] = await pool.execute('SELECT id FROM decks WHERE id = ?', [req.params.deckId]);
    if (!decks.length) return res.status(404).json({ error: 'Deck not found.' });

    await pool.execute('INSERT INTO cards (id, deck_id, front, back) VALUES (?, ?, ?, ?)', [id, req.params.deckId, front, back]);
    res.status(201).json({ id, front, back, reviewCount: 0 });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/cards/:cardId', async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM cards WHERE id = ?', [req.params.cardId]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Card not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.patch('/api/cards/:cardId/review', async (req, res, next) => {
  try {
    const allowedRatings = new Set(['again', 'hard', 'good', 'easy']);
    if (!allowedRatings.has(req.body.rating)) return res.status(400).json({ error: 'Invalid rating.' });

    const days = { again: 0, hard: 1, good: 2, easy: 4 }[req.body.rating];
    await pool.execute(
      'UPDATE cards SET review_count = review_count + 1, due_date = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id = ?',
      [days, req.params.cardId],
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A deck with that name already exists.' });
  console.error(error);
  res.status(error.status || 500).json({ error: 'The server could not complete the request.' });
});

async function start() {
  if (!dbConfig.host || !dbConfig.user || !dbConfig.password) {
    throw new Error('DB_HOST, DB_USER, and DB_PASSWORD must be set in .env.');
  }
  await initializeDatabase();
  app.listen(port, () => console.log(`Flashcard app running at http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Startup failed:', error.message);
  process.exitCode = 1;
});
