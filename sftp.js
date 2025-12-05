
module.exports = function (RED) {
    "use strict";
    var Client = require('ssh2-sftp-client');

    function SFTPCredentialsNode(config) {
        RED.nodes.createNode(this, config);
        this.host = config.host;
        this.port = config.port;
        this.username = this.credentials.username;
        this.password = this.credentials.password;
        var node = this;
    };

    RED.nodes.registerType("SFTP-credentials", SFTPCredentialsNode, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });


    function SFTPNode(config) {
        var key, node, value;
        RED.nodes.createNode(this, config);
        node = this;
        for (key in config) {
            value = config[key];
            node[key] = value;
        }
        this.server = RED.nodes.getNode(config.server);

        return this.on('input', (function (_this) {
            return function (msg) {
                node.status({
                    fill: "grey",
                    shape: "dot",
                    text: "connecting"
                });
                var sftp = new Client();

                sftp.connect({
                    host: node.server.host,
                    port: node.server.port,
                    username: node.server.username,
                    password: node.server.password
                }).then(() => {
                    this.method = msg.method || node.method;
                    this.remoteFilePath = msg.remoteFilePath || node.remoteFilePath;
                    this.useCompression = msg.useCompression || node.useCompression;
                    this.encoding = msg.encoding || node.encoding;
                    this.localFilePath = msg.localFilePath || node.localFilePath;
                    this.remoteDestPath = msg.remoteDestPath || node.remoteDestPath;
                    this.mode = msg.mode || node.mode;

                    node.status({
                        shape: "ring",
                        fill: "yellow",
                        text: node.method
                    });

                    switch (this.method) {
                        case "list":
                            return sftp.list(this.remoteFilePath);
                        case "get":
                            // return sftp.get(this.remoteFilePath, this.useCompression, this.encoding);
                            const options = { readStreamOptions: { encoding: this.encoding } };
                            return sftp.get(this.remoteFilePath, undefined, options);
                        case "put":
                            return sftp.put(this.localFilePath, this.remoteFilePath, this.useCompression, this.encoding);
                        case "mkdir":
                            return sftp.mkdir(this.remoteFilePath);
                        case "rmdir":
                            return sftp.rmdir(this.remoteFilePath);
                        case "delete":
                            return sftp.delete(this.remoteFilePath);
                        case "rename":
                            return sftp.rename(this.remoteFilePath, this.remoteDestPath);
                        case "chmod":
                            return sftp.chmod(this.remoteFilePath, this.mode);
                    }

                }).then((data) => {
                    sftp.end();
                    node.status({
                        shape: "dot",
                        fill: "green",
                        text: "Success"
                    });

                    msg.payload = data;
                    msg.remoteFilePath = this.remoteFilePath;
                    node.send(msg);
                }).catch((err) => {
                    sftp.end();
                    node.status({
                        shape: "dot",
                        fill: "red",
                        text: "Error: " + err
                    });
                    msg.payload = err;
                    msg.error = true;
                    node.send(msg);
                });
            };
        })(this));
    };
    RED.nodes.registerType("SFTP-main", SFTPNode);
};
