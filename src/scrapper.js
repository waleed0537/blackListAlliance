// optimized-scraper.js - With visible window for debugging
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');

// Use stealth plugin to better avoid detection
puppeteer.use(StealthPlugin());

// Cache file path
const cacheFilePath = path.join(__dirname, 'data-cache.json');

// Helper function for timeout
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to scrape blacklist data
async function scrapeBlacklistData() {
  console.log('Starting optimized scraping process with visible window...');
  let browser = null;
  
  try {
    // Launch browser with visible window but other optimizations
    browser = await puppeteer.launch({
      headless: false, // Show browser window for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--window-size=1280,720',
        '--start-maximized' // Ensure window is visible
      ],
      defaultViewport: null, // Let viewport match window size
      timeout: 30000
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Log navigation events for debugging
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
    page.on('pageerror', error => console.log(`BROWSER PAGE ERROR: ${error.message}`));
    
    // Don't block resources to see the full page as it loads
    // This helps identify where the issue might be
    
    // Set reasonable timeouts
    page.setDefaultNavigationTimeout(30000);
    
    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('https://www3.blacklistalliance.com/login', { 
      waitUntil: 'networkidle2', // Wait for all network activity to finish
      timeout: 30000
    });
    console.log('Navigated to login page');
    
    // Wait explicitly for login form to be fully loaded and ready
    await page.waitForSelector('input[name="email"]', { visible: true, timeout: 10000 })
      .catch(err => console.log('Warning: Email input not found with selector'));
    
    // Take screenshot of login page for verification
    await page.screenshot({ path: 'login-page.png' });
    console.log('Login page screenshot saved');
    
    // Fill in login details more carefully
    console.log('Filling login form...');
    
    // Clear existing values first
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
    const loginButtonSelector = 'button[type="submit"], button:contains("Login"), button:contains("Sign In")';
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
    
    // Wait for navigation to complete after login attempt
    console.log('Waiting for navigation after login...');
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('Navigation completed');
    } catch (navError) {
      console.log('Navigation timeout, checking current state...');
      // Take screenshot after login attempt
      await page.screenshot({ path: 'post-login.png' });
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
    
    // Give dashboard plenty of time to load
    console.log('Waiting for dashboard content to load...');
    await sleep(3500); // Increased to 5 seconds for debugging
    
    // Take screenshot of dashboard for debugging
    await page.screenshot({ path: 'dashboard.png', fullPage: true });
    console.log('Dashboard screenshot saved');
    
    // Check if dashboard has loaded properly
    const dashboardLoaded = await page.evaluate(() => {
      // Look for typical dashboard elements
      const hasStats = document.querySelectorAll('.stat-value').length > 0;
      const hasCards = document.querySelectorAll('.card').length > 0;
      const hasHeader = document.querySelector('.header') !== null;
      
      return {
        hasStats,
        hasCards, 
        hasHeader,
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500) // First 500 chars
      };
    });
    
    console.log('Dashboard verification:', dashboardLoaded);
    
    // Extract data with detailed logging
    console.log('Extracting dashboard data...');
    
    // First approach: Try to find data using CSS selectors with detailed logging
    let newBlacklistedNumbers = null;
    let remainingScrubs = null;
    
    const detailedExtraction = await page.evaluate(() => {
      // Log all stat-related elements for debugging
      const results = {
        statElements: [],
        possibleStatsText: [],
        relevantElementsFound: false
      };
      
      // Look for stats elements
      const statElements = document.querySelectorAll('.stat-value, .stat-item, span.stat-value');
      if (statElements.length > 0) {
        results.relevantElementsFound = true;
        Array.from(statElements).forEach((el, i) => {
          results.statElements.push({
            index: i,
            text: el.textContent.trim(),
            className: el.className,
            parentClass: el.parentElement ? el.parentElement.className : 'none'
          });
        });
      }
      
      // Look for text containing keywords
      const allElements = document.querySelectorAll('*');
      Array.from(allElements).forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Blacklisted') || text.includes('Scrubs')) {
          results.possibleStatsText.push({
            text: text.trim().substring(0, 100), // Limit length
            tag: el.tagName,
            className: el.className
          });
        }
      });
      
      return results;
    });
    
    console.log('Detailed extraction results:', JSON.stringify(detailedExtraction, null, 2));
    
    // Try to extract specific stats based on the detailed info
    const extractedStats = await page.evaluate(() => {
      // Try multiple selector patterns
      const selectors = [
        '.stat-value', 
        '.stat-item span', 
        'span.stat-value',
        '.stat-container .value',
        '[data-testid="stat-value"]'
      ];
      
      let foundElements = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements.push({
            selector,
            count: elements.length,
            values: Array.from(elements).map(el => el.textContent.trim())
          });
        }
      });
      
      // Direct text search
      let newBlacklistedNumbers = null;
      let remainingScrubs = null;
      
      // Check entire page text
      const bodyText = document.body.innerText;
      
      // Look for New Blacklisted Numbers
      const blacklistedMatch = bodyText.match(/(\d+)\s+New\s+Blacklisted\s+Numbers/i);
      if (blacklistedMatch) {
        newBlacklistedNumbers = blacklistedMatch[1];
      }
      
      // Look for Remaining Scrubs
      const scrubsMatch = bodyText.match(/Remaining\s+Scrubs:\s*([\d,]+)/i);
      if (scrubsMatch) {
        remainingScrubs = scrubsMatch[1];
      }
      
      return {
        foundElements,
        newBlacklistedNumbers,
        remainingScrubs,
        bodyTextSample: bodyText.substring(0, 1000) // First 1000 chars for debugging
      };
    });
    
    console.log('Stats extraction results:', JSON.stringify(extractedStats, null, 2));
    
    // Process the extracted data
    if (extractedStats.newBlacklistedNumbers) {
      newBlacklistedNumbers = parseInt(extractedStats.newBlacklistedNumbers, 10);
      console.log('Found new blacklisted numbers:', newBlacklistedNumbers);
    }
    
    if (extractedStats.remainingScrubs) {
      remainingScrubs = extractedStats.remainingScrubs;
      console.log('Found remaining scrubs:', remainingScrubs);
    }
    
    // Check if we're using fallback values
    const usingFallback = !newBlacklistedNumbers || !remainingScrubs;
    console.log('Using fallback values?', usingFallback);
    
    // Use hardcoded values as fallback
    if (!newBlacklistedNumbers) {
      newBlacklistedNumbers = 755;
      console.log('Using hardcoded value for new blacklisted numbers:', newBlacklistedNumbers);
    }
    
    if (!remainingScrubs) {
      remainingScrubs = "46,138,058";
      console.log('Using hardcoded value for remaining scrubs:', remainingScrubs);
    }
    
    // Allow some time to view the dashboard before closing
    await sleep(3000);
    
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
    
    // Try to read from cache if scraping fails
    if (fs.existsSync(cacheFilePath)) {
      console.log('Reading from cache file due to scraping failure');
      try {
        const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        return {
          ...cachedData,
          fromCache: true,
          error: error.message
        };
      } catch (cacheError) {
        console.error('Error reading cache file:', cacheError);
      }
    }
    
    // If all else fails, use the fallback values
    return {
      newBlacklistedNumbers: 755,
      remainingScrubs: "46,138,058",
      lastUpdated: new Date().toISOString(),
      isFallback: true,
      error: error.message
    };
  }
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
        return cachedData;
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
  }
  
  // Otherwise scrape fresh data
  return await scrapeBlacklistData();
}

module.exports = {
  scrapeBlacklistData,
  getBlacklistData
};