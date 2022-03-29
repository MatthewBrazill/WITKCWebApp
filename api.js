'use strict'

// Imports
const logger = require('./log.js')
const members = require('./data_managers/witkc_members.js')


const api = {
    async existsUsername(req, res) {
        logger.info(`API Request: Username Exists`)
        if (members.resolveUsername(req.param.username) === null) res.send('false')
        else res.send('true')
    },

    async getCookie(req, res) {
        if (req.session.allow_cookies) res.status(200).json({ allow_cookies: true })
        else res.status(200).json({ allow_cookies: false })
    },

    async postCookie(req, res) {
        if (req.body.allow_cookies == 'true' || req.body.allow_cookies == 'false') {
            if (req.body.allow_cookies == 'true') req.session.allow_cookies = true
            res.sendStatus(200)
        } else {
            res.sendStatus(400)
        }
    }
}

module.exports = api