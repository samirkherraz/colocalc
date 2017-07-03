const electron = require("electron");
let app = electron.app;
let BrowserWindow = electron.BrowserWindow;
let mainWindow = null;
global.config = [
    __dirname + "/css/bootstrap.css",
    __dirname + "/css/font-awesome.min.css",
    __dirname + "/js/bootstrap.min.js",
    __dirname + "/js/ColoCalc.js"
];

global.DEFAULT_DIR = app.getPath('userData');

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
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.once("ready-to-show", function() { mainWindow.show(); });
    // mainWindow.openDevTools();

    mainWindow.on('closed', function() { mainWindow = null; });
});
