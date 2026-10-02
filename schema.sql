CREATE DATABASE IF NOT EXISTS `flashcards`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `flashcards`;

CREATE TABLE IF NOT EXISTS decks (
  id CHAR(36) NOT NULL,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_decks_name (name)
) ENGINE=InnoDB;

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
  CONSTRAINT fk_cards_deck
    FOREIGN KEY (deck_id) REFERENCES decks(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
