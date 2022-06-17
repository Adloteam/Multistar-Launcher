const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const discordRPC = require("./discordRPC.js");
const ipc = ipcMain
const { setVibrancy } = require('electron-acrylic-window')

if (require('electron-squirrel-startup')) {
  app.quit();
}

const vop = {
  theme: String ('appearance-based'),
  effect: String ('acrylic'),
  useCustomWindowRefreshMethod: Boolean (true),
  maximumRefreshRate: Number (60),
  disableOnBlur: Boolean (true),
  debug: Boolean (true)
}

// TODO : FIX DISCORD RPC
// TODO : DISABLE DEV TOOLS

const createWindow = () => {
  process.env.IS_LOGGED_IN = 'false'
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    // 1198 x 883
    width: 1198,
    height: 883,
    frame: false,
    transparent: true,
    resizable: false,
    // vibrancy: vop,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.setVibrancy(vop)

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  ipc.on('closeApp', () => {
    mainWindow.close();
  })
  ipc.on('minimizeApp', () => {
    mainWindow.minimize();
  })
  ipc.on('maxResApp', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  })
  ipc.on("discord-disconnect", () => {
    discordRPC.disconnect();
  })
  ipc.on("discord-connect", () => {
    discordRPC.connect();
  })
  ipc.on("restartApp", () => {
    app.relaunch();
    app.exit();
  })
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();

    client.login({
      clientId,
      scopes
    });
  }
});