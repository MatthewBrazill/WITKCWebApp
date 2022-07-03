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
            while (i < result.length - 1) {
                if (new Date(result[i].startDate) > new Date(result[i + 1].startDate)) {
                    var help = result[i]
                    result[i] = result[i + 1]
                    result[i + 1] = help
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
            if (req.body.date.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) {
                trips.getOnDate(req.body.date).then((result) => {
                    res.status(200).json(result)
                }).catch(() => res.sendStatus(404))
            } else res.sendStatus(400)
        } catch (err) { res.status(500).json(err) }
    },

    async dates(req, res) {
        try {
            trips.list().then((results) => {
                var allDates = []
                for (var result of results) {
                    var dates = []
                    var start = new Date(result.startDate)
                    var end = new Date(result.endDate)
                    start.setHours(12)
                    end.setHours(12)
                    while (start <= end) {
                        dates.push(start.toUTCString())
                        start.setDate(start.getDate() + 1)
                    }
                    for (var date of dates) {
                        var exists = false
                        var index = 0
                        for (var allDatesIndex in allDates) {
                            if (allDates[allDatesIndex].date == date) {
                                exists = true
                                index = allDatesIndex
                                break;
                            }
                        }

                        if (exists) allDates[index].message = allDates[index].message + `, ${result.name}`
                        else allDates.push({
                            date: date,
                            message: result.name,
                            class: 'green'
                        })
                    }
                }
                res.status(200).json(allDates)
            }).catch((err) => { res.status(500).json(err); console.log(err) })
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = events