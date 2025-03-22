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
  const loadData = async (forceRefresh = false) => {
    // Set loading state when forcing refresh
    if (forceRefresh) {
      setBlacklistData(prev => ({ ...prev, isLoading: true }));
    }
    
    try {
      // Get API URL from environment
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // For immediate displays without force refresh, try to get pre-warmed data first
      if (!forceRefresh) {
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
      
      // Now fetch the actual data with force refresh if requested
      console.log('Fetching blacklist data with forceRefresh:', forceRefresh);
      
      // Use the utility function which handles timestamps and caching
      const data = await getBlacklistStats(forceRefresh);
      console.log('Blacklist data refreshed:', data);
      
      // Update state with the new data
      setBlacklistData({
        newBlacklistedNumbers: data.newBlacklistedNumbers,
        remainingScrubs: data.remainingScrubs,
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        isLoading: false,
        fromCache: data.fromCache || false
      });
    } catch (error) {
      console.error('Could not refresh data:', error);
      setBlacklistData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
        lastError: new Date().toISOString()
      }));
    }
  };

  // Function exposed to components to force a refresh
  const refreshData = async (forceRefresh = true) => {
    console.log('Force refresh requested:', forceRefresh);
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