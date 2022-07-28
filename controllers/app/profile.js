'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const fs = require('fs')
const formidable = require('formidable')
const logger = require('../../log.js')
const members = require('../../data_managers/members')
const passwords = require("../../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const sharp = require('sharp')
const helper = require('../helper.js')
const committee = require('../../data_managers/committee.js')

const profile = {
    async profilePage(req, res) {
        var data = await helper.viewData(req, 'My Profile')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        // Authenticate user
        if (data.loggedIn) {

            // Authenticate is the user is on the committee
            if (data.committee) {
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Committee User`
                })
                data.scripts.committee = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/committee_scripts.js' })
                data[data.committee] = await committee.getRole(data.committee)
                data.scripts[data.committee] = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: `js / ${data.committee} _scripts.js` })

                if (data.committee == 'equipments') {
                    // Capitalize all of the Gear Data
                    for (var attr in data.equipments.equipment) for (var gear of data.equipments.equipment[attr]) for (var a in gear)
                        if (!['equipmentId', 'img'].includes(a)) gear[a] = helper.capitalize(gear[a].toString())
                }
            }

            // Authenticate if the user is admin
            else if (data.admin) {
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Admin User`
                })
                data.committee = true
                data.scripts.committee = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/committee_scripts.js' })
                for (var role of ['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers']) {
                    data[role] = await committee.getRole(role)
                    data.scripts[role] = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: `js/${role}_scripts.js` })
                }

                // Capitalize all of the Gear Data
                for (var attr in data.equipments.equipment) for (var gear of data.equipments.equipment[attr]) for (var a in gear)
                    if (!['equipmentId', 'img'].includes(a)) gear[a] = helper.capitalize(gear[a].toString())
            }

            res.render('profile', data)
        } else res.redirect('/login')
    },

    async userPage(req, res) {
        var data = await helper.viewData(req, 'View Profile')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        // Authenticate user
        if (data.loggedIn) {

            // Validate input
            if (req.params.memberId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                var result = await members.get(req.params.memberId)
                if (result != null) {
                    result.dateJoined = new Date(result.dateJoined).toUTCString()
                    result.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: result.img })
                    data.user = result

                    res.render('user', data)
                } else res.render('404', data)
            } else res.render('404', data)
        } else res.redirect('/login')
    },

    async settingsPage(req, res) {
        var data = await helper.viewData(req, 'Settings')
        data.scripts.profile = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/profile_scripts.js' })

        // Authenticate user
        if (data.loggedIn) {
            var captain = await committee.getRole('captain')
            captain.verificationRequests.forEach(element => {
                if (element.memberId == data.member.memberId) data.verificationRequested = true
            })
            if (data.member.committeeRole == 'admin') data.admin = true

            res.render('settings', data)
        } else res.redirect('/login')
    },

    async updatePersonal(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) {
                var valid = true
                var counties = [
                    'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
                    'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
                    'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
                    'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
                ]

                // Validate input
                if (!req.body.first_name.match(/^\p{L}{1,16}$/u)) valid = false
                if (!req.body.last_name.match(/^\p{L}{1,16}$/u)) valid = false
                if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) valid = false
                if (!req.body.phone.match(/^[+0]+\d{8,12}$/) && req.body.phone != '') valid = false
                if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
                if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
                if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
                if (!counties.includes(req.body.county)) valid = false
                if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false

                if (valid) {
                    if (await members.update({
                        memberId: data.member.memberId,
                        firstName: helper.capitalize(req.body.first_name),
                        lastName: helper.capitalize(req.body.last_name),
                        email: req.body.email.toLowerCase(),
                        phone: helper.internationalize(req.body.phone),
                        address: {
                            lineOne: helper.capitalize(req.body.line_one),
                            lineTwo: helper.capitalize(req.body.line_two),
                            city: helper.capitalize(req.body.city),
                            county: req.body.county,
                            code: req.body.code.toUpperCase().replace(/\s/g, '')
                        },
                        promotion: (req.body.promotion === 'true')
                    })) res.sendStatus(200)
                    else res.sendStatus(503)
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

    async updateSettings(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            if (data.loggedIn) {
                var { fields, files } = new formidable.IncomingForm().parse(req, (err, fields, files) => {
                    if (err) throw err
                    else return { fields, files }
                })

                // Validate file
                if (files.file !== undefined) if (files.file.type.split('/')[0] == 'image') {
                    await sharp(files.file.filepath).resize({ width: 400 }).webp().toFile(`${files.file.filepath}-new`).catch((err) => { throw err })
                    s3.putObject({
                        Bucket: 'witkc',
                        Key: data.member.img,
                        Body: fs.readFileSync(`${files.file.filepath}-new`)
                    })
                }

                // Validate fields
                if (fields.bio.match(/^[^<>]{1,500}$/u)) {
                    members.update({
                        memberId: data.member.memberId,
                        bio: fields.bio
                    })
                }

                res.sendStatus(200)
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

    async updatePassword(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user (from scratch since PW change)
            if (data.loggedIn) if (await bcrypt.compare(req.body.old_password, await passwords.get(data.member.memberId))) {
                var valid = true

                // Validate input
                if (req.body.new_password.length < 8) valid = false
                if (req.body.confirm_password != req.body.new_password) valid = false

                if (valid) {
                    if (await passwords.update(data.member.memberId, await bcrypt.hash(req.body.new_password, 10))) res.sendStatus(200)
                    else res.status(503).json(err)
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

    async verify(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) {
                if (await committee.requestVerification(data.member.memberId)) res.sendStatus(200)
                else res.sendStatus(503)
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

    async delete(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) {
                if (await members.delete(data.member.memberId)) {
                    req.session.destroy()
                    res.sendStatus(200)
                } else req.sendStatus(503)
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
}

module.exports = profile