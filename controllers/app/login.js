'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const logger = require('../../log.js')
const members = require('../../data_managers/members.js')
const passwords = require("../../data_managers/passwords.js")
const bcrypt = require('bcrypt')
const helper = require('../helper.js')

const login = {
    async loginPage(req, res) {
        var data = await helper.viewData(req, 'Login')
        data.scripts.login = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/login_scripts.js' })

        if (data.loggedIn) req.session.destroy()
        res.render('login', data)
    },

    async login(req, res) {
        // Force all attempts to take 1s to prevent remote brute force attacks
        var minTime = new Promise(resolve => setTimeout(resolve, 1000))
        var valid = true

        // Server-Side Validation
        if (!req.body.username.match(/^[\w-]{1,16}$/)) valid = false
        if (!req.body.password.match(/^.{1,64}$/)) valid = false

        if (valid) {
            var memberId = await members.resolveUsername(req.body.username)
            var success = bcrypt.compare(req.body.password, await passwords.get(memberId))
        }

        // Resolve the min of 1s AFTER authentication to remain as close as possible to the 1s response time
        await minTime
        if (success) {
            logger.debug({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                message: `Login Succeeded`
            })
            req.session.memberId = memberId
            req.session.allowCookies = true
            res.status(200).json({ url: '/profile/me' })
        } else {
            logger.debug({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                message: `Login Failed`
            })
            res.sendStatus(404)
        }
    }
}

module.exports = login