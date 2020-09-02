const getRandomWord = require("../../randomWord");

var rooms = {};

class Room {
    constructor(id, password, io, lang='en') {
        this.id = id;
        this.password = password;
        this.users = [];
        this.drawer = null;
        this.io = io;
        this.timer = 15;
        this.round = 1;
        this.running = false;
        this.ended = false;
        this.empty = false;
        this.word = "prova";
        this.interval = null;
        this.started = false;
        this.guessed = {};
        this.lang = lang;
    }
    addUser(user, username) {
        this.users.push({
            id: user,
            username: username,
            points: 0,
        });
        if (this.users.length == 1)
            this.drawer = {
                id: user,
                position: 0,
            };
        if (user == this.drawer.id) this.io.to(user).emit("setMode", "drawer");
        else this.io.to(user).emit("setMode", "watch");
        this.sendUsers();
    }
    removeUser(user) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id == user) {
                if (user == this.drawer.id) {
                    this.assignDrawer();
                    if (this.drawer.position > 0) this.drawer.position--;
                    //console.log("uscito il disegnatore");
                }
                this.users.splice(i, 1);
                if (this.users.length <= 0) this.empty = true;
            }
        }
        this.sendUsers();
    }
    assignDrawer() {
        if (this.users[this.drawer.position + 1]) {
            this.drawer.id = this.users[++this.drawer.position].id;
        } else if (this.users[0]) {
            this.drawer.id = this.users[0].id;
            this.drawer.position = 0;
            if (this.round == 1) this.ended = true;
            else this.round--;
        } else this.empty = true;

        this.users.forEach((user) => {
            //console.log(user.id, this.drawer.id);
            if (user.id == this.drawer.id)
                this.io.to(user.id).emit("setMode", "drawer");
            else {
                this.io.to(user.id).emit("setMode", "watch");
            }
        });
        this.io.to(this.id).emit("setDrawer", this.drawer.id);
    }
    getWinner() {
        let winner = {
            points: -1,
        };
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].points >= winner.points) {
                winner = this.users[i];
            }
        }
        return winner;
    }
    addPoints(userid) {
        this.users.forEach((user) => {
            if (user.id == userid) {
                user.points += this.timer;
                return;
            }
        });
        this.sendUsers()
    }
    checkWord(userid, word) {
        if (this.running){
        //console.log(word.trim().toLowerCase(), this.word.trim().toLowerCase());
            if (
                userid != this.drawer.id &&
                !this.guessed[userid] &&
                word.trim().toLowerCase() == this.word.trim().toLowerCase()
            ) {
                this.guessed[userid] = true;
                this.addPoints(userid);
                this.io.to(userid).emit("word", this.word);
            }
        }
    }
    sendUsers() {
        //console.log("sendingUsers");
        let data = {
            users: this.users,
            drawer: this.drawer.id,
        };
        this.io.to(this.id).emit("users", data);
    }

    roundPause() {
        var roundTimer = 5;
        var roundInterval = setInterval(
            (() => {
                if (roundTimer <= 0) {
                    this.start();
                    clearInterval(roundInterval);
                } else roundTimer--;
                this.io.to(this.id).emit("roundTimer", roundTimer);
            }).bind(this),
            1000
        );
    }
    gamePause() {
        var gameTimer = 5;
        var gameInterval = setInterval(
            (() => {
                if (gameTimer <= 0) {
                    this.users.forEach((user) => {
                        user.points = 0;
                    })
                    this.sendUsers();
                    this.round=1;
                    this.ended = false;  //aaaaaaaaaaa
                    this.start();
                    clearInterval(gameInterval);
                } else gameTimer--;
                this.io.to(this.id).emit("gameTimer", gameTimer);
            }).bind(this),
            1000
        );
    }
    start() {
        if (this.ended) {
            this.io.to(this.id).emit("winner", this.getWinner());
            //console.log("vincitore: ", this.getWinner());
            this.gamePause();
            return;
        }
        if (!this.running && this.round > 0) {
            getRandomWord
                .random()
                .then((word) => {this.word = word[0]}).then(() => {
                    if(this.lang != 'en')
                        return getRandomWord.translate([this.word], this.lang)
                    .then(tradotto => {//console.log('tradotto');
                                        this.word = tradotto[0]}).catch((err) => console.log(err))})
                .then(() => { 
                    //console.log('prima io')
                    this.running = true;
                    //console.log(this.word);
                    //console.log(this.drawer);
                    this.guessed = {};
                    this.users.forEach((user) => {
                        let data;
                        if (user.id == this.drawer.id) data = this.word;
                        else {
                            data = "_ ".repeat(this.word.length);
                        }
                        this.io.to(user.id).emit("word", data);
                    });

                    this.interval = setInterval(
                        (() => {
                            if (this.timer <= 0) {
                                this.timer = 15;
                                this.running = false;
                                this.assignDrawer();
                                clearInterval(this.interval);
                                this.users.forEach((user) => this.io.to(user.id).emit("word", this.word))
                                this.roundPause();
                            } else this.timer--;
                            this.io.to(this.id).emit("timerEvent", this.timer);
                        }).bind(this),
                        1000
                    );
                });
        }
    }
}

module.exports = {
    rooms,
    createRoom(id, password, io, lang='en') {
        rooms[id] = new Room(id, password, io, lang);
        return id;
    },
    checkRoom(id, password) {
        if (rooms[id]) {
            //corrisponde ID
            if (rooms[id].password == password) return "ok";
            //password errata
            else return "password";
        } else return "notExist";
    },
};
