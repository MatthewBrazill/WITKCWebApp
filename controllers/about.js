'use strict'

// Imports
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')

const about = {
    async get(req, res) {
        var viewData = {
            title: 'About Us',
            logged_in: false
        }

        if (req.session.userID != undefined) {
            if (await members.exists(req.session.userID)) {
                logger.debug(`Session '${req.sessionID}' is Logged In`)
                var member = await members.get(req.session.userID)
                viewData.logged_in = true
                viewData.member = member
            }
        }
        logger.info(`Session '${req.sessionID}': Getting About`)
        res.render('about', viewData)
    }
}

module.exports = about