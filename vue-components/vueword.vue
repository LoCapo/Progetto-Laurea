//Vue.component("Vueword", {
const Vueword = {    
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
};