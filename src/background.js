import { app, protocol, dialog, BrowserWindow, ipcMain, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import fs from 'fs'
import childProcess from 'child_process'
import ncp from 'ncp'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 600,
    resizable: false,
    maximizable: false,
    frame: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL(path.join(__dirname, 'index.html'))
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// Define default configuration settings
let defaultENBPath = path.join(__dirname, '/ENB Profiles/', 'Ultimate Skyrim')
defaultENBPath = defaultENBPath.replace(/\\/gi, '\\\\')
const defaultConfig = JSON.parse('{"Options":{"GameDirectory":"","DefaultPreset":"Low","LauncherTheme":"Light"},"ENB":{"CurrentENB" : "Ultimate Skyrim","Profiles":{"Ultimate Skyrim":{"name":"Ultimate Skyrim","path":"' + defaultENBPath + '"}}}}')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  // Check if configuration file exists, if not, create a default one
  if (!fs.existsSync(path.join(__dirname, '/launcher.json'))) {
    fs.writeFileSync(path.join(__dirname, 'launcher.json'), JSON.stringify(defaultConfig, null, 2))
  }
  if (!fs.existsSync(path.join(__dirname, 'ENB Profiles'))) {
    fs.mkdirSync(path.join(__dirname, 'ENB Profiles'))
    if (!fs.existsSync(path.join(__dirname, '/ENB Profiles/', 'Ultimate Skyrim'))) {
      fs.mkdirSync(path.join(__dirname, '/ENB Profiles/', 'Ultimate Skyrim'))
    }
  }
})

const isRunning = (query, cb) => {
  let platform = process.platform;
  let cmd = '';
  switch (platform) {
      case 'win32' : cmd = `tasklist`; break;
      case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
      case 'linux' : cmd = `ps -A`; break;
      default: break;
  }
  childProcess.exec(cmd, (err, stdout, stderr) => {
      cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
  });
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('close', () => {
  win.close()
}).on('minimize', () => {
  win.minimize()
}).on('follow-link', (_event, args) => {
  shell.openExternal(args)
}).on('configure-enb-profile', (_event, args) => {
  shell.openPath(args)
})

ipcMain.handle('create-enb-profile', async (_event, name) => {
  const profilePath = path.join(__dirname, '/ENB Profiles/', name)

  fs.mkdirSync(profilePath, { recursive: true }, (error) => {
    if (error) {
      throw error
    }
  })

  dialog.showMessageBoxSync({
    type: 'info',
    buttons: ['OK'],
    title: 'Profile Folder Created',
    message: `
    A folder has been created for your new ENB profile.
    After you hit OK, the folder will open.
    Please copy the ENB files for this profile into the folder!
    `
  })
  shell.openPath(profilePath)

  // TODO: Implement a file caching system.

  return {
    name: name,
    path: profilePath
  }
})

ipcMain.handle('delete-enb-profile', async (_event, args) => {
  // Check to see if we should be deleting from the skyrim directory
  // Then delete the path
  return shell.moveItemToTrash(args.path)
})

// Update configuration file
ipcMain.handle('update-config', async (_event, args) => {
  const newConfig = JSON.stringify(args, null, 2)
  fs.writeFileSync(path.join(__dirname, '/launcher.json'), newConfig)
})

// Get configuration
ipcMain.handle('get-config', async (_event, args) => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'launcher.json')))
})

// Get Directory
ipcMain.handle('get-directory', async (_event, args) => {
  return dialog.showOpenDialogSync({
    buttonLabel: 'Choose Folder',
    properties: ['openDirectory']
  })
})

ipcMain.handle('launch-game', async (_event, args) => {
  const currentConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'launcher.json')))
  const currentENB = currentConfig.ENB.CurrentENB
  const ENBPath = path.join(__dirname, '\\ENB Profiles\\', currentENB)
  ncp.ncp(ENBPath, currentConfig.Options.GameDirectory)

  const moPath = path.join(__dirname, '..\\ModOrganizer.exe -p "UltSky 4.0.7 (' + args + ' Preset)" SKSE')
  childProcess.exec(moPath)

  let isSkyrimRunning = setInterval(checkProcess, 1000)
  function checkProcess () {
    isRunning('ModOrganizer.exe', (status) => {
      if (!status) {
        clearInterval(isSkyrimRunning)
        fs.readdir(ENBPath, (err,files) => {
          files.forEach(file => {
            fs.unlink(path.join(currentConfig.Options.GameDirectory, file), (err) => {
              console.log(err)
            })
            fs.rmdir(path.join(currentConfig.Options.GameDirectory, file), { recursive: true }, (err) => {
              if (err) {
                  throw err;
              }
            })
          })
        })  
      }
    })
  }
})

ipcMain.handle('launch-mo2', async (_event, args) => {
  const moPath = path.join(__dirname, '..\\ModOrganizer.exe')
  childProcess.exec(moPath)
})
