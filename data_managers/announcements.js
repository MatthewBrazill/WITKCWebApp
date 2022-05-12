'use strict'

// Imports
const logger = require('../log.js')
const fs = require('fs')

const announcements = {
    async create(announcement) {
        try {
            if (announcement == null || announcement == undefined) throw `Received invalid announcement ID!`
            const announcements = JSON.parse(fs.readFileSync('./data_managers/announcements.json'))
            announcements.push(announcement)
            fs.writeFileSync('./data_managers/announcements.json', JSON.stringify(announcements))
            return true
        } catch (err) {
            logger.warn(`Failed to create announcement! ${err}`)
            return false
        }
    },

    async getUnread(memberId) {
        try {
            if (memberId == null || memberId == undefined) throw `Received invalid announcement ID!`
            var unreads = []
            const announcements = JSON.parse(fs.readFileSync('./data_managers/announcements.json'))
            for (var announcement of announcements) if (announcements.readBy.includes(memberId)) unreads.push(announcement)
            return unreads
        } catch (err) {
            logger.warn(`Failed to get unread announcements! ${err}`)
            return null
        }
    },

    async update(announcement) {

    },

    async markRead(announcementId, memberId) {

    },

    async delete(announcementId) {

    }
}

module.exports = announcements