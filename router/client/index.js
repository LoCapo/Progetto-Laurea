const { Router } = require("express");
const room = require("./routes/room");
const home = require("./routes/home");
const login = require("./routes/login");
const free_drawing = require("./routes/freeDraw");


module.exports = () => {
    const router = Router();

    free_drawing(router);
    home(router);
    room(router);
    login(router)

    console.log('Client Routes - OK');
    return router;
};

