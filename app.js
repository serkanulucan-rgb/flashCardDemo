let state = { decks: [], selectedDeckId: null, studyMode: false, studyIndex: 0 };

const deckForm = document.getElementById('deck-form');
const deckNameInput = document.getElementById('deck-name');
const deckList = document.getElementById('deck-list');
const selectedDeckName = document.getElementById('selected-deck-name');
const statsGrid = document.getElementById('stats-grid');
const cardForm = document.getElementById('card-form');
const cardFrontInput = document.getElementById('card-front');
const cardBackInput = document.getElementById('card-back');
const cardList = document.getElementById('card-list');
const studyPanel = document.getElementById('study-panel');
const studyFront = document.getElementById('study-front');
const studyBack = document.getElementById('study-back');
const studyProgress = document.getElementById('study-progress');

async function apiRequest(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'The request could not be completed.');
  }
  return response.status === 204 ? null : response.json();
}

function showError(error) {
  console.error(error);
  window.alert(error.message || 'Something went wrong.');
}

async function loadState() {
  const loadedState = await apiRequest('/api/state');
  state.decks = loadedState.decks;
  if (!state.decks.some((deck) => deck.id === state.selectedDeckId)) state.selectedDeckId = state.decks[0]?.id || null;
  render();
}

function getSelectedDeck() {
  return state.decks.find((deck) => deck.id === state.selectedDeckId) || state.decks[0] || null;
}

function renderDeckList() {
  deckList.innerHTML = '';
  state.decks.forEach((deck) => {
    const li = document.createElement('li');
    if (deck.id === state.selectedDeckId) li.classList.add('active');
    const info = document.createElement('div');
    info.innerHTML = '<div class="deck-name"></div><div class="meta"></div>';
    info.querySelector('.deck-name').textContent = deck.name;
    info.querySelector('.meta').textContent = `${deck.cards.length} cards`;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      await deleteDeck(deck.id);
    });
    li.addEventListener('click', () => { state.selectedDeckId = deck.id; state.studyMode = false; render(); });
    li.append(info, deleteBtn);
    deckList.appendChild(li);
  });
}

function renderStats() {
  const deck = getSelectedDeck();
  if (!deck) { statsGrid.innerHTML = ''; return; }
  const totalCards = deck.cards.length;
  const reviewed = deck.cards.filter((card) => card.reviewCount > 0).length;
  const due = deck.cards.filter((card) => new Date(card.dueDate) <= new Date()).length;
  const mastery = totalCards ? Math.round((deck.cards.filter((card) => card.reviewCount >= 2).length / totalCards) * 100) : 0;
  const stats = [['Total Cards', totalCards], ['Reviewed', reviewed], ['Due', due], ['Mastery', `${mastery}%`]];
  statsGrid.innerHTML = stats.map(([label, value]) => `<div class="stat-card"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('');
}

function renderCardList() {
  const deck = getSelectedDeck();
  cardList.innerHTML = '';
  if (!deck) { cardList.innerHTML = '<p>No deck selected.</p>'; return; }
  if (!deck.cards.length) { cardList.innerHTML = '<p>No cards in this deck yet.</p>'; return; }
  deck.cards.forEach((card) => {
    const cardItem = document.createElement('div');
    cardItem.className = 'card-item';
    cardItem.innerHTML = '<h4></h4><p></p><div class="card-actions"><button class="delete-card">Delete</button></div>';
    cardItem.querySelector('h4').textContent = card.front;
    cardItem.querySelector('p').textContent = card.back;
    cardItem.querySelector('.delete-card').addEventListener('click', () => deleteCard(card.id));
    cardList.appendChild(cardItem);
  });
}

function renderStudyPanel() {
  const deck = getSelectedDeck();
  if (!deck || !state.studyMode) { studyPanel.classList.add('hidden'); return; }
  studyPanel.classList.remove('hidden');
  if (!deck.cards.length) { studyFront.textContent = 'No cards available for study.'; studyBack.textContent = ''; studyProgress.textContent = '0/0'; return; }
  const card = deck.cards[state.studyIndex] || deck.cards[0];
  studyFront.textContent = card.front;
  studyBack.textContent = card.back;
  studyBack.classList.add('hidden');
  studyProgress.textContent = `${Math.min(state.studyIndex + 1, deck.cards.length)}/${deck.cards.length}`;
}

function render() {
  const deck = getSelectedDeck();
  selectedDeckName.textContent = deck ? deck.name : 'Select a deck';
  renderDeckList();
  renderStats();
  renderCardList();
  renderStudyPanel();
}

async function createDeck(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const deck = await apiRequest('/api/decks', { method: 'POST', body: JSON.stringify({ name: trimmed }) });
  state.decks.push(deck);
  state.selectedDeckId = deck.id;
  render();
}

async function deleteDeck(deckId) {
  await apiRequest(`/api/decks/${deckId}`, { method: 'DELETE' });
  state.decks = state.decks.filter((deck) => deck.id !== deckId);
  if (state.selectedDeckId === deckId) state.selectedDeckId = state.decks[0]?.id || null;
  state.studyMode = false;
  render();
}

async function deleteCard(cardId) {
  await apiRequest(`/api/cards/${cardId}`, { method: 'DELETE' });
  const deck = getSelectedDeck();
  if (deck) deck.cards = deck.cards.filter((card) => card.id !== cardId);
  render();
}

async function addCard(event) {
  event.preventDefault();
  const deck = getSelectedDeck();
  if (!deck) return;
  const front = cardFrontInput.value.trim();
  const back = cardBackInput.value.trim();
  if (!front || !back) return;
  const card = await apiRequest(`/api/decks/${deck.id}/cards`, { method: 'POST', body: JSON.stringify({ front, back }) });
  deck.cards.push(card);
  cardForm.reset();
  render();
}

function openStudySession() {
  const deck = getSelectedDeck();
  if (!deck || !deck.cards.length) return;
  state.studyMode = true;
  state.studyIndex = 0;
  renderStudyPanel();
}

function closeStudySession() {
  state.studyMode = false;
  state.studyIndex = 0;
  renderStudyPanel();
}

async function markCard(rating) {
  const deck = getSelectedDeck();
  const currentCard = deck?.cards[state.studyIndex];
  if (!currentCard) return;
  await apiRequest(`/api/cards/${currentCard.id}/review`, { method: 'PATCH', body: JSON.stringify({ rating }) });
  currentCard.reviewCount = (currentCard.reviewCount || 0) + 1;
  state.studyIndex += 1;
  if (state.studyIndex >= deck.cards.length) { state.studyMode = false; state.studyIndex = 0; render(); return; }
  renderStudyPanel();
}

deckForm.addEventListener('submit', (event) => {
  event.preventDefault();
  createDeck(deckNameInput.value).catch(showError);
  deckNameInput.value = '';
});
cardForm.addEventListener('submit', (event) => addCard(event).catch(showError));
document.getElementById('flip-card').addEventListener('click', () => studyBack.classList.toggle('hidden'));
document.getElementById('close-study').addEventListener('click', closeStudySession);
document.getElementById('study-selected').addEventListener('click', openStudySession);
document.getElementById('mark-again').addEventListener('click', () => markCard('again').catch(showError));
document.getElementById('mark-hard').addEventListener('click', () => markCard('hard').catch(showError));
document.getElementById('mark-good').addEventListener('click', () => markCard('good').catch(showError));
document.getElementById('mark-easy').addEventListener('click', () => markCard('easy').catch(showError));

loadState().catch(showError);
