# Flashcard App Specification

## Overview
A lightweight flashcard application for learning and revising topics through question-and-answer study cards. The app should support creating decks, studying cards, tracking progress, and reviewing difficult cards more often.

## Goals
- Help users create and organize study decks
- Make revision fast and focused
- Track learning progress over time
- Support spaced repetition or review prioritization
- Work well on desktop and mobile screens

## Core Features

### 1. Deck Management
- Create a new deck
- Delete a deck
- View all decks in a dashboard
- Select a deck to work with

### 2. Card Management
- Add a new flashcard with:
  - front text
  - back text
- Delete a card
- View all cards inside the selected deck

### 3. Study Mode
- Study cards from one deck at a time
- Show front side first
- Flip card to reveal back side
- Rate answer as:
  - Again
  - Hard
  - Good
  - Easy
- Move to the next card after review
- Track session progress

### 4. Progress Tracking
- Show total cards in deck
- Show number of reviewed cards
- Show due cards count
- Show mastery percentage based on review activity

### 5. User Experience
- Clean and minimal UI
- Clear buttons for card review actions
- Responsive layout for desktop and smaller screens
- Local persistence using browser storage

## Suggested User Flow
1. User creates a deck
2. User adds flashcards
3. User clicks “Study Deck”
4. App presents cards one by one
5. User flips and rates their answer
6. App updates review schedule and stats
7. User reviews due cards again later

## Data Model

### Deck
- id: string
- name: string
- cards: Card[]

### Card
- id: string
- front: string
- back: string
- createdAt: datetime
- dueDate: datetime
- reviewCount: number

## Example App Screens

### Dashboard
- Deck list
- Total number of decks
- Total cards studied today
- Upcoming due reviews
- Quick actions: Add deck, Study now

### Deck Detail Page
- Deck name
- Card count
- Add card button
- Study button
- Delete card action

### Study Page
- Card front
- Flip button
- Answer reveal
- Rating buttons
- Progress indicator

## Technical Considerations
- Use browser localStorage for persistence
- Keep the app simple and lightweight
- Support multiple decks with independent card sets
- Maintain a small and fast single-page interface

## Nice-to-Have Features
- card editing
- deck renaming
- improved spaced repetition tuning
- CSV export/import
- better analytics and review history

## Acceptance Criteria
- User can create at least one deck
- User can add cards to a deck
- User can delete cards
- User can study cards in sequence
- User can flip and reveal the answer
- User can rate answer quality
- App updates progress after each review
- UI works on small and large screens

## MVP Scope
For the first version, focus on:
- deck creation
- card creation and deletion
- simple study mode
- progress tracking
- local persistence

## Future Enhancements
- deck rename functionality
- card editing
- smarter review scheduling
- cloud sync across devices
- richer statistics and analytics

## Technology Stack
- HTML5 for app structure
- CSS3 for styling and responsive layout
- Vanilla JavaScript for app logic and state handling
- Browser localStorage for persistent deck and card data
- No backend, database, or framework required for the current MVP

## Project Structure
```text
flashcard-app/
  index.html
  styles.css
  app.js
  README.md
  flashcard-app-spec.md
```

## Summary
This app is a lightweight flashcard study tool focused on simple, fast revision. The final implementation supports creating decks, adding cards, and studying them in sequence with a review workflow. It keeps the experience focused and portable by storing all data locally in the browser and prioritizing usability over complex advanced features.
