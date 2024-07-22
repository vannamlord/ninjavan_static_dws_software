const net = require('net');

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
                // Can do some actions in here
                resolve();
            });

            this.client.on('error', (err) => {
                // Can do some actions in here
                reject(new Error('Can not connect Camera'));
            });
        });
    }

    sendCommand(command) {
        return new Promise((resolve, reject) => {
            let isResolved = false;

            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    // console.error('Timeout waiting for data');
                    // Can do some actions in here
                    this.client.removeAllListeners('data');
                    reject(new Error('Timeout waiting for data'));
                }
            }, this.timeout);

            this.client.write(command, 'utf8', () => {
                // Can do some actions in here
            });

            this.client.on('data', (data) => {
                if (!isResolved) {
                    clearTimeout(timeoutId);
                    isResolved = true;
                    // console.log('Received data:', data.toString());
                    // Can do some actions in here
                    resolve(data.toString());
                }
            });

            this.client.on('error', (err) => {
                if (!isResolved) {
                    clearTimeout(timeoutId);
                    // console.error('Connection error:', err);
                    // Can do some actions in here
                    reject(err);
                }
            });
        });
    }

    close() {
        this.client.end();
        // Can do some actions in here
    }
}

module.exports = CameraClient;
