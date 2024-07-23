const net = require('net');
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const ftpConfig = {
    host: "192.168.1.108",
    port: 21,
    user: "admin1",
    password: "Admin123.",
    secure: false
};
const ftpClient = new ftp.Client();

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
        return new Promise((resolve, reject) => {
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
                    resolve(responseData);

                    // Check for image name in the response data
                    const imageNameMatch = responseData.match(/ImgName\s*=\s*(\/\S+\.jpg)/);
                    if (imageNameMatch) {
                        const imageName = imageNameMatch[1];
                        const localImagePath = path.join('/home/admin1/Desktop/Image_store', path.basename(imageName));
                        const remoteImagePath = imageName;

                        try {
                            await ftpClient.access(ftpConfig);
                            await ftpClient.downloadTo(localImagePath, remoteImagePath);
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
