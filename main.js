const { app, BrowserWindow } = require('electron');
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

// IPC event handler to interact with the camera
ipcMain.handle('get-camera-data', async () => {
    const CAMERA_IP = '192.168.1.108';
    const CAMERA_PORT = 3000;
    const CMD_START = 'start';
    const CMD_STOP = 'stop';
    const TIMEOUT = 2000; // 2 seconds timeout

    const cameraClient = new CameraClient(CAMERA_IP, CAMERA_PORT, TIMEOUT);
    try {
        await timeoutPromise(TIMEOUT, cameraClient.connect());
        await timeoutPromise(TIMEOUT, cameraClient.sendCommand(CMD_START));
        const data = await timeoutPromise(TIMEOUT, cameraClient.sendCommand(CMD_STOP));
        cameraClient.close();
        return data;
    } catch (err) {
        cameraClient.close();
        throw err;
    }
});