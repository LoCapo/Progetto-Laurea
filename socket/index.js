const socketIO = require('socket.io');
//const chat = require('chat/handlers');
const draw = require('./draw/handlers');

const io = socketIO();

module.exports = {
    init(httpServer) { //subscribtion
        io.attach(httpServer);
        draw(io);
    },
    io,
}