'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const sessions = {
    create(sessionId, userId) {
        dynamo.putItem({
            Item: {
                'session-id': { S: sessionId },
                'user-id': { S: userId }
            },
            TableName: 'witkc-sessions'
        }, (err) => {
            if (err) {
                logger.warn(`Session Creation Failed! ${err}`)
                return false
            } else {
                logger.info(`Session Created!`)
                return true
            }
        })
        setTimeout(() => this.destroy(sessionId), 300000)
    },

    create(sessionId) {
        dynamo.putItem({
            Item: { 'session-id': { S: sessionId } },
            TableName: 'witkc-sessions'
        }, (err) => {
            if (err) {
                logger.warn(`Session Creation Failed! ${err}`)
                return false
            } else {
                logger.info(`Session Created!`)
                return true
            }
        })
        setTimeout(() => this.destroy(sessionId), 300000)
    },

    includes(sessionId) {
        dynamo.getItem({
            Key: { 'session-id': { S: sessionId } },
            TableName: 'witkc-sessions'
        }, (err, data) => {
            if (err) {
                logger.warn(`Error when Querying Session! ${err}`)
                return false
            } else {
                if (data.Item) return true
                else return false
            }
        })
    },

    destroy(sessionId) {
        dynamo.deleteItem({
            Key: { 'session-id': { S: sessionId } },
            TableName: 'witkc-sessions'
        }, (err) => {
            if (err) {
                logger.warn(`Failed to Destroy Session ${sessionId}! ${err}`)
                return false
            } else {
                logger.info(`Session Deleted!`)
                return true
            }
        })
    }
}

module.exports = sessions