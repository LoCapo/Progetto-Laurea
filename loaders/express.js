const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const routesApi = require('../router/api');
const routesClient = require("../router/client");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require('../swagger.json');
const config = require('../config');

module.exports = (app) => {
    app.use(cookieParser());
    app.use(
        session({
            secret: "ajabana",
            resave: false,
            saveUninitialized: true,
            //cookie: {secure: false}
        })
    );

    app.use(cors());

    app.get("/status", (req, res) => {
        res.status(200).end();
    });
    app.head("/status", (req, res) => {
        res.status(200).end();
    });

    app.use(
        bodyParser.urlencoded({
            extended: false,
        })
    );

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    app.use(config.api.prefix, routesApi());

    app.use(routesClient());
    app.use(
        "/public",
        express.static(path.join(__dirname, "../client/public"))
    );
};