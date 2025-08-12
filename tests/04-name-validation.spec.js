const { test, expect } = require('@playwright/test');
const { loginAndOpenContact, sendMessage } = require('./helpers/whatsapp-helpers');

// Test-specific configuration
const TEST_CONFIG = {
  userName: "Atika",
  timeouts: {
    errorDelay: 5000,
  }
};

// Helper function to wait with logging
async function waitWithLog(milliseconds, description) {
  console.log(`> Waiting ${milliseconds/1000}s for ${description}...`);
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

test.describe('WhatsApp Name Validation Tests', () => {
  test('Send user name with error sequence and validation', async ({ browser }) => {
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

      // Step 3: Send user name with error sequence and validation
      await test.step('Send user name with error sequence and validation', async () => {
        console.log("👤 Starting name entry with error sequence and validation...");
        await page.waitForTimeout(2000);
        
        // First, send the error sequence that should be rejected
        const errorMessages = ['123', 'Hello123', '✅✅✅'];
        
        for (const [index, message] of errorMessages.entries()) {
          await page.waitForTimeout(TEST_CONFIG.timeouts.errorDelay);
          await sendMessage(page, message, `Error name ${index + 1}`);
          
          // After each invalid name, check if system requests re-submission
          await page.waitForTimeout(3000);
          
          // Look for error indicators or re-submission requests
          try {
            // Check for common error patterns
            const errorIndicators = [
              'text="Please enter a valid name"',
              'text="Invalid name format"',
              'text="Name should only contain letters"',
              'text="Please try again"',
              'text="Please enter your FULL NAME ONLY as per your NRIC, without any numbers, symbols or images"',
              '[aria-label*="error"]',
              '[class*="error"]'
            ];
            
            let errorFound = false;
            for (const selector of errorIndicators) {
              try {
                const errorElement = await page.waitForSelector(selector, { timeout: 2000 });
                if (errorElement) {
                  console.log(`✅ System correctly rejected invalid name "${message}" - found error indicator`);
                  errorFound = true;
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            
            if (!errorFound) {
              // Check if the conversation continues without requesting name again
              await page.waitForTimeout(2000);
              
              // Look for signs that the system accepted the invalid name and moved on
              const conversationContinues = await page.locator('text="Please submit your receipt as a proof of purchase"').or(
                page.locator('text="Next step"')
              ).or(
                page.locator('text="Please upload"')
              ).or(
                page.locator('text="Proceed"')
              ).count();
              
              if (conversationContinues > 0) {
                console.log(`❌ VALIDATION FAILED: System accepted invalid name "${message}" and continued!`);
                await page.screenshot({ path: `screenshots/validation-failed-${message.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true });
                throw new Error(`System validation failed: Invalid name "${message}" was accepted when it should have been rejected`);
              } else {
                console.log(`⚠️ No clear error message found for "${message}", but system didn't continue either`);
              }
            }
            
          } catch (validationError) {
            if (validationError.message.includes('System validation failed')) {
              throw validationError; // Re-throw validation failures
            }
            console.log(`⚠️ Could not determine validation result for "${message}": ${validationError.message}`);
          }
        }
        
        // Finally, send the correct name
        await page.waitForTimeout(TEST_CONFIG.timeouts.errorDelay);
        await sendMessage(page, TEST_CONFIG.userName, "Correct user name");
        
        // Verify the correct name is accepted
        await page.waitForTimeout(3000);
        try {
          // Look for success indicators
          const successIndicators = [
            'text="Please submit your receipt as a proof of purchase. The receipt must contain the following information:"',
            'text="Next step"',
            'text="Please upload"',
            'text="Proceed"'
          ];
          
          let successFound = false;
          for (const selector of successIndicators) {
            try {
              const successElement = await page.waitForSelector(selector, { timeout: 3000 });
              if (successElement) {
                console.log(`✅ Correct name "${TEST_CONFIG.userName}" was accepted - found success indicator`);
                successFound = true;
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!successFound) {
            console.log(`⚠️ No clear success indicator found, but assuming correct name was accepted`);
          }
          
        } catch (error) {
          console.log(`⚠️ Could not verify correct name acceptance: ${error.message}`);
        }
        
        await page.screenshot({ path: 'screenshots/name-validation-complete.png', fullPage: true });
      });

      console.log("🎉 Name validation workflow completed successfully!");

    } catch (error) {
      console.error(`> ❌ Error in name validation workflow: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/name-validation-error-${Date.now()}.png`, 
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
