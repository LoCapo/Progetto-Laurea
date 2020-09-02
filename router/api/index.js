const { Router } = require('express');
const ours_api = require("./routes/ours_api");

module.exports = () => {
    
    const router = Router();
    ours_api(router);

    console.log("API Routes - OK");
    return router;
}