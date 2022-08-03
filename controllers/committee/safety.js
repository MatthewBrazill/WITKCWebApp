'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const helper = require('../helper.js')
const members = require('../../data_managers/members')
const trips = require('../../data_managers/trips.js')

const safety = {
    async awardCertificate(req, res) {
        try {
            var data = await helper.viewData(req, 'API')
            var valid = true

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {

                // Validate input
                if (!req.body.memberIds.match(/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}){1}(,[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})*$/i)) valid = false
                if (!req.body.certId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

                if (valid) {
                    var memberIds = req.body.memberIds.split(',')
                    var results = []
                    var success = true
                    for (var memberId of memberIds) results.push(members.awardCert(memberId, req.body.certId))
                    for (var result of results) if (!await result) success = false

                    if (success) res.sendStatus(200)
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

    async revokeCertificate(req, res) {
        try {
            var data = await helper.viewData(req, 'API')
            var valid = true

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {

                // Validate input
                if (!req.body.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                if (!req.body.certId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

                if (valid) {
                    if (await members.revokeCert(req.body.memberId, req.body.certId)) res.sendStatus(200)
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

    async acceptTrip(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await trips.update({
                        tripId: req.body.tripId,
                        approved: true
                    })) res.sendStatus(200)
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

    async rejectTrip(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await trips.update({
                        tripId: req.body.tripId,
                        approved: false
                    })) res.sendStatus(200)
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
    }
}

module.exports = safety