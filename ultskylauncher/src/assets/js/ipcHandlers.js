  import {
    ipcMain,
    shell
  } from 'electron'
  import path from 'path'
  import childProcess from 'child_process'
  import fs from 'fs'
  import ncp from 'ncp'
  import os from 'os'

  // Check if UltSky config directory exists, if not, create one
  const homedir = path.join(os.homedir(),'Ultimate Skyrim Launcher')
  if(!fs.existsSync(homedir, err => {throw err})) {
    fs.mkdir(homedir, err => {throw err})
  }
  // Check if ENB directory exists, if not, create one
  let defaultENBPath = path.join(homedir, '/ENB Profiles/')
  if (!fs.existsSync(defaultENBPath)) {
    fs.mkdirSync(defaultENBPath)
    if (!fs.existsSync(path.join(defaultENBPath, 'Ultimate Skyrim'))) {
      fs.mkdirSync(path.join(defaultENBPath, 'Ultimate Skyrim'))
    }
  }
  // Check if configuration file exists, if not, create a default one
  if (!fs.existsSync(path.join(homedir, '/launcher.json'))) {
    let defaultConfig = require('../json/defaultConfig.json')
    defaultConfig.ENB.Profiles['Ultimate Skyrim'].path = defaultENBPath
    fs.writeFileSync(path.join(homedir, 'launcher.json'), JSON.stringify(defaultConfig, null, 2))
  }

  // IPC Handlers

  // Function purpose
  // Argument type and contents
  // Code to invoke
  // Return object contents

  // Follow internet link
  // String: Web link to open
  // window.ipcRenderer.send('follow-link', String)
  // NO RETURN OBJECT
  ipcMain.on('follow-link', (_event, link) => {
    shell.openExternal(link)
  })
  
  // Open file path
  // String: Folder path
  // window.ipcRenderer.send('open-file-profile', String)
  // NO RETURN OBJECT
  ipcMain.on('open-file-profile', (_event, path) => {
    shell.openPath(path)
  })
  
  // Create new ENB Profile
  // String: New ENB Profile Name
  // window.ipcRenderer.invoke('create-enb-profile', String).then((result) => {})
  // Returns object { name: '', path: ''}
  ipcMain.handle('create-enb-profile', async (_event, ENBname) => {
    const profilePath = path.join(homedir, '/ENB Profiles/', ENBname)
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
    return {
      name: ENBname,
      path: profilePath
    }
  })
  
  // Delete an ENB profile
  // Object: ENB Profile to delete from config { name: '', path: '' }
  // window.ipcRenderer.send('delete-enb-profile', Object)
  // NO RETURN OBJECT
  ipcMain.on('delete-enb-profile', async (_event, args) => {
    shell.moveItemToTrash(args.path)
  })
  
  // Update configuration file
  // JSON: New configuration settings
  // window.ipcRenderer.send('update-config', JSON)
  // NO RETURN OBJECT
  ipcMain.on('update-config', async (_event, args) => {
    const newConfig = JSON.stringify(args, null, 2)
    fs.writeFileSync(path.join(homedir, '/launcher.json'), newConfig)
  })
  
  // Get configuration
  // NO ARGUMENTS
  // window.ipcRenderer.invoke('get-config').then((result) => {})
  // Returns JSON Object
  ipcMain.handle('get-config', async (_event, args) => {
    return JSON.parse(fs.readFileSync(path.join(homedir, 'launcher.json')))
  })
  
  // Get Directory
  // NO ARGUMENTS
  // window.ipcRenderer.invoke('get-directory').then((result) => {})
  // Returns Array, folder path is at array position [0]
  ipcMain.handle('get-directory', async (_event, args) => {
    return dialog.showOpenDialogSync({
      buttonLabel: 'Choose Folder',
      properties: ['openDirectory']
    })
  })

  // Launch game
  // String: Selected quality preset
  // window.ipcRenderer.send('launch-game', String)
  // NO RETURN OBJECT
  ipcMain.on('launch-game', async (_event, args) => {
    const currentConfig = JSON.parse(fs.readFileSync(path.join(homedir, 'launcher.json')))
    const currentENB = currentConfig.ENB.CurrentENB
    const ENBPath = path.join(homedir, '\\ENB Profiles\\', currentENB)
    ncp.ncp(ENBPath, currentConfig.Options.GameDirectory)
    const moPath = path.join(currentConfig.Options.ModDirectory, '\\ModOrganizer.exe -p "UltSky 4.0.7 (' + args + ' Preset)" SKSE')
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
  
  // Launch ModOrganizer
  // NO ARGUMENTS
  // window.ipcRenderer.send('launch-mo2')
  // NO RETURN OBJECT
  ipcMain.handle('launch-mo2', async (_event, args) => {
    const currentConfig = JSON.parse(fs.readFileSync(path.join(homedir, 'launcher.json')))
    const moPath = path.join(currentConfig.Options.ModDirectory, '\\ModOrganizer.exe')
    childProcess.exec(moPath)
  })