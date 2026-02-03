const { BrowserWindow, clipboard, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

/**
 * Facebook Marketplace Automation v2
 * 
 * Uses keyboard simulation and robust element detection to handle
 * Facebook's frequently changing DOM structure.
 */
class FacebookAutomation {
  constructor() {
    this.browserWindow = null;
    this.isProcessing = false;
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  log(...args) {
    console.log('[FB Automation]', ...args);
  }

  error(...args) {
    console.error('[FB Automation Error]', ...args);
  }

  /**
   * Save base64 image to temp file for upload
   */
  async saveImageToTemp(base64Image, index) {
    const tempDir = path.join(os.tmpdir(), 'llatria-fb-images');
    await fs.mkdir(tempDir, { recursive: true });
    
    const imagePath = path.join(tempDir, `image-${Date.now()}-${index}.jpg`);
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    await fs.writeFile(imagePath, buffer);
    this.log(`Saved image ${index} to:`, imagePath);
    return imagePath;
  }

  /**
   * Clean up temp images
   */
  async cleanupTempImages() {
    try {
      const tempDir = path.join(os.tmpdir(), 'llatria-fb-images');
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
      this.log('Cleaned up temp images');
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  /**
   * Wait for a condition to be true
   */
  async waitFor(conditionFn, timeoutMs = 30000, pollMs = 500) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await conditionFn();
        if (result) return result;
      } catch (e) {
        // Continue waiting
      }
      await new Promise(r => setTimeout(r, pollMs));
    }
    throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
  }

  /**
   * Simulate typing text character by character
   */
  async typeText(text) {
    if (!this.browserWindow) return;
    
    for (const char of text) {
      this.browserWindow.webContents.sendInputEvent({
        type: 'char',
        keyCode: char
      });
      await new Promise(r => setTimeout(r, 30 + Math.random() * 20)); // Human-like delay
    }
  }

  /**
   * Send keyboard shortcut
   */
  async sendKey(key, modifiers = []) {
    if (!this.browserWindow) return;
    
    this.browserWindow.webContents.sendInputEvent({
      type: 'keyDown',
      keyCode: key,
      modifiers
    });
    await new Promise(r => setTimeout(r, 50));
    this.browserWindow.webContents.sendInputEvent({
      type: 'keyUp',
      keyCode: key,
      modifiers
    });
  }

  /**
   * Click at specific coordinates
   */
  async clickAt(x, y) {
    if (!this.browserWindow) return;
    
    this.browserWindow.webContents.sendInputEvent({
      type: 'mouseDown',
      x: Math.round(x),
      y: Math.round(y),
      button: 'left',
      clickCount: 1
    });
    await new Promise(r => setTimeout(r, 50));
    this.browserWindow.webContents.sendInputEvent({
      type: 'mouseUp',
      x: Math.round(x),
      y: Math.round(y),
      button: 'left',
      clickCount: 1
    });
  }

  /**
   * Execute JavaScript in the browser context with proper error handling
   */
  async executeScript(script) {
    if (!this.browserWindow) throw new Error('No browser window');
    return await this.browserWindow.webContents.executeJavaScript(script);
  }

  /**
   * Find and click an element by various strategies
   */
  async findAndClick(strategies) {
    const script = `
      (function() {
        const strategies = ${JSON.stringify(strategies)};
        
        for (const strategy of strategies) {
          let elements = [];
          
          if (strategy.selector) {
            elements = Array.from(document.querySelectorAll(strategy.selector));
          }
          
          if (strategy.textContains) {
            const allElements = document.querySelectorAll('*');
            elements = Array.from(allElements).filter(el => {
              const text = el.textContent?.toLowerCase() || '';
              const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
              return text.includes(strategy.textContains.toLowerCase()) || 
                     ariaLabel.includes(strategy.textContains.toLowerCase());
            });
          }
          
          // Find visible, clickable element
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            const style = window.getComputedStyle(el);
            
            if (rect.width > 0 && rect.height > 0 && 
                style.visibility !== 'hidden' && 
                style.display !== 'none') {
              
              // Check if it's in viewport
              if (rect.top >= 0 && rect.left >= 0 && 
                  rect.bottom <= window.innerHeight && 
                  rect.right <= window.innerWidth) {
                
                return {
                  found: true,
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                  tagName: el.tagName,
                  text: el.textContent?.substring(0, 50)
                };
              }
            }
          }
        }
        
        return { found: false };
      })()
    `;
    
    return await this.executeScript(script);
  }

  /**
   * Fill a form field using multiple strategies
   */
  async fillField(fieldConfig) {
    const { label, value, type = 'text' } = fieldConfig;
    
    this.log(`Filling field: ${label} with value: ${value?.substring(0, 30)}...`);
    
    // Strategy 1: Find by aria-label or placeholder
    const findScript = `
      (function() {
        const label = "${label.replace(/"/g, '\\"')}".toLowerCase();
        
        // Find input/textarea by label
        const inputs = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]'));
        
        for (const input of inputs) {
          const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
          const placeholder = (input.placeholder || '').toLowerCase();
          const labelFor = input.id ? document.querySelector(\`label[for="\${input.id}"]\`)?.textContent?.toLowerCase() : '';
          
          if (ariaLabel.includes(label) || placeholder.includes(label) || labelFor?.includes(label)) {
            const rect = input.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              return {
                found: true,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                tagName: input.tagName,
                isContentEditable: input.contentEditable === 'true'
              };
            }
          }
        }
        
        // Strategy 2: Find by nearby text label
        const allText = document.body.innerText.toLowerCase();
        if (allText.includes(label)) {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            if (walker.currentNode.textContent?.toLowerCase().includes(label)) {
              const parent = walker.currentNode.parentElement;
              const nearbyInput = parent?.querySelector('input, textarea, [contenteditable="true"]') ||
                                  parent?.nextElementSibling?.querySelector('input, textarea, [contenteditable="true"]');
              if (nearbyInput) {
                const rect = nearbyInput.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  return {
                    found: true,
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    tagName: nearbyInput.tagName,
                    isContentEditable: nearbyInput.contentEditable === 'true'
                  };
                }
              }
            }
          }
        }
        
        return { found: false };
      })()
    `;
    
    const result = await this.executeScript(findScript);
    
    if (!result.found) {
      this.log(`Field "${label}" not found, skipping`);
      return false;
    }
    
    // Click to focus the field
    await this.clickAt(result.x, result.y);
    await new Promise(r => setTimeout(r, 300));
    
    // Clear existing content
    await this.sendKey('a', ['control']);
    await new Promise(r => setTimeout(r, 100));
    
    // Type the value
    if (type === 'text' || type === 'textarea') {
      await this.typeText(String(value));
    } else if (type === 'number') {
      await this.typeText(String(value));
    }
    
    await new Promise(r => setTimeout(r, 200));
    this.log(`Field "${label}" filled successfully`);
    return true;
  }

  /**
   * Handle Facebook's photo upload
   */
  async uploadPhotos(imagePaths) {
    this.log('Starting photo upload, paths:', imagePaths);
    
    // Find photo upload button/area
    const uploadAreaScript = `
      (function() {
        // Look for file input
        const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
        for (const input of fileInputs) {
          const rect = input.getBoundingClientRect();
          // File inputs are often hidden, check parent
          if (input.offsetParent !== null || rect.width > 0) {
            return { 
              found: true, 
              type: 'fileInput',
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          }
        }
        
        // Look for "Add photos" button/area
        const photoButtons = Array.from(document.querySelectorAll('[aria-label*="photo"], [aria-label*="Photo"], [aria-label*="image"]'));
        for (const btn of photoButtons) {
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return {
              found: true,
              type: 'photoButton',
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              label: btn.getAttribute('aria-label')
            };
          }
        }
        
        // Look for drag-drop area or + button
        const addAreas = Array.from(document.querySelectorAll('[role="button"]')).filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          const label = el.getAttribute('aria-label')?.toLowerCase() || '';
          return text.includes('add photo') || text.includes('upload') || 
                 label.includes('add photo') || label.includes('upload') ||
                 text.includes('+');
        });
        
        for (const area of addAreas) {
          const rect = area.getBoundingClientRect();
          if (rect.width > 50 && rect.height > 50) {
            return {
              found: true,
              type: 'addButton',
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              text: area.textContent?.substring(0, 30)
            };
          }
        }
        
        return { found: false };
      })()
    `;
    
    const uploadArea = await this.executeScript(uploadAreaScript);
    this.log('Upload area detection:', uploadArea);
    
    if (!uploadArea.found) {
      // Save images to a known location and show instructions
      const downloadDir = path.join(os.homedir(), 'Downloads', 'llatria-marketplace-images');
      await fs.mkdir(downloadDir, { recursive: true });
      
      const savedPaths = [];
      for (let i = 0; i < imagePaths.length; i++) {
        const sourcePath = imagePaths[i];
        const destPath = path.join(downloadDir, `listing-image-${i + 1}.jpg`);
        await fs.copyFile(sourcePath, destPath);
        savedPaths.push(destPath);
      }
      
      // Show notification in the browser
      await this.executeScript(`
        (function() {
          const overlay = document.createElement('div');
          overlay.style.cssText = \`
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            background: #1877f2; color: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          \`;
          overlay.innerHTML = \`
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px;">📸 Images Ready!</div>
            <div style="font-size: 14px; opacity: 0.9;">
              ${imagePaths.length} image(s) saved to:<br>
              <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-size: 12px;">
                ~/Downloads/llatria-marketplace-images/
              </code><br><br>
              Please drag the images to the photo area or click "Add Photos" to select them.
            </div>
            <button onclick="this.parentElement.remove()" style="
              margin-top: 12px; background: rgba(255,255,255,0.2); border: none;
              padding: 8px 16px; border-radius: 6px; color: white; cursor: pointer;
            ">Got it</button>
          \`;
          document.body.appendChild(overlay);
          setTimeout(() => overlay.remove(), 30000);
        })()
      `);
      
      return { 
        success: true, 
        manual: true, 
        savedTo: downloadDir,
        message: `Images saved to ${downloadDir}. Please upload manually.`
      };
    }
    
    // Click the upload area
    await this.clickAt(uploadArea.x, uploadArea.y);
    await new Promise(r => setTimeout(r, 1000));
    
    // Return paths for native file dialog
    return {
      success: true,
      paths: imagePaths,
      uploadArea
    };
  }

  /**
   * Main method: Post item to Facebook Marketplace
   */
  async postToMarketplace(itemData, images = []) {
    if (this.isProcessing) {
      throw new Error('Facebook posting already in progress');
    }

    this.isProcessing = true;
    this.log('Starting Facebook Marketplace posting...', { title: itemData.title, imageCount: images.length });

    try {
      // Save images to temp files
      const imagePaths = [];
      for (let i = 0; i < Math.min(images.length, 10); i++) {
        const tempPath = await this.saveImageToTemp(images[i], i);
        imagePaths.push(tempPath);
      }

      // Create browser window
      this.browserWindow = new BrowserWindow({
        width: 1280,
        height: 900,
        show: true,
        title: 'Facebook Marketplace - Llatria',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: 'persist:facebook-marketplace',
          devTools: this.debugMode,
        },
      });

      if (this.debugMode) {
        this.browserWindow.webContents.openDevTools({ mode: 'detach' });
      }

      // Navigate to create listing page
      const marketplaceUrl = 'https://www.facebook.com/marketplace/create/item';
      this.log('Navigating to:', marketplaceUrl);
      
      await this.browserWindow.loadURL(marketplaceUrl);
      
      // Wait for page to stabilize
      await new Promise(r => setTimeout(r, 3000));
      
      // Check if logged in
      const currentUrl = this.browserWindow.webContents.getURL();
      this.log('Current URL:', currentUrl);
      
      if (currentUrl.includes('login') || currentUrl.includes('checkpoint')) {
        this.log('Login required');
        
        // Show login instructions
        await this.executeScript(`
          (function() {
            const overlay = document.createElement('div');
            overlay.style.cssText = \`
              position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
              z-index: 99999; background: white; padding: 30px; border-radius: 16px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3); text-align: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            \`;
            overlay.innerHTML = \`
              <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">Please Log In</div>
              <div style="color: #666; margin-bottom: 16px;">Log in to your Facebook account, then Llatria will continue automatically.</div>
            \`;
            document.body.appendChild(overlay);
          })()
        `);
        
        // Wait for login (check URL periodically)
        try {
          await this.waitFor(async () => {
            const url = this.browserWindow.webContents.getURL();
            return url.includes('marketplace/create');
          }, 120000, 2000);
          
          this.log('Login successful, continuing...');
          await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
          return {
            success: false,
            error: 'Login timeout. Please log in and try again.',
            requiresLogin: true
          };
        }
      }

      // Wait for form to be ready
      this.log('Waiting for form to be ready...');
      await new Promise(r => setTimeout(r, 3000));
      
      // Fill in the form fields
      const fillResults = {
        title: false,
        price: false,
        description: false,
        photos: false
      };

      // Fill title
      fillResults.title = await this.fillField({
        label: 'title',
        value: itemData.title,
        type: 'text'
      }) || await this.fillField({
        label: 'what are you selling',
        value: itemData.title,
        type: 'text'
      });

      await new Promise(r => setTimeout(r, 500));

      // Fill price
      fillResults.price = await this.fillField({
        label: 'price',
        value: itemData.price,
        type: 'number'
      });

      await new Promise(r => setTimeout(r, 500));

      // Fill description
      fillResults.description = await this.fillField({
        label: 'description',
        value: itemData.description,
        type: 'textarea'
      }) || await this.fillField({
        label: 'describe',
        value: itemData.description,
        type: 'textarea'
      });

      // Handle photos
      if (imagePaths.length > 0) {
        const photoResult = await this.uploadPhotos(imagePaths);
        fillResults.photos = photoResult.success;
      }

      // Show completion overlay
      await this.executeScript(`
        (function() {
          const itemData = ${JSON.stringify(itemData)};
          const fillResults = ${JSON.stringify(fillResults)};
          
          const overlay = document.createElement('div');
          overlay.id = 'llatria-status';
          overlay.style.cssText = \`
            position: fixed; bottom: 20px; right: 20px; z-index: 99999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; padding: 20px; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          \`;
          
          const statusIcon = (success) => success ? '✅' : '⚠️';
          
          overlay.innerHTML = \`
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 12px;">
              Llatria - Listing Ready
            </div>
            <div style="font-size: 13px; opacity: 0.9; line-height: 1.6;">
              \${statusIcon(fillResults.title)} Title: \${fillResults.title ? 'Filled' : 'Manual entry needed'}<br>
              \${statusIcon(fillResults.price)} Price: \${fillResults.price ? 'Filled' : 'Manual entry needed'}<br>
              \${statusIcon(fillResults.description)} Description: \${fillResults.description ? 'Filled' : 'Manual entry needed'}<br>
              \${statusIcon(fillResults.photos)} Photos: \${fillResults.photos ? 'Ready' : 'Manual upload needed'}
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.8;">
              Review the listing and click <strong>Publish</strong> when ready.
            </div>
            <button onclick="this.parentElement.remove()" style="
              margin-top: 12px; background: rgba(255,255,255,0.2); border: none;
              padding: 8px 16px; border-radius: 6px; color: white; cursor: pointer;
              width: 100%;
            ">Dismiss</button>
          \`;
          document.body.appendChild(overlay);
        })()
      `);

      return {
        success: true,
        fillResults,
        url: this.browserWindow.webContents.getURL(),
        message: 'Form populated. Please review and click Publish.',
        requiresManualSubmit: true
      };

    } catch (error) {
      this.error('Posting failed:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Close the browser window
   */
  closeWindow() {
    if (this.browserWindow && !this.browserWindow.isDestroyed()) {
      this.browserWindow.close();
    }
    this.browserWindow = null;
    this.isProcessing = false;
    this.cleanupTempImages();
  }

  /**
   * Check if currently processing
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      hasWindow: this.browserWindow !== null && !this.browserWindow.isDestroyed()
    };
  }

  /**
   * Open Facebook login window for authentication
   */
  async openAuthWindow() {
    return new Promise((resolve) => {
      const authWindow = new BrowserWindow({
        width: 800,
        height: 700,
        show: true,
        title: 'Facebook Login - Llatria',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: 'persist:facebook-marketplace',
        },
      });

      authWindow.loadURL('https://www.facebook.com/login');

      // Check if logged in after page loads
      authWindow.webContents.on('did-finish-load', async () => {
        const url = authWindow.webContents.getURL();
        
        // If we're on a page that's not login, user is logged in
        if (!url.includes('login') && !url.includes('checkpoint')) {
          this.log('User logged in successfully');
          resolve({ success: true, message: 'Logged in to Facebook' });
          authWindow.close();
        }
      });

      // Handle manual close
      authWindow.on('closed', () => {
        resolve({ success: false, message: 'Login window closed' });
      });
    });
  }
}

// Singleton instance
const facebookAutomation = new FacebookAutomation();

module.exports = { facebookAutomation };
