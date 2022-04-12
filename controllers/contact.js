'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const ses = new AWS.SESV2()
const uuid = require('uuid')
const logger = require('../log.js')
const viewData = require('../view_data.js')

const contact = {
    async get(req, res) {
        var data = await viewData.get(req, 'Contact Us')
        data.scripts.contact = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/contact_scripts.js' })
        
        logger.info(`Session '${req.sessionID}': Getting Contact`)
        res.render('contact', data)
    },

    async post(req, res) {
        try {
            var ticket = uuid.v4()
            var valid = true


            if (!req.body.first_name.match(/^\p{L}{1,16}$/u)) valid = false
            if (!req.body.last_name.match(/^\p{L}{1,16}$/u)) valid = false
            if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,})$/i)) valid = false
            if (!req.body.message.match(/^.{1,500}$/u)) valid = false

            if (valid) {
                ses.sendEmail({
                    Content: {
                        Simple: {
                            Body: { Text: { Data: `From: ${req.body.first_name} ${req.body.last_name}\nE-Mail: ${req.body.email}\nTime: ${new Date()}\nTicket: ${ticket}\n\n\n${req.body.message}` } },
                            Subject: { Data: `Contact Form Message: ${ticket}` }
                        }
                    },
                    FromEmailAddress: 'witkc.contact-form@brazill.net',
                    Destination: { ToAddresses: ['matthew.s.brazill@gmail.com'] },
                    ReplyToAddresses: [req.body.email]
                }).promise().then(() => {
                    logger.info(`Session '${req.sessionID}': Sent contact message!`)
                    res.sendStatus(200)
                }).catch((err) => {
                    logger.info(`Session '${req.sessionID}': Failed to send message! ${err}`)
                    res.status(500).json(err)
                })
            } else {
                logger.info(`Session '${req.sessionID}': Tried to send invalid message!`)
                res.sendStatus(400)
            }
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = contact