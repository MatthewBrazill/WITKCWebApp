'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const privacy = {
    async get(req, res) {
        var data = await viewData.get(req, 'Privacy Policy')
        logger.info(`Session '${req.sessionID}': Getting Privacy Policy`)
        res.render('privacy', data)
    }
}

module.exports = privacy