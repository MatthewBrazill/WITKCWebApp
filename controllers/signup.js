'use strict'

// Imports
const StatsD = require('hot-shots')
const datadog = new StatsD('localhost', 8125)
const logger = require('../log.js')
const sessions = require('../data_managers/sessions')
const members = require('../data_managers/witkc_members')
const passwords = require("../data_managers/passwords")
const bcrypt = require('bcrypt')
const { v4 } = require('uuid')

const signup = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Sign Up`)
        var viewData = {
            title: 'Sign Up'
        }

        if (sessions.includes(req.sessionID)) {
            logger.debug(`Session '${req.sessionID}' is Destroyed`)
            sessions.destroy(req.sessionID)
            req.session.destroy()
        }
        logger.debug(`Session '${req.sessionID}' is Created`)
        sessions.create(req.sessionID)
        datadog.increment('witkc.signup.calls')
        res.render('signup', viewData)
    },

    async post(req, res) {
        logger.info(`Session '${req.sessionID}': Posting Sign Up Form`)
        if (true) {
            var member = {
                memberId: v4(),
                username: req.body.username,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                address: {
                    lineOne: req.body.address.line_one,
                    lineTwo: req.body.address.line_two,
                    county: req.body.address.county,
                    eir: req.body.address.eir,
                },
                dateJoined: new Date().toISOString().substring(0, 10)
            }

            const password = {
                memberId: member.memberId,
                hash: bcrypt.hashSync(req.body.password, 10)
            }

            members.create(member)
            passwords.create(password)

            logger.info(`Session '${req.sessionID}': Successfully Signed Up`)
            sessions.create(req.session.id, member.memberId)
            req.session.userId = member.memberId
            datadog.increment('witkc.signup.signups')
            res.redirect("/")
        } else {
            logger.info(`Session '${req.sessionID}': Sign Up Failed`)
            res.redirect("/signup")
        }
    }
}

module.exports = signup