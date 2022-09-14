'use strict'

// Imports
const logger = require('../../log.js')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const helper = require('../helper.js')
const uuid = require('uuid')
const bookings = require('../../data_managers/bookings.js')
const equipment = require('../../data_managers/equipment.js')

const gear = {
    async bookPage(req, res) {
        var data = await helper.viewData(req, 'Book Equipment')
        data.scripts.bookings = process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/bookings_scripts.js' : '/js/bookings_scripts.js'

        //Authenticate user
        if (data.loggedIn) if (data.member.verified) {
            data.equipment = await equipment.getAll()

            // Capitalize all of the Gear Data
            for (var attr in data.equipment) for (var gear of data.equipment[attr]) for (var a in gear)
                if (!['equipmentId', 'img'].includes(a)) gear[a] = helper.capitalize(gear[a].toString())
            res.render('bookings', data)
        } else res.status(403).redirect('/profile/me')
        else res.status(401).redirect('/login')
    },

    async available(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {
                var valid = true

                // Validate input
                if (!req.body.equipmentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                if (!req.body.fromDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                if (!req.body.toDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false

                if (valid) {
                    if (await bookings.available(req.body.equipmentId, req.body.fromDate, req.body.toDate)) res.status(200).json(true)
                    else res.status(200).json(false)
                } else res.sendStatus(404)
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

    async get(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.bookingId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {

                    var result = await bookings.get(req.body.bookingId)
                    if (result != null) res.status(200).json(result)
                    else res.sendStatus(404)
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

    async dates(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) {
                var result = await bookings.getAllFor(data.member.memberId)
                if (result != null) {
                    var dates = []

                    for (var booking of result) {
                        var start = new Date(booking.fromDate)
                        var end = new Date(booking.toDate)

                        while (start.setHours(0, 0, 0, 0) <= end.setHours(0, 0, 0, 0)) {
                            dates.push({
                                date: start.toUTCString(),
                                class: 'green'
                            })
                            start.setDate(start.getDate() + 1)
                        }
                    }
                    res.status(200).json(dates)
                } else res.sendStatus(404)
            } else res.sendStatus(401)
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

    async day(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) {

                // Validate input
                if (req.body.date.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) {

                    var result = await bookings.getAllFor(data.member.memberId)
                    if (result != null) {
                        var list = []
                        var date = new Date(req.body.date).setHours(0, 0, 0, 0)
                        for (var booking of result) if (new Date(booking.fromDate).setHours(0, 0, 0, 0) <= date && date <= new Date(booking.toDate).setHours(0, 0, 0, 0)) list.push(booking)
                        for (var i in list) {
                            list[i].equipment = await equipment.get(list[i].equipmentId)
                            list[i].equipment.type = helper.capitalize(list[i].equipment.type)
                        }
                        res.status(200).json(list)
                    } else res.sendStatus(404)
                } else res.sendStatus(400)
            } else res.sendStatus(401)
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

    async book(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {
                var valid = true

                // Validate input
                if (!req.body.equipmentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                if (!req.body.fromDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                if (!req.body.toDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false

                if (valid) {
                    if (await bookings.available(req.body.equipmentId, req.body.fromDate, req.body.toDate)) {
                        if (await bookings.create({
                            bookingId: uuid.v4(),
                            equipmentId: req.body.equipmentId,
                            memberId: data.member.memberId,
                            fromDate: req.body.fromDate,
                            toDate: req.body.toDate
                        })) res.sendStatus(200)
                        else res.sendStatus(404)
                    } else res.sendStatus(404)
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

    async update() {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'equipments' || data.admin) {




                res.sendStatus(501)
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

    async delete(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.bookingId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    var result = await bookings.get(req.body.bookingId)
                    if (result != null && (result.memberId == data.member.memberId || data.committee == 'equipments' || data.admin)) {
                        if (await bookings.delete(req.body.bookingId)) res.sendStatus(204)
                        else res.sendStatus(503)
                    } else res.sendStatus(403)
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

module.exports = gear