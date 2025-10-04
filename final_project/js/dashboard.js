// dashboard.js - Dashboard functionality
import { appState } from './state.js';
import { removeFromFavorites } from './favorites.js';

let eventsSearchedCount = 0;

function initDashboard() {
  const dashboardBtn = document.getElementById('dashboardBtn');
  const dashboardSection = document.getElementById('dashboardSection');
  const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
  const exportFavoritesBtn = document.getElementById('exportFavoritesBtn');
  const updateProfileBtn = document.getElementById('updateProfileBtn');

  dashboardBtn.addEventListener('click', () => {
    showDashboard();
  });

  clearFavoritesBtn.addEventListener('click', () => {
    clearAllFavorites();
  });

  exportFavoritesBtn.addEventListener('click', () => {
    exportFavorites();
  });

  updateProfileBtn.addEventListener('click', () => {
    showProfileUpdateForm();
  });

  // Track search events
  const searchForm = document.getElementById('eventSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', () => {
      eventsSearchedCount++;
      updateDashboardStats();
    });
  }
}

function showDashboard() {
  // Hide other sections
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('eventsSection').style.display = 'none';
  document.getElementById('favoritesSection').style.display = 'none';

  // Show dashboard
  document.getElementById('dashboardSection').style.display = 'block';

  // Update dashboard content
  updateDashboardContent();
}

function updateDashboardContent() {
  if (!appState.currentUser) return;

  const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`)) || {};
  
  // Update profile information
  document.getElementById('profileUsername').textContent = appState.currentUser;
  document.getElementById('profileInterests').textContent = 
    userData.interests?.join(', ') || 'None specified';
  
  // Set member since date (using current date as placeholder)
  const memberSince = userData.memberSince || new Date().toLocaleDateString('pt-BR');
  document.getElementById('profileMemberSince').textContent = memberSince;

  // Update statistics
  updateDashboardStats();
}

function updateDashboardStats() {
  document.getElementById('totalFavorites').textContent = appState.favorites.length;
  document.getElementById('eventsSearched').textContent = eventsSearchedCount;
  document.getElementById('lastActivity').textContent = new Date().toLocaleDateString('pt-BR');
}

function clearAllFavorites() {
  if (confirm('Are you sure you want to clear all favorites?')) {
    appState.favorites = [];
    
    // Update localStorage
    const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`)) || {};
    userData.favorites = [];
    localStorage.setItem(`user_${appState.currentUser}`, JSON.stringify(userData));

    // Update dashboard
    updateDashboardStats();
    
    // Refresh favorites display if visible
    const favoritesSection = document.getElementById('favoritesSection');
    if (favoritesSection.style.display !== 'none') {
      const favoritesList = document.getElementById('favoritesList');
      if (favoritesList) {
        favoritesList.innerHTML = '<p>No favorited events yet. Add some!</p>';
      }
    }

    alert('All favorites cleared successfully!');
  }
}

function exportFavorites() {
  if (appState.favorites.length === 0) {
    alert('No favorites to export.');
    return;
  }

  const exportData = {
    username: appState.currentUser,
    exportDate: new Date().toISOString(),
    totalFavorites: appState.favorites.length,
    favorites: appState.favorites
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `favorites_${appState.currentUser}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  alert('Favorites exported successfully!');
}

function showProfileUpdateForm() {
  const userData = JSON.parse(localStorage.getItem(`user_${appState.currentUser}`)) || {};
  const currentInterests = userData.interests?.join(', ') || '';
  
  const newInterests = prompt('Update your interests (comma separated):', currentInterests);
  
  if (newInterests !== null) {
    userData.interests = newInterests ? newInterests.split(',').map(i => i.trim()) : [];
    userData.memberSince = userData.memberSince || new Date().toISOString();
    
    localStorage.setItem(`user_${appState.currentUser}`, JSON.stringify(userData));
    updateDashboardContent();
    
    alert('Profile updated successfully!');
  }
}

// Function to show dashboard button when user is logged in
function showDashboardButton() {
  const dashboardBtn = document.getElementById('dashboardBtn');
  if (dashboardBtn) {
    dashboardBtn.style.display = 'inline-block';
  }
}

// Function to hide dashboard button when user is logged out
function hideDashboardButton() {
  const dashboardBtn = document.getElementById('dashboardBtn');
  if (dashboardBtn) {
    dashboardBtn.style.display = 'none';
  }
}

export { 
  initDashboard, 
  showDashboard, 
  updateDashboardContent, 
  showDashboardButton, 
  hideDashboardButton 
};
