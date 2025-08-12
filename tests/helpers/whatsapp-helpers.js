const readline = require('readline');

// Configuration
const CONFIG = {
  contactNumber: "+60 3-9771 1660",
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

// Helper function to wait with logging
async function waitWithLog(milliseconds, description) {
  console.log(`> Waiting ${milliseconds/1000}s for ${description}...`);
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

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

// Shared login and contact search function
async function loginAndOpenContact(page, test) {
  // Step 1: Navigate to WhatsApp Web and Login
  await test.step('✅ Login: Navigate to WhatsApp Web and complete login', async () => {
    console.log("📱 Opening WhatsApp Web...");
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/whatsapp-loaded.png', fullPage: true });

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
    
    // Wait for login completion
    try {
      const chatElements = await Promise.race([
        page.waitForSelector('[data-testid="chat-list"]', { timeout: 30000 }).catch(() => null),
        page.waitForSelector('[data-testid="chat-list-search"]', { timeout: 30000 }).catch(() => null),
        page.waitForSelector('div[contenteditable="true"]', { timeout: 30000 }).catch(() => null)
      ]);
      
      if (chatElements) {
        console.log("✅ Login: Already logged in to WhatsApp Web");
        await page.screenshot({ path: 'screenshots/login-success.png', fullPage: true });
      }
    } catch (error) {
      console.log("⚠️ Waiting for login elements:", error.message);
    }
  });

  // Step 2: Search and open contact
  await test.step('✅ Contact Search: Find and open contact', async () => {
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
    
    // Look for contact result and click
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
      console.log(`✅ Contact Search: Found and opened contact ${CONFIG.contactNumber}`);
    } else {
      console.log("⚠️ Could not find contact, trying to continue...");
      await page.screenshot({ path: 'screenshots/contact-not-found.png', fullPage: true });
    }
  });
}

module.exports = {
  CONFIG,
  waitForEnter,
  waitWithLog,
  sendMessage,
  loginAndOpenContact
};
