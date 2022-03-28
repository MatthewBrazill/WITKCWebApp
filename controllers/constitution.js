'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const constitution = {
    async get(req, res) {
        var data = await viewData.get(req, 'Constitution')
        logger.info(`Session '${req.sessionID}': Getting Constitution`)
        res.render('constitution', data)
    }
}

module.exports = constitution