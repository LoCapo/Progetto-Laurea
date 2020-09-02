const { Router } = require("express");
const axios = require("axios");
const getWord = require("../../../randomWord");
const jwt = require("jsonwebtoken");
const db = require("node-couchdb");
const config = require("../../../config");
const path = require('path');

const couch = new db({
    auth: {
        user: config.db_username,
        password: config.db_password,
    },
});

//middlewares
fs = require("fs");
const router = Router();

module.exports = (app) => {
    app.use("/", router);

    router.get("/getRandomWord", (req, res) => {
        //parametri: num, lang
        let number = parseInt(req.query.num) || 1;
        let language = req.query.lang || 'en';

        if(['en', 'it', 'de', 'es'].includes(language)){
            if (language != "en") {
                getWord
                    .random(number)
                    .then((parole) => {
                        getWord
                            .translate(parole, language)
                            .then((result) => {
                                res.status(200).send(result);
                            })
                            .catch((err) => res.sendStatus(400));
                    })
                    .catch(() => res.sendStatus(400));
            //{ res.send(getWord.translate(parole, req))})
        } else {
            getWord
                .random(number)
                .then((words) => {
                    res.status(200).send(words);
                })
                .catch((err) => res.sendStatus(400));
        }
        }
        else{
            res.sendStatus(400)
        }
    });
    
    router.get("/getImage", (req, res) => {
        //parametri: api_key, name
        if(!req.query.name){
            res.sendStatus(400);
            return;
        }
        if (req.query.api_key) {
            console.log(req.query.api_key);
            let api_key = req.query.api_key;
            let nome_file = req.query.name;
            jwt.verify(api_key, "ajabana", (err, decode) => {
                if (err) {
                    console.log("errore verifica api_key");
                    console.log(err);
                    res.sendStatus(400);
                } else {
                    couch
                        .get(config.db_database_name, config.db_document)
                        .then((data, headers, status) => {
                            let autenticated = false;
                            //controllo autenticazione facebook
                            if (decode.user_id) {
                                let user_id = decode.user_id;
                                //se utente presente
                                if (data.data.users[user_id] && data.data.users[user_id].username == decode.username) {
                                        autenticated = true
                                } else 
                                    res.send("Parametri non corretti");
                             //controllo autenticazione locale
                            }else if (decode.username) {
                                let username = decode.username;
                                let password = decode.password;
                                if (
                                    data.data.users[username] &&
                                    data.data.users[username].password ==
                                        password
                                ) {
                                    autenticated = true;
                                } else {
                                    res.send("Parametri non corretti");
                                }
                            } else {
                                res.send(400);
                            }

                            ///send data
                            if(autenticated){
                                fs.readdir("./user_images", (err, files) => {
                                    if (err) 
                                        res.send(err);
                                    else{
                                        let filename = '';
                                        let definitivo = "";
                                        files.forEach((file) => {
                                            if ((file.split('-')[0] == decode.user_id || file.split('-')[0] == decode.username) && file.split('-')[1].includes(nome_file)){
                                                if(file.split('-')[1] == `${nome_file}.png`)
                                                    definitivo = file;
                                                filename = file;
                                            }
                                        });
                                        if (definitivo) {
                                            filename = definitivo;
                                        }
                                        res.sendFile(path.resolve(`./user_images/${filename}`));
                                    }
                                });
                            }
                            else{
                                res.sendStatus(400);
                            }
                        });
                }
            });
        } else {
            res.sendStatus(400);
        }
    });
};
