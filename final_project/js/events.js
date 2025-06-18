// events.js - Updated with Ticketmaster API implementation
import { TICKETMASTER_API_KEY } from './config';

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

async function fetchEvents(keyword = '', city = '') {
  try {
    showLoading(true);
    eventsList.innerHTML = '';
    
    const params = new URLSearchParams({
      apikey: TICKETMASTER_API_KEY,
      countryCode: 'BR', // Mantemos apenas o filtro de país
      size: 12,
      keyword: keyword,
      locale: 'pt-BR',
      sort: 'date,asc'
    });

    // Adiciona cidade apenas se for especificada
    if (city) {
      params.append('city', city);
    }

    const response = await fetch(`${BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data._embedded || !data._embedded.events) {
      eventsList.innerHTML = '<p>No events found. Try different search terms.</p>';
      return;
    }

    displayEvents(data._embedded.events);
  } catch (error) {
    console.error('Error fetching events:', error);
    eventsList.innerHTML = `<p>Error loading events: ${error.message}</p>`;
  } finally {
    showLoading(false);
  }
}
function showLoading(show) {
  const loadingElement = document.getElementById('loadingIndicator') || 
    document.createElement('div');
  loadingElement.id = 'loadingIndicator';
  loadingElement.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading events...</p>
  `;
  loadingElement.style.display = show ? 'block' : 'none';
  loadingElement.style.textAlign = 'center';
  loadingElement.style.padding = '20px';
  
  if (show && !document.getElementById('loadingIndicator')) {
    eventsList.before(loadingElement);
  }
}

function displayEvents(events) {
  eventsList.innerHTML = events.map(event => {
    const venue = event._embedded?.venues?.[0] || {};
    const image = event.images?.find(img => img.width === 640) || event.images?.[0] || {};
    const dateInfo = event.dates?.start;
    const priceRange = event.priceRanges?.[0];
    
    return `
      <div class="event-card">
        <div class="event-image">
          <img src="${image.url || 'img/event-placeholder.jpg'}" 
               alt="${event.name}" loading="lazy">
        </div>
        <div class="event-info">
          <h3>${event.name}</h3>
          ${dateInfo?.dateTime ? `
            <p><strong>Date:</strong> ${new Date(dateInfo.dateTime).toLocaleDateString('pt-BR')}</p>
            <p><strong>Time:</strong> ${new Date(dateInfo.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          ` : dateInfo?.localDate ? `
            <p><strong>Date:</strong> ${new Date(dateInfo.localDate).toLocaleDateString('pt-BR')}</p>
          ` : '<p><strong>Date:</strong> To be announced</p>'}
          <p><strong>Venue:</strong> ${venue.name || 'TBD'}</p>
          <p><strong>Location:</strong> ${venue.city?.name || 'Unknown'}, ${venue.state?.stateCode || ''}</p>
          ${priceRange ? `
            <p><strong>Price:</strong> R$${priceRange.min.toFixed(2)}${priceRange.max ? ` - R$${priceRange.max.toFixed(2)}` : '+'}</p>
          ` : '<p><strong>Price:</strong> Contact venue</p>'}
          <button class="favorite-btn" data-event-id="${event.id}">★ Favorite</button>
          <a href="${event.url || '#'}" target="_blank" class="ticket-btn">Tickets</a>
        </div>
      </div>
    `;
  }).join('');



  // Add event listeners
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.dataset.eventId;
      const event = events.find(ev => ev.id === eventId);
      addToFavorites(event);
      e.target.textContent = '★ Favoritado!';
      e.target.style.backgroundColor = '#27ae60';
    });
  });
}

function initEvents() {
  const searchForm = document.getElementById("eventSearchForm");
  
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = document.getElementById("eventKeyword").value.trim();
    const location = document.getElementById("eventLocation").value.trim();
    fetchEvents(keyword, location);
  });

  // Load initial events (sem filtro de cidade)
  fetchEvents();
}