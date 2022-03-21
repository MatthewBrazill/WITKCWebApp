'use strict'

// Imports
const logger = require('../log.js')

const logout = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Logging Out`)
        req.session.destroy()
        res.redirect('/')
    }
}

module.exports = logout