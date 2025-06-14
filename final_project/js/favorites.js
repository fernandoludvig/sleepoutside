// favorites.js - Favorites functionality
const favoritesSection = document.getElementById("favoritesSection");
const favoritesList = document.getElementById("favoritesList");

function initFavorites() {
  loadFavoritesFromStorage();
}

function loadFavoritesFromStorage() {
  if (!currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
  favorites = userData?.favorites || [];
  displayFavorites();
}

function displayFavorites() {
  favoritesList.innerHTML = favorites.length > 0 
    ? favorites.map(fav => `
        <div class="event-card">
          <div class="event-info">
            <h3>${fav.name}</h3>
            <p><strong>Date:</strong> ${new Date(fav.date).toLocaleDateString()}</p>
            <a href="${fav.url}" target="_blank" class="ticket-btn">View Tickets</a>
            <button class="remove-favorite" data-event-id="${fav.id}">Remove</button>
          </div>
        </div>
      `).join('')
    : '<p>No favorites yet. Add some events!</p>';

  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.dataset.eventId;
      removeFromFavorites(eventId);
    });
  });
}

function addToFavorites(event) {
  if (!currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
  if (!userData.favorites.some(fav => fav.id === event.id)) {
    userData.favorites.push({
      id: event.id,
      name: event.name,
      date: event.dates.start.dateTime || event.dates.start.localDate,
      image: event.images.find(img => img.width === 640)?.url || '',
      url: event.url
    });
    localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
    loadFavoritesFromStorage();
  }
}

function removeFromFavorites(eventId) {
  if (!currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
  userData.favorites = userData.favorites.filter(fav => fav.id !== eventId);
  localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
  loadFavoritesFromStorage();
}