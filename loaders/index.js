const expressLoader = require('./express');
const templateLoader = require('./template')
const axios = require('axios')

module.exports = async (app) => {
    await expressLoader(app);
    console.log('Express server initialized');
    await templateLoader(app);
    console.log('Template loader initialized');    
}