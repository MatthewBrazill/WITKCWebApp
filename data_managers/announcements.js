'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const announcements = {
    async create(announcement) {
        if (announcement == undefined || announcement == null) return false
        return dynamo.putItem({
            Item: {
                'announcementId': { S: announcement.announcementId },
                'title': { S: announcement.title },
                'content': { S: announcement.content },
                'date': { S: announcement.date },
                'author': { S: announcement.author }
            },
            TableName: 'witkc-announcements'
        }).promise().then(() => {
            logger.info(`Announcement '${announcement.announcementId}': Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create announcement '${announcement.announcementId}'! ${err}`)
            return false
        })
    },

    async getUnread(memberId) {
        if (memberId == null || memberId == undefined) return false
        return dynamo.scan({
            ExpressionAttributeValues: { ':memberId': { S: memberId } },
            FilterExpression: 'NOT contains(readBy, :memberId)',
            TableName: 'witkc-announcements'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var unreads = []
                for (var item of data.Items) {
                    unreads.push({
                        announcementId: item['announcementId'].S,
                        title: item['title'].S,
                        content: item['content'].S,
                        date: item['date'].S,
                        author: item['author'].S
                    })
                }
                return unreads
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to get unread announcements! ${err}`)
            return null
        })
    },

    async markRead(announcementId, memberId) {
        if (announcementId == undefined || announcementId == null || memberId == undefined || memberId == null) return false
        return dynamo.updateItem({
            Key: { 'announcementId': { S: announcementId } },
            ExpressionAttributeValues: { ':memberId': { SS: [memberId] } },
            UpdateExpression: 'ADD readBy :memberId',
            TableName: 'witkc-announcements'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not mark announcement '${announcementId}' as read by '${memberId}'! ${err}`)
            return false
        })
    }
}

module.exports = announcements