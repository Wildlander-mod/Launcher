const {dialog} = require('electron')
function applySettings()
{
    console.log('Preparing JSON file...')
    path = __dirname + "/config/config.json"
    newConfig = JSON.parse(`{"debug" : ${document.getElementById('debugMode').checked},"skyrimDirectory" : "${document.getElementById('skyrimDirectory').value.replace(/\\/g,'\\\\')}","defaultPreset" : ${document.getElementById('performancePreset').options.selectedIndex}}`)
    console.log(newConfig)
    fs.writeFileSync(path, JSON.stringify(newConfig,null,2))
    dialogs.alert("Settings Saved.", ok => {location.reload()})
}
function changeDirectory() 
{
    let path = remote.dialog.showOpenDialogSync({
        title: "Open Skyrim Folder",
        buttonLabel: 'Choose folder',
        properties: ['openDirectory']
    })
    document.getElementById('skyrimDirectory').value = path
}