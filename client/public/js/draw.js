Vue.component("Vuecanvas", {
    template: `<canvas class="vuecanvas" :style="{cursor: selectedCursor}" ref="v-canvas" :width="width" :height="height"></canvas>`,
    props: {
        width: {
            default: 300,
        },
        height: {
            default: 300,
        },
        mode: {
            default: "offline",
        },
        socket: "",
    },
    data() {
        return {
            lastScroll: "",
            context: null,
            isDrawing: false,
            history: [], //Vettore che conserva tutti i tratti effettuati
            point: {
                x: Number,
                y: Number,
            },
            lastStrokeHistory: [0],
            selectedColor: "",
            lineWidth: Number,
            currentOperation: "",
            availableColors: {
                red: "#ff0000",
                orange: "#ffc400",
                yellow: "#ffff00",
                purple: "#c400c4",
                green: "#00c400",
                greenyellow: "#a7ffa4",
                blue: "#0000ff",
                turquoise: "#74f7fc",
                brown: "#994e1c",
                beige: "#f0ba69",
                black: "#000000",
                white: "#ffffff",
            },
            //Online Variables
            //Drawer
            buffer: [],
        };
    },
    mounted() {
        this.socket.off("completeImage");
        this.socket.off("getImageState");
        this.socket.off("strokes");
        this.socket.off("clearDrawing");
        this.socket.off("redraw");
        this.setCanvas();
        if (this.mode === "drawer" || this.mode === "offline")
            this.bindEvents();
        this.subscription();
    },
    methods: {
        subscription() {
            if (this.mode === "watch") {
                this.socket.on(
                    "completeImage",
                    ((data) => {
                        console.log("received image");
                        this.history = data.history;
                        this.context.clearRect(0, 0, this.width, this.height);
                        data.history.forEach((stroke) => this._redraw(stroke));
                    }).bind(this)
                );

                this.socket.on(
                    "strokes",
                    ((strokes) => {
                        strokes.forEach((stroke) => {
                            this.history.push(stroke);
                            this._redraw(stroke);
                        });
                    }).bind(this)
                );

                this.socket.on(
                    "clearDrawing",
                    (() => {
                        this.clear();
                    }).bind(this)
                );

                this.socket.on(
                    "redraw",
                    ((lastHistory) => {
                        this.lastStrokeHistory = [0];
                        for (let i = 0; i < lastHistory.length; i++) {
                            this.lastStrokeHistory.push(lastHistory[i]);
                        }
                        this.redraw();
                    }).bind(this)
                );
            } else if (this.mode === "drawer") {
                this.socket.on("getImageState", this.sendState);

                setInterval(this.dispatcher, 20);
            }
        },
        sendState() {
            this.socket.emit("imageState", { history: this.history });
        },
        dispatcher() {
            if (this.buffer) {
                const temp = this.buffer.map((x) => x);
                for (let i = 0; i < temp.length; i++) {
                    switch (temp[i].action) {
                        case "strokes":
                            let strokes = [];
                            strokes.push(temp[i].stroke);
                            while (
                                temp[i + 1] &&
                                temp[i + 1].action === "strokes"
                            ) {
                                strokes.push(temp[++i].stroke);
                            }
                            this.socket.emit("strokes", strokes);
                            break;
                        case "clear":
                            this.socket.emit("clearDrawing");
                            break;
                        case "redraw":
                            this.socket.emit("redraw", temp[i].lastHistory);
                            break;
                        default:
                            console.log("azione non riconosciuta :(");
                    }
                }
                this.buffer.splice(0, temp.length);
            }
        },
        newStroke(eventPoint) {
            return {
                operation: this.context.globalCompositeOperation,
                strokeColor: this.context.strokeStyle,
                strokeWidth: this.context.lineWidth,
                from: {
                    x: this.point.x,
                    y: this.point.y,
                },
                to: {
                    x: eventPoint.offsetX,
                    y: eventPoint.offsetY,
                },
            };
        },
        setCanvas() {
            this.context = this.$refs["v-canvas"].getContext("2d");
            this.isDrawing = false;
            this.history = [];
            this.point.x = 0;
            this.point.y = 0;
            this.currentOperation = "source-over";
            this.context.globalCompositeOperation = this.currentOperation;
            this.selectedColor = "#000000";
            this.context.strokeStyle = this.selectedColor;
            this.lineWidth = 8;
            this.context.lineWidth = this.lineWidth;
            this.context.lineCap = "round";
            this.context.lineJoin = "round";
        },
        bindEvents() {
            this.$refs["v-canvas"].addEventListener("mousedown", (event) => {
                if (window.getSelection().focusNode != null) {
                    window.getSelection().removeAllRanges();
                }
                if (!this.isDrawing) {
                    this.isDrawing = true;
                    this.$refs["v-canvas"].addEventListener(
                        "mousemove",
                        this.draw
                    );
                }
                [this.point.x, this.point.y] = [event.offsetX, event.offsetY];
                this.draw(event);
            });
            this.$refs["v-canvas"].addEventListener("mouseup", () => {
                if (this.isDrawing) {
                    this.isDrawing = false;
                    this.$refs["v-canvas"].removeEventListener(
                        "mousemove",
                        this.draw
                    );
                    this.lastStrokeHistory.push(this.history.length);
                }
            });
            this.$refs["v-canvas"].addEventListener("wheel", (e) => {
                e.preventDefault();
                if (e.deltaY <= -1) {
                    //Movimento rotellina in su
                    if (this.lineWidth < 28) {
                        this.lineWidth += 2;
                        this.context.lineWidth = this.lineWidth;
                    }
                } else if (e.deltaY >= 1)
                    if (this.lineWidth > 4) {
                        //Movimento rotellina in giù
                        this.context.lineWidth = this.lineWidth;
                        this.lineWidth -= 2;
                    }
            });
            this.$refs["v-canvas"].addEventListener("mouseout", () => {
                if (this.isDrawing) {
                    this.isDrawing = false;
                    this.$refs["v-canvas"].removeEventListener(
                        "mousemove",
                        this.draw
                    );
                    this.lastStrokeHistory.push(this.history.length);
                }
            });
        },
        setColor(color) {
            let reg = /#[0-9A-Fa-f]{6}/;
            this.selectedColor = color;
            if (!this.selectedColor && this.selectedColor.match(reg))
                this.context.strokeStyle = this.selectedColor = "#000000";
            else this.context.strokeStyle = this.selectedColor;
        },
        redraw() {
            //Funzione per il tasto "indietro", ridisegna i tratti tranne l'ultimo
            if (this.lastStrokeHistory.length < 2) return;
            if (this.mode === "drawer") {
                this.buffer.push({
                    action: "redraw",
                    lastHistory: [...this.lastStrokeHistory],
                });
            }
            let index = this.lastStrokeHistory[
                this.lastStrokeHistory.length - 2
            ];
            if (this.history.length < index) return;
            this.context.clearRect(0, 0, this.width, this.height);
            this.history.length = index;
            this.lastStrokeHistory.pop();
            this.history.forEach((stroke) => this._redraw(stroke));
            this.context.globalCompositeOperation = this.currentOperation;
            this.context.strokeStyle = this.selectedColor;
            this.context.lineWidth = this.lineWidth;
        },
        _redraw(stroke) {
            this.context.globalCompositeOperation = stroke.operation;
            this.context.strokeStyle = stroke.strokeColor;
            this.context.lineWidth = stroke.strokeWidth;
            this.context.beginPath();
            this.context.moveTo(stroke.from.x, stroke.from.y);
            this.context.lineTo(stroke.to.x, stroke.to.y);
            this.context.stroke();
        },
        draw(event) {
            if (!this.isDrawing) return;
            else {
                this.context.beginPath();
                let stroke = this.newStroke(event);
                this.context.moveTo(stroke.from.x, stroke.from.y);
                this.context.lineTo(stroke.to.x, stroke.to.y);
                this.context.stroke();
                [this.point.x, this.point.y] = [stroke.to.x, stroke.to.y];
                this.history.push(stroke);
                if (this.mode === "drawer")
                    this.buffer.push({ action: "strokes", stroke: stroke });
            }
        },
        clear() {
            if (this.mode === "drawer") this.buffer.push({ action: "clear" });
            this.context.clearRect(0, 0, this.width, this.height);
            this.lastStrokeHistory = [0];
            this.history = [];
        },

        //SOCKET FUNCTIONS//

        //WATCH ONLY
        drawReceived(stroke) {
            this.context.globalCompositeOperation = stroke.operation;
            this.context.strokeStyle = stroke.strokeColor;
            this.context.lineWidth = stroke.strokeWidth;
            this.context.beginPath();
            this.context.moveTo(stroke.from.x, stroke.from.y);
            this.context.lineTo(stroke.to.x, stroke.to.y);
            this.context.stroke();
            this.history.push(stroke);
        },

        //DRAWER ONLY
    },
    computed: {
        selectedCursor() {
            //Cursore dinamico
            return `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cellipse opacity='${
                this.isDrawing ? "1" : "0.3"
            }' stroke='%23000' ry='15' rx='15' id='svg_2' cy='16' cx='16' stroke-opacity='null' stroke-width='2' fill='none'/%3E%3Cellipse ry='${
                this.lineWidth / 2
            }' rx='${this.lineWidth / 2}' id='svg_3' cy='16' cx='16' opacity='${
                this.isDrawing ? "1" : "0.3"
            }' stroke-width='1.5' stroke='%23000' fill='none'/%3E%3C/g%3E%3C/svg%3E") 16 16, pointer`;
        },
        fillSelector() {
            if (this.currentOperation == "source-over")
                return `%23${this.selectedColor.substring(1)}`;
            else return "none";
        },
    },
});

