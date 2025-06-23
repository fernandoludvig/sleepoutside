// events.js - Ticketmaster API integration
import { TICKETMASTER_API_KEY } from './config.js';
import { appState } from './state.js';
import { addToFavorites } from './favorites.js'; // ✅ Certifique-se de que está exportando

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const eventsList = document.getElementById('eventsList');

function initEvents() {
  const searchForm = document.getElementById("eventSearchForm");

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = document.getElementById("eventKeyword").value.trim();
    const location = document.getElementById("eventLocation").value.trim();
    fetchEvents(keyword, location);
  });

  // Busca inicial sem filtro
  fetchEvents();
}

async function fetchEvents(keyword = '', city = '') {
  try {
    showLoading(true);
    eventsList.innerHTML = '';

    const params = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      countryCode: 'BR',
      size: 12,
      keyword,
      locale: 'pt-BR',
      sort: 'date,asc'
    });

    if (city) {
      params.append('city', city);
    }

    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const events = data._embedded?.events;

    if (!events || events.length === 0) {
      eventsList.innerHTML = '<p>No events found. Try different search terms.</p>';
      return;
    }

    displayEvents(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    eventsList.innerHTML = `<p>Error loading events: ${error.message}</p>`;
  } finally {
    showLoading(false);
  }
}

function showLoading(show) {
  let loadingElement = document.getElementById('loadingIndicator');

  if (!loadingElement) {
    loadingElement = document.createElement('div');
    loadingElement.id = 'loadingIndicator';
    loadingElement.style.textAlign = 'center';
    loadingElement.style.padding = '20px';
    loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading events...</p>
    `;
    eventsList.before(loadingElement);
  }

  loadingElement.style.display = show ? 'block' : 'none';
}

function displayEvents(events) {
  eventsList.innerHTML = events.map(event => {
    const venue = event._embedded?.venues?.[0] || {};
    const image = event.images?.find(img => img.width === 640) || event.images?.[0] || {};
    const dateInfo = event.dates?.start;
    const priceRange = event.priceRanges?.[0];

    const dateHTML = dateInfo?.dateTime
      ? `
        <p><strong>Date:</strong> ${new Date(dateInfo.dateTime).toLocaleDateString('pt-BR')}</p>
        <p><strong>Time:</strong> ${new Date(dateInfo.dateTime).toLocaleTimeString('pt-BR', {
          hour: '2-digit', minute: '2-digit'
        })}</p>`
      : dateInfo?.localDate
      ? `<p><strong>Date:</strong> ${new Date(dateInfo.localDate).toLocaleDateString('pt-BR')}</p>`
      : '<p><strong>Date:</strong> To be announced</p>';

    const priceHTML = priceRange
      ? `<p><strong>Price:</strong> R$${priceRange.min.toFixed(2)}${priceRange.max ? ` - R$${priceRange.max.toFixed(2)}` : '+'}</p>`
      : '<p><strong>Price:</strong> Contact venue</p>';

    return `
      <div class="event-card">
        <div class="event-image">
          <img src="${image.url || 'img/event-placeholder.jpg'}" alt="${event.name}" loading="lazy">
        </div>
        <div class="event-info">
          <h3>${event.name}</h3>
          ${dateHTML}
          <p><strong>Venue:</strong> ${venue.name || 'TBD'}</p>
          <p><strong>Location:</strong> ${venue.city?.name || 'Unknown'}, ${venue.state?.stateCode || ''}</p>
          ${priceHTML}
          <button class="favorite-btn" data-event-id="${event.id}">★ Favorite</button>
          <a href="${event.url || '#'}" target="_blank" class="ticket-btn">Tickets</a>
        </div>
      </div>
    `;
  }).join('');

  bindFavoriteButtons(events);
}

function bindFavoriteButtons(events) {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.dataset.eventId;
      const event = events.find(ev => ev.id === eventId);
      if (event) {
        addToFavorites(event);
        e.target.textContent = '★ Favoritado!';
        e.target.style.backgroundColor = '#27ae60';
      }
    });
  });
}

export { initEvents };
