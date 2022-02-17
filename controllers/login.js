'use strict'

// Imports
const logger = require('../log.js')
const sessions = require('../data_managers/sessions')
const members = require('../data_managers/witkc_members')
const passwords = require("../data_managers/passwords")
const bcrypt = require('bcrypt')

const login = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Login`)
        var viewData = {
            title: 'Login'
        }

        if (sessions.includes(req.sessionID)) {
            logger.debug(`Session '${req.sessionID}' is Destroyed`)
            sessions.destroy(req.sessionID)
            req.session.destroy()
        }
        logger.debug(`Session '${req.sessionID}' is Created`)
        sessions.create(req.sessionID)
        res.render('login', viewData)
    },

    async post(req, res) {
        //Increase time to authenticate to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000))

        logger.info(`Session '${req.sessionID}': Posting Login Form`)
        if (true) {
            var member = members.getWithUsername(req.body.username)

            if (bcrypt.compareSync(req.body.password, passwords.get(member.memberId))) {
                logger.info(`Session '${req.sessionID}': Successfully Logged In`)
                sessions.create(req.session.id, member.memberId)
                req.session.userId = member.memberId
                res.redirect('/')
            } else {
                logger.info(`Session '${req.sessionID}': Login Failed`)
                res.redirect('/login')
            }
        } else res.redirect('/login')
    }
}

module.exports = login