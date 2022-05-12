'use strict'

// Imports
const logger = require('../log.js')
const fs = require('fs')

const announcements = {
    async create(announcement) {
        try {
            if (announcement == null || announcement == undefined) throw `Received invalid announcement!`
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
            if (memberId == null || memberId == undefined) throw `Received invalid memberId!`
            var unreads = []
            const announcements = JSON.parse(fs.readFileSync('./data_managers/announcements.json'))
            for (var announcement of announcements) if (!announcement.readBy.includes(memberId)) unreads.push(announcement)
            return unreads
        } catch (err) {
            logger.warn(`Failed to get unread announcements! ${err}`)
            return null
        }
    },

    async update(announcement) {

    },

    async markRead(announcementId, memberId) {
        try {
            if (memberId == null || memberId == undefined) throw `Received invalid memberId!`
            if (announcementId == null || announcementId == undefined) throw `Received invalid announcementId!`
            const announcements = JSON.parse(fs.readFileSync('./data_managers/announcements.json'))
            for (var announcement of announcements) if (announcement.announcementId == announcementId) {
                announcement.readBy.push(memberId)
                fs.writeFileSync('./data_managers/announcements.json', JSON.stringify(announcements))
                return true
            }
            throw 'Failed to find announcement.'
        } catch (err) {
            logger.warn(`Failed to mark announcement '${announcementId}' as read! ${err}`)
            return false
        }
    },

    async delete(announcementId) {

    }
}

module.exports = announcements