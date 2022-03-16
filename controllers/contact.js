'use strict'

// Imports
const logger = require('../log.js')
const sessions = require('../data_managers/sessions')
const members = require('../data_managers/witkc_members')

const contact = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Contact`)
        var viewData = {
            title: 'Contact Us',
            logged_in: false
        }

        if (await sessions.includes(req.sessionID)) {
            logger.debug(`Session '${req.sessionID}' Exists`)
            if (await members.exists(req.session.userId)) {
                logger.debug(`Session '${req.sessionID}' is Logged In`)
                var member = await members.get(req.session.userId)
                viewData.logged_in = true
                viewData.name = `${member.firstName} ${member.lastName}`
                viewData.date_joined = member.dateJoined
            }
        } else {
            logger.debug(`Session '${req.sessionID}' is Created`)
            sessions.create(req.sessionID)
        }
        res.render('contact', viewData)
    },

    async post(req, res) {
        //Build send email function
        logger.error(`Session '${req.sessionID}': Posting Message`)
        res.redirect('/')
    }
}

module.exports = contact