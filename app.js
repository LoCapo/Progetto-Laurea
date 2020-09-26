const express = require('express');
const config = require('./config');
async function startServer() {
    const app = express();
    module.exports = app;
    await require('./loaders')(app);

    const server = require('http').createServer(app);
    await require('./socket').init(server);
    console.log('Socket initialized');

    const prova = server.listen(config.port, config.serverURI, err => {
        if (err) {
            console.log('error')
            process.exit(1);
        }
        console.log(`Server Listening on port: ${config.port}`);
    })
    //module.exports = prova;
}

startServer(); 