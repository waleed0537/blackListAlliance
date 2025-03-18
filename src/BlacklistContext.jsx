import React, { createContext, useState, useEffect, useContext } from 'react';
import { getBlacklistStats } from './blacklistAPI';

export const BlacklistContext = createContext();

export const BlacklistProvider = ({ children }) => {
  const [blacklistData, setBlacklistData] = useState({
    newBlacklistedNumbers: 869, // Start with default data
    remainingScrubs: "47,995,198", // Start with default data
    isLoading: true
  });

  const refreshData = async (forceRefresh = false) => {
    setBlacklistData(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('Refreshing blacklist data with forceRefresh:', forceRefresh);
      const data = await getBlacklistStats(forceRefresh);
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
        isLoading: false
      }));
    }
  };

  // Load data when component mounts
  useEffect(() => {
    console.log('BlacklistProvider mounted, loading data...');
    refreshData();
    
    // Set up polling for updates (every 15 minutes)
    const intervalId = setInterval(() => {
      refreshData();
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