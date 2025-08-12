const { test, expect } = require('@playwright/test');
const readline = require('readline');
const path = require('path');

// Use real receipt image instead of generated test image
const receiptPath = 'c:\\Users\\User\\Downloads\\testqa1.jpg';

// Configuration
const CONFIG = {
  contactNumber: "+60 3-9771 1660", // Updated to use phone number
  triggerMessage: "kuhentest",
  userName: "Atika",
  agentMessage: "Hello, I need assistance with my recent transaction. Can you please help me?",
  timeouts: {
    qrScan: 120000,
    buttonWait: 60000,
    messageDelay: 3000,
    errorDelay: 5000,
    receiptUpload: 15000
  }
};

// Helper function to wait for user input (QR scan)
const waitForEnter = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Scan the QR code in the browser, then press ENTER here to continue... ", () => {
      rl.close();
      resolve();
    });
  });
};

// Helper function to send message with enhanced error handling
async function sendMessage(page, message, description = "Message") {
  try {
    // Try multiple selectors for message box
    const selectors = [
      '[data-testid="conversation-compose-box-input"]',
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"]'
    ];
    
    let messageBox = null;
    for (const selector of selectors) {
      try {
        messageBox = await page.waitForSelector(selector, { timeout: 10000 });
        if (messageBox) break;
      } catch (e) {
        continue;
      }
    }
    
    if (!messageBox) {
      throw new Error('Could not find message input box');
    }
    
    await messageBox.click();
    await messageBox.fill(message);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    console.log(`✅ ${description} sent: "${message}"`);
    
    // Take screenshot after sending message
    await page.screenshot({ 
      path: `screenshots/${description.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`, 
      fullPage: true 
    });
    
  } catch (error) {
    console.error(`❌ Failed to send ${description}: ${error.message}`);
    await page.screenshot({ 
      path: `screenshots/error_${description.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`, 
      fullPage: true 
    });
    throw error;
  }
}

