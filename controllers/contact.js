'use strict'

// Imports
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')

const contact = {
    async get(req, res) {
        var viewData = {
            title: 'Contact Us',
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
        logger.info(`Session '${req.sessionID}': Getting Contact`)
        res.render('contact', viewData)
    },

    async post(req, res) {
        //Build send email function
        logger.error(`Session '${req.sessionID}': Posting Message`)
        res.redirect('/')
    }
}

module.exports = contact