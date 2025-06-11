// Remove as constantes de API que não serão usadas
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

    // Mostrar uma mensagem nos sections que precisariam das APIs
    eventsList.innerHTML = "<p>Event functionality would require Ticketmaster API</p>";
    favoritesList.innerHTML = "<p>Favorites functionality would be available with API</p>";
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

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init);