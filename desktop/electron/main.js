const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { facebookAutomation } = require('./facebook-automation');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  if (isDev) {
    // Try multiple ports in case Vite uses a different one
    const ports = [3000, 3001, 3002, 3003, 3004, 5173];
    const tryLoad = (portIndex = 0) => {
      if (portIndex >= ports.length) {
        console.error('Failed to connect to dev server on any port');
        return;
      }
      const port = ports[portIndex];
      win.loadURL(`http://localhost:${port}`).catch(() => {
        tryLoad(portIndex + 1);
      });
    };
    tryLoad();
    // DevTools can be opened manually with Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux)
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Handle file selection dialog
ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
    properties: options.properties || ['openFile', 'multiSelections'],
    filters: options.filters || [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ],
  });
  return result;
});

// Handle reading file data
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Determine MIME type
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    return {
      data: fileBuffer.toString('base64'),
      name: path.basename(filePath),
      type: mimeTypes[ext] || 'image/jpeg',
      size: stats.size,
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
});

// Handle Facebook Marketplace posting
ipcMain.handle('facebook-post', async (event, { itemData, images }) => {
  try {
    const result = await facebookAutomation.postToMarketplace(itemData, images);
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to post to Facebook Marketplace',
    };
  }
});

// Handle Facebook authentication
ipcMain.handle('facebook-auth', async (event) => {
  try {
    const result = await facebookAutomation.openAuthWindow();
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to open Facebook auth',
    };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

