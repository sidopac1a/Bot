const { app, BrowserWindow, Tray, Menu, shell } = require('electron');
const path = require('path');

let tray = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "WCBot 1.2 v by sidoDz",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.png') // شعار البرنامج
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  // Tray
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'فتح التطبيق', click: () => win.show() },
    { label: 'واتساب', click: () => shell.openExternal('https://wa.me/96878995911') },
    { label: 'خروج', click: () => app.quit() },
  ]);
  tray.setToolTip('WCBot 1.2 v by sidoDz');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
