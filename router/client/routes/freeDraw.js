const { Router } = require("express");
const router = Router();
const multer = require('multer');
const config = require('../../../config')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'user_images/')
    },
    filename: function (req, file, cb) {
        cb(null, req.session.user_id + '-' + file.originalname + '.png');
    }
})

let upload = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        let name = file.originalname;
        if(!file.originalname || file.originalname.includes('-')) {
            return callback(console.log('no'))
        }
        callback(null, true)
    }});

module.exports = (app) => {
    
    app.use("/free_drawing", router);

    router.get("/", (req, res) => {
        if(!req.session.api_key && !req.session.token){ 
            res.redirect("/login");
            return;
        }

        error = req.query.err;
        if (error){
            res.render("errore");
        }
        else {

            res.render("free_drawing/freeDraw", {
                HOST: config.external_uri,
            });
        }
    });

    router.post("/save", upload.single('file'), (req, res) => {
        if(req.file)
            if(!req.file.originalname || req.file.originalname.includes('-'))
                res.sendStatus(400);
            else
                res.sendStatus(200);
        else
            res.sendStatus(400);
    });
};