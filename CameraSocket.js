const net = require('net');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');
const FtpServer = require('./FtpServer'); // Adjust the path to FtpServer

const ftpConfig = {
    host: "192.168.1.100", // Adjust this to the FTP server IP
    port: 21,
    user: "admin1",
    password: "Admin123.",
    secure: false
};

const ftpClient = new ftp.Client();
const IMAGE_SAVE_DIRECTORY = '/home/admin1/Desktop/Image_store';

// Ensure the directory exists
if (!fs.existsSync(IMAGE_SAVE_DIRECTORY)) {
    fs.mkdirSync(IMAGE_SAVE_DIRECTORY, { recursive: true });
}

// Start FTP server (you should call this in your application initialization)
const ftpServer = new FtpServer({
    parameters: {
        hostname: "0.0.0.0",
        port: 21,
        path: IMAGE_SAVE_DIRECTORY,
        logins: [
            { username: "admin1", password: "Admin123." }
        ]
    }
});
ftpServer.initialize();

class CameraClient {
    constructor(ip, port, timeout = 2000) {
        this.ip = ip;
        this.port = port;
        this.timeout = timeout;
        this.client = new net.Socket();
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client.connect(this.port, this.ip, () => {
                resolve();
            });

            this.client.on('error', (err) => {
                reject(new Error('Cannot connect to camera'));
            });
        });
    }

    sendCommand(command) {
        return new Promise(async (resolve, reject) => {
            let isResolved = false;

            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    this.client.removeAllListeners('data');
                    reject(new Error('Timeout waiting for data'));
                }
            }, this.timeout);

            this.client.write(command, 'utf8');

            this.client.on('data', async (data) => {
                if (!isResolved) {
                    clearTimeout(timeoutId);
                    isResolved = true;
                    const responseData = data.toString();

                    // Check for image name in the response data
                    const imageNameMatch = responseData.match(/ImgName\s*=\s*(\/\S+\.jpg)/);
                    if (imageNameMatch) {
                        const imageName = imageNameMatch[1];
                        const localImagePath = path.join(IMAGE_SAVE_DIRECTORY, path.basename(imageName));
                        const remoteImagePath = imageName;

                        try {
                            // Download the image from the FTP server
                            await ftpClient.access(ftpConfig);
                            await ftpClient.downloadTo(localImagePath, remoteImagePath);
                            console.log('Image saved at:', localImagePath);
                            resolve({ responseData, imagePath: localImagePath });
                        } catch (err) {
                            console.error('FTP error:', err);
                            reject(new Error('FTP error: ' + err.message));
                        } finally {
                            ftpClient.close();
                        }
                    } else {
                        resolve({ responseData, imagePath: null });
                    }
                }
            });

            this.client.on('error', (err) => {
                if (!isResolved) {
                    clearTimeout(timeoutId);
                    reject(err);
                }
            });
        });
    }

    close() {
        this.client.end();
    }
}

module.exports = CameraClient;
