'use strict'

// Imports
const logger = require('../log.js')
const sessions = require('../data_managers/sessions')

const logout = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Logging Out`)
        if (await sessions.includes(req.sessionID)) {
            logger.debug(`Session '${req.sessionID}' is Destroyed`)
            sessions.destroy(req.sessionID)
            req.session.destroy()
        }
        res.redirect('/')
    }
}

module.exports = logout