const { shell,remote } = require('electron');
const fs = require('fs');
const Dialogs = require('dialogs')
const dialogs = Dialogs()
let currentConfig = require(__dirname + '\\config\\config.json')