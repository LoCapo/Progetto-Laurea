const { Router } = require("express");
const config = require("../../../config");
const router = Router();

module.exports = (app) => {
    app.use("/", router);

    router.get("/", (req, res) => {    
        if(req.session.token || req.session.api_key){
            res.render("home/home", {
            login_path: "/login/logout",
            button_color: "danger",
            button_text: "Logout"})
        }
        else {
            res.render("home/home", {
            login_path: "/login",
            button_color: "success",
            button_text: "Login",
            });
        }
    });
};
