const api = require('../randomWord');
const request = require("supertest");
const app = require("../app.js");
const routes = require("../loaders");

describe("Checking random words function", () => {
    jest.setTimeout(30000);
    test("Returns an array of one element", async () => {
        const word = await api.random(1);
        expect(word.length).toBe(1);
    });

    test('Returns 1 random word', async () => {
        const word = await api.random(1);
        expect(word[0]).toMatch(/.+/);
    });

    test("Returns an array of three elements", async () => {
        const words = await api.random(3);
        expect(words.length).toBe(3);
    });

    test("Returns 3 random words", async () => {
        const words = await api.random(3);
        let text = words.join(",");
        expect(text).toMatch(/.+,.+,.+/);
    });
});  

describe("Checking the translating function", () => {
    /*test("Translates from english to italian", async () => {
        const word = ["dog"];
        return expect(api.translate(word,"it")).resolves[0].toMatch("Cane"); */
    test("Translates from english to italian", async () => {
        const word = ["dog"];
        const translatedWord = await api.translate(word,"it");
        expect(translatedWord[0]).toMatch("Cane");
    });

    test("Translates from english to german", async () => {
        const word = ["dog"];
        const translatedWord = await api.translate(word, "de");
        expect(translatedWord[0]).toMatch("Hund");
    });

    test("Translates from english to french", async () => {
        const word = ["dog"];
        const translatedWord = await api.translate(word, "fr");
        expect(translatedWord[0]).toMatch("Chien");
    });

    test("Translates more words with a single call", async () => {
        const words = ["dog","cat","fish"];
        const translatedWords = await api.translate(words, "it");
        expect(translatedWords).toEqual(["cane","gatto","pesce"]);
    });
}); 


describe("Checking random words function", () => {
    jest.setTimeout(30000);
    
    beforeEach((done) => {
        server = app.listen(4000, (err) => {
            if (err) return done(err);
            agent = request.agent(server);
            done();
        });
    });
    afterEach((done) => {
        return server && server.close(done);
    });

    test("responds with a random word if the request has no parameters", async () => {
        const response = await agent.get("/api/getRandomWord");
        expect(parseInt(response.header['content-length'])).toBeGreaterThan(0);
        expect(response.body[0]).toMatch(/.+/);
        expect(response.status).toBe(200);
    });
    test("responds with 'n' words if the parameter num is set to 'n'", async () => {
        const response = await agent.get("/api/getRandomWord?num=3");
        expect(parseInt(response.header['content-length'])).toBeGreaterThan(0);
        expect(response.body[0]).toMatch(/.+/);
        expect(response.body[1]).toMatch(/.+/);
        expect(response.body[2]).toMatch(/.+/);
        expect(response.status).toBe(200);
    });
    test("responds with a word of a selected language", async () => {
        const response = await agent.get("/api/getRandomWord?lang=it");
        expect(parseInt(response.header['content-length'])).toBeGreaterThan(0);
        expect(response.body[0]).toMatch(/.+/);
        expect(response.status).toBe(200);
    });  


    /*
    test("responds with a random word if the request has no parameters", async () => {
        const response = await request(app).get("/api/getRandomWord");
        expect(parseInt(response.header['content-length'])).toBeGreaterThan(0);
        expect(response.body[0]).toMatch(/.+/);
        expect(response.status).toBe(200);
    });*/
    /*
    test("responds with 'n' words if the parameter num is set to 'n'", async () => {
        const response = await request(app).get("/api/getRandomWord?num=3");
        expect(parseInt(response.header['content-length'])).toBeGreaterThan(0);
        expect(response.body[0]).toMatch(/.+/);
        expect(response.body[1]).toMatch(/.+/);
        expect(response.body[2]).toMatch(/.+/);
        expect(response.status).toBe(200);
    });
    */
   /* 
   test("responds with a word of a selected language", async () => {
       const response = await request(app).get("/api/getRandomWord?lang=it");
       expect(parseInt(response.header['content-length'])).toBeGreaterThan(0);
       expect(response.body[0]).toMatch(/.+/);
       expect(response.status).toBe(200);
       });
       */
});






