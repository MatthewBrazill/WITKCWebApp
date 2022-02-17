'use strict'

// Imports
const StatsD = require('hot-shots')
const datadog = new StatsD('localhost', 8125)
const logger = require('../log.js')
const sessions = require('../data_managers/sessions')

const logout = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Logging Out`)
        if (sessions.includes(req.sessionID)) {
            logger.debug(`Session '${req.sessionID}' is Destroyed`)
            sessions.destroy(req.sessionID)
            req.session.destroy()
        }
        datadog.decrement('witkc.loged_in')
        res.redirect('/')
    }
}

module.exports = logout