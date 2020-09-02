Vue.component("Vuecanvas", {
    template: `<canvas class="vuecanvas" :style="{cursor: selectedCursor}" ref="v-canvas" :width="width" :height="height"></canvas>`,
    props: {
        width: {
            default: 300,
        },
        height: {
            default: 300,
        }
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
            host: "",
        };
    },
    mounted() {
        this.host = this.$el.attributes["host"].value;
        this.setCanvas();
        this.bindEvents();
    },
    methods: {
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
            }
        },
        clear() {
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
        saveImage(title) {
            /*  Per sfondo BIANCO => defualt: trasparente
                let myData = this.context.getImageData(
                0,
                0,
                this.width,
                this.height
            );
            let data = myData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 255) {
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = 255;
                    data[i + 3] = 255;
                }
            }
            this.context.putImageData(myData, 0, 0);*/

            this.$refs['v-canvas'].toBlob(blob => {
                this.sendForm(blob,title);
            }, 'image/png');
        },
        sendForm(blob,title) {
            //Invia l'immagine al server in formato BLOB, con il relativo titolo
            console.log(blob);
            let bodyFormData = new FormData();
            bodyFormData.append('file', blob, title);
            let xhr = new XMLHttpRequest();
            xhr.open("POST", `${this.host}/free_drawing/save`, true);
            xhr.onreadystatechange = function() {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    alert(`Immagine salvata correttamente`);

                }
            }
            xhr.send(bodyFormData);
        }

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

var app = new Vue({
    el: "#app",
    data: {
        canvas: "",
        palette: "",
        title: ""
    },
    mounted() {
        this.canvas = this.$refs["myCanvas"];
    },
    methods: {
        changeColor(e) {
            this.canvas.setColor(e.target.value);
            console.log(e.target.value);
        },
        saveImage() {
            console.log('triggered');
            if(this.title && !this.title.includes('-'))
                this.canvas.saveImage(this.title);
            else
                alert(`Inserisci un nome valido per l'immagine`)
        },
        clear() {
            this.canvas.clear();
        },
        redo() {
            this.canvas.redraw();
        }
    },
});
