const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const EssayBot = require('../src/EssayBot');

let mainWindow;
let essayBot;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Human Essay Bot',
    resizable: true,
    minimizable: true,
    maximizable: true
  });

  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  
  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

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

// IPC handlers for communication with renderer process
ipcMain.handle('start-writing', async (event, { prompt, settings }) => {
  try {
    essayBot = new EssayBot(settings);
    const result = await essayBot.startWriting(prompt, (progress) => {
      mainWindow.webContents.send('writing-progress', progress);
    });
    return { success: true, result };
  } catch (error) {
    console.error('Error starting writing:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-writing', async () => {
  if (essayBot) {
    await essayBot.stopWriting();
    return { success: true };
  }
  return { success: false, error: 'No active writing session' };
});

ipcMain.handle('analyze-writing-style', async (event, { filePath }) => {
  try {
    const analyzer = require('../src/WritingStyleAnalyzer');
    const style = await analyzer.analyzeFile(filePath);
    return { success: true, style };
  } catch (error) {
    console.error('Error analyzing writing style:', error);
    return { success: false, error: error.message };
  }
});
