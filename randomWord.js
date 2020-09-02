const fs = require("fs");
const express = require("express");
const config = require("./config");
const unirest = require("unirest");

module.exports = {
    random(num = 1) {
        return new Promise((resolve, reject) => {
            fs.readFile("names.txt", "utf8", (err, data) => {
                if (err) {
                    return console.log(err);
                }
                let names = data.split("\n").map((x) => x.trim());

                let words = [];
                for (let i = 0; i < num; i++) {
                    words.push(names[Math.floor(Math.random() * names.length)]);
                }

                resolve(words);
            });
        });
    },
    
    translate(words, lang) {
        return new Promise((resolve, reject) => {
            let text = words.join(", ");
            let result;
            var req = unirest("POST", "https://microsoft-translator-text.p.rapidapi.com/translate");

            req.query({
                "profanityAction": "NoAction",
                "textType": "plain",
                to: lang,
                "api-version": "3.0"
            });

            req.headers({
                "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
                "x-rapidapi-key": config.translate_key,
                "content-type": "application/json",
                accept: "application/json",
                useQueryString: true,
            });

            req.type("json");
            req.send([
                {
                    "Text": text
                }
            ]);

            req.end(function (res) {
                if (res.error) {
                    console.log(res.error.status);
                    reject();
                } else {
                    result = res.body[0].translations[0].text;/*
                    result = result.replace(/, il /g, ", ");
                    result = result.replace(/, lo /g, ", ");
                    result = result.replace(/, la /g, ", ");
                    result = result.replace(/, i /g, ", ");
                    result = result.replace(/, gli /g, ", ");
                    result = result.replace(/, le /g, ", ");*/
                    result = result.split(", ");
                    resolve(result);
                }
            });
        });
    },
};

