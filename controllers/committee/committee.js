'use strict'

// Imports
const logger = require('../../log.js')
const uuid = require('uuid')
const announcements = require('../../data_managers/announcements.js')
const committeeStore = require('../../data_managers/committee.js')
const members = require('../../data_managers/members.js')
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
    },

    async list(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            var result = await committeeStore.getAll()
            if (result != null) res.status(200).json(result)
            else res.sendStatus(503)
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

    async appoint(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate admin
            if (data.admin) {
                var valid = true

                console.log(req.body)

                // Validate input
                if (await members.get(req.body.captain) == null && req.body.captain != '') valid = false
                if (await members.get(req.body.vice) == null && req.body.vice != '') valid = false
                if (await members.get(req.body.safety) == null && req.body.safety != '') valid = false
                if (await members.get(req.body.treasurer) == null && req.body.treasurer != '') valid = false
                if (await members.get(req.body.equipments) == null && req.body.equipments != '') valid = false
                if (await members.get(req.body.pro) == null && req.body.pro != '') valid = false
                if (await members.get(req.body.freshers) == null && req.body.freshers != '') valid = false

                if (valid) {
                    if (await committeeStore.setMemberForRole('captain', req.body.captain) &&
                        await committeeStore.setMemberForRole('vice', req.body.vice) &&
                        await committeeStore.setMemberForRole('safety', req.body.safety) &&
                        await committeeStore.setMemberForRole('treasurer', req.body.treasurer) &&
                        await committeeStore.setMemberForRole('equipments', req.body.equipments) &&
                        await committeeStore.setMemberForRole('pro', req.body.pro) &&
                        await committeeStore.setMemberForRole('freshers', req.body.freshers)) res.sendStatus(200)
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