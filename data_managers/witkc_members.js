'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const members = {
    async create(member) {
        if (member == null) return false
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
            logger.info(`Member ${member.memberId}: Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create member ${member.memberId}! ${err}`)
            return false
        })
    },

    async resolveUsername(username) {
        if (username == null) return null
        return dynamo.scan({
            ExpressionAttributeNames: { '#ID': 'member-id' },
            ExpressionAttributeValues: { ':username': { S: username } },
            FilterExpression: 'username = :username',
            ProjectionExpression: '#ID',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items[0] != undefined) return data.Items[0]['member-id'].S
            else return null
        }).catch((err) => {
            logger.warn(`Could not resolve username ${username}! ${err}`)
            return null
        })
    },

    async get(memberId) {
        if (memberId == null) return null
        return dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Item != undefined) return {
                memberId: data.Item['member-id'].S,
                username: data.Item['username'].S,
                firstName: data.Item['first-name'].S,
                lastName: data.Item['last-name'].S,
                email: data.Item['email'].S,
                phone: data.Item['phone'].N,
                verified: data.Item['verified'].BOOL,
                address: {
                    lineOne: data.Item['address'].L[0].S,
                    lineTwo: data.Item['address'].L[1].S,
                    city: data.Item['address'].L[2].S,
                    county: data.Item['address'].L[3].S,
                    eir: data.Item['address'].L[4].S
                },
                dateJoined: data.Item['date-joined'].S
            }
            else return null
        }).catch((err) => {
            logger.warn(`Failed to retrieve member ${memberId}! ${err}`)
            return null
        })
    },

    async exists(memberId) {
        if (memberId == null) return false
        return dynamo.getItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Item != undefined) return true
            else return false
        }).catch((err) => {
            logger.warn(`Failed to retrieve member ${memberId}! ${err}`)
            return false
        })
    },

    async update(member) {
        if (member == null) return false
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
            logger.info(`Member ${memberId}: Updated`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to update member ${member.memberId}! ${err}`)
            return false
        })
    },

    async delete(memberId) {
        if (memberId == null) return false
        return dynamo.deleteItem({
            Key: { 'member-id': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then(() => {
            logger.info(`Member ${memberId}: Deleted`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete member ${memberId}! ${err}`)
            return false
        })
    }
}

module.exports = members