'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const passwords = {
    async create(memberId, hash) {
        if (memberId === null || memberId === undefined || hash === null || hash === undefined) return false
        return dynamo.putItem({
            Item: {
                'member-id': { S: memberId },
                'hash': { S: hash }
            },
            TableName: 'witkc-passwords'
        }).promise().then(() => {
            logger.info(`Password for user ${memberId}: Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create password for user ${memberId}! ${err}`)
            return false
        })
    },

    async get(memberId) {
        // Returns null as a string so that bcrypt doesn't fail
        if (memberId === null || memberId === undefined) return 'null'
        return dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data.Item != undefined) return data.Item['hash'].S
            else return 'null'
        }).catch((err) => {
            logger.warn(`Failed to retrieve password for user ${memberId}! ${err}`)
            return 'null'
        })
    },

    async update(memberId, hash) {
        if (memberId === null || memberId === undefined || hash === null || hash === undefined) return false
        return dynamo.putItem({
            Item: {
                'member-id': { S: memberId },
                'hash': { S: hash }
            },
            TableName: 'witkc-passwords'
        }).promise().then(() => {
            logger.info(`Password for user ${memberId}: Updated`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to update password for user ${memberId}! ${err}`)
            return false
        })
    },

    async delete(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-passwords'
        }).promise().then(() => {
            logger.info(`Password for user ${memberId}: Deleted`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete password for user ${memberId}! ${err}`)
            return false
        })
    }
}

module.exports = passwords