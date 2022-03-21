'use strict'

// Imports
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')

const viking = {
    async get(req, res) {
        var viewData = {
            title: 'My Viking',
            logged_in: false
        }

        if (req.session.userID != undefined) {
            if (await members.exists(req.session.userID)) {
                logger.debug(`Session '${req.sessionID}' is Logged In`)
                var member = await members.get(req.session.userID)
                viewData.logged_in = true
                viewData.member = member
                logger.info(`Session '${req.sessionID}': Getting Home`)
                res.render('viking', viewData)
                return
            }
        }
        
        res.redirect('/')
    },

    async post() {
        res.redirect('/my_viking')
    }
}

module.exports = viking