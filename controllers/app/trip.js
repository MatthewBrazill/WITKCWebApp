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
        data.scripts.trip = process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/trip_scripts.js' : '/js/trip_scripts.js'

        // Authenticate user
        if (data.loggedIn) if (data.member.verified) {
            res.render('trip_create', data)
        } else res.redirect('/profile/me')
        else res.redirect('/login')
    },

    async viewPage(req, res) {
        var data = await helper.viewData(req, 'View Trip')

        // Validate input
        if (req.params.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
            data.trip = await trips.get(req.params.tripId)
            if (data.trip !== null) {
                data.trip.destination.county = helper.capitalize(data.trip.destination.county)

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

                    if (data.admin || data.committee || data.member.memberId == data.trip.creator) data.editable = true
                    else data.editable = false
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
                            if (cert.skillLevel > best.skillLevel && cert.category == 'Rescue') best = cert
                        }
                        if (best.category != 'Rescue') best = { certName: '' }
                    } else best = { certName: '' }
                    data.trip.safety[i] = {
                        memberId: member.memberId,
                        firstName: member.firstName,
                        lastName: member.lastName,
                        img: s3.getSignedUrl('getObject', { Bucket: 'setukc-private', Key: member.img }),
                        cert: best.certName
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
                        img: s3.getSignedUrl('getObject', { Bucket: 'setukc-private', Key: member.img })
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

                res.render('trip_view', data)
            } else res.render('404', data)
        } else res.render('404', data)
    },

    async editPage(req, res) {
        var data = await helper.viewData(req, 'Edit Trip')
        data.scripts.trip = process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/trip_scripts.js' : '/js/trip_scripts.js'

        // Authenticate user
        if (data.loggedIn) if (data.member.verified) {

            // Validate input
            if (req.params.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                data.trip = await trips.get(req.params.tripId)
                if (data.trip != null) {

                    // Check Ownership
                    if (data.trip.creator == data.member.memberId || data.committee || data.admin) {

                        // Get the safety boaters
                        var safety = data.trip.safety
                        data.trip.safety = ''
                        for (var i in safety) data.trip.safety = data.trip.safety + `,'${safety[i]}'`
                        data.trip.safety = data.trip.safety.substring(1)
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
                                img: s3.getSignedUrl('getObject', { Bucket: 'setukc-private', Key: member.img })
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

                        var hazards = data.trip.hazards
                        data.trip.hazards = {}
                        for (var hazard of hazards) switch (hazard) {
                            case 'Stainers and sweepers.':
                                data.trip.hazards.strainers = 'checked=""'
                                break;

                            case 'Waterfalls, and other types of drops.':
                                data.trip.hazards.falls = 'checked=""'
                                break;

                            case 'Dams and other types of manmade obstacles.':
                                data.trip.hazards.dams = 'checked=""'
                                break;

                            case 'Riverbank undercuts and of submerged retaining hazards.':
                                data.trip.hazards.undercuts = 'checked=""'
                                break;

                            default:
                                data.trip.hazards.others = 'checked=""'
                                data.trip.hazards.othersValue = hazard.slice(15, -1)
                                break;
                        }

                        if (data.trip.enoughSafety) data.trip.enoughSafety = 'checked=""'
                        else data.trip.enoughSafety = ''

                        res.render('trip_edit', data)
                    } else res.redirect(`/trip/${req.params.tripId}`)
                } else res.render('404', data)
            } else res.render('404', data)
        } else res.redirect('/profile/me')
        else res.redirect('/login')
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
                if (!req.body.tripName.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (!req.body.startDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                if (!req.body.endDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                if (!req.body.description.match(/^[^<>]{1,500}$/u)) valid = false
                if (!req.body.lineOne.match(/^[\w- ]{1,32}$/)) valid = false
                if (!req.body.lineTwo.match(/^[\w- ]{1,32}$/) && req.body.lineTwo != '') valid = false
                if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
                if (!counties.includes(req.body.county)) valid = false
                if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false
                if (req.body.skillLevel < 1 || req.body.skillLevel > 5) valid = false
                if (req.body.enoughSafety != 'true' && req.body.enoughSafety != 'false') valid = false
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
                    var trip = {
                        tripId: uuid.v4(),
                        tripName: helper.capitalize(req.body.tripName),
                        creator: data.member.memberId,
                        startDate: new Date(req.body.startDate).toUTCString(),
                        endDate: new Date(req.body.endDate).toUTCString(),
                        description: req.body.description,
                        destination: {
                            lineOne: helper.capitalize(req.body.lineOne),
                            lineTwo: helper.capitalize(req.body.lineTwo),
                            city: helper.capitalize(req.body.city),
                            county: req.body.county,
                            code: req.body.code.toUpperCase().replace(/\s/g, ''),
                        },
                        skillLevel: req.body.skillLevel,
                        safety: req.body.safety.split(','),
                        enoughSafety: (req.body.enoughSafety == 'true'),
                        hazards: hazards,
                        attendees: req.body.safety.split(',')
                    }
                    if (data.committee == 'safety') trip.approved = true
                    if (await trips.create(trip)) res.status(200).json({ url: `/trip/${trip.tripId}` })
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

    async update(req, res) {
        try {
            var data = await helper.viewData(req, 'View Trip')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    data.trip = await trips.get(req.body.tripId)
                    if (data.trip != null) {

                        // Check Ownership
                        if (data.trip.creator == data.member.memberId || data.committee || data.admin) {
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
                            if (!req.body.tripName.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                            if (!req.body.startDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                            if (!req.body.endDate.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/)) valid = false
                            if (!req.body.description.match(/^[^<>]{1,500}$/u)) valid = false
                            if (!req.body.lineOne.match(/^[\w- ]{1,32}$/)) valid = false
                            if (!req.body.lineTwo.match(/^[\w- ]{1,32}$/) && req.body.lineTwo != '') valid = false
                            if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
                            if (!counties.includes(req.body.county)) valid = false
                            if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false
                            if (req.body.skillLevel < 1 || req.body.skillLevel > 5) valid = false
                            if (req.body.enoughSafety != 'true' && req.body.enoughSafety != 'false') valid = false
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

                                // Update trip
                                if (await trips.update({
                                    tripId: req.body.tripId,
                                    tripName: helper.capitalize(req.body.tripName),
                                    startDate: new Date(req.body.startDate).toUTCString(),
                                    endDate: new Date(req.body.endDate).toUTCString(),
                                    description: req.body.description,
                                    destination: {
                                        lineOne: helper.capitalize(req.body.lineOne),
                                        lineTwo: helper.capitalize(req.body.lineTwo),
                                        city: helper.capitalize(req.body.city),
                                        county: req.body.county,
                                        code: req.body.code.toUpperCase().replace(/\s/g, ''),
                                    },
                                    skillLevel: req.body.skillLevel,
                                    safety: req.body.safety.split(','),
                                    enoughSafety: (req.body.enoughSafety == 'true'),
                                    approved: (data.committee == 'safety'),
                                    hazards: hazards,
                                    attendees: req.body.safety.split(',')
                                })) res.status(200).json({ url: `/trip/${req.body.tripId}` })
                                else res.sendStatus(503)
                            } else res.sendStatus(400)
                        } else res.sendStatus(403)
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

    async join(req, res) {
        try {
            var data = await helper.viewData(req, 'View Trip')

            // Authneticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await members.joinTrip(data.member.memberId, req.body.tripId)) res.sendStatus(200)
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
                    if (await members.leaveTrip(data.member.memberId, req.body.tripId)) res.sendStatus(200)
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

    async delete(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    data.trip = await trips.get(req.body.tripId)
                    if (data.trip != null) {
                        if (data.member.memberId == data.trip.creator || data.admin || data.committee) {
                            s3.putObject({
                                Bucket: 'witkc',
                                Key: `deletedTrips/${req.body.tripId}.json`,
                                Body: JSON.stringify(await trips.get(req.body.tripId))
                            })

                            if (await trips.delete(req.body.tripId)) res.sendStatus(200)
                            else res.sendStatus(503)
                        } else res.sendStatus(403)
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
    }
}

module.exports = trip