const { rooms, checkRoom } = require("./roomArray");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Connected: " + socket.id);

        socket.on("strokes", (data) => {
            socket.broadcast.to(socket.room).emit("strokes", data);
        });
        
        socket.on("clearDrawing", () => {
            socket.broadcast.to(socket.room).emit("clearDrawing");
        });

        socket.on("redraw", (data) => {
            socket.broadcast.to(socket.room).emit("redraw", data);
        });

        socket.on("imageState", (data) => {
            socket.broadcast.to(socket.room).emit("completeImage", data);
        });

        socket.on("join", (data) => {
            socket.room = data.id;
            socket.username = data.username
            if (checkRoom(data.id, data.password) == "ok") {
                socket.join(data.id);
                rooms[socket.room].addUser(socket.id, socket.username);
                if(rooms[socket.room].drawer.id != socket.id){
                    console.log(rooms[socket.room].drawer.id);
                    io.to(rooms[socket.room].drawer.id).emit("getImageState");
                    console.log('joinedroom');
                }
            }
            else {
                socket.emit("notExists");
                socket.room = '';
            }
        });

        socket.on("startGame", () => {
            console.log(`Avvio game in room: ${socket.room}`);
            if(socket.room && rooms[socket.room] && !rooms[socket.room].started){
                rooms[socket.room].started = true;
                rooms[socket.room].start();
            }
        });

        socket.on("disconnect", () => {
            console.log("disconnected" + socket.id);
            if (socket.room && rooms[socket.room]) {
                rooms[socket.room].removeUser(socket.id);
                console.log('andato');
                if (rooms[socket.room].empty) {
                    if (rooms[socket.room].interval)
                        clearInterval(rooms[socket.room].interval)
                    delete rooms[socket.room];
                }
            }

        });
        socket.on("points", (data) => {
            console.log(`Avvio game in room: ${data.username} -> ${data.points}`);
        });

        //CHAT AREA

        socket.on("message", (data) => { 
            if (socket.room && rooms[socket.room] && data.trim().toLowerCase() == rooms[socket.room].word.trim().toLowerCase()) {
                rooms[socket.room].checkWord(socket.id, data);
                return;
            } 

            let package = {
                user: socket.username,
                text: data,
            };

            io.to(socket.room).emit("message", package);
        })
    });
};
