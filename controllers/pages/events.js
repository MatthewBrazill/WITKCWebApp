'use strict'

// Imports
const AWS = require('aws-sdk')
const trips = require('../../data_managers/trips.js')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const viewData = require('../../view_data.js')

const events = {
    async get(req, res) {
        var data = await viewData.get(req, 'Events')
        data.scripts.events = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/events_scripts.js' })
        data.events = await trips.from(new Date()).then((result) => {
            var i = 0
            while (i < result.length-1) {
                if (new Date(result[i].startDate) > new Date(result[i+1].startDate)) {
                    var help = result[i]
                    result[i] = result[i+1]
                    result[i+1] = help
                    i = 0;
                } else i++
            }
            return result.slice(0, 5)
        }).catch(() => [])

        logger.info(`Session '${req.sessionID}': Getting Events`)
        res.render('events', data)
    },

    async day(req, res) {
        try {
            if (req.body.date.match(/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)) {
                trips.getOnDate(req.body.date).then((result) => {
                    res.status(200).json(result)
                }).catch(() => res.sendStatus(404))
            } else res.sendStatus(400)
        } catch (err) { res.status(500).json(err) }
    },

    async month(req, res) {
        // Implement after event and trips database
        res.status(200).json({ events: [] })
    }
}

module.exports = events