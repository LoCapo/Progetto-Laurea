const api = require('../randomWord');

describe("Checking random words API", () => {
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
//npm run test --detectOpenHandles
describe("Checking translating function", () => {
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

