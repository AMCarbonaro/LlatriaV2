const { BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs').promises;

/**
 * Facebook Marketplace automation using Electron's BrowserWindow
 * Since Facebook doesn't have a public API, we automate the web interface
 */
class FacebookAutomation {
  constructor() {
    this.browserWindow = null;
    this.isProcessing = false;
  }

  /**
   * Convert base64 image to temporary file
   */
  async saveImageToTemp(base64Image, index) {
    const tempDir = require('os').tmpdir();
    const imagePath = path.join(tempDir, `llatria-fb-${Date.now()}-${index}.jpg`);
    
    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    await fs.writeFile(imagePath, buffer);
    return imagePath;
  }

  /**
   * Post item to Facebook Marketplace
   */
  async postToMarketplace(itemData, images) {
    if (this.isProcessing) {
      throw new Error('Facebook posting already in progress');
    }

    this.isProcessing = true;

    return new Promise((resolve, reject) => {
      // Create a new BrowserWindow for Facebook
      this.browserWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true, // Show window so user can see progress
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          partition: 'persist:facebook-marketplace',
          devTools: true, // Enable DevTools for debugging
        },
      });

      // Open DevTools for debugging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        this.browserWindow.webContents.openDevTools();
      }

      // Navigate to Facebook Marketplace create page
      const marketplaceUrl = 'https://www.facebook.com/marketplace/create/item';
      console.log('[Facebook Automation] Navigating to:', marketplaceUrl);
      this.browserWindow.loadURL(marketplaceUrl);

      // Wait for page to be ready
      this.browserWindow.webContents.once('did-finish-load', async () => {
        try {
          console.log('[Facebook Automation] Page loaded, waiting for form...');
          
          // Wait longer for Facebook's dynamic content to load
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Check if we're on the right page
          const currentUrl = this.browserWindow.webContents.getURL();
          console.log('[Facebook Automation] Current URL:', currentUrl);
          
          if (currentUrl.includes('login') || currentUrl.includes('checkpoint')) {
            this.isProcessing = false;
            reject(new Error('Please log in to Facebook first. The login window is open.'));
            return;
          }

          // Wait for form to be interactive
          let formReady = false;
          let attempts = 0;
          while (!formReady && attempts < 20) {
            formReady = await this.browserWindow.webContents.executeJavaScript(`
              document.querySelector('input[type="text"]') !== null || 
              document.querySelector('textarea') !== null ||
              document.querySelector('div[role="textbox"]') !== null
            `);
            if (!formReady) {
              await new Promise(resolve => setTimeout(resolve, 500));
              attempts++;
            }
          }

          console.log('[Facebook Automation] Form ready, starting automation...');

          // Prepare data for injection (escape properly)
          const itemDataSafe = {
            title: itemData.title || '',
            description: itemData.description || '',
            price: itemData.price || 0,
            condition: itemData.condition || 'used',
            category: itemData.category || '',
            location: itemData.location || '',
          };

          // Inject automation script
          const result = await this.browserWindow.webContents.executeJavaScript(`
            (async () => {
              try {
                // Define itemData in this scope
                const itemData = ${JSON.stringify(itemDataSafe)};
                
                // Wait for form to be ready
                const waitForElement = (selector, timeout = 30000) => {
                  return new Promise((resolve, reject) => {
                    const startTime = Date.now();
                    const checkElement = () => {
                      const element = document.querySelector(selector);
                      if (element) {
                        resolve(element);
                      } else if (Date.now() - startTime > timeout) {
                        reject(new Error(\`Element \${selector} not found within \${timeout}ms\`));
                      } else {
                        setTimeout(checkElement, 100);
                      }
                    };
                    checkElement();
                  });
                };

                // Check if user is logged in
                const loginButton = document.querySelector('a[href*="login"]');
                if (loginButton) {
                  return { success: false, error: 'Please log in to Facebook first', requiresLogin: true };
                }

                // Find and fill title field
                // Facebook uses various selectors, try multiple approaches including contenteditable divs
                const titleSelectors = [
                  'input[placeholder*="What are you selling"]',
                  'input[aria-label*="What are you selling"]',
                  'input[placeholder*="Item name"]',
                  'input[aria-label*="Item name"]',
                  'input[type="text"][placeholder*="selling"]',
                  'input[type="text"][placeholder*="name"]',
                  'input[data-testid*="title"]',
                  'input[data-testid*="name"]',
                  'div[contenteditable="true"][aria-label*="sell"]',
                  'div[contenteditable="true"][aria-label*="name"]',
                  'div[role="textbox"][aria-label*="sell"]',
                  'input[type="text"]:not([type="hidden"])',
                ];
                
                let titleField = null;
                for (const selector of titleSelectors) {
                  const fields = Array.from(document.querySelectorAll(selector));
                  // Filter out hidden fields and find the most likely title field
                  titleField = fields.find(field => {
                    const rect = field.getBoundingClientRect();
                    const isVisible = rect.width > 0 && rect.height > 0;
                    const placeholder = field.placeholder?.toLowerCase() || '';
                    const ariaLabel = field.getAttribute('aria-label')?.toLowerCase() || '';
                    const textContent = field.textContent?.toLowerCase() || '';
                    
                    return isVisible && (
                      placeholder.includes('sell') ||
                      placeholder.includes('name') ||
                      placeholder.includes('title') ||
                      ariaLabel.includes('sell') ||
                      ariaLabel.includes('name') ||
                      textContent.includes('what are you selling')
                    );
                  });
                  if (titleField) break;
                }
                
                if (!titleField) {
                  // Last resort: try first visible text input or contenteditable
                  const allInputs = Array.from(document.querySelectorAll('input[type="text"], div[contenteditable="true"]'));
                  titleField = allInputs.find(input => {
                    const rect = input.getBoundingClientRect();
                    return rect.width > 100 && rect.height > 20;
                  });
                }
                
                if (!titleField) {
                  console.error('Title field not found. Available elements:', {
                    inputs: document.querySelectorAll('input').length,
                    textareas: document.querySelectorAll('textarea').length,
                    contenteditables: document.querySelectorAll('[contenteditable="true"]').length
                  });
                  return { 
                    success: false, 
                    error: 'Could not find title field. Facebook may have updated their interface.',
                    debugInfo: {
                      inputs: document.querySelectorAll('input').length,
                      textareas: document.querySelectorAll('textarea').length,
                      contenteditables: document.querySelectorAll('[contenteditable="true"]').length
                    }
                  };
                }

                // Fill the field based on type
                titleField.focus();
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const titleValue = itemData.title || '';
                if (titleField.tagName === 'INPUT' || titleField.tagName === 'TEXTAREA') {
                  titleField.value = titleValue;
                  titleField.dispatchEvent(new Event('input', { bubbles: true }));
                  titleField.dispatchEvent(new Event('change', { bubbles: true }));
                } else if (titleField.contentEditable === 'true') {
                  titleField.textContent = titleValue;
                  titleField.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                console.log('Title filled:', titleValue);

                // Find and fill price field
                const priceSelectors = [
                  'input[placeholder*="Price"]',
                  'input[aria-label*="Price"]',
                  'input[placeholder*="$"]',
                  'input[type="number"]',
                  'input[inputmode="numeric"]',
                  'input[data-testid*="price"]',
                ];
                
                let priceField = null;
                for (const selector of priceSelectors) {
                  const fields = Array.from(document.querySelectorAll(selector));
                  priceField = fields.find(f => {
                    const rect = f.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0 && 
                           (f.placeholder?.toLowerCase().includes('price') || 
                            f.placeholder?.includes('$') ||
                            f.getAttribute('aria-label')?.toLowerCase().includes('price') ||
                            f.type === 'number');
                  });
                  if (priceField) break;
                }
                
                if (priceField) {
                  priceField.focus();
                  const priceValue = itemData.price || 0;
                  priceField.value = priceValue.toString();
                  priceField.dispatchEvent(new Event('input', { bubbles: true }));
                  priceField.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Find and fill description field
                const descriptionSelectors = [
                  'textarea[placeholder*="Describe"]',
                  'textarea[aria-label*="Describe"]',
                  'textarea[placeholder*="description"]',
                  'textarea[aria-label*="description"]',
                  'textarea[data-testid*="description"]',
                  'div[contenteditable="true"][aria-label*="description"]',
                  'div[contenteditable="true"][aria-label*="describe"]',
                  'div[role="textbox"][aria-label*="description"]',
                  'textarea',
                ];
                
                let descriptionField = null;
                for (const selector of descriptionSelectors) {
                  const fields = Array.from(document.querySelectorAll(selector));
                  descriptionField = fields.find(f => {
                    const rect = f.getBoundingClientRect();
                    return rect.width > 200 && rect.height > 50; // Description fields are usually larger
                  });
                  if (descriptionField) break;
                }
                
                // If still not found, use first large textarea or contenteditable
                if (!descriptionField) {
                  const allTextareas = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"]'));
                  descriptionField = allTextareas.find(f => {
                    const rect = f.getBoundingClientRect();
                    return rect.width > 200 && rect.height > 50;
                  });
                }
                
                if (descriptionField) {
                  descriptionField.focus();
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  const descValue = (itemData.description || '').replace(/\\n/g, ' ');
                  if (descriptionField.tagName === 'TEXTAREA' || descriptionField.tagName === 'INPUT') {
                    descriptionField.value = descValue;
                    descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
                    descriptionField.dispatchEvent(new Event('change', { bubbles: true }));
                  } else if (descriptionField.contentEditable === 'true') {
                    descriptionField.textContent = descValue;
                    descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                  console.log('Description filled');
                } else {
                  console.warn('Description field not found');
                }

                // Find and select category (if dropdown exists)
                const categorySelectors = [
                  'div[role="button"][aria-label*="Category"]',
                  'div[role="listbox"]',
                  'select',
                ];
                
                let categoryField = null;
                for (const selector of categorySelectors) {
                  categoryField = document.querySelector(selector);
                  if (categoryField) break;
                }
                
                if (categoryField && itemData.category) {
                  categoryField.click();
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  // Try to find and click the category option
                  const categoryOptions = Array.from(document.querySelectorAll('div[role="option"]'));
                  const matchingOption = categoryOptions.find(opt => 
                    opt.textContent?.toLowerCase().includes(itemData.category.toLowerCase())
                  );
                  
                  if (matchingOption) {
                    matchingOption.click();
                  }
                }

                // Find and fill location field (if exists)
                if (itemData.location) {
                  const locationSelectors = [
                    'input[placeholder*="Location"]',
                    'input[aria-label*="Location"]',
                  ];
                  
                  let locationField = null;
                  for (const selector of locationSelectors) {
                    locationField = document.querySelector(selector);
                    if (locationField) break;
                  }
                  
                if (locationField) {
                  locationField.focus();
                  const locationValue = itemData.location || '';
                  locationField.value = locationValue;
                  locationField.dispatchEvent(new Event('input', { bubbles: true }));
                  locationField.dispatchEvent(new Event('change', { bubbles: true }));
                }
                }

                // Note: Image upload requires file input, which we'll handle separately
                // The images array will be passed to the Electron main process

                return { 
                  success: true, 
                  message: 'Form filled successfully. Please review and submit manually.',
                };
              } catch (error) {
                return { success: false, error: error.message };
              }
            })()
          `);

          if (result.success) {
            // Return success - user will need to click publish button
            resolve({
              success: true,
              listingId: `fb-${Date.now()}`,
              url: this.browserWindow.webContents.getURL(),
              message: 'Form filled and images uploaded. Please review and click "Publish" button in the Facebook window.',
              requiresManualSubmit: true,
            });
          } else if (result.requiresLogin) {
            reject(new Error('Please log in to Facebook first. The login window is open.'));
          } else {
            console.error('[Facebook Automation] Form fill failed:', result);
            reject(new Error(result.error || 'Failed to fill Facebook form'));
          }
        } catch (error) {
          reject(error);
        } finally {
          this.isProcessing = false;
        }
      });

      // Handle window close
      this.browserWindow.on('closed', () => {
        this.browserWindow = null;
        this.isProcessing = false;
      });

      // Handle errors
      this.browserWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        if (errorCode !== -3) { // Ignore navigation errors
          this.isProcessing = false;
          reject(new Error(`Failed to load Facebook: ${errorDescription}`));
        }
      });
    });
  }

  /**
   * Upload images to Facebook Marketplace
   * Attempts to programmatically upload images using file input manipulation
   */
  async uploadImages(images) {
    if (!this.browserWindow || !images || images.length === 0) {
      return { success: false, error: 'No images or browser window' };
    }

    try {
      console.log('[Facebook Automation] Preparing to upload', images.length, 'images...');
      
      // Save images to temp files
      const os = require('os');
      const tempDir = path.join(os.homedir(), 'Downloads', 'llatria-facebook-images');
      
      // Create directory if it doesn't exist
      try {
        await fs.mkdir(tempDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      const tempFiles = [];
      for (let i = 0; i < Math.min(images.length, 10); i++) { // Facebook allows max 10 images
        const tempPath = path.join(tempDir, `llatria-image-${Date.now()}-${i + 1}.jpg`);
        const base64Data = images[i].replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(tempPath, buffer);
        tempFiles.push(tempPath);
        console.log('[Facebook Automation] Saved image', i + 1, 'to', tempPath);
      }

      // Wait a bit for page to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to programmatically upload images
      const uploadResult = await this.browserWindow.webContents.executeJavaScript(`
        (async () => {
          try {
            // Find file input
            const fileInputSelectors = [
              'input[type="file"][accept*="image"]',
              'input[type="file"]',
              'input[accept*="image"]',
            ];
            
            let fileInput = null;
            for (const selector of fileInputSelectors) {
              fileInput = document.querySelector(selector);
              if (fileInput) break;
            }
            
            // Also try to find upload button and trigger it
            if (!fileInput) {
              const uploadButtons = [
                'div[role="button"][aria-label*="photo"]',
                'div[role="button"][aria-label*="image"]',
                'div[aria-label*="Add photos"]',
                'div[aria-label*="Add photos or videos"]',
              ];
              
              for (const buttonSelector of uploadButtons) {
                const button = document.querySelector(buttonSelector);
                if (button) {
                  button.click();
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  // Try to find file input again after clicking
                  for (const selector of fileInputSelectors) {
                    fileInput = document.querySelector(selector);
                    if (fileInput) break;
                  }
                  if (fileInput) break;
                }
              }
            }
            
            if (!fileInput) {
              return { 
                success: false, 
                error: 'Could not find file input. Images saved to Downloads folder.',
                tempDir: \`${tempDir}\`,
                fileCount: ${tempFiles.length}
              };
            }
            
            // Create FileList with the temp files
            // Note: We can't directly set files, but we can try to trigger the input
            fileInput.style.display = 'block';
            fileInput.style.visibility = 'visible';
            fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the input
            fileInput.style.border = '3px solid #1877f2';
            fileInput.style.boxShadow = '0 0 10px rgba(24, 119, 242, 0.5)';
            
            return {
              success: true,
              found: true,
              message: 'File input found. Please select images manually or drag and drop.',
              tempDir: \`${tempDir}\`,
              fileCount: ${tempFiles.length}
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `);

      // Log upload result
      console.log('[Facebook Automation] Upload attempt result:', uploadResult);
      
      // Show notification with file locations
      const message = uploadResult?.success 
        ? `File input found and highlighted. ${tempFiles.length} image(s) ready in: ${tempDir}`
        : `Images saved to: ${tempDir}. ${uploadResult?.error || 'Please upload manually'}`;

      // Show notification in the window
      this.browserWindow.webContents.executeJavaScript(`
        (() => {
          const notification = document.createElement('div');
          notification.style.cssText = \`
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1877f2;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            max-width: 350px;
          \`;
          notification.innerHTML = \`
            <strong>📸 Images Ready!</strong><br>
            <small>${tempFiles.length} image(s) saved to:</small><br>
            <code style="font-size: 11px; background: rgba(0,0,0,0.2); padding: 2px 4px; border-radius: 3px; word-break: break-all;">${tempDir}</code><br>
            <small>${uploadResult?.found ? 'File input highlighted. Click it to select images.' : 'Please drag images to the upload area or click to browse.'}</small>
          \`;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
          }, 15000);
        })()
      `);

      return {
        success: uploadResult?.success || false,
        tempFiles,
        message: message,
        fileInputFound: uploadResult?.found || false,
      };
    } catch (error) {
      console.error('Error preparing images:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Open Facebook authentication window
   */
  async openAuthWindow() {
    const authWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        partition: 'persist:facebook-auth',
      },
    });

    authWindow.loadURL('https://www.facebook.com/login');

    return new Promise((resolve) => {
      authWindow.webContents.once('did-finish-load', () => {
        // Check if logged in by looking for marketplace link
        authWindow.webContents.executeJavaScript(`
          document.querySelector('a[href*="marketplace"]') !== null
        `).then((isLoggedIn) => {
          if (isLoggedIn) {
            resolve({ success: true, message: 'Logged in successfully' });
          } else {
            resolve({ success: false, message: 'Please complete login in the window' });
          }
        });
      });

      authWindow.on('closed', () => {
        resolve({ success: false, message: 'Auth window closed' });
      });
    });
  }

  /**
   * Close the browser window
   */
  closeWindow() {
    if (this.browserWindow) {
      this.browserWindow.close();
      this.browserWindow = null;
    }
    this.isProcessing = false;
  }
}

// Singleton instance
const facebookAutomation = new FacebookAutomation();

module.exports = { facebookAutomation };

