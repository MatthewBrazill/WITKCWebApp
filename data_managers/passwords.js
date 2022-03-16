'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const passwords = {
    async create(memberId, hash) {
        return dynamo.putItem({
            Item: {
                'member-id': { S: memberId },
                'hash': { S: hash }
            },
            TableName: 'witkc-passwords'
        }).promise().then(() => {
            logger.info(`Password created!`)
            return true
        }).catch((err) => {
            logger.warn(`Password creation failed! ${err}`)
            return false
        })
    },

    async get(memberId) {
        return dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data.Item == undefined) return data.Item['hash'].S
            else return null
        }).catch(() => {
            logger.warn(`Password couldn't be retrieved! ${err}`)
            return null
        })
    },

    async update(memberId, hash) {
        return dynamo.updateItem({
            Key: { 'member-id': { S: memberId } },
            ExpressionAttributeValues: { ':hash': hash },
            UpdateExpression: 'SET hash = :hash',
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data.Item != undefined) return true
            else return false
        }).catch((err, data) => {
            logger.warn(`Password couldn't be updated! ${err}`)
            return false
        })
    },

    delete(memberId) {
        dynamo.deleteItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-passwords'
        }).promise().then(() => {
            logger.info(`Password for user ${memberId} deleted!`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete password for user ${memberId}! ${err}`)
            return false
        })
    }
}

module.exports = passwords