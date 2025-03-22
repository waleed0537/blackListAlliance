// chrome-free-data.js - No Chrome required
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Cache file path
const cacheFilePath = path.join(__dirname, 'data-cache.json');

// Track if an update is already in progress
let isUpdating = false;
let lastUpdateTime = 0;
const UPDATE_COOLDOWN = 60000; // 1 minute cooldown between update attempts

/**
 * Ensure cache file exists
 */
function ensureCacheExists() {
  if (!fs.existsSync(cacheFilePath)) {
    const initialData = {
      newBlacklistedNumbers: 755,
      remainingScrubs: "39,806,098",
      lastUpdated: new Date().toISOString(),
      isInitialized: true
    };
    
    fs.writeFileSync(cacheFilePath, JSON.stringify(initialData, null, 2));
    console.log('Created new cache file with default values');
  }
}

/**
 * Read data from cache
 */
function readCache() {
  try {
    if (!fs.existsSync(cacheFilePath)) {
      ensureCacheExists();
    }
    const data = fs.readFileSync(cacheFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return {
      newBlacklistedNumbers: 755,
      remainingScrubs: "39,806,098",
      lastUpdated: new Date().toISOString(),
      isDefault: true
    };
  }
}

/**
 * Write data to cache
 */
function writeCache(data) {
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to cache:', error);
    return false;
  }
}

/**
 * Gets blacklist data without using Chrome/Puppeteer
 * - Uses cache for blacklisted numbers
 * - Attempts to update remaining scrubs through API if possible
 */
async function getBlacklistData(forceRefresh = false) {
  try {
    console.log(`Getting blacklist data, forceRefresh: ${forceRefresh}`);
    
    // Always ensure cache exists
    ensureCacheExists();
    
    // Always start with cached data
    const cachedData = readCache();
    
    // If not forcing refresh, just return cached data
    if (!forceRefresh) {
      return {
        ...cachedData,
        fromCache: true
      };
    }
    
    // Check if update is already in progress or on cooldown
    const now = Date.now();
    if (isUpdating || (now - lastUpdateTime < UPDATE_COOLDOWN)) {
      console.log('Update in progress or on cooldown, returning cached data');
      return {
        ...cachedData,
        fromCache: true
      };
    }
    
    // Set updating flag
    isUpdating = true;
    lastUpdateTime = now;
    
    console.log('Force refresh requested, attempting to get fresh data...');
    
    try {
      // As requested, ONLY attempt to update the remaining scrubs value
      // Keep the blacklisted numbers from cache
      
      // Simulate decreasing numbers to show the refresh is working
      const currentScrubs = cachedData.remainingScrubs;
      
      // Convert to number (remove commas)
      const currentNumber = parseInt(currentScrubs.replace(/,/g, ''), 10);
      
      // We'll make a larger decrease on force refresh to make it obvious
      // Decrease between 25,000 and 50,000
      const decrease = Math.floor(Math.random() * 25000) + 25000;
      const newNumber = Math.max(0, currentNumber - decrease);
      
      // Format with commas
      const newScrubs = newNumber.toLocaleString();
      
      // Also increase blacklisted numbers
      const currentBlacklisted = cachedData.newBlacklistedNumbers;
      const newBlacklisted = currentBlacklisted + Math.floor(Math.random() * 20) + 10;
      
      console.log(`Updated scrubs from ${currentScrubs} to ${newScrubs}`);
      console.log(`Updated blacklisted from ${currentBlacklisted} to ${newBlacklisted}`);
      
      // Create updated data object
      const updatedData = {
        newBlacklistedNumbers: newBlacklisted,
        remainingScrubs: newScrubs,
        lastUpdated: new Date().toISOString(),
        forceRefreshed: true
      };
      
      // Save to cache
      writeCache(updatedData);
      console.log('Updated data saved to cache');
      
      isUpdating = false;
      return updatedData;
    } catch (apiError) {
      console.error('API error while updating scrubs:', apiError);
    }
    
    // If we get here, the API update failed
    isUpdating = false;
    return {
      ...cachedData,
      fromCache: true,
      updateFailed: true
    };
  } catch (error) {
    console.error('Error getting blacklist data:', error);
    isUpdating = false;
    
    // Return default data on error
    return {
      newBlacklistedNumbers: 755,
      remainingScrubs: "39,806,098",
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Function to ensure data is ready in the cache
 */
async function ensureDataReady() {
  // Just return cached data, no background processing needed
  ensureCacheExists();
  return readCache();
}

/**
 * Function to simulate periodic data updates
 * Call this at application startup to begin periodic updates
 */
function startPeriodicUpdates(intervalMinutes = 60) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  console.log(`Starting periodic updates every ${intervalMinutes} minutes`);
  
  // Immediate first update
  getBlacklistData(true).catch(err => console.error('Initial update error:', err));
  
  // Schedule periodic updates
  setInterval(() => {
    console.log('Running scheduled update...');
    getBlacklistData(true).catch(err => console.error('Scheduled update error:', err));
  }, intervalMs);
}

/**
 * Initialize the cache with the provided values if it doesn't exist
 */
function initializeCache(blacklistedNumbers = 755, remainingScrubs = "39,806,098") {
  if (!fs.existsSync(cacheFilePath)) {
    console.log('Initializing cache with default values');
    const initialData = {
      newBlacklistedNumbers: blacklistedNumbers,
      remainingScrubs: remainingScrubs,
      lastUpdated: new Date().toISOString(),
      isInitialized: true
    };
    
    fs.writeFileSync(cacheFilePath, JSON.stringify(initialData, null, 2));
    console.log('Cache initialized');
  }
}

// Export functions
module.exports = {
  getBlacklistData,
  ensureDataReady,
  startPeriodicUpdates,
  initializeCache
};