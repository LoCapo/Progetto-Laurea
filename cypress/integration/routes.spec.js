const { expect } = require("chai");

describe("Testing routes, registration and login", () => {
    //inizio ogni test dalla homepage
    beforeEach(() => {
        cy.visit("/");
    });
    it("starts from the homepage", () => {
        cy.url().then( (url) => {
            expect(url).to.equal("http://localhost:4000/");  
        }); 
    });
    it("moves from the homepage to the login page", () => {
        cy.get("#linktologin").click();
        cy.url().then((url) => {
            expect(url).to.equal("http://localhost:4000/login")
        });
    });
    it("blocks non-authorized requests to the multiplayer page", ()=> {
        cy.get("#multiplayer").click();
        cy.url().then( (url) => {
            expect(url).to.equal("http://localhost:4000/login");
        });
    });
    it("blocks non-authorized requests to the free drawing page", () => {
        cy.get("#disegnolibero").click();
        cy.url().then((url) => {
            expect(url).to.equal("http://localhost:4000/login");
        });
    });
    it("creates a new account", () => {
        cy.get("#linktologin").click();
        cy.get("#reg-username").type("admin");
        cy.get("#reg-password").type("admin");
        cy.get("#reg-submit").click();
        cy.url().then((url) => {
            expect(url).to.equal("http://localhost:4000/room")
        });
    });
    it("redirects to the homepage after the logout", () => {
        cy.registration("admin", "admin");
        cy.visit("/login");
        cy.get("#log-username").type("admin");
        cy.get("#log-password").type("admin");
        cy.get("#log-submit").click();
        cy.get("#login-logout").click();
        cy.url().then((url) =>{
            expect(url).to.equal("http://localhost:4000/")
        });    
    });
    it("fails to create an account if the username is already taken", () => {
        cy.registration("admin","admin");
        cy.get("#linktologin").click();
        cy.get("#reg-username").type("admin");
        cy.get("#reg-password").type("admin");
        cy.get("#reg-submit").click();
        cy.url().then((url) => {
            expect(url).to.equal("http://localhost:4000/login/registrazione");
        });
    });
    it("fails to create an account if the username contains the character '-'", () => {
        cy.get("#linktologin").click();
        cy.get("#reg-username").type("admin-");
        cy.get("#reg-password").type("admin");
        cy.get("#reg-submit").click();
        cy.url().then((url) => {
            expect(url).to.equal("http://localhost:4000/login/registrazione");
        });
    });
    it("creates a multiplayer room", () =>{
        cy.registration("admin","admin");
        cy.login("admin","admin");
        cy.get("#room-name").type("test");
        cy.get("#room-password").type("password");
        cy.get("#room-submit").click();
        cy.url().then((url)=>{
            expect(url).to.equal("http://localhost:4000/room/draw");
        })
    });
    it("creates a singleplayer room", () => {
        cy.registration("admin", "admin");
        cy.login("admin", "admin");
        cy.get("#disegno-libero").click();
        cy.url().then((url) => {
            expect(url).to.equal("http://localhost:4000/free_drawing");
        });
    });

})