'use strict'

// Imports
const logger = require('../../log.js')

const cookies = {
    async check(req, res) {
        try {
            // If allow_cookies is set, cookies are allowed, if not, not
            if (req.session.allow_cookies) res.status(200).json({ allow_cookies: true })
            else res.status(200).json({ allow_cookies: false })
        } catch (err) {
            logger.error({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                error: err,
                stack: err.stack,
                message: `${req.method} ${req.url} Failed => ${err}`
            })
            res.status(500).json(err)
        }
    },

    async allow(req, res) {
        try {
            // Validate input
            if (req.body.allow_cookies == 'true' || req.body.allow_cookies == 'false') {

                // Set cookie to allowed
                if (req.body.allow_cookies == 'true') {
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `Allowed Cookies`
                    })
                    req.session.allow_cookies = true
                }
                res.sendStatus(200)
            } else res.sendStatus(400)
        } catch (err) {
            logger.error({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                error: err,
                stack: err.stack,
                message: `${req.method} ${req.url} Failed => ${err}`
            })
            res.status(500).json(err)
        }
    }
}

module.exports = cookies