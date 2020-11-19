const electron = require('electron');
const url = require('url');
const path = require('path');
const { protocol } = require('electron');

const { app, BrowserWindow, Menu, ipcMain, shell } = electron;

//SET ENV
process.env.NODE_ENV = 'production'

let mainWindow;
let addWindow;
let helpWindow;

// Listen for app to be ready
app.on('ready', function(){

    //external link opener
    const handleRedirect = (e, url) => {
        if (url !== e.sender.getURL()) {
          e.preventDefault()
          shell.openExternal(url)
        }
    }

    // Create new window
    mainWindow = new BrowserWindow({
        resizable: false,
        fullscreenable: false,
        webPreferences:{
            nodeIntegration:true
        }
    });

    mainWindow.webContents.on('will-navigate', handleRedirect)
    // Load html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    // Build the menu
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

//addWindow create func ------------------------
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Ajouter des articles',
        resizable: false,
        fullscreenable: false,
        webPreferences:{
            nodeIntegration:true
        }
    });
    // Load html file into the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // clear mem
    addWindow.on('close', function(){
        addWindow = null
    })

};

//helpWindow create func ------------------------
function createHelpWindow(){
    helpWindow = new BrowserWindow({
        width: 500,
        height: 522,
        resizable: false,
        fullscreenable: false,
        title: 'Aide',
        webPreferences:{
            nodeIntegration:true
        }
    });

    const handleRedirect = (e, url) => {
        if (url !== e.sender.getURL()) {
          e.preventDefault()
          shell.openExternal(url)
        }
    }

    helpWindow.webContents.on('will-navigate', handleRedirect)
    // Load html file into the window
    helpWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'helpWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // clear mem
    helpWindow.on('close', function(){
        helpWindow = null
    })

};

//Catch the item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Menu template
const menuTemplate = [
    {
        label:'Fichier',
        submenu:[
            {
                label: 'Ajouter un article',
                accelerator: process.platform == 'darwin' ? 'Command+P' :
                'Ctrl+P',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Supprimer les articles',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quitter l\'application',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Aide',
        submenu:[
            {
                label: 'Aides et Informations',
                accelerator: process.platform == 'darwin' ? 'Command+H' :
                'Ctrl+H',
                click(){
                    createHelpWindow();
                }
            }
        ]
    }
];

//Mac compatibility menu
if(process.platform == 'darwin') {
    menuTemplate.unshift({});
}

//Dev tools if not in production mode
if (process.env.NODE_ENV !== 'production'){
    menuTemplate.push({
        label: 'Devs Tools',
        submenu:[
            {
                label: 'Toggle Devs Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}