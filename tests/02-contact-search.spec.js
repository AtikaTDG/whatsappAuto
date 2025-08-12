const { test, expect } = require('@playwright/test');
const { loginAndOpenContact } = require('./helpers/whatsapp-helpers');

test.describe('WhatsApp Contact Search Tests', () => {
  test('Search and open contact by phone number', async ({ browser }) => {
    // Configure test timeout
    test.setTimeout(300000); // 5 minutes
    
    // Launch browser with video recording and anti-detection settings
    const context = await browser.newContext({
      recordVideo: {
        dir: './test-results/videos',
        size: { width: 1280, height: 720 }
      },
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const page = await context.newPage();
    
    // Set longer timeouts
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    try {
      // Navigate to WhatsApp Web (assuming already logged in)
      console.log("📱 Opening WhatsApp Web...");
      await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);

      // Step: Search and open contact by phone number
      await test.step('Search for contact by phone number', async () => {
        console.log(`📞 Searching for contact: ${CONFIG.contactNumber}`);
        
        // Look for search box with multiple possible selectors
        const searchSelectors = [
          '[data-testid="chat-list-search"]',
          'div[contenteditable="true"][data-tab="3"]',
          'div[contenteditable="true"]'
        ];
        
        let searchBox = null;
        for (const selector of searchSelectors) {
          try {
            searchBox = await page.waitForSelector(selector, { timeout: 10000 });
            if (searchBox) {
              console.log(`📍 Found search box with selector: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!searchBox) {
          throw new Error('Could not find search box');
        }
        
        await searchBox.click();
        await searchBox.fill(CONFIG.contactNumber);
        await page.waitForTimeout(3000);
        
        // Look for contact result
        const contactSelectors = [
          '[data-testid="cell-frame-container"]',
          `span[title*="${CONFIG.contactNumber}"]`,
          'div[role="listitem"]'
        ];
        
        let contactResult = null;
        for (const selector of contactSelectors) {
          try {
            contactResult = await page.waitForSelector(selector, { timeout: 10000 });
            if (contactResult) {
              console.log(`📍 Found contact with selector: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (contactResult) {
          await contactResult.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screenshots/contact-opened.png', fullPage: true });
          console.log(`📱 Contact ${CONFIG.contactNumber} opened`);
        } else {
          console.log("⚠️ Could not find contact, trying to continue...");
          await page.screenshot({ path: 'screenshots/contact-not-found.png', fullPage: true });
          throw new Error('Contact not found');
        }
      });

      console.log("🎉 Contact search completed successfully!");

    } catch (error) {
      console.error(`> ❌ Error in contact search: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/contact-search-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }

    // Keep browser open for inspection in non-CI environments
    if (!process.env.CI) {
      console.log("> Browser will remain open for inspection...");
      await page.waitForTimeout(10000); // Wait 10 seconds before closing
    }
  });
});
