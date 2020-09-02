const { Router } = require("express");
const router = Router();
const config = require('../../../config')
const {
    createRoom,
    checkRoom,
} = require("../../../socket/draw/roomArray");
const {io} = require("../../../socket")


module.exports = (app) => {
    app.use("/room", router);

    router.get("/", (req, res) => {
        if(!req.session.api_key && !req.session.token){ 
            res.redirect("/login");
            return;
        }

        error = req.query.err;
        if (error) {
            res.render("room/room", {
                room_link: `/room/draw`,
                error: "Insisci la password corretta per la stanza!",
                username: req.session.username,
                api_key: req.session.api_key,
            });
        } else {
            res.render("room/room", {
                room_link: `/room/draw`,
                username: req.session.username,
                api_key: req.session.api_key,
            });
        }
    });

    router.post("/draw", (req, res) => {
        if(!req.session.api_key && !req.session.token){ 
            res.redirect("/login");
            return;
        }

        if (req.body) {
            console.log(req.body.lang);
            if (checkRoom(req.body.id, req.body.password) == "ok"){
                res.render("draw/draw", {
                    ROOM: req.body.id,
                    PASSWORD: req.body.password,
                    USERNAME: req.session.username,
                    //HOST: `http://${config.serverURI}:${config.port}`,
                    HOST: config.external_uri,
                });
            }
            else if (checkRoom(req.body.id, req.body.password) == "password") {
                res.redirect(`/room?err=password&roomName=${req.body.id}`);
            } else {
                createRoom(req.body.id, req.body.password, io, req.body.lang);
                res.render("draw/draw", {
                    ROOM: req.body.id,
                    PASSWORD: req.body.password,
                    USERNAME: req.session.username,
                    //HOST: `http://${config.serverURI}:${config.port}`,
                    HOST: config.external_uri,
                });
            }
        } else res.sendStatus(400);
    });
};
