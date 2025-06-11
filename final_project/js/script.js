// Placeholder API keys - replace with your own keys
const TICKETMASTER_API_KEY = "YOUR_TICKETMASTER_API_KEY_HERE";
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

// Globals and DOM references
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authSection = document.getElementById("authSection");
const searchSection = document.getElementById("searchSection");
const eventsSection = document.getElementById("eventsSection");
const favoritesSection = document.getElementById("favoritesSection");

const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeMsg = document.getElementById("welcomeMsg");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginSubmit = document.getElementById("loginSubmit");
const loginError = document.getElementById("loginError");

const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const registerInterests = document.getElementById("registerInterests");
const registerSubmit = document.getElementById("registerSubmit");
const registerError = document.getElementById("registerError");

const showRegisterLink = document.getElementById("showRegisterLink");
const showLoginLink = document.getElementById("showLoginLink");

const locationInput = document.getElementById("locationInput");
const detectLocationBtn = document.getElementById("detectLocationBtn");
const keywordInput = document.getElementById("keywordInput");
const categorySelect = document.getElementById("categorySelect");
const priceSelect = document.getElementById("priceSelect");
const dateInput = document.getElementById("dateInput");
const searchForm = document.getElementById("searchForm");

const eventsList = document.getElementById("eventsList");
const favoritesList = document.getElementById("favoritesList");

const eventModal = document.getElementById("eventModal");
const closeModal = document.getElementById("closeModal") || document.getElementById("closeModal");
const modalEventDetails = document.getElementById("modalEventDetails");
const modalMap = document.getElementById("modalMap");

let map, infoWindow;
let markers = [];

let currentUser = null; // store current logged-in username
let favorites = [];

// Initialize app
function init() {
  bindEvents();
  loadUserFromStorage();
  loadFavoritesFromStorage();
  updateUIForAuth();
}

// Bind UI events
function bindEvents() {
  showLoginBtn.addEventListener("click", () => {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  showRegisterBtn.addEventListener("click", () => {
    registerForm.style.display = "block";
    loginForm.style.display = "none";
  });

  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "block";
    loginForm.style.display = "none";
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  logoutBtn.addEventListener("click", () => {
    logoutUser();
  });

  loginSubmit.addEventListener("click", loginUser);
  registerSubmit.addEventListener("click", registerUser);

  detectLocationBtn.addEventListener("click", detectUserLocation);
  searchForm.addEventListener("submit", searchEvents);

  closeModal.addEventListener("click", () => {
    eventModal.style.display = "none";
    clearMarkers();
  });

  window.addEventListener("click", (e) => {
    if (e.target === eventModal) {
      eventModal.style.display = "none";
      clearMarkers();
    }
  });
}

// User Registration
function registerUser() {
  const username = registerUsername.value.trim();
  const password = registerPassword.value.trim();
  const interests = registerInterests.value.trim();

  registerError.textContent = "";

  if (!username || !password) {
    registerError.textContent = "Please enter username and password.";
    return;
  }

  // Check if user exists
  if (localStorage.getItem(`user_${username}`)) {
    registerError.textContent = "Username already exists.";
    return;
  }

  const userData = {
    password,
    interests: interests ? interests.split(",").map(i => i.trim()) : [],
    favorites: []
  };

  localStorage.setItem(`user_${username}`, JSON.stringify(userData));

  alert("Registration successful! Please login.");

  // Reset and show login form
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  registerUsername.value = "";
  registerPassword.value = "";
  registerInterests.value = "";
}

// User Login
function loginUser() {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  loginError.textContent = "";

  if (!username || !password) {
    loginError.textContent = "Please enter username and password.";
    return;
  }

  const userDataRaw = localStorage.getItem(`user_${username}`);
  if (!userDataRaw) {
    loginError.textContent = "User not found.";
    return;
  }

  const userData = JSON.parse(userDataRaw);
  if (userData.password !== password) {
    loginError.textContent = "Incorrect password.";
    return;
  }

  currentUser = username;
  saveCurrentUser();
  loadFavoritesFromStorage();
  updateUIForAuth();

  loginUsername.value = "";
  loginPassword.value = "";
}

// Logout
function logoutUser() {
  currentUser = null;
  saveCurrentUser();
  updateUIForAuth();
}

// Save current user to localStorage
function saveCurrentUser() {
  if (currentUser) {
    localStorage.setItem("currentUser", currentUser);
  } else {
    localStorage.removeItem("currentUser");
  }
}

// Load current user from localStorage
function loadUserFromStorage() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
  }
}

