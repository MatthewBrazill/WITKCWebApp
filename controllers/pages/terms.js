'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')

const terms = {
    async terms(req, res) {
        var data = await viewData.get(req, 'Terms and Services')

        logger.info(`Session '${req.sessionID}': Getting Terms and Services`)
        res.render('terms', data)
    },

    async privacy(req, res) {
        var data = await viewData.get(req, 'Privacy Policy')

        logger.info(`Session '${req.sessionID}': Getting Privacy Policy`)
        res.render('privacy', data)
    }
}

module.exports = terms