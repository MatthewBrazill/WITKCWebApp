'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const home = {
    async get(req, res) {
        var data = await viewData.get(req, 'Home')
        logger.info(`Session '${req.sessionID}': Getting Home`)
        res.render('home', data)
    }
}

module.exports = home