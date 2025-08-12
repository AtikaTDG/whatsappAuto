// Create a simple test image for upload
const fs = require('fs');
const path = require('path');

// Create test-images directory if it doesn't exist
const testImagesDir = path.join(__dirname, '..', 'test-images');
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir, { recursive: true });
}

// Create a simple 1x1 pixel PNG image (base64 encoded)
const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const imageBuffer = Buffer.from(base64Image, 'base64');

// Write test receipt image
const receiptPath = path.join(testImagesDir, 'test-receipt.png');
fs.writeFileSync(receiptPath, imageBuffer);

console.log('✅ Test receipt image created at:', receiptPath);

module.exports = {
  testImagesDir,
  receiptPath
};
