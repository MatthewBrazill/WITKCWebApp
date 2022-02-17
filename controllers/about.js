'use strict'

// Imports
const logger = require('../log.js')
const sessions = require('../data_managers/sessions')
const members = require('../data_managers/witkc_members')

const about = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting About`)
        var viewData = {
            title: 'About Us',
            logged_in: false
        }

        if (sessions.includes(req.sessionID)) {
            logger.debug(`Session '${req.sessionID}' Exists`)
            if (members.exists(req.session.userId)) {
                logger.debug(`Session '${req.sessionID}' is Logged In`)
                var member = members.getWithId(req.session.userId)
                viewData.logged_in = true
                viewData.name = `${member.firstName} ${member.lastName}`
                viewData.date_joined = member.dateJoined
            }
        } else {
            logger.debug(`Session '${req.sessionID}' is Created`)
            sessions.create(req.sessionID)
        }
        res.render('about', viewData)
    }
}

module.exports = about