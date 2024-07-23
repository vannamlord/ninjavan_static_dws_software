const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const CameraClient = require('./CameraSocket');

function createWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.menuBarVisible = false;
    mainWindow.maximize();
    mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('get-camera-data', async () => {
    const CAMERA_IP = '192.168.1.108';
    const CAMERA_PORT = 3000;
    const CMD_START = 'start';
    const CMD_STOP = 'stop';
    const TIMEOUT = 2000; // 2 seconds timeout

    const cameraClient = new CameraClient(CAMERA_IP, CAMERA_PORT, TIMEOUT);

    try {
        await cameraClient.connect();
        await cameraClient.sendCommand(CMD_START);
        const { responseData, imagePath } = await cameraClient.sendCommand(CMD_STOP);
        cameraClient.close();

        return { data: responseData, imagePath };
    } catch (err) {
        cameraClient.close();
        return { error: err.message };
    }
});
