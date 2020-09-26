// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("registration", (username,password) => {
    cy.visit("/login");
    cy.get("#reg-username").type("admin");
    cy.get("#reg-password").type("admin");
    cy.get("#reg-submit").click();
    cy.get("#login-logout").click();
});

Cypress.Commands.add("login",(username,password) => {
    cy.visit("/login")
    cy.get("#log-username").type("admin");
    cy.get("#log-password").type("admin");
    cy.get("#log-submit").click();
});