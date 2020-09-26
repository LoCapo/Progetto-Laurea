const { expect } = require("chai");
const axios = require("axios");
const clipboardy = require("clipboardy");
const db = require("node-couchdb");

const couch = new db({
    auth: {
        user: "admin",
        password: "password",
    },
});

describe("Testing getImage API", () => {
    /*
    beforeEach(() => {
        fs.readdir("user_images", (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join("user_images", file), err => {
                    if (err) throw err;
                });
            }
        });
    });    */
    beforeEach(() => {
        cy.task("readdir", { path: "user_images" }, { timeout: 30000 });
    });
    //Verifica del funzionamento dei passaggi che permettono all'utente di salvare un'immagine
    it("saves the image created by the user", () => {
        cy.registration("admin,admin");
        cy.login("admin","admin");
        cy.get("#disegno-libero").click();
        cy.get("#canvas").click();
        cy.get("#title").type("test");
        cy.get("#save-image-button").click();
        cy.task("getFile");
        //cy.task("readdir", {path: "user_images"},{timeout: 30000});
        /*
        fs.readdir("user_images",(err,files) => {
            if(err) throw err;
            expect(files[0]).to.equal("admin-test");
        });*/
    });
    //Test dell'API getImage
    it("returns the required image",() => {
        cy.registration("admin","admin");
        cy.login("admin", "admin");
        cy.get("#mostra").click();
        cy.visit("/free_drawing");
        cy.get("#canvas").click();
        cy.get("#title").type("testapi");
        cy.get("#save-image-button").click();
        cy.task("getApiKey").then((api_key) => {
            cy.request("api/getImage?name=testapi&api_key=" + api_key).then((response) => {
                console.log(response);
                expect(parseInt(response.headers['content-length'])).to.not.equal(0);
                expect(response.headers["content-type"]).to.equal("image/png");
            });
        });
    });
});