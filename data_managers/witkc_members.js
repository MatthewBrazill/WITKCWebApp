'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const members = {
    async create(member) {
        return dynamo.putItem({
            Item: {
                'member-id': { S: member.memberId },
                'username': { S: member.username },
                'first-name': { S: member.firstName },
                'last-name': { S: member.lastName },
                'email': { S: member.email },
                'phone': { N: member.phone },
                'date-joined': { S: member.dateJoined },
                'verified': { BOOL: member.verified },
                'address': {
                    L: [
                        { S: member.address.lineOne },
                        { S: member.address.lineTwo },
                        { S: member.address.city },
                        { S: member.address.county },
                        { S: member.address.eir }
                    ]
                }
            },
            TableName: 'witkc-members'
        }).promise().then(() => {
            logger.info(`Member created!`)
            return true
        }).catch((err) => {
            logger.warn(`Member creation failed! ${err}`)
            return false
        })
    },

    async resolveUsername(username) {
        return dynamo.scan({
            ExpressionAttributeValues: { ':username': { S: username } },
            FilterExpression: 'username = :username',
            ProjectionExpression: 'member-id',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            console.log(data)
            if (data.Items != undefined) return data.Items[0]
            else return null
        }).catch((err) => {
            logger.warn(`Could not resolve username ${username}! ${err}`)
            return null
        })
    },

    async get(memberId) {
        return dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc=members'
        }).promise().then((data) => {
            if (data.Item != undefined) return data.Item
            else return null
        }).catch((err) => {
            logger.warn(`Member couldn't be retrieved! ${err}`)
            return null
        })
    },

    async exists(memberId) {
        return dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc=members'
        }).promise().then((data) => {
            if (data.Item != undefined) return true
            else return false
        }).catch((err) => {
            logger.warn(`Member couldn't be retrieved! ${err}`)
            return false
        })
    },

    async update(member) {
        return dynamo.putItem({
            Item: {
                'member-id': { S: member.memberId },
                'username': { S: member.username },
                'first-name': { S: member.firstName },
                'last-name': { S: member.lastName },
                'email': { S: member.email },
                'phone': { N: member.phone },
                'date-joined': { S: member.dateJoined },
                'verified': { B: member.verified },
                'address': {
                    'line-one': { S: member.address.lineOne },
                    'line-two': { S: member.address.lineTwo },
                    'city': { S: member.address.city },
                    'county': { S: member.address.county },
                    'eir-code': { S: member.address.eir },
                }
            },
            TableName: 'witkc-members'
        }).promise().then(() => {
            logger.info(`Member updated!`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to update member ${member.memberId}! ${err}`)
            return false
        })
    },

    async delete(memberId) {
        return dynamo.deleteItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then(() => {
            logger.info(`Member ${memberId} deleted!`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete member ${memberId}! ${err}`)
            return false
        })
    }
}

module.exports = members