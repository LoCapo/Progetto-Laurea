/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
const fs = require("fs");
const { expect } = require("chai");
const clipboardy = require("clipboardy");
const db = require("node-couchdb");


const couch = new db({
  auth: {
    user: "admin",
    password: "password",
  },
});
let global_api_key;
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    readdir({ path }) {
      fs.readdir(path, (err,files) => {
        if (err) throw err;
        for (let file of files) {
          let string= "" + path + "/" + file;
          fs.unlink(string, (err) => {
            if (err) throw err;
          });
        }
      });
      return null;
    }
  });

  on("task",{
    getFile() {
      fs.readdir("user_images",(err,files) => {
        if (err) throw err;
        expect(files[0]).to.equal("admin-test.png");
      });
      return null;
    }
  })

  on("task",{
    async getApiKey(){
      let variabile;
      await couch.get("pinturicchio", "6ef079da3844000c94b4a9c8f4000970").then(
        function (data, headers, status) {
          variabile = data.data.users["admin"].api_key;
          console.log(variabile);
        })
      console.log(variabile);
      return variabile;
    }
  })
/*
  on("task",{
    setApiKey() {
      let api_key;
      couch.get("pinturicchio", "6ef079da3844000c94b4a9c8f4000970").then(
        function (data, headers, status) {
          api_key = data.data.users["admin"].api_key;
          console.log(api_key);
          global_api_key = api_key;
          console.log(global_api_key);
        });
    console.log(global_api_key);
    return null;
    }
  })
  on("task",{
    getApiKey(){
      return global_api_key
    }
  })

*/
}