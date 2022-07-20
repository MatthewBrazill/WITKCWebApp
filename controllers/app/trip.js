'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const uuid = require('uuid')
const helper = require('../helper.js')
const trips = require('../../data_managers/trips.js')
const members = require('../../data_managers/members.js')

const trip = {
    async createPage(req, res) {
        var data = await helper.viewData(req, 'Create Trip')
        data.scripts.trip = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/trip_scripts.js' })

        // Authenticate user
        if (data.loggedIn) if (data.member.verified) {
            res.render('trip', data)
        } else res.redirect('/profile/me')
        else res.redirect('/login')
    },

    async viewPage(req, res) {
        var data = await helper.viewData(req, 'View Trip')

        // Validate input
        if (req.params.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
            data.trip = await trips.get(req.params.tripId)
            if (data.trip !== null) {
                data.trip.location.county = helper.capitalize(data.trip.location.county)

                // Authenticate if they are logged in
                if (data.loggedIn) {
                    if (data.admin || !data.member.verified) data.trip.joinable = false

                    if (data.trip.attendees.includes(data.member.memberId)) data.joined = true
                    else data.joined = false
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `User Joined => ${data.joined}`
                    })

                } else data.trip.joinable = false
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Trip Joinable => ${data.joinable}`
                })

                // Get the safety boaters
                for (var i in data.trip.safety) {
                    var member = await members.get(data.trip.safety[i])
                    if (member.certs.length > 0) {
                        var best = member.certs[0]
                        for (var cert of member.certs) {
                            if (cert.level > best.level && cert.category == 'Rescue') best = cert
                        }
                        if (best.category != 'Rescue') best = { name: '' }
                    } else best = { name: '' }
                    data.trip.safety[i] = {
                        memberId: member.memberId,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: member.img }),
                        cert: best.name
                    }
                }
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Trip Safety Count => ${data.trip.safety.length}`
                })

                // Get the nececary parts of members
                for (var i in data.trip.attendees) {
                    var member = await members.get(data.trip.attendees[i])
                    data.trip.attendees[i] = {
                        memberId: member.memberId,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: member.img })
                    }
                }
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Trip Member Count => ${data.trip.attendees.length}`
                })

                res.render('view_trip', data)
            } else res.render('404', data)
        } else res.render('404', data)
    },

    async create(req, res) {
        try {
            var data = await helper.viewData(req, 'View Trip')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {
                var valid = true
                var memberIds = await members.list().then((members) => {
                    var memberIds = []
                    for (var member of members) memberIds.push(member.memberId)
                    return memberIds
                })
                var commonHazards = ['strainers', 'falls', 'dams', 'undercuts']
                var counties = [
                    'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
                    'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
                    'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
                    'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
                ]

                // Validate input
                if (!req.body.name.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (!req.body.start_date.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                if (!req.body.end_date.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                if (!req.body.description.match(/^[^<>]{1,500}$/u)) valid = false
                if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
                if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
                if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
                if (!counties.includes(req.body.county)) valid = false
                if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false
                if (req.body.level < 1 || req.body.level > 5) valid = false
                if (req.body.enough_safety != 'true' && req.body.enough_safety != 'false') valid = false
                if (!req.body.safety.split(',').every((item) => memberIds.includes(item))) valid = false
                if (req.body.hazards != undefined) if (!req.body.hazards.every(item => {
                    if (!commonHazards.includes(item)) {
                        if (item.match(/^[\w- ]{1,24}$/)) {
                            return true
                        } else return false
                    } else return true
                })) valid = false


                if (valid) {
                    var hazards = []
                    if (req.body.hazards == undefined) hazards = ['No hazards.']
                    else for (var hazard of req.body.hazards) switch (hazard) {
                        case 'strainers':
                            hazards.push('Stainers and sweepers.')
                            break;

                        case 'falls':
                            hazards.push('Waterfalls, and other types of drops.')
                            break;

                        case 'dams':
                            hazards.push('Dams and other types of manmade obstacles.')
                            break;

                        case 'undercuts':
                            hazards.push('Riverbank undercuts and of submerged retaining hazards.')
                            break;

                        default:
                            hazards.push(`Other Hazards: ${hazard}.`)
                            break;
                    }

                    // Create trip
                    if (trips.create({
                        tripId: uuid.v4(),
                        name: helper.capitalize(req.body.name),
                        startDate: new Date(req.body.start_date).toUTCString(),
                        endDate: new Date(req.body.end_date).toUTCString(),
                        description: req.body.description,
                        location: {
                            lineOne: helper.capitalize(req.body.line_one),
                            lineTwo: helper.capitalize(req.body.line_two),
                            city: helper.capitalize(req.body.city),
                            county: req.body.county,
                            code: req.body.code.toUpperCase().replace(/\s/g, ''),
                        },
                        level: req.body.level,
                        safety: req.body.safety.split(','),
                        enoughSafety: (req.body.enough_safety == 'true'),
                        approved: (data.committee == 'safety'),
                        hazards: hazards,
                        attendees: req.body.safety.split(',')
                    })) res.status(200).json({ url: `/trip/${trip.tripId}` })
                    else res.status(503)
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

    async list(req, res) {
        try {
            var result = trips.list()
            if (result !== null) res.status(200).json(result)
            else res.sendStatus(404)
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

    async join(req, res) {
        try {
            var data = await helper.viewData(req, 'View Trip')

            // Authneticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (members.joinTrip(data.member.memberId, req.body.tripId)) res.sendStatus(200)
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

    async leave(req, res) {
        try {
            var data = await helper.viewData(req, 'View Trip')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (members.leaveTrip(data.member.memberId, req.body.tripId)) res.sendStatus(200)
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

module.exports = trip