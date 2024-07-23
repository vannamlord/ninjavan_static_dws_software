const FtpSrv = require('ftp-srv');
const { networkInterfaces } = require('os');
const Process = require('process');
const path = require('path');
const fs = require('fs');

class FtpServer {
    static DEFAULT_HOSTNAME = "0.0.0.0";
    static DEFAULT_PORT = 21;

    constructor(params) {
        this.params = params.parameters;
        this.params.hostname = (this.params.hostname || FtpServer.DEFAULT_HOSTNAME);
        this.params.port = (this.params.port || FtpServer.DEFAULT_PORT);
        this.params.path = (this.params.path || Process.cwd());

        const localips = this.getLocalIPs();
        const option = {
            pasv_url: (this.params.pasv_url || localips[0].address),
            url: "ftp://" + this.params.hostname + ":" + this.params.port
        };
        if (this.logger) option.log = this.logger;

        this.ftpserver = new FtpSrv(option);
    }

    getLocalIPs() {
        const nets = networkInterfaces();
        const result = [];

        for (const name in nets) {
            const f = nets[name].filter((net) => net.family === "IPv4" && !net.internal);
            if (f.length) result.push(f[0]);
        }
        return result;
    }

    initialize() {
        this.ftpserver.on('login', (data, resolve, reject) => {
            const { connection, username, password } = data;
            const validLogin = this.params.logins.find(login => login.username === username && login.password === password);
            if (validLogin) {
                console.log(`${username} logged on successfully`);

                FtpServer.FUNCTION_EVENTS.forEach(eventname => {
                    connection.on(eventname, (error, filename) => {
                        console.log(`Event: ${eventname}, File: ${filename}`);
                    });
                });

                resolve({ root: this.params.path });
            } else {
                reject(new Error('Invalid login'));
            }
        });

        this.ftpserver.listen().then(() => {
            console.log(`FTP server running at ftp://${this.params.hostname}:${this.params.port}${this.params.path}`);
        }).catch(err => {
            console.error('Error starting FTP server:', err);
        });
    }

    shutdown() {
        this.ftpserver.close().then(() => {
            console.log("FTP server closed");
        }).catch(err => {
            console.error('Error closing FTP server:', err);
        });
    }

    static FUNCTION_EVENTS = ["STOR", "RETR", "RNFR", "RNTO"];
}

module.exports = FtpServer;
