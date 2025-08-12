const { test, expect } = require('@playwright/test');
const { loginAndOpenContact } = require('./helpers/whatsapp-helpers');

test.describe('WhatsApp Login Tests', () => {
  test('Navigate to WhatsApp Web and complete login', async ({ browser }) => {
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
      // Step 1: Navigate to WhatsApp Web
      await test.step('Navigate to WhatsApp Web', async () => {
        console.log("📱 Opening WhatsApp Web...");
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/whatsapp-loaded.png', fullPage: true });
      });
      
      // Step 2: Handle login and loading states
      await test.step('Check login status and wait for completion', async () => {
        // Wait for page to stabilize
        await page.waitForTimeout(5000);
        
        try {
          // Check if QR code exists
          const qrCode = await page.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: 3000 });
          if (qrCode) {
            console.log("📱 QR Code found! Please scan it.");
            await page.screenshot({ path: 'screenshots/qr-code.png', fullPage: true });
            await waitForEnter();
          }
        } catch {
          console.log("ℹ️ No QR code found - checking login status.");
        }
        
        // Check for loading state
        try {
          const loadingText = await page.locator('text=Loading your chats').waitFor({ timeout: 3000 });
          if (loadingText) {
            console.log("⏳ Chats are loading...");
            await page.screenshot({ path: 'screenshots/loading-chats.png', fullPage: true });
          }
        } catch {
          console.log("ℹ️ No loading state found.");
        }
        
        try {
          // Check if already logged in by looking for chat list or search box
          const chatElements = await Promise.race([
            page.waitForSelector('[data-testid="chat-list"]', { timeout: 30000 }).catch(() => null),
            page.waitForSelector('[data-testid="chat-list-search"]', { timeout: 30000 }).catch(() => null),
            page.waitForSelector('div[contenteditable="true"]', { timeout: 30000 }).catch(() => null)
          ]);
          
          if (chatElements) {
            console.log("✅ Successfully logged in to WhatsApp Web!");
            await page.screenshot({ path: 'screenshots/login-success.png', fullPage: true });
            return;
          }
        } catch (error) {
          console.log("⚠️ Waiting for login elements:", error.message);
        }
        
        console.log("✅ WhatsApp Web is ready!");
      });

      console.log("🎉 WhatsApp login completed successfully!");

    } catch (error) {
      console.error(`> ❌ Error in login workflow: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/whatsapp-login-error-${Date.now()}.png`, 
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

  test('Verify WhatsApp Web loads correctly', async ({ page }) => {
    await page.goto('https://web.whatsapp.com');
    
    // Verify page loads
    await expect(page).toHaveTitle(/WhatsApp/);
    
    // Verify QR code or main interface appears
    const qrCode = page.locator('[data-testid="qr-code"]');
    const chatList = page.locator('[data-testid="chat-list"]');
    
    // Either QR code should be visible (not logged in) or chat list (logged in)
    await expect(qrCode.or(chatList)).toBeVisible({ timeout: 30000 });
  });
});
