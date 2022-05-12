'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const uuid = require('uuid')
const viewData = require('../../view_data.js')
const trips = require('../../data_managers/trips.js')
const members = require('../../data_managers/witkc_members.js')

const trip = {
    async create(req, res) {
        var data = await viewData.get(req, 'Create Trip')
        data.scripts.trip = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/trip_scripts.js' })

        if (data.loggedIn) if (data.member.verified) {
            logger.info(`Session '${req.sessionID}': Getting Create Trip`)
            res.render('trip', data)
        } else res.redirect('/')
        else res.redirect('/')

    },

    async view(req, res) {
        var data = await viewData.get(req, 'View Trip')

        if (req.params.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
            trips.get(req.params.tripId).then(async (trip) => {
                if (trip !== null) {
                    data.trip = trip
                    data.trip.location.county = viewData.capitalize(data.trip.location.county)

                    if (data.loggedIn) {
                        if (data.admin || !data.member.verified) data.trip.joinable = false

                        if (data.trip.attendees.includes(data.member.memberId)) data.joined = true
                        else data.joined = false
                    } else data.trip.joinable = false

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

                    for (var i in data.trip.attendees) {
                        var member = await members.get(data.trip.attendees[i])
                        data.trip.attendees[i] = {
                            memberId: member.memberId,
                            firstName: member.firstName,
                            lastName: member.lastName,
                            img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: member.img })
                        }
                    }


                    logger.info(`Session '${req.sessionID}': Getting View Trip`)
                    res.render('view_trip', data)
                } else res.redirect('/404')
            }).catch((err) => { console.log(err); res.redirect('/404') })
        } else res.redirect('/404')
    },

    async apiCreate(req, res) {
        try {
            var data = await viewData.get(req, 'View Trip')

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

                // Server-Side Validation
                if (!req.body.name.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (!req.body.start_date.match(/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)) valid = false
                if (!req.body.end_date.match(/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/)) valid = false
                if (!req.body.description.match(/^[^<>]{1,500}$/u)) valid = false
                if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
                if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
                if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
                if (!counties.includes(req.body.county)) valid = false
                if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false
                if (req.body.level < 1 || req.body.level > 5) valid = false
                if (req.body.enough_safety != 'true' && req.body.enough_safety != 'false') valid = false
                if (!req.body.safety.split(',').every((item) => memberIds.includes(item))) valid = false
                if (!req.body.hazards.every(item => {
                    if (!commonHazards.includes(item)) {
                        if (item.match(/^[\w- ]{1,24}$/)) {
                            return true
                        } else return false
                    } else return true
                })) valid = false


                if (valid) {
                    var hazards = []
                    for (var hazard of req.body.hazards) switch (hazard) {
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

                    // Create trip object
                    var trip = {
                        tripId: uuid.v4(),
                        name: viewData.capitalize(req.body.name),
                        startDate: new Date(req.body.start_date).toUTCString().substring(5, 16),
                        endDate: new Date(req.body.end_date).toUTCString().substring(5, 16),
                        description: req.body.description,
                        location: {
                            lineOne: viewData.capitalize(req.body.line_one),
                            lineTwo: viewData.capitalize(req.body.line_two),
                            city: viewData.capitalize(req.body.city),
                            county: req.body.county,
                            code: req.body.code.toUpperCase().replace(/\s/g, ''),
                        },
                        level: req.body.level,
                        safety: req.body.safety.split(','),
                        enoughSafety: (req.body.enough_safety == 'true'),
                        approved: (data.committee == 'safety'),
                        hazards: hazards,
                        attendees: req.body.safety.split(',')
                    }

                    trips.create(trip).then((success) => {
                        if (success) res.status(200).json({ url: `/trip/${trip.tripId}` })
                        else res.sendStatus(500)
                    }).catch((err) => { res.status(500).json(err) })
                }
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async list(req, res) {
        try {
            var data = await viewData.get(req, 'View Trip')

            if (req.params.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                trips.list(req.params.tripId).then((trips) => {
                    if (trips !== null) res.status(200).json(trips)
                    else res.sendStatus(404)
                }).catch((err) => { res.status(400).json(err) })
            } else res.redirect(400)
        } catch (err) { res.status(500).json(err) }
    },

    async join(req, res) {
        try {
            var data = await viewData.get(req, 'View Trip')

            if (data.loggedIn) if (data.member.verified) {
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    members.joinTrip(data.member.memberId, req.body.tripId)
                    res.sendStatus(200)
                }
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async leave(req, res) {
        try {
            var data = await viewData.get(req, 'View Trip')

            if (data.loggedIn) if (data.member.verified) {
                if (req.body.tripId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    members.leaveTrip(data.member.memberId, req.body.tripId)
                    res.sendStatus(200)
                }
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = trip