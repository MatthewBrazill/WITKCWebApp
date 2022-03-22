'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const members = require('../data_managers/witkc_members.js')
const passwords = require("../data_managers/passwords.js")
const bcrypt = require('bcrypt')

const login = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Login`)
        var viewData = {
            title: 'Login',
            language_dropdown: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/language_dropdown.js' }),
            witkc_img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'img/witkc_logo.png' }),
            login_validator: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/login_validator.js' })
        }

        req.session.destroy()
        res.render('login', viewData)
    },

    async post(req, res) {
        // Increase time to authenticate to prevent remote brute force
        await new Promise(resolve => setTimeout(resolve, 1000))
        logger.info(`Session '${req.sessionID}': Posting Login Form`)
        var valid = true

        // Server-Side Validation
        if (!req.body.username.match(/^[\w-]{1,16}$/)) valid = false
        if (!req.body.password.match(/^.{1,64}$/)) valid = false

        if (valid) {
            var member = await members.get(await members.resolveUsername(req.body.username))
            if (member != null) {
                var hash = await passwords.get(member.memberId)
                if (hash != null) {
                    // Evaluate login credentials
                    if (bcrypt.compareSync(req.body.password, hash)) {
                        logger.info(`Session '${req.sessionID}': Successfully Logged In`)
                        req.session.userID = member.memberId
                        res.redirect('/')
                        return
                    }
                }
            }
        }
        logger.info(`Session '${req.sessionID}': Login Failed`)
        var viewData = {
            title: 'Login',
            login_failed: true
        }
        res.render('login', viewData)
    }
}

module.exports = login