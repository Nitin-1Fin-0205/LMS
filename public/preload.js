const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Biometric operations
  biometricCheckService: () => ipcRenderer.invoke('biometric-check-service'),
  biometricInitDevice: () => ipcRenderer.invoke('biometric-init-device'),
  biometricCapture: (deviceHandle, pageId) => ipcRenderer.invoke('biometric-capture', deviceHandle, pageId),
  
  // Dialog operations
  showErrorDialog: (title, content) => ipcRenderer.invoke('show-error-dialog', title, content),
  showInfoDialog: (title, content) => ipcRenderer.invoke('show-info-dialog', title, content),
  
  // Platform info
  platform: process.platform,
  isElectron: true
});
