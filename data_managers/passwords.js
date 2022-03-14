'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const passwords = {
    create(memberId, hash) {
        dynamo.putItem({
            Item: {
                'member-id': { S: memberId },
                'hash': { S: hash }
            },
            TableName: 'witkc-passwords'
        }, (err) => {
            if (err) {
                logger.warn(`Password creation failed! ${err}`)
                return false
            } else {
                logger.info(`Password created!`)
                return true
            }
        })
    },

    get(memberId) {
        dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-passwords'
        }, (err, data) => {
            if (err) {
                logger.warn(`Password couldn't be retrieved! ${err}`)
                return null
            } else {
                if (data.Item) return data.Item['hash'].S
                else return null
            }
        })
    },

    update(memberId, hash) {
        dynamo.updateItem({
            Key: { 'member-id': { S: memberId } },
            ExpressionAttributeValues: {':hash': hash},
            UpdateExpression: 'SET hash = :hash',
            TableName: 'witkc-passwords'
        }, (err, data) => {
            if (err) {
                logger.warn(`Password couldn't be updated! ${err}`)
                return false
            } else {
                logger.info(`Password for user ${memberId} updated!`)
                console.log('pw update data:', data)
                if (data.Item) return true
                else return false
            }
        })
    },

    delete(memberId) {
        dynamo.deleteItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-passwords'
        }, (err) => {
            if (err) {
                logger.warn(`Failed to delete password for user ${memberId}! ${err}`)
                return false
            } else {
                logger.info(`Password for user ${memberId} deleted!`)
                return true
            }
        })
    }
}

module.exports = passwords