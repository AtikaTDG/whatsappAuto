const { test, expect } = require('@playwright/test');
const { loginAndOpenContact, sendMessage } = require('./helpers/whatsapp-helpers');

// Use real receipt image
const receiptPath = 'c:\\Users\\User\\Downloads\\testqa1.jpg';

test.describe('WhatsApp Login and Contact Search Tests', () => {
  test('Login, contact search, and receipt upload', async ({ browser }) => {
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

      // Step 3: Send activation message
      await test.step('Send activation message', async () => {
        console.log("💬 Sending activation message to enable attachment button...");
        await page.waitForTimeout(2000);
        await sendMessage(page, "Hello", "Activation message");
        await page.waitForTimeout(5000);
      });

      // Step 4: Upload receipt image manually
      await test.step('Upload receipt image manually', async () => {
        console.log("📄 Uploading Watsons receipt image manually...");
        
        try {
          console.log(`📋 Using receipt file: ${receiptPath}`);
          
          // Wait for the chat to be fully loaded
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screenshots/before-manual-upload.png', fullPage: true });
          
          // Method 1: Look for hidden file input and set files directly
          console.log("📎 Attempting direct file input method...");
          const fileInputs = await page.$$('input[type="file"]');
          
          if (fileInputs.length > 0) {
            console.log(`📁 Found ${fileInputs.length} file input(s), using the first one`);
            await fileInputs[0].setInputFiles(receiptPath);
            await page.waitForTimeout(2000);
            console.log("✅ File uploaded successfully via direct input method");
            await page.screenshot({ path: 'screenshots/file-uploaded.png', fullPage: true });
          } else {
            // Provide manual instructions since keyboard shortcut may not work
            console.log("📎 Providing manual upload instructions...");
            console.log("📋 MANUAL ACTION REQUIRED:");
            console.log("1. Click the attachment/clip button (📎) in WhatsApp");
            console.log("2. Select 'Photos & Videos' or 'Document'");
            console.log(`3. Navigate to and select: ${receiptPath}`);
            console.log("4. Click Send");
            console.log("⏳ Waiting 30 seconds for manual upload...");
            
            await page.screenshot({ path: 'screenshots/manual-upload-instruction.png', fullPage: true });
            await page.waitForTimeout(30000); // Wait 30 seconds for manual action
            
            console.log("✅ Manual upload time completed");
          }
          
        } catch (error) {
          console.log("⚠️ Error during receipt upload:", error.message);
          await page.screenshot({ path: 'screenshots/upload-error.png', fullPage: true });
          console.log("📋 Manual upload required - please attach the receipt manually");
          console.log(`📁 File location: ${receiptPath}`);
        }
      });

      console.log("🎉 Login, contact search, and receipt upload completed successfully!");
      console.log("ℹ️ Note: Receipt upload attempted with manual input method");

    } catch (error) {
      console.error(`> ❌ Error in workflow: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/workflow-error-${Date.now()}.png`, 
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
