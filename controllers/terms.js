'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const terms = {
    async get(req, res) {
        var data = await viewData.get(req, 'Terms and Services')

        logger.info(`Session '${req.sessionID}': Getting Terms and Services`)
        res.render('terms', data)
    }
}

module.exports = terms