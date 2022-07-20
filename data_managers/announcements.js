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
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    announcement: announcement,
                    objectType: 'announcement',
                    storageType: 'dynamo',
                    message: `Created Announcement`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                announcement: announcement,
                objectType: 'announcement',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Create Announcement`
            })
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
                logger.info({
                    memberId: memberId,
                    objectType: 'announcement',
                    storageType: 'dynamo',
                    message: `Got Unread Announcements`
                })
                return unreads
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'announcement',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Unread Announcements`
            })
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
            if (data) {
                logger.info({
                    announcementId: announcementId,
                    memberId: memberId,
                    objectType: 'announcement',
                    storageType: 'dynamo',
                    message: `Marked Announcement As Read`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                announcementId: announcementId,
                memberId: memberId,
                objectType: 'announcement',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Mark Announcement As Read`
            })
            return false
        })
    }
}

module.exports = announcements