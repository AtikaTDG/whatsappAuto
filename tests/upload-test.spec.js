const { test, expect } = require('@playwright/test');

// Simple test to verify Watsons receipt upload
test('Upload Watsons receipt to WhatsApp', async ({ page }) => {
  test.setTimeout(120000);
  
  const receiptPath = 'c:\\Users\\User\\Downloads\\testqa1.jpg';
  
  console.log('📱 Opening WhatsApp Web...');
  await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/whatsapp-loaded-for-upload.png', fullPage: true });
  
  // Wait for any chat to be available (user needs to manually navigate to a chat)
  console.log('📞 Please navigate to a chat manually, then press Enter in terminal...');
  
  // Simple wait for user to set up
  await page.waitForTimeout(30000);
  
  try {
    console.log('📄 Starting Watsons receipt upload...');
    console.log(`📋 Using receipt file: ${receiptPath}`);
    
    // Look for attachment button
    const attachButton = await page.waitForSelector('[data-testid="clip"]', { timeout: 10000 });
    await attachButton.click();
    console.log('📎 Attachment button clicked');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/attachment-menu.png', fullPage: true });
    
    // Look for Photos option
    const photosOption = await page.waitForSelector('li[role="menuitem"]:has-text("Photos & Videos")', { timeout: 5000 });
    await photosOption.click();
    console.log('📸 Photos option clicked');
    
    await page.waitForTimeout(1000);
    
    // Look for file input
    const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
    await fileInput.setInputFiles(receiptPath);
    console.log('📸 Watsons receipt file selected');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/receipt-preview.png', fullPage: true });
    
    // Look for send button
    const sendButton = await page.waitForSelector('[data-testid="send"]', { timeout: 5000 });
    await sendButton.click();
    console.log('✅ Watsons receipt sent successfully!');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/receipt-sent-final.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    await page.screenshot({ path: 'screenshots/upload-error.png', fullPage: true });
    throw error;
  }
});
