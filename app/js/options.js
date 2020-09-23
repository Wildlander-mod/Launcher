function applySettings()
{
    console.log('Preparing JSON file...')
    path = __dirname + "/config/config.json"
    newConfig = JSON.parse(`{"debug" : ${document.getElementById('debugMode').checked},"skyrimDirectory" : "${document.getElementById('skyrimDirectory').textContent}","defaultPreset" : ${document.getElementById('performancePreset').options.selectedIndex}}`)
    console.log(newConfig)
    fs.writeFileSync(path, JSON.stringify(newConfig,null,2))
    dialogs.alert("Settings Saved.", ok => {location.reload()})
}