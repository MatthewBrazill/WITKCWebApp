'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const members = require('../../data_managers/members.js')
const passwords = require("../../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const helper = require('../helper.js')

const signup = {
    async signupPage(req, res) {
        var data = await helper.viewData(req, 'Sign Up')
        data.scripts.signUp = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/sign_up_scripts.js' })

        if (data.loggedIn) req.session.destroy()

        res.render('signup', data)
    },

    async createAccount(req, res) {
        try {
            var valid = true
            var counties = [
                'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
                'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
                'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
                'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
            ]

            // Server-Side Validation
            if (!req.body.first_name.match(/^\p{L}{1,16}$/u)) valid = false
            if (!req.body.last_name.match(/^\p{L}{1,16}$/u)) valid = false
            if (!req.body.username.match(/^[\w-]{1,16}$/) || await members.resolveUsername(req.body.username) !== null) valid = false
            if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) valid = false
            if (!req.body.phone.match(/^[+0]+\d{8,12}$/) && req.body.phone != '') valid = false
            if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
            if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
            if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
            if (!counties.includes(req.body.county)) valid = false
            if (!req.body.code.match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !req.body.code.match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) valid = false
            if (req.body.password.length < 8) valid = false
            if (req.body.confirm_password != req.body.password) valid = false

            if (valid) {

                // Create the member object
                var member = {
                    memberId: uuid.v4(),
                    username: req.body.username,
                    firstName: helper.capitalize(req.body.first_name),
                    lastName: helper.capitalize(req.body.last_name),
                    email: req.body.email.toLowerCase(),
                    phone: helper.internationalize(req.body.phone),
                    verified: false,
                    promotion: true,
                    address: {
                        lineOne: helper.capitalize(req.body.line_one),
                        lineTwo: helper.capitalize(req.body.line_two),
                        city: helper.capitalize(req.body.city),
                        county: req.body.county,
                        code: req.body.code.toUpperCase().replace(/\s/g, ''),
                    },
                    img: 'img/placeholder_avatar.webp',
                    dateJoined: new Date().toUTCString()
                }

                var mSuccess = members.create(member)
                var pSuccess = passwords.create(member.memberId, await bcrypt.hash(req.body.password, 10))

                req.session.memberId = member.memberId
                req.session.allow_cookies = true

                if (await mSuccess && await pSuccess) res.status(200).json({ url: '/profile/me' })
                else {
                    if (await mSuccess) passwords.delete(member.memberId)
                    if (await pSuccess) members.delete(member.memberId)
                    res.sendStatus(503)
                }
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
    }
}

module.exports = signup