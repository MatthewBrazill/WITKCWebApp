'use strict'

// Imports
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')
const passwords = require("../data_managers/passwords")
const bcrypt = require('bcrypt')

const login = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Login`)
        var viewData = {
            title: 'Login'
        }

        req.session.destroy()
        res.render('login', viewData)
    },

    async post(req, res) {
        //Increase time to authenticate to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000))

        logger.info(`Session '${req.sessionID}': Posting Login Form`)
        if (true) {
            var member = await members.get(await members.resolveUsername(req.body.username))

            if (bcrypt.compareSync(req.body.password, await passwords.get(member.memberId))) {
                logger.info(`Session '${req.sessionID}': Successfully Logged In`)
                req.session.userID = member.memberId
                res.redirect('/')
            } else {
                logger.info(`Session '${req.sessionID}': Login Failed`)
                res.redirect('/login')
            }
        } else res.redirect('/login')
    }
}

module.exports = login