// Update UI based on authentication status
function updateUIForAuth() {
  if (currentUser) {
    authSection.style.display = "none";
    searchSection.style.display = "block";
    eventsSection.style.display = "block";
    favoritesSection.style.display = "block";

    welcomeMsg.textContent = `Welcome, ${currentUser}`;
    showLoginBtn.style.display = "none";
    showRegisterBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    renderFavorites();
  } else {
    authSection.style.display = "block";
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    searchSection.style.display = "none";
    eventsSection.style.display = "none";
    favoritesSection.style.display = "none";

    welcomeMsg.textContent = "";
    showLoginBtn.style.display = "inline-block";
    showRegisterBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// Detect user location
function detectUserLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  detectLocationBtn.textContent = "Detecting...";
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      reverseGeocode(latitude, longitude);
      detectLocationBtn.textContent = "Detect My Location";
    },
    () => {
      alert("Unable to retrieve your location.");
      detectLocationBtn.textContent = "Detect My Location";
    }
  );
}

// Reverse geocode to get city or zip from coords
function reverseGeocode(lat, lng) {
  // Using Google Maps Geocoder
  const geocoder = new google.maps.Geocoder();
  const latlng = { lat, lng };
  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        // Find city or postal code from address components
        const addressComponents = results[0].address_components;
        let city = "";
        let postalCode = "";
        addressComponents.forEach(comp => {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("postal_code")) postalCode = comp.long_name;
        });
        locationInput.value = city || postalCode || "";
      } else {
        alert("No address found.");
      }
    } else {
      alert("Geocoder failed due to: " + status);
    }
  });
}

// Search events based on form
async function searchEvents(e) {
  e.preventDefault();

  let location = locationInput.value.trim();
  if (!location) {
    alert("Please enter a city or ZIP code.");
    return;
  }

  const keyword = keywordInput.value.trim();
  const category = categorySelect.value;
  const price = priceSelect.value;
  const date = dateInput.value;

  eventsList.innerHTML = "Loading events...";

  try {
    // Call Ticketmaster API (placeholder URL & parameters)
    const url = buildTicketmasterURL(location, keyword, category, price, date);
    const response = await fetch(url);
    const data = await response.json();

    if (data.page.totalElements === 0) {
      eventsList.innerHTML = "<p>No events found.</p>";
      return;
    }

    renderEvents(data._embedded.events);
  } catch (err) {
    console.error(err);
    eventsList.innerHTML = "<p>Error loading events.</p>";
  }
}

// Build Ticketmaster API URL with filters
function buildTicketmasterURL(location, keyword, category, price, date) {
  const baseURL = "https://app.ticketmaster.com/discovery/v2/events.json";

  let params = new URLSearchParams();
  params.append("apikey", TICKETMASTER_API_KEY);
  params.append("size", "20");

  // Location filtering (using city)
  params.append("city", location);

  if (keyword) params.append("keyword", keyword);
  if (category) params.append("segmentName", category);
  if (price) {
    if (price === "free") params.append("priceRanges", "0-0");
    else if (price === "paid") params.append("priceRanges", "1-10000");
  }
  if (date) {
    // Format date range: startDateTime=yyyy-MM-ddTHH:mm:ssZ
    // We'll search from the selected date 00:00 to 23:59 UTC
    const startDateTime = new Date(date + "T00:00:00Z").toISOString();
    const endDateTime = new Date(date + "T23:59:59Z").toISOString();
    params.append("startDateTime", startDateTime);
    params.append("endDateTime", endDateTime);
  }

  return `${baseURL}?${params.toString()}`;
}

// Render events in the list
function renderEvents(events) {
  eventsList.innerHTML = "";
  events.forEach(event => {
    const card = createEventCard(event);
    eventsList.appendChild(card);
  });
}

// Create event card DOM element
function createEventCard(event) {
  const card = document.createElement("div");
  card.className = "event-card";

  // Image
  const img = document.createElement("img");
  img.className = "event-image";
  if (event.images && event.images.length) img.src = event.images[0].url;
  else img.src = "https://via.placeholder.com/300x160?text=No+Image";

  card.appendChild(img);

  // Content container
  const content = document.createElement("div");
  content.className = "event-content";

  // Title
  const title = document.createElement("h3");
  title.className = "event-title";
  title.textContent = event.name;
  content.appendChild(title);

  // Date/time
  const dateTime = document.createElement("p");
  dateTime.className = "event-date";
  dateTime.textContent = event.dates?.start?.localDate || "Date TBD";
  content.appendChild(dateTime);

  // Venue
  const venue = document.createElement("p");
  venue.className = "event-venue";
  if (event._embedded?.venues?.length)
    venue.textContent = event._embedded.venues[0].name;
  else venue.textContent = "Venue TBD";
  content.appendChild(venue);

  // Tags (categories)
  const tags = document.createElement("p");
  tags.className = "event-tags";
  if (event.classifications && event.classifications.length) {
    tags.textContent = event.classifications
      .map(c => c.segment?.name)
      .filter(Boolean)
      .join(", ");
  }
  content.appendChild(tags);

  card.appendChild(content);

  // Bookmark button
  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.className = "bookmark-btn";
  bookmarkBtn.title = "Add to Favorites";
  bookmarkBtn.innerHTML = "★";
  if (isFavorited(event.id)) bookmarkBtn.classList.add("favorited");

  bookmarkBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite(event);
    bookmarkBtn.classList.toggle("favorited");
  });
  card.appendChild(bookmarkBtn);

  // Share button
  const shareBtn = document.createElement("button");
  shareBtn.className = "share-btn";
  shareBtn.title = "Share Event";
  shareBtn.innerHTML = "⤴";
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    shareEvent(event);
  });
  card.appendChild(shareBtn);

  // Click card to open detailed modal
  card.addEventListener("click", () => {
    openEventModal(event);
  });

  return card;
}

