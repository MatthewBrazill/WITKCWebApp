'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')
const members = require('../data_managers/witkc_members')

const safety = {
    async award(req, res) {
        var data = await viewData.get(req, 'API')
        var valid = true

        if (data.logged_in) {
            // Server-Side Validation
            if (!req.body.members.match(/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}){1}(,[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})*$/i)) valid = false
            if (!req.body.cert.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

            if (valid) {
                var safety = await members.getCommitteeMemberForRole('safety')
                if (safety === null) safety = await members.getCommitteeMemberForRole('admin')

                if (safety.memberId == data.member.memberId) {
                    var memberIds = req.body.members.split(',')
                    for (var memberId of memberIds) members.awardCert(memberId, req.body.cert)
                    res.sendStatus(200)
                } else res.sendStatus(403)
            } else res.sendStatus(400)
        } else res.sendStatus(403)
    },

    async rescind(req, res) {
        var data = await viewData.get(req, 'API')
        var valid = true

        if (data.logged_in) {
            // Server-Side Validation
            if (!req.body.members.match(/^([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}){1}(,[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})*$/i)) valid = false
            if (!req.body.cert.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false

            if (valid) {
                members.getCommitteeMemberForRole('safety').then((safety) => {
                    if (safety.memberId == data.member.memberId) {

                    } else res.sendStatus(403)
                }).catch((err) => res.status(500).json({ err: err }))
            } else res.sendStatus(400)
        } else res.sendStatus(403)
    }
}

module.exports = safety