"use strict";
const electron = require("electron");
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;
let mainWindow = null;
global.APP_DIR = __dirname + '/com.skad.colocalc';
global.DATA_DIR = app.getPath('userData');

global.config = [
    global.APP_DIR + "/js/jquery.min.js",
    global.APP_DIR + "/js/bootstrap.min.js",
    global.APP_DIR + "/js/ColoCalc.js",
    global.APP_DIR + "/js/jspdf.min.js",
    global.APP_DIR + "/js/jspdf.plugin.autotable.min.js"
];

app.on('window-all-closed', function() {

    if(process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {

    mainWindow = new BrowserWindow({
        'minHeight' : 500,
        'minWidth' : 900,
        'show' : false,
        'title' : "ColoCalc"

    });
    mainWindow.setMenu(null);
    // mainWindow.maximize();
    mainWindow.loadURL('file://' + global.APP_DIR + '/index.html');

    mainWindow.once("ready-to-show", function() { mainWindow.show(); });
    //mainWindow.openDevTools();

    mainWindow.on('closed', function() { mainWindow = null; });
});
