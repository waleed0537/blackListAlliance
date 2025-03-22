import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get blacklist stats
export const getBlacklistStats = async (forceRefresh = false) => {
  try {
    console.log('Fetching blacklist stats from API, forceRefresh:', forceRefresh);
    
    // Determine endpoint based on whether we need to force refresh
    const endpoint = forceRefresh ? '/api/blacklist-stats' : '/api/pre-warm';
    const url = `${API_URL}${endpoint}${forceRefresh ? '?refresh=true' : ''}`;
    
    console.log('Requesting URL:', url);
    const response = await axios.get(url);
    
    // Extract data differently based on which endpoint was used
    const data = endpoint === '/api/pre-warm' ? response.data.data : response.data;
    
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching blacklist stats:', error);
    throw error; // Let the caller handle the error
  }
};