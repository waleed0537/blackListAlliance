import React, { createContext, useState, useEffect, useContext } from 'react';
import { getBlacklistStats } from './blacklistAPI';
import axios from 'axios';

export const BlacklistContext = createContext();

export const BlacklistProvider = ({ children }) => {
  const [blacklistData, setBlacklistData] = useState({
    newBlacklistedNumbers: 755, // Start with default data
    remainingScrubs: "39,806,098", // Start with default data
    isLoading: true
  });

  // Use this function to ensure we have both display data and background refreshing
  const loadData = async (immediate = false) => {
    // Immediately update UI with cached data if available
    const showLoadingState = immediate;
    
    if (showLoadingState) {
      setBlacklistData(prev => ({ ...prev, isLoading: true }));
    }
    
    try {
      // First attempt to get data from the pre-warm endpoint for an immediate response
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // For immediate displays, try to get pre-warmed data first
      if (immediate) {
        try {
          const preWarmResponse = await axios.get(`${API_URL}/api/pre-warm`);
          console.log('Pre-warmed data received:', preWarmResponse.data);
          
          // Show immediate data first
          setBlacklistData({
            newBlacklistedNumbers: preWarmResponse.data.data.newBlacklistedNumbers,
            remainingScrubs: preWarmResponse.data.data.remainingScrubs,
            lastUpdated: preWarmResponse.data.data.lastUpdated,
            isLoading: false,
            fromCache: preWarmResponse.data.data.fromCache || true
          });
        } catch (preWarmError) {
          console.error('Error fetching pre-warmed data:', preWarmError);
          // Continue to the main data fetch below
        }
      }
      
      // Now fetch the actual data (which might take longer but be more up-to-date)
      console.log('Fetching blacklist data with forceRefresh:', immediate);
      const data = await getBlacklistStats(immediate);
      console.log('Blacklist data refreshed:', data);
      
      // Update state with the new data
      setBlacklistData({
        newBlacklistedNumbers: data.newBlacklistedNumbers,
        remainingScrubs: data.remainingScrubs,
        lastUpdated: data.lastUpdated,
        isLoading: false,
        fromCache: data.fromCache
      });
    } catch (error) {
      console.log('Could not refresh data');
      setBlacklistData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  // Function exposed to components to force a refresh
  const refreshData = async (forceRefresh = false) => {
    return loadData(forceRefresh);
  };

  // Load data when component mounts
  useEffect(() => {
    console.log('BlacklistProvider mounted, loading data...');
    loadData(false);
    
    // Set up polling for updates (every 15 minutes)
    const intervalId = setInterval(() => {
      loadData(false);
    }, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <BlacklistContext.Provider value={{ 
      ...blacklistData, 
      refreshData 
    }}>
      {children}
    </BlacklistContext.Provider>
  );
};

// Custom hook to use blacklist data
export const useBlacklistData = () => useContext(BlacklistContext);

export default BlacklistContext;