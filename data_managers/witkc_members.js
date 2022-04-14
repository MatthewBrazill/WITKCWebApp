'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const certificates = require('./certificates.js')
const trips = require('./trips.js')
const dynamo = new AWS.DynamoDB()
const s3 = new AWS.S3()

const members = {
    async create(member) {
        if (member === null || member === undefined) return false
        return dynamo.putItem({
            Item: {
                'memberId': { S: member.memberId },
                'username': { S: member.username },
                'firstName': { S: member.firstName },
                'lastName': { S: member.lastName },
                'email': { S: member.email },
                'phone': { S: member.phone },
                'verified': { BOOL: member.verified },
                'promotion': { BOOL: member.promotion },
                'address': {
                    L: [
                        { S: member.address.lineOne },
                        { S: member.address.lineTwo },
                        { S: member.address.city },
                        { S: member.address.county },
                        { S: member.address.code }
                    ]
                },
                'certs': { L: [] },
                'trips': { L: [] },
                'img': { S: member.img },
                'dateJoined': { S: member.dateJoined }
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
            ExpressionAttributeNames: { '#ID': 'memberId' },
            ExpressionAttributeValues: { ':username': { S: username } },
            FilterExpression: 'username = :username',
            ProjectionExpression: '#ID',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items[0] != undefined) return data.Items[0]['memberId'].S
            else return null
        }).catch((err) => {
            logger.warn(`Could not resolve username ${username}! ${err}`)
            return null
        })
    },

    async get(memberId) {
        if (memberId === null || memberId === undefined) return null
        return dynamo.getItem({
            Key: { 'memberId': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then(async (data) => {
            if (data.Item != undefined) {
                var member = {}
                for (var attr in data.Item) {
                    if ('S' in data.Item[attr]) member[attr] = data.Item[attr].S
                    else if ('BOOL' in data.Item[attr]) member[attr] = data.Item[attr].BOOL
                    else if (attr == 'address') {
                        member.address = {
                            lineOne: data.Item['address'].L[0].S,
                            lineTwo: data.Item['address'].L[1].S,
                            city: data.Item['address'].L[2].S,
                            county: data.Item['address'].L[3].S,
                            code: data.Item['address'].L[4].S
                        }
                    }
                    else if (attr == 'certs') {
                        member.certs = []
                        for (var item of data.Item['certs'].L) {
                            member.certs.push(await certificates.get(item.S))
                        }
                    }
                    else if (attr == 'trips') {
                        member.trips = []
                        for (var item of data.Item['trips'].L) {
                            member.trips.push(await trips.get(item.S))
                        }
                    }
                    else if ('L' in data.Item[attr]) {
                        member[attr] = []
                        for (var item of data.Item[attr].L) member[attr].push(item.S)
                    }
                }
                return member

            }
            else return null
        }).catch((err) => {
            logger.warn(`Failed to retrieve member ${memberId}! ${err}`)
            return null
        })
    },

    async list() {
        return dynamo.scan({
            ExpressionAttributeNames: {
                '#ID': 'memberId',
                '#FN': 'firstName',
                '#LN': 'lastName',
                '#IMG': 'img'
            },
            ExpressionAttributeValues: { ':username': { S: 'admin' } },
            FilterExpression: 'NOT username = :username',
            ProjectionExpression: '#ID, #FN, #LN, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var members = []
                for (var item of data.Items) {
                    members.push({
                        memberId: item['memberId'].S,
                        firstName: item['firstName'].S,
                        lastName: item['lastName'].S,
                        img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                    })
                }
                return members
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to retrieve members! ${err}`)
            return null
        })
    },

    async exists(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.getItem({
            Key: { 'memberId': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Item != undefined) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to verify existence of member ${memberId}! ${err}`)
            return false
        })
    },

    async update(member) {
        if (member === null || member === undefined) return false
        var attributes = {}
        var expression = 'SET '
        for (var attr in member) {
            if (attr == 'memberId') { }
            else if (typeof member[attr] == 'boolean') {
                attributes[`:${attr}`] = { BOOL: member[attr] }
                expression += `${attr} = :${attr}, `
            } else if (attr == 'address') {
                attributes[':address'] = {
                    L: [
                        { S: member.address.lineOne },
                        { S: member.address.lineTwo },
                        { S: member.address.city },
                        { S: member.address.county },
                        { S: member.address.code }
                    ]
                }
                expression += `${attr} = :${attr}, `
            } else {
                attributes[`:${attr}`] = { S: member[attr] }
                expression += `${attr} = :${attr}, `
            }
        }
        if (expression.slice(-2) == ', ') expression = expression.slice(0, -2)
        return dynamo.updateItem({
            Key: { 'memberId': { S: member.memberId } },
            ExpressionAttributeValues: attributes,
            UpdateExpression: expression,
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            if (member.memberId === undefined) err = `'member.memberId' was not supplied!`
            logger.warn(`Failed to update member ${member.memberId}! ${err}`)
            return false
        })
    },

    async awardCert(memberId, certId) {
        if (memberId === null || memberId === undefined || certId === null || certId === undefined) return false
        return dynamo.updateItem({
            Key: { 'memberId': { S: memberId } },
            ExpressionAttributeValues: { ':cert': { L: [{ S: certId }] } },
            UpdateExpression: 'SET certs = list_append(certs, :cert)',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not award certificate '${certId}' to member '${memberId}'! ${err}`)
            return false
        })
    },

    async revokeCert(memberId, certId) {
        if (memberId === null || memberId === undefined || certId === null || certId === undefined) return false
        return dynamo.getItem({
            ExpressionAttributeNames: { '#CERT': 'certs' },
            Key: { 'memberId': { S: memberId } },
            ProjectionExpression: '#CERT',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                for (var i in data.Item['certs'].L) if (data.Item['certs'].L[i].S == certId) return i
                return -1
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).then((index) => {
            if (index != -1) return dynamo.updateItem({
                Key: { 'memberId': { S: memberId } },
                UpdateExpression: `REMOVE certs[${index}]`,
                TableName: 'witkc-members'
            }).promise().then((data) => {
                if (data) return true
                else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
            }).catch((err) => { throw err })
            else return false
        }).catch((err) => {
            logger.warn(`Could not remove certificate '${certId}' from member '${memberId}'! ${err}`)
            return false
        })
    },

    async joinTrip(memberId, tripId) {
        if (memberId === null || memberId === undefined || tripId === null || tripId === undefined) return false
        return dynamo.updateItem({
            Key: { 'tripId': { S: tripId } },
            ExpressionAttributeValues: { ':member': { L: [{ S: memberId }] } },
            UpdateExpression: 'SET members = list_append(members, :member)',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not add member '${memberId}' to trip '${tripId}'! ${err}`)
            return false
        })
    },

    async leaveTrip(memberId, tripId) {
        if (memberId === null || memberId === undefined || tripId === null || tripId === undefined) return false
        return dynamo.getItem({
            ExpressionAttributeNames: { '#MBRS': 'members' },
            Key: { 'tripId': { S: tripId } },
            ProjectionExpression: '#MBRS',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                for (var i in data.Item['members'].L) if (data.Item['members'].L[i].S == memberId) return i
                return -1
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).then((index) => {
            if (index != -1) return dynamo.updateItem({
                Key: { 'tripId': { S: tripId } },
                UpdateExpression: `REMOVE members[${index}]`,
                TableName: 'witkc-trips'
            }).promise().then((data) => {
                if (data) return true
                else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
            }).catch((err) => { throw err })
            else return false
        }).catch((err) => {
            logger.warn(`Could not remove member '${memberId}' from trip '${tripId}'! ${err}`)
            return false
        })
    },

    async delete(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'memberId': { S: memberId } },
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