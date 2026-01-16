node-red-contrib-sftp
=====================

An SFTP node for Node-RED, a wrapper for [ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client)

This is/was a clone of the original node-red-contrib-sftp versions by @jonferreira and @schattenmann, updated by @dceejay to use the latest client library.

### Changes

**v2.0.0** (breaking) - handles errors by sending to the Node-RED catch node rather than polluting the msg.payload.
**v1.0.2** - now hides the credentials properly using the Node-RED built in credentials handler.

### Install

Either use the Manage Palette option in the Node-RED Editor menu, or run the following command in your Node-RED user directory - typically `~/.node-red`

    npm i @dceejay/node-red-contrib-sftp
