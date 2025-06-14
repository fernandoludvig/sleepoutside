// script.js - Main application controller

// DOM References
const domElements = {
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  authSection: document.getElementById("authSection"),
  searchSection: document.getElementById("searchSection"),
  eventsSection: document.getElementById("eventsSection"),
  favoritesSection: document.getElementById("favoritesSection"),
  showLoginBtn: document.getElementById("showLoginBtn"),
  showRegisterBtn: document.getElementById("showRegisterBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  welcomeMsg: document.getElementById("welcomeMsg"),
  loginUsername: document.getElementById("loginUsername"),
  loginPassword: document.getElementById("loginPassword"),
  loginSubmit: document.getElementById("loginSubmit"),
  loginError: document.getElementById("loginError"),
  registerUsername: document.getElementById("registerUsername"),
  registerPassword: document.getElementById("registerPassword"),
  registerInterests: document.getElementById("registerInterests"),
  registerSubmit: document.getElementById("registerSubmit"),
  registerError: document.getElementById("registerError"),
  showRegisterLink: document.getElementById("showRegisterLink"),
  showLoginLink: document.getElementById("showLoginLink"),
  eventsList: document.getElementById("eventsList"),
  favoritesList: document.getElementById("favoritesList")
};

// App State
const appState = {
  currentUser: null,
  favorites: []
};

// Authentication Functions
const auth = {
  registerUser() {
    const { registerUsername, registerPassword, registerInterests, registerError } = domElements;
    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();
    const interests = registerInterests.value.trim();

    registerError.textContent = "";

    if (!username || !password) {
      registerError.textContent = "Please enter username and password.";
      return;
    }

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
    this.resetRegisterForm();
  },

  loginUser() {
    const { loginUsername, loginPassword, loginError } = domElements;
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

    appState.currentUser = username;
    this.saveCurrentUser();
    this.resetLoginForm();
  },

  logoutUser() {
    appState.currentUser = null;
    this.saveCurrentUser();
  },

  saveCurrentUser() {
    if (appState.currentUser) {
      localStorage.setItem("currentUser", appState.currentUser);
    } else {
      localStorage.removeItem("currentUser");
    }
    ui.updateUIForAuth();
  },

  loadUserFromStorage() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      appState.currentUser = savedUser;
    }
  },

  resetLoginForm() {
    const { loginUsername, loginPassword } = domElements;
    loginUsername.value = "";
    loginPassword.value = "";
  },

  resetRegisterForm() {
    const { registerUsername, registerPassword, registerInterests, registerForm, loginForm } = domElements;
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    registerUsername.value = "";
    registerPassword.value = "";
    registerInterests.value = "";
  }
};

// UI Controller
const ui = {
  bindEvents() {
    const {
      showLoginBtn,
      showRegisterBtn,
      logoutBtn,
      loginSubmit,
      registerSubmit,
      showRegisterLink,
      showLoginLink
    } = domElements;

    showLoginBtn.addEventListener("click", () => this.toggleAuthForms('login'));
    showRegisterBtn.addEventListener("click", () => this.toggleAuthForms('register'));
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleAuthForms('register');
    });
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleAuthForms('login');
    });
    logoutBtn.addEventListener("click", auth.logoutUser.bind(auth));
    loginSubmit.addEventListener("click", auth.loginUser.bind(auth));
    registerSubmit.addEventListener("click", auth.registerUser.bind(auth));
  },

  toggleAuthForms(formToShow) {
    const { loginForm, registerForm } = domElements;
    if (formToShow === 'login') {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    } else {
      registerForm.style.display = "block";
      loginForm.style.display = "none";
    }
  },

  updateUIForAuth() {
    const {
      authSection,
      searchSection,
      eventsSection,
      favoritesSection,
      welcomeMsg,
      showLoginBtn,
      showRegisterBtn,
      logoutBtn,
      eventsList,
      favoritesList
    } = domElements;

    if (appState.currentUser) {
      authSection.style.display = "none";
      searchSection.style.display = "block";
      eventsSection.style.display = "block";
      favoritesSection.style.display = "block";
      welcomeMsg.textContent = `Welcome, ${appState.currentUser}`;
      showLoginBtn.style.display = "none";
      showRegisterBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
      
      // Initialize these sections if they exist
      if (typeof initEvents === 'function') initEvents();
      if (typeof initFavorites === 'function') initFavorites();
    } else {
      authSection.style.display = "block";
      this.toggleAuthForms('login');
      searchSection.style.display = "none";
      eventsSection.style.display = "none";
      favoritesSection.style.display = "none";
      welcomeMsg.textContent = "";
      showLoginBtn.style.display = "inline-block";
      showRegisterBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  }
};

// Initialize App
function init() {
  ui.bindEvents();
  auth.loadUserFromStorage();
  ui.updateUIForAuth();
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);