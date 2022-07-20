'use strict'

// Imports
const helper = require('../helper.js')
const certs = require('../../data_managers/certificates.js')
const logger = require('../../log.js')


const certificates = {
    async list(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Autheticate safety officer
            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {
                var result = await certs.list()
                if (result !== null) res.status(200).json(result)
                else res.sendStatus(404)
            } else res.sendStatus(403)
            else res.sendStatus(401)
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
}

module.exports = certificates