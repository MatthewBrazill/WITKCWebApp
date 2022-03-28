'use strict'

// Imports
const logger = require('./log.js')
const members = require('./data_managers/witkc_members.js')


const api = {
    async existsUsername(req, res) {
        logger.info(`API Request: Username Exists`)
        if (members.resolveUsername(req.param.username) === null) res.send('false')
        else res.send('true')
    }
}

module.exports = api