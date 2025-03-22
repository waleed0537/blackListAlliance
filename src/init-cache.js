// init-cache.js
const fs = require('fs');
const path = require('path');

/**
 * Initialize the cache with the latest values or defaults
 */
function initializeCache() {
  const cacheFilePath = path.join(__dirname, 'data-cache.json');
  
  // Default values
  const defaultData = {
    newBlacklistedNumbers: 755,
    remainingScrubs: "39,806,098", 
    lastUpdated: new Date().toISOString(),
    isInitialized: true
  };
  
  // Check if current cache exists
  if (fs.existsSync(cacheFilePath)) {
    try {
      const currentCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      console.log('Current cache exists:', currentCache);
      
      // Update lastUpdated time while keeping existing values
      const updatedCache = {
        ...currentCache,
        lastUpdated: new Date().toISOString()
      };
      
      fs.writeFileSync(cacheFilePath, JSON.stringify(updatedCache, null, 2));
      console.log('Cache updated with new timestamp');
      return;
    } catch (error) {
      console.error('Error reading existing cache:', error);
      // If there's an error, we'll create a new cache below
    }
  }
  
  // Create new cache file with default values
  try {
    fs.writeFileSync(cacheFilePath, JSON.stringify(defaultData, null, 2));
    console.log('Created new cache file with default values:', defaultData);
  } catch (error) {
    console.error('Error creating new cache file:', error);
  }
}

// Run the initialization
initializeCache();