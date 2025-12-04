/**
 * Test script for Facebook automation
 * Run this to test the automation without the full app
 * 
 * Usage: node electron/test-facebook.js
 */

const { app, BrowserWindow } = require('electron');
const { facebookAutomation } = require('./facebook-automation');

// Mock item data for testing
const testItemData = {
  title: 'Test iPhone 13 Pro',
  description: 'Apple iPhone 13 Pro in excellent condition. 256GB storage, unlocked.',
  price: 699.99,
  condition: 'like_new',
  category: 'Electronics',
  location: 'San Francisco, CA',
};

// Mock base64 image (1x1 red pixel)
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testFacebookAutomation() {
  console.log('Starting Facebook automation test...');
  console.log('Item data:', testItemData);
  
  try {
    const result = await facebookAutomation.postToMarketplace(testItemData, [testImage]);
    console.log('✅ Success!', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Wait for Electron to be ready
app.whenReady().then(() => {
  console.log('Electron ready, starting test...');
  testFacebookAutomation();
  
  // Keep app running
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});



