'use strict'

// Imports
const logger = require('../log.js')
const viewData = require('../view_data.js')
const members = require('../data_managers/witkc_members')
const trips = require('../data_managers/trips.js')

const captain = {
    async verify(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (data.committee == 'captain' || data.admin) {
                    if (req.body.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                        members.update({
                            memberId: req.body.memberId,
                            verified: true
                        }).then((success) => {
                            if (success) res.sendStatus(200)
                            else res.sendStatus(400)
                        }).catch((err) => res.status(500).json(err))
                    } else res.sendStatus(400)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async stats(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) {
                if (data.committee == 'captain' || data.admin) {
                    var today = new Date()
                    if (today.getMonth() < 9) var lastSeptember = new Date(new Date('2020-09-01').setFullYear(today.getFullYear() - 1)).toUTCString().substring(5, 16)
                    else var lastSeptember = new Date(new Date('2020-09-01').setFullYear(today.getFullYear())).toUTCString().substring(5, 16)

                    var m = await members.list()
                    var t = await trips.since(lastSeptember)

                    var stats = {
                        members: m.length,
                        trips: t.length,
                        boats: 3,
                        expenses: 168
                    }
                    res.status(200).json(stats)
                } else res.sendStatus(403)
            } else res.sendStatus(403)
        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
    }
}

module.exports = captain