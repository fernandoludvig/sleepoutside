// events.js - Ticketmaster API integration
import { TICKETMASTER_API_KEY, USE_LOCAL_DATA } from './config.js';
import { appState } from './state.js';
import { addToFavorites } from './favorites.js';

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

    // Try Ticketmaster API first if key is configured
    if (!USE_LOCAL_DATA && TICKETMASTER_API_KEY !== 'YOUR_TICKETMASTER_API_KEY_HERE') {
      try {
        const params = new URLSearchParams({
          apikey: TICKETMASTER_API_KEY,
          countryCode: 'BR',
          size: 12,
          locale: 'pt-BR',
          sort: 'date,asc'
        });

        if (keyword) {
          params.append('keyword', keyword);
        }

        if (city) {
          params.append('city', city);
        }

        console.log('Fetching events from Ticketmaster API...');
        const response = await fetch(`${BASE_URL}?${params}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        const events = data._embedded?.events;

        if (!events || events.length === 0) {
          eventsList.innerHTML = '<p>No events found. Try different search terms.</p>';
          return;
        }

        console.log(`Found ${events.length} events from Ticketmaster API`);
        showApiStatus('live', 'Using Ticketmaster API');
        displayEvents(events);
        return;

      } catch (apiError) {
        console.warn('Ticketmaster API failed, falling back to local data:', apiError.message);
        // Fall through to local data
      }
    }

    // Fallback to local data
    console.log('Using local data...');
    const localData = await fetch('./data/data.json');
    const data = await localData.json();
    let events = data._embedded?.events || [];

    // Filter by keyword if provided
    if (keyword) {
      events = events.filter(event => 
        event.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Filter by city if provided
    if (city) {
      events = events.filter(event => 
        event._embedded?.venues?.[0]?.city?.name?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (events.length === 0) {
      eventsList.innerHTML = '<p>No events found. Try different search terms.</p>';
      return;
    }

    console.log(`Found ${events.length} events from local data`);
    showApiStatus('fallback', 'Using Local Data');
    displayEvents(events);

  } catch (error) {
    console.error('Error fetching events:', error);
    eventsList.innerHTML = `
      <div class="error-message">
        <p>Error loading events: ${error.message}</p>
        <p>Please check your API key configuration or try again later.</p>
      </div>
    `;
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

function showApiStatus(type, message) {
  let statusElement = document.getElementById('apiStatus');
  
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = 'apiStatus';
    statusElement.className = `api-status ${type}`;
    document.body.appendChild(statusElement);
  }
  
  statusElement.className = `api-status ${type}`;
  statusElement.textContent = message;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (statusElement) {
      statusElement.style.opacity = '0';
      setTimeout(() => {
        if (statusElement && statusElement.parentNode) {
          statusElement.parentNode.removeChild(statusElement);
        }
      }, 300);
    }
  }, 3000);
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
