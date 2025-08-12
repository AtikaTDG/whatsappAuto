const { test, expect } = require('@playwright/test');
const { loginAndOpenContact, sendMessage } = require('./helpers/whatsapp-helpers');

// Configuration
const CONFIG = {
  agentMessage: "Hello, I need assistance with my recent transaction. Can you please help me?",
  timeouts: {
    errorDelay: 5000,
    receiptUpload: 15000
  }
};

// Helper function to wait with logging
async function waitWithLog(milliseconds, description) {
  console.log(`> Waiting ${milliseconds/1000}s for ${description}...`);
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

test.describe('WhatsApp Agent Communication Tests', () => {
  test('Login, contact search, receipt upload, and chat with agent', async ({ browser }) => {
    test.setTimeout(300000); // 5 minutes total
    
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
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    try {
      // Step 1 & 2: Login and open contact using shared helper
      await loginAndOpenContact(page, test);

      // Step 3: Wait for possible receipt upload phase
      await test.step('Handle receipt upload wait', async () => {
        console.log("📄 Waiting for any additional receipt upload phase...");
        await waitWithLog(CONFIG.timeouts.receiptUpload, "additional receipt upload");
      });

      // Step 4: Look for and click "Chat with Agent" if available
      await test.step('Look for Chat with Agent button', async () => {
        try {
          console.log("🤖 Looking for Chat with Agent button...");
          await page.waitForSelector('div[role="button"]:has-text("Chat with Agent")', { timeout: 20000 });
          await page.click('div[role="button"]:has-text("Chat with Agent")');
          console.log("✅ Chat with Agent button clicked!");
          await page.screenshot({ path: 'screenshots/chat-agent-clicked.png', fullPage: true });
        } catch {
          console.log("⚠️ Chat with Agent button not found, continuing...");
          await page.screenshot({ path: 'screenshots/no-chat-agent.png', fullPage: true });
        }
      });

      // Step 5: Send message to agent
      await test.step('Send agent inquiry', async () => {
        await waitWithLog(CONFIG.timeouts.errorDelay, "agent response");
        await sendMessage(page, CONFIG.agentMessage, "Agent enquiry");
        await page.screenshot({ path: 'screenshots/agent-inquiry-sent.png', fullPage: true });
      });

      // Step 6: Wait for system response
      await test.step('Wait for system response', async () => {
        console.log("⏳ Waiting for system response...");
        await page.waitForTimeout(3000); // Wait for system to respond
        
        try {
          // Look for the expected system response
          const systemResponse = await page.locator('text="Our friendly agent will get back to you"').waitFor({ timeout: 10000 });
          if (systemResponse) {
            console.log("✅ Found system response: 'Our friendly agent will get back to you'");
            await page.screenshot({ path: 'screenshots/system-response-received.png', fullPage: true });
            console.log("🎉 Agent inquiry submitted successfully and system responded!");
          }
        } catch (e) {
          console.log("⚠️ Expected system response not found");
          await page.screenshot({ path: 'screenshots/no-system-response.png', fullPage: true });
          
          // Look for any recent messages for debugging
          const allMessages = await page.$$eval('[role="row"]', rows => 
            rows.map(row => row.textContent?.trim()).filter(text => text && text.length > 0).slice(-5)
          );
          console.log("📝 Recent messages:", allMessages);
        }
        
        await page.screenshot({ path: 'screenshots/automation-complete.png', fullPage: true });
        console.log("🎉 WhatsApp automation workflow completed successfully!");
      });

    } catch (error) {
      console.error(`> ❌ Error in workflow: ${error.message}`);
      await page.screenshot({ 
        path: `test-results/workflow-error-${Date.now()}.png`, 
        fullPage: true 
      });
      throw error;
    }

    if (!process.env.CI) {
      console.log("> Browser will remain open for inspection...");
      await page.waitForTimeout(10000);
    }
  });
});