let ENBProfiles = require(__dirname + '/config/enb.json');

function loadENB(ENB) {
    if(currentConfig.skyrimDirectory == "")
    {
        dialogs.alert('You cannot use ENB Manager without setting your Skyrim path in the options menu!', ok => {return})
    } else {
        document.body.style.cursor = "progress";

        let oldENBFiles = ENBProfiles.profiles[ENBProfiles.currentENB].files
        if(ENBProfiles.currentENB != 0) {
            console.log('DELETING CURRENT ENB INSTALL')
            files = fs.readdirSync(currentConfig.skyrimDirectory)
            
            files.forEach(file => 
            {
                console.log('Scanning Skyrim folder: ' + currentConfig.skyrimDirectory)
                console.log(files)
                if(oldENBFiles.includes(file))
                {
                    console.log('Removing '+currentConfig.skyrimDirectory+'/'+file)
                    if(fs.lstatSync(currentConfig.skyrimDirectory+'/'+file).isDirectory())
                    {
                        fs.rmdirSync(currentConfig.skyrimDirectory+'/'+file, {recursive:true})
                    }
                    else
                    {
                        fs.unlinkSync(currentConfig.skyrimDirectory+'/'+file)
                    }
                }
            })
        }
        if(ENB == 0){ENBProfiles.currentENB = ENB;fs.writeFileSync(__dirname + '/config/enb.json', JSON.stringify(ENBProfiles, null, 2));location.reload()}
        let newFiles = fs.readdirSync(__dirname+"/ENB Profiles/"+ENBProfiles.profiles[ENB].name)
        newFiles.forEach(file =>
        {
            fs.copySync(__dirname+"/ENB Profiles/"+ENBProfiles.profiles[ENB].name+"/"+file, currentConfig.skyrimDirectory+"\\"+file)
        })
        ENBProfiles.currentENB = ENB
        fs.writeFileSync(__dirname + '/config/enb.json', JSON.stringify(ENBProfiles, null, 2))
        location.reload()
    }
}

function configureENB(ENB) {
    if(currentConfig.skyrimDirectory == "")
    {
        dialogs.alert('You cannot use ENB Manager without setting your Skyrim path in the options menu!', ok => {return})
    } else {require('child_process').exec(`start "" "${__dirname + "/ENB Profiles/" + ENBProfiles.profiles[ENB].name}"`)}
}

function deleteENB(ENB) {
    if(currentConfig.skyrimDirectory == "")
    {
        dialogs.alert('You cannot use ENB Manager without setting your Skyrim path in the options menu!', ok => {return})
    } 
    else
    {
        console.log(ENB)
        dialogs.confirm(`Delete the "${ENBProfiles.profiles[ENB].name}" ENB profile?`, ok =>
        {
            if(ok){
                document.body.style.cursor = "progress"
                fs.rmdirSync(`${__dirname}/ENB Profiles/${ENBProfiles.profiles[ENB].name}`, { recursive: true })
                let oldENBFiles = ENBProfiles.profiles[ENB].files
                if(ENB == ENBProfiles.currentENB) {
                    console.log('DELETING CURRENT ENB INSTALL')
                    files = fs.readdirSync(currentConfig.skyrimDirectory)
                    
                    files.forEach(file => 
                    {
                        console.log('Scanning Skyrim folder: ' + currentConfig.skyrimDirectory)
                        console.log(files)
                        for (file of files) 
                        {
                            if(oldENBFiles.includes(file))
                            {
                                console.log('Removing '+currentConfig.skyrimDirectory+'/'+file)
                                if(fs.lstatSync(currentConfig.skyrimDirectory+'/'+file).isDirectory())
                                {
                                    fs.rmdirSync(currentConfig.skyrimDirectory+'/'+file, {recursive:true})
                                }
                                else
                                {
                                    fs.unlinkSync(currentConfig.skyrimDirectory+'/'+file)
                                }
                            }
                        }
                    })

                }
                ENBProfiles.currentENB = 0
                delete ENBProfiles.profiles[ENB]
                for(i=ENB;i < Object.keys(ENBProfiles.profiles).length;i++)
                {
                    ENBProfiles.profiles[i] = ENBProfiles.profiles[i+1]
                    delete ENBProfiles.profiles[i+1]
                }
                fs.writeFileSync(__dirname + '/config/enb.json', JSON.stringify(ENBProfiles, null, 2))
                document.body.style.cursor = "auto"
                dialogs.alert("Profile deleted.", ok => {location.reload()})
            } else {
                dialogs.alert("Profile not deleted.", ok => {location.reload()})
            }
        })
    }
}

function addENB() {
    if(currentConfig.skyrimDirectory == "")
    {
        dialogs.alert('You cannot use ENB Manager without setting your Skyrim path in the options menu!', ok => {return})
    }
    else
    {
        let newENBName
        dialogs.prompt('Enter a name for your new ENB profile.', ok => {
            if(ok){
                newENBName = ok
                fs.mkdir(__dirname + "/ENB Profiles/" + newENBName, (err) =>
                {
                    if(err)
                    {
                        dialogs.alert(err + "\nFOLDER COULD NOT BE CREATED", ok => {location.reload()})
                    }
                    else
                    {
                        dialogs.alert('A folder has been created for your new ENB profile. After you hit ok, a explorer window will open the folder. Please copy the ENB files for this preset over, then hit okay again!', ok => 
                        {
                            require('child_process').exec(`start "" "${__dirname + "/ENB Profiles/" + newENBName}"`);
                            dialogs.alert('Paste your files in, then hit ok', ok =>
                            {
                                fs.readdir(`${__dirname + "/ENB Profiles/" + newENBName}`, (err,files) =>
                                {
                                    if(err)
                                    {
                                        dialogs.alert(err + "\nFOLDER COULD NOT BE READ", ok => {location.reload()})
                                    }
                                    else
                                    {
                                        let ENB = Object.keys(ENBProfiles.profiles).length
                                        let newKey = JSON.parse(`{"name":"${newENBName}","files":""}`)
                                        ENBProfiles.profiles[ENB] = newKey;
                                        console.log(ENBProfiles);
                                        let newProfile = []
                                        for (file of files)
                                        {
                                            newProfile.push(file)
                                            console.log(file)
                                        }
                                        ENBProfiles.profiles[ENB].files = newProfile
                                        fs.writeFileSync(__dirname + '/config/enb.json', JSON.stringify(ENBProfiles, null, 2))
                                        dialogs.alert("Profile created!", ok =>
                                        {
                                            location.reload()
                                        })
                                    }
                                })
                            })
                        })
                    }
                })
            }
        })  
    }
}