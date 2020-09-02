const dotenv = require('dotenv');
const env = dotenv.config();

if (env.error) {
    throw new Error('Missing .env file');
}

module.exports = {
    serverURI: process.env.serverURI || "localhost",
    port: process.env.port || 4000,
    external_uri: process.env.EXT_URI || "http://"+process.env.serverURI + ":" + process.env.port,
    
    //database
    db_username: process.env.DB_USERNAME || "admin",
    db_password: process.env.DB_PASSWORD || "admin",
    db_database_name: process.env.DB_DATABASE_NAME || "",
    db_document: process.env.DB_DOC_ID || "",
    db_document_facebook: process.env.DB_DOC_ID_FB || "",

    //facebook oauth
    fb_client_id: process.env.FB_CLIENT_ID || "",
    fb_redirect_uri: "http://"+process.env.serverURI + ":" + process.env.port +  process.env.FB_REDIRECT_URI || "",
    //fb_redirect_uri: process.env.FB_REDIRECT_URI || "",
    fb_state_param: process.env.FB_STATE || "",
    fb_client_secret: process.env.FB_CLIENT_SECRET || "",

    //traslate api
    translate_key: process.env.TRANSLATE_KEY || "",

    //jwtSecret:

    api: {
        prefix: "/api",
    },
    client: {
        prefix: "/",
    },
};

