import axios from 'axios';

// Get blacklist stats
export const getBlacklistStats = async (forceRefresh = false) => {
  try {
    console.log('Fetching blacklist stats from API, forceRefresh:', forceRefresh);
    
    // Direct axios call with full URL
    const baseUrl = 'http://localhost:5000';
    const endpoint = '/api/blacklist-stats';
    const url = `${baseUrl}${endpoint}${forceRefresh ? '?refresh=true' : ''}`;
    
    console.log('Requesting URL:', url);
    const response = await axios.get(url);
    
    console.log('Received data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching blacklist stats:', error);
    throw error; // Let the caller handle the error
  }
};