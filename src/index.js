const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

let mainWindow
const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
		height: 640,
		frame: false,
		resizable: false,
		centre: true,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'Dodge.html'))
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    })
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