Vue.component("Vueword", {
    template: `<h1 class="display-5">{{laparola}}</h1>`,
    props: {
        socket: "",
    },
    data() {
        return {
            laparola: "",
        };
    },
    mounted() {
        this.socket.on("word", (data) => {
            this.laparola = data;
        });
    },
});

Vue.component("Vuewinner", {
    template: `
                <div :style="display" class="alert alert-success" role="alert">
                    Il vincitore è {{winner}}! [Prossima partita in: {{gameTimer}}]
                </div>`,

    props: {
        socket: "",
        display: {
            default: "display: none;",
        },
    },
    data() {
        return {
            winner: "",
            gameTimer: "",
        };
    },
    mounted() {
        this.socket.on("winner", (data) => {
            this.winner = data.username;
            this.display = "";
        });
        this.socket.on("gameTimer", (data) => {
            if(data == 0)
                this.display = "display: none;";
            else
                this.gameTimer = data;
        });
    },
});

Vue.component("Vuechat", {
    template: `<div>
            <div class="message-box" id="messageBox">
                <div v-for="(message, index) in messages" :key="index" class="message">
                    <b>{{message.user}}</b>: {{message.text}}
                </div>
            </div>
            <input type="text" @keydown="send($event)"/>
        </div>`,
    props: {
        socket: "",
    },
    data() {
        return {
            messages: [],
        };
    },
    mounted() {
        this.socket.on("message", (data) => {
            this.messages.push(data);
            this.$nextTick(() => {
                let box = document.getElementById("messageBox");
                this.updateScroll();
            });
        });
    },
    methods: {
        send(e) {
            if (e.keyCode == 13) {
                if (e.target.value) {
                    let data = e.target.value;
                    this.socket.emit("message", data);
                    e.target.value = "";
                }
            }
        },
        updateScroll() {
            let element = document.getElementById("messageBox");
            if (
                element.scrollHeight -
                    element.clientHeight -
                    element.scrollTop <
                60
            ) {
                element.scrollTop = element.scrollHeight;
            }
        },
    },
});

