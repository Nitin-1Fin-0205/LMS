const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: false // Needed for WebAgent communication
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

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

// IPC handlers for biometric operations
ipcMain.handle('biometric-check-service', async () => {
  try {
    const response = await fetch('http://localhost:8084/api/createSessionID?dummy=' + Math.random());
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Biometric service not running: ' + error.message);
  }
});

ipcMain.handle('biometric-init-device', async () => {
  try {
    const response = await fetch('http://localhost:8084/api/initDevice?dummy=' + Math.random());
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to initialize biometric device: ' + error.message);
  }
});

ipcMain.handle('biometric-capture', async (event, deviceHandle, pageId) => {
  try {
    // Capture fingerprint
    const captureUrl = `http://localhost:8084/api/captureSingle?dummy=${Math.random()}&sHandle=${deviceHandle}&id=${pageId}&resetTimer=30000`;
    const captureResponse = await fetch(captureUrl);
    const captureData = await captureResponse.json();
    
    if (captureData.retValue !== 0) {
      throw new Error(captureData.retString || 'Capture failed');
    }

    // Get template data
    const templateUrl = `http://localhost:8084/api/getTemplateData?dummy=${Math.random()}&sHandle=${deviceHandle}&id=${pageId}&encrypt=0&extractEx=1&qualityLevel=80`;
    const templateResponse = await fetch(templateUrl);
    const templateData = await templateResponse.json();

    if (templateData.retValue !== 0) {
      throw new Error(templateData.retString || 'Template extraction failed');
    }

    // Get WSQ image
    const wsqUrl = `http://localhost:8084/api/getImageData?dummy=${Math.random()}&sHandle=${deviceHandle}&id=${pageId}&fileType=3&compressionRatio=0.75&width=288&height=300`;
    const wsqResponse = await fetch(wsqUrl);
    const wsqData = await wsqResponse.json();

    // Get BMP image
    const imgUrl = `http://localhost:8084/api/getImageData?dummy=${Math.random()}&sHandle=${deviceHandle}&id=${pageId}&fileType=1&compressionRatio=0.75&width=288&height=300`;
    const imgResponse = await fetch(imgUrl);
    const imgData = await imgResponse.json();

    return {
      success: true,
      template: templateData.templateBase64,
      quality: templateData.quality || 80,
      wsq: wsqData.imageBase64,
      image: imgData.imageBase64
    };
  } catch (error) {
    throw new Error('Fingerprint capture failed: ' + error.message);
  }
});

ipcMain.handle('biometric-abort-capture', async (event, deviceHandle) => {
  try {
    const response = await fetch(`http://localhost:8084/api/abortCapture?dummy=${Math.random()}&sHandle=${deviceHandle}&resetTimer=30000`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to abort capture:', error);
    return { success: false };
  }
});

ipcMain.handle('show-error-dialog', async (event, title, content) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'error',
    title: title,
    message: content,
    buttons: ['OK']
  });
  return result;
});

ipcMain.handle('show-info-dialog', async (event, title, content) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: content,
    buttons: ['OK']
  });
  return result;
});
