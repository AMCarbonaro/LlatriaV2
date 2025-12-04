const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  postToFacebook: (itemData, images) => ipcRenderer.invoke('facebook-post', { itemData, images }),
  openFacebookAuth: () => ipcRenderer.invoke('facebook-auth'),
});


