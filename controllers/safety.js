'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')
const members = require('../data_managers/witkc_members')

const safety = {
    async award(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.logged_in) {
                if (data.committee == 'safety' || data.admin) {
                    // Server-Side Validation
                    if (!req.body.memberIds.match(/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}){1}(,[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})*$/i)) valid = false
                    if (!req.body.certId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

                    if (valid) {
                        var memberIds = req.body.memberIds.split(',')
                        for (var memberId of memberIds) members.awardCert(memberId, req.body.certId)
                        res.sendStatus(200)
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) {
            res.status(500).json(err)
        }
    },

    async revoke(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.logged_in) {
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
        } catch (err) {
            res.status(500).json(err)
        }
    }
}

module.exports = safety