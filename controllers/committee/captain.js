'use strict'

// Imports
const logger = require('../../log.js')
const helper = require('../helper.js')
const members = require('../../data_managers/members')
const trips = require('../../data_managers/trips.js')
const equipment = require('../../data_managers/equipment.js')
const committee = require('../../data_managers/committee.js')

const captain = {
    async verify(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'captain' || data.admin) {

                // Validate input
                if (req.body.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (committee.resolveVerification(req.body.memberId, (req.body.decision == 'true'))) res.sendStatus(200)
                    else res.sendStatus(503)
                } else res.sendStatus(400)
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

    async stats(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'captain' || data.admin) {
                var today = new Date()
                if (today.getMonth() < 9) var lastSeptember = new Date(new Date('2020-09-01').setFullYear(today.getFullYear() - 1))
                else var lastSeptember = new Date(new Date('2020-09-01').setFullYear(today.getFullYear()))

                var m = await members.list()
                var t = await trips.since(lastSeptember)
                var e = await equipment.getAll().then((result) => result.boats)

                var stats = {
                    members: m.length,
                    trips: t.length,
                    boats: e.length
                }
                res.status(200).json(stats)
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
    }
}

module.exports = captain