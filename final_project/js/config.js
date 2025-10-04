// config.js - Configuration settings
// Para obter uma chave da API do Ticketmaster:
// 1. Acesse: https://developer.ticketmaster.com/
// 2. Crie uma conta gratuita
// 3. Acesse "My Account" > "API Keys"
// 4. Crie uma nova chave para "Discovery API"
// 5. Substitua 'YOUR_TICKETMASTER_API_KEY_HERE' pela sua chave real

export const TICKETMASTER_API_KEY = 'JdfSV6QD51P4iUXxysXCY5cCAzBh8lEL';

// Fallback para dados locais quando a API não estiver disponível
export const USE_LOCAL_DATA = false; // Mude para true se não tiver chave da API

// Configurações da aplicação
export const APP_CONFIG = {
  defaultCountry: 'BR',
  defaultLocale: 'pt-BR',
  eventsPerPage: 12,
  maxFavorites: 50
};