// Check if event is favorited
function isFavorited(eventId) {
  return favorites.some(fav => fav.id === eventId);
}

// Toggle favorite status
function toggleFavorite(event) {
  if (!currentUser) {
    alert("Please login to save favorites.");
    return;
  }

  if (isFavorited(event.id)) {
    favorites = favorites.filter(fav => fav.id !== event.id);
  } else {
    favorites.push({
      id: event.id,
      name: event.name,
      date: event.dates.start.localDate,
      venue: event._embedded?.venues[0]?.name || "Venue TBD",
      url: event.url,
    });
  }

  saveFavoritesToStorage();
  renderFavorites();
}

// Save favorites to localStorage
function saveFavoritesToStorage() {
  if (!currentUser) return;
  const userDataRaw = localStorage.getItem(`user_${currentUser}`);
  if (!userDataRaw) return;

  const userData = JSON.parse(userDataRaw);
  userData.favorites = favorites;
  localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
}

// Load favorites from localStorage
function loadFavoritesFromStorage() {
  if (!currentUser) {
    favorites = [];
    return;
  }
  const userDataRaw = localStorage.getItem(`user_${currentUser}`);
  if (!userDataRaw) {
    favorites = [];
    return;
  }

  const userData = JSON.parse(userDataRaw);
  favorites = userData.favorites || [];
}

// Render favorites list
function renderFavorites() {
  favoritesList.innerHTML = "";
  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorites added yet.</p>";
    return;
  }

  favorites.forEach(fav => {
    const item = document.createElement("div");
    item.className = "favorite-item";

    const link = document.createElement("a");
    link.href = fav.url;
    link.target = "_blank";
    link.textContent = `${fav.name} - ${fav.date} @ ${fav.venue}`;
    item.appendChild(link);

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      favorites = favorites.filter(f => f.id !== fav.id);
      saveFavoritesToStorage();
      renderFavorites();
    });
    item.appendChild(removeBtn);

    favoritesList.appendChild(item);
  });
}

// Open event modal with details and map
function openEventModal(event) {
  modalEventDetails.innerHTML = `
    <h2>${event.name}</h2>
    <p><strong>Date:</strong> ${event.dates.start.localDate}</p>
    <p><strong>Venue:</strong> ${event._embedded?.venues[0]?.name || "Venue TBD"}</p>
    <p><strong>Address:</strong> ${
      event._embedded?.venues[0]?.address?.line1 || "N/A"
    }</p>
    <p><strong>Description:</strong> ${event.info || "No description available."}</p>
    <p><a href="${event.url}" target="_blank">More info / Tickets</a></p>
  `;

  eventModal.style.display = "block";

  // Show map for venue location
  if (event._embedded?.venues[0]?.location) {
    const { latitude, longitude } = event._embedded.venues[0].location;
    showMap(latitude, longitude);
  } else {
    modalMap.innerHTML = "<p>No location data available.</p>";
  }
}

// Show map in modal
function showMap(lat, lng) {
  modalMap.innerHTML = "";
  if (!map) {
    map = new google.maps.Map(modalMap, {
      center: { lat, lng },
      zoom: 15,
    });
    infoWindow = new google.maps.InfoWindow();
  } else {
    map.setCenter({ lat, lng });
  }

  clearMarkers();

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    title: "Event Venue",
  });
  markers.push(marker);
}

// Clear all markers from map
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// Share event (basic sharing)
function shareEvent(event) {
  if (navigator.share) {
    navigator
      .share({
        title: event.name,
        text: `Check out this event: ${event.name}`,
        url: event.url,
      })
      .then(() => console.log("Shared successfully"))
      .catch((error) => console.error("Error sharing", error));
  } else {
    alert("Sharing not supported on this browser.");
  }
}

