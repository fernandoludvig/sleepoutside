// favorites.js - Favorite event handling
import { appState } from './state.js';

const favoritesList = document.getElementById('favoritesList');

function initFavorites() {
  loadFavoritesFromStorage();
  displayFavorites();
}

function loadFavoritesFromStorage() {
  if (!appState.currentUser) return;

  try {
    const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`));
    appState.favorites = userData?.favorites || [];
  } catch (e) {
    console.error("Failed to parse user data:", e);
    appState.favorites = [];
  }
}

function saveFavoritesToStorage() {
  if (!appState.currentUser) return;

  const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`)) || {};
  userData.favorites = appState.favorites;
  localStorage.setItem(`user_${appState.currentUser}`, JSON.stringify(userData));
}

function displayFavorites() {
  if (!favoritesList) return;

  if (appState.favorites.length === 0) {
    favoritesList.innerHTML = '<p>No favorited events yet. Add some!</p>';
    return;
  }

  favoritesList.innerHTML = appState.favorites.map(fav => `
    <div class="event-card">
      ${fav.image ? `
        <div class="event-image">
          <img src="${fav.image}" alt="${fav.name}" loading="lazy">
        </div>
      ` : ''}
      <div class="event-info">
        <h3>${fav.name}</h3>
        <p><strong>Date:</strong> ${new Date(fav.date).toLocaleDateString('pt-BR')}</p>
        <p><strong>Venue:</strong> ${fav.venue || 'TBD'}</p>
        <a href="${fav.url}" target="_blank" class="ticket-btn">Ingressos</a>
        <button class="remove-favorite" data-event-id="${fav.id}">Remove</button>
      </div>
    </div>
  `).join('');

  bindRemoveFavoriteButtons();
}

function bindRemoveFavoriteButtons() {
  document.querySelectorAll('.remove-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.dataset.eventId;
      removeFromFavorites(eventId);
    });
  });
}

function addToFavorites(event) {
  if (!appState.currentUser || !event) return;

  const alreadyExists = appState.favorites.some(fav => fav.id === event.id);
  if (alreadyExists) return;

  const venue = event._embedded?.venues?.[0]?.name || 'TBD';

  const favorite = {
    id: event.id,
    name: event.name,
    date: event.dates?.start?.dateTime || event.dates?.start?.localDate || '',
    image: event.images?.find(img => img.width === 640)?.url || event.images?.[0]?.url || '',
    url: event.url,
    venue
  };

  appState.favorites.push(favorite);
  saveFavoritesToStorage();
  displayFavorites();
}

function removeFromFavorites(eventId) {
  if (!appState.currentUser) return;

  appState.favorites = appState.favorites.filter(fav => fav.id !== eventId);
  saveFavoritesToStorage();
  displayFavorites();
}

export {
  initFavorites,
  addToFavorites,
  removeFromFavorites,
  loadFavoritesFromStorage
};
