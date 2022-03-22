'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const members = require('../data_managers/witkc_members.js')
const passwords = require("../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const uuid = require('uuid')

const signup = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Sign Up`)
        var viewData = {
            title: 'Sign Up',
            language_dropdown: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/language_dropdown.js' }),
            witkc_img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'img/witkc_logo.png' }),
            county_dropdown: s3.getSignedUrl('getObject', {Bucket: 'witkc', Key: 'js/county_dropdown.js'}),
            sign_up_validator: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/sign_up_validator.js' })
        }

        req.session.destroy()
        res.render('signup', viewData)
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
        if (!req.body.username.match(/^[\w-]{1,16}$/)) valid = false
        if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)+$/)) valid = false
        if (!req.body.phone.match(/^[+0]+\d{8,12}$/) && req.body.phone != '') valid = false
        if (!req.body.line_one.match(/^[\w- ]{1,32}$/)) valid = false
        if (!req.body.line_two.match(/^[\w- ]{1,32}$/) && req.body.phone != '') valid = false
        if (!req.body.city.match(/^[\w- ]{1,32}$/)) valid = false
        if (!req.body.county in counties) valid = false
        if (!req.body.eir.match(/^[a-zA-Z0-9]{3}[ ]?[a-zA-Z0-9]{4}$/)) valid = false
        if (req.body.password.length < 8) valid = false
        if (req.body.confirm_password != req.body.password) valid = false

        if (valid) {
            var member = {
                memberId: uuid.v4(),
                username: req.body.username,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                address: {
                    lineOne: req.body.line_one,
                    lineTwo: req.body.line_two,
                    city: req.body.city,
                    county: req.body.county,
                    eir: req.body.eir,
                },
                verified: false,
                dateJoined: new Date().toISOString().substring(0, 10),
                img: 'img/placeholder_avatar.png'
            }
            req.session.userID = member.memberId
            members.create(member)
            passwords.create(member.memberId, bcrypt.hashSync(req.body.password, 10))

            logger.info(`Session '${req.sessionID}': Successfully Signed Up`)
            res.redirect("/")
        } else {
            logger.info(`Session '${req.sessionID}': Sign Up Failed`)
            var viewData = {
                title: 'Sign Up',
                sign_up_failed: true,
                /*first_name: req.body.first_name,
                last_name: req.body.last_name,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                line_one: req.body.line_one,
                line_two: req.body.line_two,
                city: req.body.city,
                county: req.body.county,
                eir: req.body.eir,
                password: req.body.password,
                confirm_password: req.body.confirm_password */
            }
            res.render("/signup", viewData)
        }
    }
}

module.exports = signup