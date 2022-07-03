'use strict'

// Imports
const logger = require('./log.js')


const api = {
    async check(req, res) {
        try {
            if (req.session.allow_cookies) res.status(200).json({ allow_cookies: true })
            else res.status(200).json({ allow_cookies: false })
        } catch (err) { res.status(500).json(err) }
    },

    async allow(req, res) {
        try {
            if (req.body.allow_cookies == 'true' || req.body.allow_cookies == 'false') {
                if (req.body.allow_cookies == 'true') req.session.allow_cookies = true
                res.sendStatus(200)
            } else res.sendStatus(400)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = api