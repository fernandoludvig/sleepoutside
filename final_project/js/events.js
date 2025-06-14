// events.js - Event-related functions
const eventsSection = document.getElementById("eventsSection");
const eventsList = document.getElementById("eventsList");
const searchSection = document.getElementById("searchSection");
const searchEventsBtn = document.getElementById("searchEventsBtn");

function initEvents() {
  searchEventsBtn.addEventListener("click", () => {
    const keyword = document.getElementById("eventKeyword").value;
    const location = document.getElementById("eventLocation").value;
    fetchEvents(keyword, location);
  });

  fetchEvents();
}

async function fetchEvents(keyword = '', city = '') {
  try {
    // This would be your actual API call to Ticketmaster
    // For now using mock data
    const mockEvents = [
      {
        id: "1",
        name: "Concert in the Park",
        dates: { start: { dateTime: "2023-12-15T19:00:00" } },
        _embedded: {
          venues: [{
            name: "Central Park",
            city: { name: "New York" },
            state: { stateCode: "NY" }
          }]
        },
        images: [{ url: "https://example.com/concert.jpg", width: 640 }],
        priceRanges: [{ min: 20, max: 50, currency: "USD" }],
        info: "Annual summer concert series",
        url: "#"
      }
    ];
    
    displayEvents(mockEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    eventsList.innerHTML = '<p>Failed to load events. Please try again later.</p>';
  }
}

function displayEvents(events) {
  eventsList.innerHTML = events.map(event => {
    const date = new Date(event.dates.start.dateTime || event.dates.start.localDate);
    const venue = event._embedded?.venues?.[0] || {};
    
    return `
      <div class="event-card">
        <div class="event-image">
          <img src="${event.images.find(img => img.width === 640)?.url || ''}" alt="${event.name}">
        </div>
        <div class="event-info">
          <h3>${event.name}</h3>
          <p><strong>Date:</strong> ${date.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${date.toLocaleTimeString()}</p>
          <p><strong>Venue:</strong> ${venue.name || 'TBD'}</p>
          <p><strong>Location:</strong> ${venue.city?.name || ''}, ${venue.state?.stateCode || ''}</p>
          <p><strong>Price Range:</strong> ${event.priceRanges?.[0]?.min || 'N/A'} - ${event.priceRanges?.[0]?.max || 'N/A'} ${event.priceRanges?.[0]?.currency || ''}</p>
          <p class="event-description">${event.info || 'No description available'}</p>
          <button class="favorite-btn" data-event-id="${event.id}">★ Add to Favorites</button>
          <a href="${event.url}" target="_blank" class="ticket-btn">Get Tickets</a>
        </div>
      </div>
    `;
  }).join('');

    // Add event listeners to favorite buttons
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const eventId = e.target.dataset.eventId;
      const event = events.find(ev => ev.id === eventId);
      addToFavorites(event);
      e.target.textContent = '★ Added!';
    });
  });
}