'use strict'

// Imports
const logger = require('../log.js')
const members = require('../data_managers/witkc_members')
const passwords = require("../data_managers/passwords")
const bcrypt = require('bcrypt')
const uuid = require('uuid')

const signup = {
    async get(req, res) {
        logger.info(`Session '${req.sessionID}': Getting Sign Up`)
        var viewData = {
            title: 'Sign Up'
        }

        req.session.destroy()
        res.render('signup', viewData)
    },

    async post(req, res) {
        logger.info(`Session '${req.sessionID}': Posting Sign Up Form`)
        if (true) {
            var member = {
                memberId: uuid.v4(),
                username: req.body.username,
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                email: req.body.email,
                phone: req.body.phone,
                verified: false,
                address: {
                    lineOne: req.body.line_one,
                    lineTwo: req.body.line_two,
                    city: req.body.city,
                    county: req.body.county,
                    eir: req.body.eir,
                },
                dateJoined: new Date().toISOString().substring(0, 10)
            }
            req.session.userID = member.memberId
            members.create(member)
            passwords.create(member.memberId, bcrypt.hashSync(req.body.password, 10))

            logger.info(`Session '${req.sessionID}': Successfully Signed Up`)
            res.redirect("/")
        } else {
            logger.info(`Session '${req.sessionID}': Sign Up Failed`)
            res.redirect("/signup")
        }
    }
}

module.exports = signup