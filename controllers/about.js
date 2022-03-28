'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const about = {
    async get(req, res) {
        var data = await viewData.get(req, 'About Us')
        logger.info(`Session '${req.sessionID}': Getting About`)
        res.render('about', data)
    }
}

module.exports = about