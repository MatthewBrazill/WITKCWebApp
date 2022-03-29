'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const members = require('../data_managers/witkc_members.js')
const passwords = require("../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const viewData = require('../view_data.js')

const signup = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Sign Up`)
        var data = await viewData.get(req, 'Sign Up')
        data.scripts.sign_up = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/sign_up_scripts.js' })

        req.session.destroy()
        res.render('signup', data)
    },

    async post(req, res) {
        logger.info(`Session '${req.sessionID}': Posting Sign Up Form`)
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
        if (!req.body.username.match(/^[\w-]{1,16}$/) || members.resolveUsername(req.body.username) !== null) valid = false
        if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/)) valid = false
        if (!req.body.phone.match(/^[+0]+\d{8,12}$/) && req.body.phone != '') valid = false
        if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
        if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.line_two != '') valid = false
        if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
        if (!req.body.county in counties) valid = false
        if (!req.body.code.match(/^[a-zA-Z0-9]{3}[ ]?[a-zA-Z0-9]{4}$/)) valid = false
        if (req.body.password.length < 8) valid = false
        if (req.body.confirm_password != req.body.password) valid = false

        if (valid) {
            // Create the member object
            var member = {
                memberId: uuid.v4(),
                username: req.body.username,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                verified: false,
                promotion: true,
                address: {
                    lineOne: req.body.line_one,
                    lineTwo: req.body.line_two,
                    city: req.body.city,
                    county: req.body.county,
                    code: req.body.code,
                },
                img: 'img/placeholder_avatar.png',
                dateJoined: new Date().toISOString().substring(0, 10)
            }

            members.create(member)
            passwords.create(member.memberId, await bcrypt.hash(req.body.password, 10))

            req.session.userID = member.memberId
            req.session.allow_cookies = true
            logger.info(`Session '${req.sessionID}': Sign Up Succeeded`)
            res.status(200).json({ url: '/profile/me' })
        } else {
            logger.info(`Session '${req.sessionID}': Sign Up Failed`)
            res.sendStatus(400)
        }
    }
}

module.exports = signup