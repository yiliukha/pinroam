const { app, BrowserWindow, session, Menu } = require('electron')
const path = require('path')

const isDev = process.argv.includes('--dev')

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 900,
    minHeight: 600,
    title: 'GeoQuest',
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#1a1a2e',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,            // allow cross-origin iframes (Street View)
      allowRunningInsecureContent: true,
    },
  })

  // Remove X-Frame-Options from all responses so Google Maps iframe can load
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = Object.fromEntries(
      Object.entries(details.responseHeaders || {})
        .filter(([k]) => !['x-frame-options','content-security-policy'].includes(k.toLowerCase()))
    )
    callback({ responseHeaders: headers })
  })

  Menu.setApplicationMenu(null)

  win.loadFile(path.join(__dirname, '../www/index.html'))

  win.once('ready-to-show', () => win.show())

  if (isDev) win.webContents.openDevTools({ mode: 'detach' })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
