// favorites.js - Updated for Ticketmaster data
function initFavorites() {
  loadFavoritesFromStorage();
}

function loadFavoritesFromStorage() {
  if (!appState.currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`));
  appState.favorites = userData?.favorites || [];
  displayFavorites();
}

function displayFavorites() {
  favoritesList.innerHTML = appState.favorites.length > 0 
    ? appState.favorites.map(fav => `
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
            <button class="remove-favorite" data-event-id="${fav.id}">Remover</button>
          </div>
        </div>
      `).join('')
    : '<p>No favorited events yet. Add some!</p>';

  // Add event listeners
  document.querySelectorAll('.remove-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.dataset.eventId;
      removeFromFavorites(eventId);
    });
  });
}

function addToFavorites(event) {
  if (!appState.currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`));
  if (!userData.favorites.some(fav => fav.id === event.id)) {
    const venue = event._embedded?.venues?.[0]?.name || 'TBD';
    
    userData.favorites.push({
      id: event.id,
      name: event.name,
      date: event.dates.start.dateTime || event.dates.start.localDate,
      image: event.images?.find(img => img.width === 640)?.url || event.images?.[0]?.url || '',
      url: event.url,
      venue: venue
    });
    
    localStorage.setItem(`user_${appState.currentUser}`, JSON.stringify(userData));
    loadFavoritesFromStorage();
  }
}

function removeFromFavorites(eventId) {
  if (!appState.currentUser) return;
  
  const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`));
  userData.favorites = userData.favorites.filter(fav => fav.id !== eventId);
  localStorage.setItem(`user_${appState.currentUser}`, JSON.stringify(userData));
  loadFavoritesFromStorage();
}