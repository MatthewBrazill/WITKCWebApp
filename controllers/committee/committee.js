'use strict'

// Imports
const logger = require('../../log.js')
const uuid = require('uuid')
const announcements = require('../../data_managers/announcements.js')
const viewData = require('../../view_data.js')

const committee = {
    async createAnnouncement(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.loggedIn) if (data.committee || data.admin) {
                // Server-Side Validation
                if (!req.body.title.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (!req.body.content.match(/^[^<>]{1,500}$/u)) valid = false

                if (valid) {
                    await announcements.create({
                        announcementId: uuid.v4(),
                        title: viewData.capitalize(req.body.title),
                        content: req.body.content,
                        readBy: [],
                        date: new Date().toISOString().substring(0, 10).split('-').reverse().join('/'),
                        author: data.member.memberId
                    })
                    res.sendStatus(200)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async markAnnouncementRead(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) {
                // Server-Side Validation
                if (req.body.announcementId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await announcements.markRead(req.body.announcementId, data.member.memberId)) res.sendStatus(200)
                    else throw 'Could not mark announcement as read.'
                } else res.sendStatus(400)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err); console.log(err) }
    }
}

module.exports = committee