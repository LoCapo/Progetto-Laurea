// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
const db = require("node-couchdb");


const couch = new db({
    auth: {
        user: "admin",
        password: "password",
    },
});

import './commands'

beforeEach(() => {
    couch.get("pinturicchio", "6ef079da3844000c94b4a9c8f4000970").then(
        function(data,headers,status){
            data.data.users = {};
            couch.update("pinturicchio", data.data);/*.then(
                function(data,headers,status){
                },
                function(err){
                    console.log(err);
                }
            );    */
        });
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
