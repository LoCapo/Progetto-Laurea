const express = require('express');
const config = require('./config');

async function startServer() {
    const app = express();
    
    await require('./loaders')(app);

    const server = require('http').createServer(app);
    await require('./socket').init(server);
    console.log('Socket initialized');

    server.listen(config.port, config.serverURI, err => {
        if (err) {
            console.log('error')
            process.exit(1);
        }
        console.log(`Server Listening on port: ${config.port}`);
    })
}

startServer();