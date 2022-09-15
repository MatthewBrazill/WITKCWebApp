'use strict'

// Imports
const AWS = require('aws-sdk')
const trips = require('../../data_managers/trips.js')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const helper = require('../helper.js')

const events = {
    async eventsPage(req, res) {
        var data = await helper.viewData(req, 'Events')
        data.scripts.events = process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/events_scripts.js' : '/js/events_scripts.js'

        // Process all events to get the next 5
        data.events = await trips.from(new Date()).then((result) => {
            var i = 0

            // Sort algorithm
            while (i < result.length - 1) {
                if (new Date(result[i].startDate) > new Date(result[i + 1].startDate)) {
                    var help = result[i]
                    result[i] = result[i + 1]
                    result[i + 1] = help
                    i = 0;
                } else i++
            }
            logger.debug({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                message: `Sorted Events`
            })
            return result.slice(0, 5)
        }).catch((err) => {
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
        })

        // Trim date string to human readable
        for (var i in data.events) {
            data.events[i].startDate = data.events[i].startDate.substring(5, 16)
            data.events[i].endDate = data.events[i].endDate.substring(5, 16)
        }
        logger.debug({
            sessionId: req.sessionID,
            loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
            memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
            method: req.method,
            urlPath: req.url,
            message: `Cleaned Event Dates`
        })
        res.render(`${req.device.type}/events`, data)
    },

    async day(req, res) {
        try {
            // Validate input
            if (req.body.date.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) {
                res.status(200).json(await trips.getOnDate(req.body.date))
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
    },

    async all(req, res) {
        try {
            trips.list().then((results) => {
                var allDates = []
                for (var result of results) {
                    var dates = []

                    // Add dates to the list for each day in trip length
                    var start = new Date(result.startDate)
                    var end = new Date(result.endDate)
                    while (start.setHours(0, 0, 0, 0) <= end.setHours(0, 0, 0, 0)) {
                        dates.push(start.toUTCString())
                        start.setDate(start.getDate() + 1)
                    }

                    // Preapre for Formatic Calendar formating
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

                        if (exists) allDates[index].message = allDates[index].message + `, ${result.tripName}`
                        else allDates.push({
                            date: date,
                            message: result.tripName,
                            class: result.approved === undefined ? 'yellow' : result.approved ? 'green' : 'red'
                        })
                    }
                }
                res.status(200).json(allDates)
            }).catch((err) => {
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
            })
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

module.exports = events