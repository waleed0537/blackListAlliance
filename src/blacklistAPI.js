import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get blacklist stats
export const getBlacklistStats = async (forceRefresh = false) => {
  try {
    console.log('Fetching blacklist stats from API, forceRefresh:', forceRefresh);
    
    // Use the configured API URL
    const endpoint = '/api/blacklist-stats';
    const url = `${API_URL}${endpoint}${forceRefresh ? '?refresh=true' : ''}`;
    
    console.log('Requesting URL:', url);
    const response = await axios.get(url);
    
    console.log('Received data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blacklist stats:', error);
    throw error; // Let the caller handle the error
  }
};