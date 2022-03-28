'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const committee = {
    async get(req, res) {
        var data = await viewData.get(req, 'Committee')
        logger.info(`Session '${req.sessionID}': Getting Committee`)
        res.render('committee', data)
    }
}

module.exports = committee