Vue.component("Vueusers", {
    template: `
    <div>
        <div v-for="(user, index) in users" :key="index" class="card mb-2" >
            <div class="card-header">
                <p><span v-if="drawer == user.id"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M11.293 1.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.39.242l-3 1a1 1 0 0 1-1.266-1.265l1-3a1 1 0 0 1 .242-.391l9-9zM12 2l2 2-9 9-3 1 1-3 9-9z"/>
                            <path fill-rule="evenodd" d="M12.146 6.354l-2.5-2.5.708-.708 2.5 2.5-.707.708zM3 10v.5a.5.5 0 0 0 .5.5H4v.5a.5.5 0 0 0 .5.5H5v.5a.5.5 0 0 0 .5.5H6v-1.5a.5.5 0 0 0-.5-.5H5v-.5a.5.5 0 0 0-.5-.5H3z"/>
                            </svg> | </span>{{user.username}} </p>
            </div>
            <div class="card-body">
                <blockquote class="blockquote mb-0">
                    <p>Points:{{user.points}}</p>
                    <span v-if="drawer == user.id && !roundTimer">
                        <footer class="blockquote-footer"><cite title="Source Title">Disegnatore</cite></footer>
                    </span>
                    <span v-if="drawer == user.id && roundTimer">
                        <footer class="blockquote-footer"><cite title="Source Title">Prossimo disegnatore in: {{roundTimer}}</cite></footer>
                    </span>
                </blockquote>
            </div>
        </div>
    </div>`,
  props: {
        socket: "",
    },
    data() {
        return {
            users: [],
            drawer: "",
            roundTimer: "",
        };
    },
    mounted() {
        this.socket.on("users", (data) => {
            this.users = data.users;
            this.drawer = data.drawer;
        });
        this.socket.on("roundTimer", (data) => {
            this.roundTimer = data;
        });
        this.socket.on("setDrawer", (data) => {
            this.drawer = data;
        });
        this.socket.on("points", (data) => {
            this.users = data;
        });
    },
});

