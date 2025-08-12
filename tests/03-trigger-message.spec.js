const { test, expect } = require('@playwright/test');
const { loginAndOpenContact, sendMessage, CONFIG } = require('./helpers/whatsapp-helpers');

// Test-specific configuration
const TEST_CONFIG = {
  triggerMessage: "kuhentest",
  timeouts: {
    messageDelay: 3000,
  }
};

// Helper function to wait with logging
async function waitWithLog(milliseconds, description) {
  console.log(`> Waiting ${milliseconds/1000}s for ${description}...`);
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

test.describe('WhatsApp Trigger Message Tests', () => {
  test('Send trigger message and handle proceed button', async ({ browser }) => {
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
      // Step 1 & 2: Login and open contact using shared helper
      await loginAndOpenContact(page, test);

      // Step 3: Send trigger message
      await test.step('Send trigger message', async () => {
        console.log("📝 Sending trigger message...");
        await sendMessage(page, TEST_CONFIG.triggerMessage, "Trigger message");
        await waitWithLog(CONFIG.timeouts.messageDelay, "bot response");
        
        // Take screenshot after trigger to see the response
        await page.screenshot({ path: 'screenshots/after-trigger-message.png', fullPage: true });
      });

      // Step: Click Proceed button (this should appear after trigger message)
      await test.step('Click Proceed button', async () => {
        console.log("🔘 Looking for Proceed button after trigger message...");
        
        try {
          // Wait for proceed button to appear after trigger message
          const proceedButton = await page.waitForSelector('div._ahef[role="button"]:has-text("Proceed")', { 
            timeout: 30000,
            state: 'visible'
          });
          
          console.log("✅ Proceed button found!");
          await page.screenshot({ path: 'screenshots/proceed-button-found.png', fullPage: true });
          
          // Wait for button to be enabled using DOM attribute check
          let isEnabled = false;
          let attempts = 0;
          while (!isEnabled && attempts < 30) {
            const ariaDisabled = await proceedButton.getAttribute('aria-disabled');
            const disabled = await proceedButton.getAttribute('disabled');
            isEnabled = ariaDisabled !== 'true' && !disabled;
            
            if (!isEnabled) {
              await page.waitForTimeout(1000);
              attempts++;
            }
          }
          
          if (isEnabled) {
            console.log("✅ Proceed button is enabled, clicking...");
            await proceedButton.click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ path: 'screenshots/proceed-button-clicked.png', fullPage: true });
            console.log("✅ Proceed button clicked successfully!");
          } else {
            console.log("⚠️ Proceed button remained disabled");
            await page.screenshot({ path: 'screenshots/proceed-button-disabled.png', fullPage: true });
          }
          
        } catch (error) {
          console.log("⚠️ Proceed button not found or not clickable:", error.message);
          await page.screenshot({ path: 'screenshots/proceed-button-error.png', fullPage: true });
          throw error; // Fail the test if proceed button is not found
        }
      });

      console.log("🎉 Trigger message workflow completed successfully!");

    } catch (error) {
      console.error(`> ❌ Error in trigger message workflow: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/trigger-message-error-${Date.now()}.png`, 
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
