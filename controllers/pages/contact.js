'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const ses = new AWS.SESV2()
const uuid = require('uuid')
const logger = require('../../log.js')
const helper = require('../helper.js')

const contact = {
    async contactPage(req, res) {
        var data = await helper.viewData(req, 'Contact Us')
        data.scripts.contact = process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/contact_scripts.js' : '/js/contact_scripts.js'
        res.render(`${req.device.type}/contact`, data)
    },

    async sendMessage(req, res) {
        try {
            var ticket = uuid.v4()
            var valid = true

            if (!req.body.firstName.match(/^['-\.\p{L}]{1,16}$/u)) valid = false
            if (!req.body.lastName.match(/^['-\.\p{L}]{1,16}$/u)) valid = false
            if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) valid = false
            if (!req.body.message.match(/^[^<>]{1,500}$/u)) valid = false

            // Validate input
            if (valid) {
                ses.sendEmail({
                    Content: {
                        Simple: {
                            Body: {
                                Text: {
                                    Data:
                                        `From: ${req.body.firstName} ${req.body.lastName}\n
                                E-Mail: ${req.body.email}\n
                                Time: ${new Date()}\n
                                Ticket: ${ticket}\n
                                \n
                                \n${req.body.message}`
                                }
                            },
                            Subject: { Data: `Contact Form Message: ${ticket}` }
                        }
                    },
                    FromEmailAddress: 'setukc.contact-form@brazill.net',
                    Destination: { ToAddresses: ['matthew.s.brazill@gmail.com'] },
                    ReplyToAddresses: [req.body.email]
                }).promise().then(() => {
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `Sent Message`
                    })
                    res.sendStatus(200)
                }).catch((err) => {
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
                })
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

module.exports = contact