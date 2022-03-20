'use strict'

// Imports
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')

const committee = {
    async get(req, res) {
        var viewData = {
            title: 'Committee',
            logged_in: false
        }

        if (req.session.userID != undefined) {
            if (await members.exists(req.session.userID)) {
                logger.debug(`Session '${req.sessionID}' is Logged In`)
                var member = await members.get(req.session.userID)
                viewData.logged_in = true
                viewData.name = `${member.firstName} ${member.lastName}`
                viewData.date_joined = member.dateJoined
            }
        }
        logger.info(`Session '${req.sessionID}': Getting Committee`)
        res.render('committee', viewData)
    }
}

module.exports = committee