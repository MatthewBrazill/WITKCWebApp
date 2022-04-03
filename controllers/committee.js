'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')
const members = require('../data_managers/witkc_members.js')

const committee = {
    async get(req, res) {
        var data = await viewData.get(req, 'Committee')
        data.committee = members.getCommittee()
        logger.info(`Session '${req.sessionID}': Getting Committee`)
        res.render('committee', data)
    }
}

module.exports = committee