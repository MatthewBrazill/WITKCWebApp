'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../log.js')
const members = require('../data_managers/witkc_members.js')
const passwords = require("../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const viewData = require('../view_data.js')

const login = {
    async get(req, res) {
        var data = await viewData.get(req, 'Login')
        data.scripts.login = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/login_scripts.js' })

        if (data.loggedIn) req.session.destroy()
        logger.info(`Session '${req.sessionID}': Getting Login`)
        res.render('login', data)
    },

    async post(req, res) {
        // Force all attempts to take 1s to prevent remote brute force attacks
        var minTime = new Promise(resolve => setTimeout(resolve, 1000))
        logger.info(`Session '${req.sessionID}': Posting Login Form`)
        var valid = true

        // Server-Side Validation
        if (!req.body.username.match(/^[\w-]{1,16}$/)) valid = false
        if (!req.body.password.match(/^.{1,64}$/)) valid = false

        if (valid) {
            var memberId = await members.resolveUsername(req.body.username)
            var success = bcrypt.compare(req.body.password, await passwords.get(memberId))
        }

        await minTime
        if (await success) {
            logger.info(`Session '${req.sessionID}': Login Succeeded`)
            req.session.userID = memberId
            req.session.allow_cookies = true
            res.status(200).json({ url: '/profile/me' })
        } else {
            logger.info(`Session '${req.sessionID}': Login Failed`)
            res.sendStatus(403)
        }
    }
}

module.exports = login