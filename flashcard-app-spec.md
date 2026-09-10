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
- Rename a deck
- Delete a deck
- View all decks in a dashboard
- Search or filter decks by name

### 2. Intent-Based Categorization 
- Each card can be assigned to one or more intent categories
- Categories represent the purpose or context of the content, such as:
  - Vocabulary
  - Concept recall
  - Problem solving
  - Definitions
  - Facts and formulas
  - Practical application
  - Interview prep
  - Language learning
  - Others
- Users can create custom categories
- Users can rename or delete categories
- Cards can be filtered by category in the deck view
- Study sessions can be limited to one category or multiple categories
- Category statistics show how many cards are due or mastered in each category

### 3. Card Management
- Add a new flashcard with:
  - front text
  - back text
  - optional tags
  - optional category
  - optional intent category
- Edit an existing card
- Delete a card
- Mark a card as favorite or starred
- Bulk import cards from CSV or JSON
- Allow import/export of category mappings

### 4. Study Mode
- Study cards from one deck at a time
- Study by category or by full deck
- Show front side first
- Flip card to reveal back side
- Rate answer as:
  - Again
  - Hard
  - Good
  - Easy
- Move to next card after review
- Track session progress
- Show category-specific study stats during a session

### 4. Progress Tracking
- Show total cards in deck
- Show cards reviewed today
- Show mastery percentage
- Show streaks or review consistency
- Show due cards for review

### 5. Spaced Repetition (Optional but Recommended)
- Schedule review based on rating
- Reintroduce difficult cards more often
- Defer easy cards to later
- Show due cards first

### 6. User Experience
- Clean and minimal UI
- Clear buttons for review actions
- Keyboard shortcuts support
- Responsive design for mobile and desktop
- Dark mode option

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
- description: string
- createdAt: datetime
- updatedAt: datetime
- cardCount: number

### Card
- id: string
- deckId: string
- front: string
- back: string
- tags: string[]
- category: string
- intentCategory: string
- intentTags: string[]
- createdAt: datetime
- updatedAt: datetime
- dueDate: datetime
- intervalDays: number
- easeFactor: number
- reviewCount: number
- masteryLevel: number

### IntentCategory
- id: string
- name: string
- description: string
- color: string
- isCustom: boolean
- createdAt: datetime
- cardCount: number

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
- Review button
- Category filter tabs or dropdown
- Search cards
- Filter by intent category
- Edit/delete controls for cards

### Category Management Page
- List of all intent categories
- Add custom category
- Rename category
- Delete category
- View number of cards in each category
- Assign a color for visual grouping

### Study Page
- Card front
- Category badge indicating intent
- Flip button
- Answer reveal
- Rating buttons
- Progress indicator
- Optional “study only selected category” filter

### Settings Page
- Theme selection
- Review defaults
- Notification preferences
- Data export/import

## Technical Considerations
- Use a local-first storage approach for simplicity
- Support browser storage or a lightweight backend database
- Keep JSON or SQLite as data store options
- Ensure card data is easy to export/import

## Nice-to-Have Features
- Audio pronunciation support
- Image support on cards
- Deck sharing
- AI-generated flashcards from notes
- Import from PDF, text, or markdown
- Learning analytics charts

## Acceptance Criteria
- User can create at least one deck
- User can add cards to a deck
- User can assign an intent category to each card
- User can create and manage custom categories
- User can filter cards by category
- User can study cards in sequence or by category
- User can flip and reveal the answer
- User can mark answer difficulty
- App updates progress after each review
- User can edit or delete cards
- UI works on small and large screens
- Category stats reflect card counts and review progress accurately

## MVP Scope
For the first version, focus on:
- deck creation
- card creation
- intent-based categorization
- category management
- study mode by full deck or selected category
- progress tracking
- simple review scheduling

## Future Enhancements
- spaced repetition algorithm tuning
- mobile app version
- cloud sync across devices
- AI-created flashcards from imported content
- collaborative deck sharing

## Suggested Project Structure
```text
flashcard-app/
  src/
    components/
    pages/
    hooks/
    utils/
    services/
    types/
  public/
  data/
  README.md
  package.json
```

## Summary
This app should feel simple, fast, and focused on daily revision. The core value is helping users learn effectively by turning content into quick, repeatable review sessions with measurable progress. Intent-based categorization adds a stronger learning structure by allowing users to sort cards by their purpose, such as definitions, recall, formulas, or application, so revision becomes more targeted and intentional.
