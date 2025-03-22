// scrapper.js - Production-compatible version
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// Use stealth plugin to better avoid detection
puppeteer.use(StealthPlugin());

// Cache file path
const cacheFilePath = path.join(__dirname, 'data-cache.json');

// Track if scraping is already in progress
let isScraping = false;
let lastScrapeTime = 0;
const SCRAPE_COOLDOWN = 60000; // 1 minute cooldown between scrape attempts

// Helper function for timeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to scrape blacklist data
async function scrapeBlacklistData() {
  // Prevent multiple simultaneous scraping attempts
  if (isScraping) {
    console.log('Scraping already in progress, returning cached data');
    return getCachedData();
  }

  // Apply cooldown to prevent too frequent scraping
  const now = Date.now();
  if (now - lastScrapeTime < SCRAPE_COOLDOWN) {
    console.log('Scrape cooldown active, returning cached data');
    return getCachedData();
  }

  console.log('Starting production-compatible scraping process...');
  isScraping = true;
  lastScrapeTime = now;
  let browser = null;
  
  try {
    // Determine if we're in production or development
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Launch browser with appropriate settings for environment
    const launchOptions = {
      headless: isProduction ? 'new' : false, // Use headless in production, visible in development
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage',
      ],
      defaultViewport: { width: 1280, height: 720 },
      timeout: 30000
    };
    
    // In production, we might need additional args
    if (isProduction) {
      launchOptions.args.push(
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-dev-shm-usage',
        '--single-process', // This can help in some production environments
        '--no-zygote'
      );
    }
    
    browser = await puppeteer.launch(launchOptions);
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Log navigation events for debugging
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
    
    // Set reasonable timeouts
    page.setDefaultNavigationTimeout(30000);
    
    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('https://www3.blacklistalliance.com/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    console.log('Navigated to login page');
    
    // Wait for login form
    await page.waitForSelector('input[name="email"]', { visible: true, timeout: 10000 })
      .catch(err => console.log('Warning: Email input not found with selector'));
    
    // Fill in login details
    console.log('Filling login form...');
    
    // Clear any existing values first
    await page.evaluate(() => {
      const email = document.querySelector('input[name="email"]');
      const password = document.querySelector('input[name="password"]');
      if (email) email.value = '';
      if (password) password.value = '';
    });
    
    // Type with small delays to simulate human interaction
    await page.type('input[name="email"]', process.env.BLA_EMAIL || 'rainomanraza@gmail.com', { delay: 20 });
    await page.type('input[name="password"]', process.env.BLA_PASSWORD || 'Hello@mars9090', { delay: 20 });
    console.log('Credentials entered');
    
    // Find and click login button
    const buttonVisible = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.toLowerCase().includes('login') || 
        b.textContent.toLowerCase().includes('sign in')
      );
      return btn ? true : false;
    });
    
    if (buttonVisible) {
      console.log('Login button found, clicking...');
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent.toLowerCase().includes('login') || 
          b.textContent.toLowerCase().includes('sign in')
        );
        if (btn) btn.click();
      });
    } else {
      console.log('Login button not found, trying form submission...');
      await page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.submit();
      });
    }
    
    // Wait for navigation
    console.log('Waiting for navigation after login...');
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('Navigation completed');
    } catch (navError) {
      console.log('Navigation timeout, checking current state...');
    }
    
    // Check current URL
    const currentUrl = await page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // If not on dashboard, navigate there directly
    if (!currentUrl.includes('/dashboard')) {
      console.log('Not on dashboard, navigating there directly...');
      await page.goto('https://www3.blacklistalliance.com/dashboard', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      console.log('Navigated to dashboard page');
    }
    
    // Give dashboard time to load
    console.log('Waiting for dashboard content to load...');
    await sleep(3000);
    
    // Extract data using multiple selector strategies for greater reliability
    const extractedStats = await page.evaluate(() => {
      // Create an array of different selector strategies
      const strategies = [
        // Strategy 1: Regular CSS selectors
        () => {
          const stats = {};
          const blacklistedElem = document.querySelector('.stat-value');
          const remainingElem = document.querySelectorAll('.stat-value')[1];
          
          if (blacklistedElem) stats.newBlacklistedNumbers = parseInt(blacklistedElem.textContent.trim(), 10);
          if (remainingElem) stats.remainingScrubs = remainingElem.textContent.trim();
          
          return stats;
        },
        
        // Strategy 2: Text content analysis
        () => {
          const stats = {};
          const elements = document.querySelectorAll('*');
          
          for (const el of elements) {
            const text = el.textContent || '';
            
            // Look for blacklisted numbers
            if (text.match(/New\s+Blacklisted\s+Numbers/i)) {
              const parent = el.closest('.stat-item') || el.parentElement;
              const valueEl = parent.querySelector('.stat-value');
              if (valueEl) {
                stats.newBlacklistedNumbers = parseInt(valueEl.textContent.trim(), 10);
              }
            }
            
            // Look for remaining scrubs
            if (text.match(/Remaining\s+Scrubs/i)) {
              const parent = el.closest('.stat-item') || el.parentElement;
              const valueEl = parent.querySelector('.stat-value');
              if (valueEl) {
                stats.remainingScrubs = valueEl.textContent.trim();
              }
            }
          }
          
          return stats;
        },
        
        // Strategy 3: Direct text search in body content
        () => {
          const stats = {};
          const bodyText = document.body.innerText;
          
          const blacklistedMatch = bodyText.match(/(\d+)\s+New\s+Blacklisted\s+Numbers/i);
          if (blacklistedMatch) {
            stats.newBlacklistedNumbers = blacklistedMatch[1];
          }
          
          const scrubsMatch = bodyText.match(/Remaining\s+Scrubs[:.\s]*([\d,]+)/i);
          if (scrubsMatch) {
            stats.remainingScrubs = scrubsMatch[1];
          }
          
          return stats;
        }
      ];
      
      // Try each strategy until we get results
      let results = {};
      for (const strategy of strategies) {
        const strategyResults = strategy();
        if (strategyResults.newBlacklistedNumbers || strategyResults.remainingScrubs) {
          if (strategyResults.newBlacklistedNumbers) results.newBlacklistedNumbers = strategyResults.newBlacklistedNumbers;
          if (strategyResults.remainingScrubs) results.remainingScrubs = strategyResults.remainingScrubs;
          
          if (results.newBlacklistedNumbers && results.remainingScrubs) break;
        }
      }
      
      return results;
    });
    
    console.log('Stats extraction results:', extractedStats);
    
    // Process the extracted data
    let newBlacklistedNumbers = extractedStats.newBlacklistedNumbers ? 
      (typeof extractedStats.newBlacklistedNumbers === 'string' ? 
        parseInt(extractedStats.newBlacklistedNumbers, 10) : 
        extractedStats.newBlacklistedNumbers) : null;
    
    let remainingScrubs = extractedStats.remainingScrubs || null;
    
    // Check if we're using fallback values
    const usingFallback = !newBlacklistedNumbers || !remainingScrubs;
    console.log('Using fallback values?', usingFallback);
    
    // Use cached data first if available, then hardcoded values
    if (usingFallback) {
      try {
        if (fs.existsSync(cacheFilePath)) {
          const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
          
          if (!newBlacklistedNumbers && cachedData.newBlacklistedNumbers) {
            newBlacklistedNumbers = cachedData.newBlacklistedNumbers;
            console.log('Using cached value for new blacklisted numbers:', newBlacklistedNumbers);
          }
          
          if (!remainingScrubs && cachedData.remainingScrubs) {
            remainingScrubs = cachedData.remainingScrubs;
            console.log('Using cached value for remaining scrubs:', remainingScrubs);
          }
        }
      } catch (cacheErr) {
        console.error('Error reading from cache:', cacheErr);
      }
    }
    
    // If still no values, use hardcoded fallbacks
    if (!newBlacklistedNumbers) {
      newBlacklistedNumbers = 755;
      console.log('Using hardcoded value for new blacklisted numbers:', newBlacklistedNumbers);
    }
    
    if (!remainingScrubs) {
      remainingScrubs = "39,806,098";
      console.log('Using hardcoded value for remaining scrubs:', remainingScrubs);
    }
    
    // Allow some time for any final data to load
    await sleep(1000);
    
    // Prepare the data to return
    const data = {
      newBlacklistedNumbers,
      remainingScrubs,
      lastUpdated: new Date().toISOString(),
      usingFallback
    };
    
    console.log('Final processed data:', data);
    
    // Save data to cache file
    fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2));
    console.log('Data saved to cache file');
    
    // Close browser
    await browser.close();
    console.log('Browser closed');
    
    isScraping = false;
    return data;
  } catch (error) {
    console.error('Error scraping data:', error);
    
    // Make sure browser is closed in case of error
    if (browser) {
      try {
        await browser.close();
        console.log('Browser closed after error');
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    // Use cached data if available
    const cachedData = getCachedData();
    
    isScraping = false;
    return cachedData;
  }
}

// Helper function to get cached data
function getCachedData() {
  try {
    if (fs.existsSync(cacheFilePath)) {
      console.log('Reading from cache file');
      const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      return {
        ...cachedData,
        fromCache: true
      };
    }
  } catch (cacheError) {
    console.error('Error reading cache file:', cacheError);
  }
  
  // Fallback data if cache is unavailable
  return {
    newBlacklistedNumbers: 755,
    remainingScrubs: "39,806,098",
    lastUpdated: new Date().toISOString(),
    isFallback: true
  };
}

// Function to get data (with optional cache)
async function getBlacklistData(useCache = true) {
  // Check if we have recent cache data
  if (useCache && fs.existsSync(cacheFilePath)) {
    try {
      const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      const cacheAge = new Date() - new Date(cachedData.lastUpdated);
      
      // Use cache if it's less than 1 hour old
      if (cacheAge < 3600000) { // 1 hour in milliseconds
        console.log('Using cached data (less than 1 hour old)');
        return {
          ...cachedData,
          fromCache: true
        };
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
  }
  
  // Otherwise scrape fresh data
  return await scrapeBlacklistData();
}

// Function to ensure data is ready in the cache
async function ensureDataReady() {
  // If cache doesn't exist or is too old, start scraping in the background
  let shouldScrape = false;
  
  if (fs.existsSync(cacheFilePath)) {
    try {
      const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
      const cacheAge = Date.now() - new Date(cachedData.lastUpdated).getTime();
      shouldScrape = cacheAge > 3600000; // older than 1 hour
    } catch (error) {
      shouldScrape = true;
    }
  } else {
    shouldScrape = true;
  }
  
  if (shouldScrape && !isScraping) {
    // Start scraping in the background without awaiting it
    console.log('Starting background scraping...');
    scrapeBlacklistData().catch(err => console.error('Background scraping error:', err));
    
    // Return cached data or default data immediately
    return getCachedData();
  }
  
  return getCachedData();
}

module.exports = {
  scrapeBlacklistData,
  getBlacklistData,
  ensureDataReady
};