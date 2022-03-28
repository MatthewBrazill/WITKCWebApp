'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const members = {
    async create(member) {
        if (member === null || member === undefined) return false
        return dynamo.putItem({
            Item: {
                'member-id': { S: member.memberId },
                'username': { S: member.username },
                'first-name': { S: member.firstName },
                'last-name': { S: member.lastName },
                'email': { S: member.email },
                'phone': { S: member.phone },
                'verified': { BOOL: member.verified },
                'address': {
                    L: [
                        { S: member.address.lineOne },
                        { S: member.address.lineTwo },
                        { S: member.address.city },
                        { S: member.address.county },
                        { S: member.address.code }
                    ]
                },
                'img': {S: member.img},
                'date-joined': { S: member.dateJoined }
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
        if (username === null || username === undefined) return null
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
        if (memberId === null || memberId === undefined) return null
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
                phone: data.Item['phone'].S,
                verified: data.Item['verified'].BOOL,
                address: {
                    lineOne: data.Item['address'].L[0].S,
                    lineTwo: data.Item['address'].L[1].S,
                    city: data.Item['address'].L[2].S,
                    county: data.Item['address'].L[3].S,
                    code: data.Item['address'].L[4].S
                },
                img: data.Item['img'].S,
                dateJoined: data.Item['date-joined'].S
            }
            else return null
        }).catch((err) => {
            logger.warn(`Failed to retrieve member ${memberId}! ${err}`)
            return null
        })
    },

    async getCommittee() {

    },

    async exists(memberId) {
        if (memberId === null || memberId === undefined) return false
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
        if (member === null || member === undefined) return false
        return dynamo.putItem({
            Item: {
                'member-id': { S: member.memberId },
                'username': { S: member.username },
                'first-name': { S: member.firstName },
                'last-name': { S: member.lastName },
                'email': { S: member.email },
                'phone': { S: member.phone },
                'verified': { BOOL: member.verified },
                'address': {
                    L: [
                        { S: member.address.lineOne },
                        { S: member.address.lineTwo },
                        { S: member.address.city },
                        { S: member.address.county },
                        { S: member.address.code }
                    ]
                },
                'img': { S: member.img },
                'date-joined': { S: member.dateJoined }
            },
            TableName: 'witkc-members'
        }).promise().then(() => {
            logger.info(`Member ${member.memberId}: Updated`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to update member ${member.memberId}! ${err}`)
            return false
        })
    },

    async delete(memberId) {
        if (memberId === null || memberId === undefined) return false
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