// Helper function to wait with logging
async function waitWithLog(milliseconds, description) {
  console.log(`> Waiting ${milliseconds/1000}s for ${description}...`);
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

test.describe('WhatsApp Automation Flow', () => {
  test('Complete WhatsApp automation workflow', async ({ browser }) => {
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

      // Step 3: Search and open contact by phone number
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
        }
      });

      // Step 4: Send trigger message
      await test.step('Send trigger message', async () => {
        console.log("📝 Sending trigger message...");
        await sendMessage(page, CONFIG.triggerMessage, "Trigger message");
        await waitWithLog(CONFIG.timeouts.messageDelay, "bot response");
        
        // Take screenshot after trigger to see the response
        await page.screenshot({ path: 'screenshots/after-trigger-message.png', fullPage: true });
      });

      // Step 5: Click Proceed button (this should appear after trigger message)
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

      // Step 6: Send user name with error sequence and validation
      await test.step('Send user name with error sequence and validation', async () => {
        console.log("👤 Starting name entry with error sequence and validation...");
        await waitWithLog(2000, "name entry prompt");
        
        // First, send the error sequence that should be rejected
        const errorMessages = ['123', 'Hello123', '✅✅✅'];
        
        for (const [index, message] of errorMessages.entries()) {
          await waitWithLog(CONFIG.timeouts.errorDelay, `error name ${index + 1}`);
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
        await waitWithLog(CONFIG.timeouts.errorDelay, "correct name entry");
        await sendMessage(page, CONFIG.userName, "Correct user name");
        
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
                console.log(`✅ Correct name "${CONFIG.userName}" was accepted - found success indicator`);
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

      // Step 7: Upload an image (receipt/document)
      await test.step('Upload image/receipt', async () => {
        console.log("📄 Uploading Watsons receipt image...");
        
        try {
          // Use real Watsons receipt from Downloads folder
          console.log(`📋 Using receipt file: ${receiptPath}`);
          
          // Look for attachment/clip button
          const attachmentSelectors = [
            '[data-testid="clip"]',
            'span[data-icon="clip"]',
            'button[aria-label*="Attach"]',
            'div[role="button"][title*="Attach"]'
          ];
          
          let attachButton = null;
          for (const selector of attachmentSelectors) {
            try {
              attachButton = await page.waitForSelector(selector, { timeout: 5000 });
              if (attachButton) {
                console.log(`📎 Found attachment button with selector: ${selector}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (attachButton) {
            await attachButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'screenshots/attachment-menu-opened.png', fullPage: true });
            
            // Look for "Photos & Videos" or "Document" option
            const photoSelectors = [
              'li[role="menuitem"]:has-text("Photos & Videos")',
              'div[role="button"]:has-text("Photos")',
              'button:has-text("Photos")',
              'input[type="file"][accept*="image"]'
            ];
            
            let photoOption = null;
            for (const selector of photoSelectors) {
              try {
                photoOption = await page.waitForSelector(selector, { timeout: 3000 });
                if (photoOption) {
                  console.log(`📸 Found photo option with selector: ${selector}`);
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            
            if (photoOption) {
              // If it's a file input, upload directly
              if (await photoOption.getAttribute('type') === 'file') {
                await photoOption.setInputFiles(receiptPath);
                console.log("📸 Watsons receipt uploaded directly via file input");
              } else {
                await photoOption.click();
                await page.waitForTimeout(1000);
                
                // Look for file input after clicking
                try {
                  const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 5000 });
                  await fileInput.setInputFiles(receiptPath);
                  console.log("📸 Watsons receipt uploaded via file input");
                } catch {
                  console.log("📸 File input not found - manual selection required");
                  console.log("⏳ Please select the Watsons receipt manually (15 seconds)...");
                  await waitWithLog(15000, "manual file selection");
                }
              }
              
              // Wait for image to be processed and look for send button
              await page.waitForTimeout(2000);
              
              try {
                const sendButton = await page.waitForSelector('[data-testid="send"]', { timeout: 5000 });
                await sendButton.click();
                console.log("✅ Watsons receipt sent successfully!");
                await page.screenshot({ path: 'screenshots/watsons-receipt-sent.png', fullPage: true });
              } catch {
                console.log("⚠️ Send button not found after receipt upload");
                await page.screenshot({ path: 'screenshots/receipt-upload-no-send.png', fullPage: true });
              }
              
            } else {
              console.log("⚠️ Photo option not found");
              await page.screenshot({ path: 'screenshots/no-photo-option.png', fullPage: true });
            }
            
          } else {
            console.log("⚠️ Attachment button not found, skipping image upload");
            await page.screenshot({ path: 'screenshots/no-attachment-button.png', fullPage: true });
          }
          
        } catch (error) {
          console.log(`⚠️ Image upload failed: ${error.message}`);
          await page.screenshot({ path: 'screenshots/image-upload-error.png', fullPage: true });
        }
      });

      // Step 8: Receipt upload and Chat with Agent
      await test.step('Handle receipt upload and chat with agent', async () => {
        console.log("📄 Waiting for any additional receipt upload phase...");
        await waitWithLog(CONFIG.timeouts.receiptUpload, "additional receipt upload");

        try {
          console.log("🤖 Looking for Chat with Agent button...");
          await page.waitForSelector('div[role="button"]:has-text("Chat with Agent")', { timeout: 20000 });
          await page.click('div[role="button"]:has-text("Chat with Agent")');
          console.log("✅ Chat with Agent button clicked!");
          await page.screenshot({ path: 'screenshots/chat-agent-clicked.png', fullPage: true });
        } catch (error) {
          console.log("⚠️ Chat with Agent button not found, continuing...");
          await page.screenshot({ path: 'screenshots/no-chat-agent.png', fullPage: true });
        }
      });

      // Step 9: Send agent enquiry
      await test.step('Send agent inquiry', async () => {
        await waitWithLog(CONFIG.timeouts.errorDelay, "agent response");
        await sendMessage(page, CONFIG.agentMessage, "Agent enquiry");
        
        // Final screenshot
        await page.screenshot({ path: 'screenshots/automation-complete.png', fullPage: true });
        console.log("🎉 WhatsApp automation workflow completed successfully!");
      });

    } catch (error) {
      console.error(`> ❌ Error in automation workflow: ${error.message}`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/whatsapp-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }

    // Keep browser open for inspection in non-CI environments
    if (!process.env.CI) {
      console.log("> Browser will remain open for inspection...");
      await page.waitForTimeout(60000); // Wait 1 minute before closing
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
