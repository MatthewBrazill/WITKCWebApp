'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const viewData = require('../../view_data.js')
const members = require('../../data_managers/witkc_members')
const trips = require('../../data_managers/trips.js')

const safety = {
    async award(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {
                // Server-Side Validation
                if (!req.body.memberIds.match(/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}){1}(,[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})*$/i)) valid = false
                if (!req.body.certId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

                if (valid) {
                    var memberIds = req.body.memberIds.split(',')
                    for (var memberId of memberIds) members.awardCert(memberId, req.body.certId)
                    res.sendStatus(200)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async revoke(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.loggedIn) {
                if (data.committee == 'safety' || data.admin) {

                    // Server-Side Validation
                    if (!req.body.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                    if (!req.body.certId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

                    if (valid) {
                        members.revokeCert(req.body.memberId, req.body.certId)
                        res.sendStatus(200)
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async accept(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) {
                if (data.committee == 'safety' || data.admin) {
                    if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                        trips.update({
                            tripId: req.body.tripId,
                            approved: true
                        })
                        res.sendStatus(200)
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async delete(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) {
                if (data.committee == 'safety' || data.admin) {
                    if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                        await s3.putObject({
                            Bucket: 'witkc',
                            Key: `deletedTrips/${req.body.tripId}.json`,
                            Body: JSON.stringify(await trips.get(req.body.tripId))
                        }).promise().catch((err) => { throw err })
                        trips.delete(req.body.tripId)
                        res.sendStatus(200)
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = safety