'use strict'

// Imports
const logger = require('../../log.js')
const uuid = require('uuid')
const announcements = require('../../data_managers/announcements.js')
const helper = require('../helper.js')

const committee = {
    async createAnnouncement(req, res) {
        try {
            var data = await helper.viewData(req, 'API')
            var valid = true

            // Authenticate user
            if (data.loggedIn) if (data.committee || data.admin) {

                // Validate input
                if (!req.body.title.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (!req.body.content.match(/^[^<>]{1,500}$/u)) valid = false

                if (valid) {
                    if (await announcements.create({
                        announcementId: uuid.v4(),
                        title: helper.capitalize(req.body.title),
                        content: req.body.content,
                        readBy: [],
                        date: new Date().toUTCString(),
                        author: data.member.memberId
                    })) res.sendStatus(200)
                    else res.sendStatus(503)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
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
    },

    async readAnnouncement(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) {

                // Validate inout
                if (req.body.announcementId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await announcements.markRead(req.body.announcementId, data.member.memberId)) res.sendStatus(200)
                    else res.sendStatus(503)
                } else res.sendStatus(400)
            } else res.sendStatus(401)
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

module.exports = committee