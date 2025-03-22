import axios from 'axios';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get blacklist stats
export const getBlacklistStats = async (forceRefresh = false) => {
  try {
    console.log('Fetching blacklist stats from API, forceRefresh:', forceRefresh);
    
    // Add timestamp to prevent caching when force refreshing
    const timestamp = Date.now();
    
    // Create the URL with proper query parameters to bypass cache
    const url = `${API_URL}/api/blacklist-stats?refresh=${forceRefresh}&_t=${timestamp}`;
    
    console.log('Requesting URL:', url);
    
    // Make the request without custom headers to avoid CORS issues
    const response = await axios.get(url);
    
    console.log('Received data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blacklist stats:', error);
    throw error; // Let the caller handle the error
  }
};