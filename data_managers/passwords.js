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
                'memberId': { S: memberId },
                'hash': { S: hash }
            },
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    objectType: 'password',
                    storageType: 'dynamo',
                    message: `Created Password`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'password',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Create Password`
            })
            return false
        })
    },

    async get(memberId) {
        // Returns null as a string so that bcrypt doesn't fail
        if (memberId === null || memberId === undefined) return 'null'
        return dynamo.getItem({
            Key: { 'memberId': { S: memberId } },
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                logger.info({
                    memberId: memberId,
                    objectType: 'password',
                    storageType: 'dynamo',
                    message: `Got Password`
                })
                return data.Item['hash'].S
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'password',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Password`
            })
            return 'null'
        })
    },

    async update(memberId, hash) {
        if (memberId === null || memberId === undefined || hash === null || hash === undefined) return false
        return dynamo.putItem({
            Item: {
                'memberId': { S: memberId },
                'hash': { S: hash }
            },
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    objectType: 'password',
                    storageType: 'dynamo',
                    message: `Updated Password`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'password',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Update Password`
            })
            return false
        })
    },

    async delete(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'memberId': { S: memberId } },
            TableName: 'witkc-passwords'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    objectType: 'password',
                    storageType: 'dynamo',
                    message: `Deleted Password`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'password',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Delete Password`
            })
            return false
        })
    }
}

module.exports = passwords