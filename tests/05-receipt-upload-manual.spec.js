const { test, expect } = require('@playwright/test');
const { loginAndOpenContact, sendMessage } = require('./helpers/whatsapp-helpers');

test.describe('WhatsApp Login and Contact Search Tests', () => {
  test('Login, contact search, and manual receipt upload', async ({ browser }) => {
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

    // Configuration
    const CONFIG = {
      receiptPath: 'c:\\Users\\User\\Downloads\\testqa1.jpg'
    };

    try {
      // Step 1 & 2: Login and open contact using shared helper
      await loginAndOpenContact(page, test);

      // Step 3: Send error sequence for upload receipt
      await test.step('Send error sequence for upload receipt', async () => {
        console.log("📝 Starting upload receipt error sequence...");
        
        // Error sequence as requested
        const errorMessages = [
          'dsvdsvefew',
          '23432@@@@@'
        ];
        
        for (const [index, message] of errorMessages.entries()) {
          await page.waitForTimeout(3000); // Wait between messages
          await sendMessage(page, message, `Error message ${index + 1} for receipt upload`);
          
          // Wait for system response
          await page.waitForTimeout(2000);
          console.log(`📝 Sent error message ${index + 1}: "${message}"`);
        }
        
        console.log("✅ Error sequence for upload receipt completed");
      });

      // Step 4: Manual receipt upload with instructions
      await test.step('Manual receipt upload', async () => {
        console.log("📄 Preparing for manual receipt upload...");
        
        console.log("📋 MANUAL ACTION REQUIRED:");
        console.log("1. Click the attachment/clip button (📎) in WhatsApp");
        console.log("2. Select 'Photos & Videos' or 'Document'");
        console.log(`3. Navigate to and select: ${CONFIG.receiptPath}`);
        console.log("4. Add any caption if needed");
        console.log("5. Click Send");
        console.log("");
        console.log("⏳ You have 60 seconds to complete the manual upload...");
        
        await page.screenshot({ path: 'screenshots/ready-for-manual-upload.png', fullPage: true });
        
        // Wait 60 seconds for manual upload
        const startTime = Date.now();
        const timeoutMs = 60000; // 60 seconds
        
        while (Date.now() - startTime < timeoutMs) {
          await page.waitForTimeout(5000);
          const remainingTime = Math.ceil((timeoutMs - (Date.now() - startTime)) / 1000);
          console.log(`⏰ ${remainingTime} seconds remaining for manual upload...`);
        }
        
        console.log("✅ Manual upload time completed");
        await page.screenshot({ path: 'screenshots/after-manual-upload.png', fullPage: true });
      });

      // Step 5: Handle image upload validation
      await test.step('Handle image upload validation', async () => {
        console.log("📸 Monitoring for image upload messages...");
        
        // Wait a moment for any system responses
        await page.waitForTimeout(3000);
        
        // Look for the specific error message about image upload
        try {
          const imageErrorMessage = await page.locator('text="Please upload an image using WhatsApp (click a camera icon and choose a photo)"').waitFor({ timeout: 5000 });
          if (imageErrorMessage) {
            console.log("❌ Found image upload error message: 'Please upload an image using WhatsApp (click a camera icon and choose a photo)'");
            await page.screenshot({ path: 'screenshots/image-upload-error.png', fullPage: true });
            
            // This indicates the test should proceed to image upload
            console.log("📋 Test should continue to image upload step");
            return;
          }
        } catch (e) {
          // No error message found, check for success message
        }
        
        // Look for the success message
        try {
          const successMessage = await page.locator('text="Thank you for your submission!"').waitFor({ timeout: 5000 });
          if (successMessage) {
            console.log("❌ UNEXPECTED: Found success message after error sequence!");
            await page.screenshot({ path: 'screenshots/unexpected-success-after-error.png', fullPage: true });
            
            // This should NOT happen - error sequence should not lead to success
            throw new Error("Test FAILED: Error sequence messages resulted in success message 'Thank you for your submission!' - this should not happen!");
          }
        } catch (e) {
          if (e.message.includes("Test FAILED")) {
            throw e; // Re-throw our intentional failure
          }
          // No success message found - this is expected after error sequence
        }
        
        // If neither message is found, take a screenshot for debugging
        console.log("⚠️ Neither image upload error nor success message found");
        await page.screenshot({ path: 'screenshots/no-validation-message.png', fullPage: true });
        
        // Look for any other relevant messages
        const allMessages = await page.$$eval('[role="row"]', rows => 
          rows.map(row => row.textContent?.trim()).filter(text => text && text.length > 0).slice(-5)
        );
        console.log("📝 Recent messages:", allMessages);
      });

      console.log("🎉 Login, contact search, and manual receipt upload process completed!");
      console.log("ℹ️ Note: Receipt upload requires manual action by user");

    } catch (error) {
      console.error(`> ❌ Error in workflow: ${error.message}`);
      
      // Take screenshot for debugging
      try {
        await page.screenshot({ 
          path: `test-results/workflow-error-${Date.now()}.png`, 
          fullPage: true 
        });
      } catch (screenshotError) {
        console.log("Could not take error screenshot:", screenshotError.message);
      }
      
      throw error;
    }

    // Keep browser open for inspection in non-CI environments
    if (!process.env.CI) {
      console.log("> Browser will remain open for inspection...");
      await page.waitForTimeout(15000); // Wait 15 seconds before closing
    }
  });
});
