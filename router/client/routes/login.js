const { Router } = require("express");
const config = require("../../../config");
const db = require("node-couchdb");
const jwt = require('jsonwebtoken');
const router = Router();
const axios = require("axios");

const couch = new db({
    auth: {
        user: config.db_username,
        password: config.db_password,
    },
});

module.exports = (app) => {
    app.use("/login", router);

    router.get("/", (req, res) => {
        if(req.session.api_key || req.session.token){ 
            res.redirect("/room");
            return;
        }

        res.render("login/login", {
            errLoginUsername: "display:none;",
            errLoginPassword: "display:none;",
            errRegistrazioneUsername: "display:none;",
        });
    });

    router.post("/", (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        couch.get(config.db_database_name, config.db_document).then(
            function (data, headers, status) {
                if (data.data.users.hasOwnProperty(username)) {
                    //se esiste username
                    if (data.data.users[username].password == password) {
                        //se la password è corretta
                        req.session.user_id = username;
                        req.session.username = username;
                        req.session.api_key= data.data.users[username].api_key;
                        res.redirect("/room");
                    } else {
                        //se la password è sbagliata
                        res.render("login/login", {
                            errLoginUsername: "display:none;",
                            errLoginPassword: "display:;",
                            errRegistrazioneUsername: "display:none;",
                        });
                    }
                } else {
                    //se non esiste username
                    res.render("login/login", {
                        errLoginUsername: "display:;",
                        errLoginPassword: "display:none;",
                        errRegistrazioneUsername: "display:none;",
                    });
                }
            },
            function (err) {
                res.send(err);
            }
        );
    });
    router.get("/logout", (req, res) => {
        req.session.token = '';
        req.session.api_key = '';
        res.redirect("/");
    })

    router.post("/registrazione", (req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        couch.get(config.db_database_name, config.db_document).then(
            function (data, headers, status) {
                if (data.data.users.hasOwnProperty(username) || username.indexOf('-') >= 0) {
                    res.render("login/login", {
                        errLoginUsername: "display:none;",
                        errLoginPassword: "display:none;",
                        errRegistrazioneUsername: "display:;",
                    });
                } else {
                    req.session.username = username;
                    req.session.user_id = username;
                    //genero api_key    
                    let token = jwt.sign({username: username, password: password}, 'ajabana');
                    req.session.api_key = token;
                    data.data.users[username] = {
                        username: username,
                        password: password,
                        //inserisco api_key
                        api_key: token,
                    };
                    couch.update(config.db_database_name, data.data).then(
                        function (data, headers, status) {
                            res.redirect("/room");
                        },
                        function (err) {
                            console.log(err);
                        }
                    );
                }
            },
            function (err) {
                res.send(err);
            }
        );
    });

    router.get("/oauth", (req, res) => {
        /*reindirizzamento a facebook per ottenere l'autorizzazione e il code (sulla redirect_uri) */
        res.redirect(
            "https://www.facebook.com/v7.0/dialog/oauth?client_id=" +
                config.fb_client_id +
                "&redirect_uri=" +
                config.fb_redirect_uri +
                "&state=" +
                config.fb_state_param +
                "&response_type=code"
        );
    });

    router.get("/oauth/token", (req, res) => {
        let code = req.query.code;
        let access_token;

        //scambio code per access token del client
        axios
            .get(
                "https://graph.facebook.com/v7.0/oauth/access_token?client_id=" +
                    config.fb_client_id +
                    "&redirect_uri=" +
                    config.fb_redirect_uri +
                    "&client_secret=" +
                    config.fb_client_secret +
                    "&code=" +
                    code
            )
            .then((response) => {
                access_token = response.data.access_token;
                //salvataggio dell'access token nella sessione
                console.log("Token client ottenuto");
                req.session.token = access_token;

                //creazione app token (client_id|client_secret)
                let appToken =
                    config.fb_client_id + "|" + config.fb_client_secret;
                    
                //verifica token client tramite token app per ottenere l'user_id
                axios
                    .get(
                        `https://graph.facebook.com/debug_token?input_token=${access_token}&access_token=${appToken}`
                    )
                    .then((re) => {
                        let user_id = re.data.data.user_id;
                        req.session.user_id = user_id;
                        console.log("user_id ottenuto");
                        //get a facebook per ottenere i dati dell'utente (nome e cognome)
                        axios
                            .get(
                                `https://graph.facebook.com/${user_id}?fields=id,name&access_token=${access_token}`
                            )
                            .then((resp) => {
                                const username = resp.data.name;
                                const token = access_token;

                                req.session.username = username;
                                //salviamo l'utente sul database o lo aggiorniamo qualora abbia cambiato il nome su facebook
                                couch
                                    .get(
                                        config.db_database_name,
                                        config.db_document
                                    )
                                    .then(
                                        function (data, headers, status) {
                                            //non controllo se gia esiste poichè ad ogni login aggiorniamo username e password 
                                            //che potrebbero essere cambiati dall'ultimo login
                                            //creazione api_key dell'utente usando jwt e salvataggio di questa nella sessione
                                                let api_key = jwt.sign({user_id: user_id, username: username }, 'ajabana');
                                                req.session.api_key = api_key;
                                                data.data.users[user_id] = {
                                                    username: username,
                                                    token: access_token,
                                                    api_key: api_key,
                                                };
                                                couch
                                                    .update(config.db_database_name, data.data)
                                                    .then(
                                                        function (data, headers, status) {
                                                            res.redirect("/room");
                                                        },
                                                        function (err) {
                                                            res.send(err);
                                                        }
                                                    );
                                            },
                                            function (err) {
                                                res.send(err);
                                            }
                                    );
                            })
                            .catch((err) => {
                                res.send(err);
                            });
                    })

                    .catch((err) => {
                        res.send(err);
                    });
            })
            .catch((err) => {
                console.log("mancavo io");
            });
    });
};