var app = new Vue({
    el: "#app",
    data: {
        socket: "",
        canvasMode: "drawer",
        room: "",
        pass: "",
        timer: "",
        username: "",
        users: [],
        match_start: false,
        canvas: "",
        palette: "",
        host: "",
    },
    beforeMount: function () {
        this.room = this.$el.attributes["room"].value;
        this.pass = this.$el.attributes["pass"].value;
        this.username = this.$el.attributes["username"].value;
        this.host = this.$el.attributes["host"].value;
        this.canvas = this.$refs["myCanvas"];
        console.log(this.host);
        this.socket = io(this.host);
    },
    mounted() {
        let data = {
            id: this.room,
            password: this.pass,
            username: this.username,
        };
        this.socket.on("notExists", () => {
            window.location.replace(this.host + "/room");
        });
        this.socket.on(
            "timerEvent",
            ((data) => {
                this.timer = data;
            }).bind(this)
        );
        this.socket.on("setMode", (data) => {
            this.canvasMode = data;
        });
        this.socket.emit("join", data);

        this.socket.on("points", (data) => {
            console.log(data);
        });
    },
    methods: {
        change() {
            if (this.canvasMode == "drawer") this.canvasMode = "watch";
            else this.canvasMode = "drawer";
            this.canvas = this.$refs["myCanvas"];
        },
        start(e) {
            if (!this.match_start) {
                this.socket.emit("startGame");
                e.target.disabled = true;
            }
        },
        changeColor(e) {
            this.canvas = this.$refs["myCanvas"];
            this.canvas.setColor(e.target.value);
            console.log(e.target.value);
        },
        clear() {
            this.canvas = this.$refs["myCanvas"];
            this.canvas.clear();
        },
        redo() {
            this.canvas = this.$refs["myCanvas"];
            this.canvas.redraw();
        }
    },
});
