'use strict'

// Imports
const logger = require('../log.js')
const certificates = require('./certificates.js')
const AWS = require('aws-sdk')
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
                'img': { S: member.img },
                'dateJoined': { S: member.dateJoined }
            },
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    member: member,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Created Member`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                member: member,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Create Member`
            })
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
            if (data.Items[0] != undefined) {
                logger.info({
                    username: username,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Resolved Username`
                })
                return data.Items[0]['memberId'].S
            } else return null
        }).catch((err) => {
            logger.warn({
                username: username,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Resolve Username`
            })
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
                var member = { certs: [] }
                for (var attr in data.Item) {
                    if ('S' in data.Item[attr]) member[attr] = data.Item[attr].S
                    else if ('SS' in data.Item[attr]) member[attr] = data.Item[attr].SS
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
                }
                for (var i in member.certs) member.certs[i] = await certificates.get(member.certs[i])
                logger.info({
                    memberId: memberId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Got Member`
                })
                return member
            } else {
                logger.info({
                    memberId: memberId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Member Does Not Exists`
                })
                return null
            }
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Member`
            })
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
        }).promise().then(async (data) => {
            if (data.Items != undefined) {
                var members = []
                for (var item of data.Items) {
                    members.push({
                        memberId: item['memberId'].S,
                        firstName: item['firstName'].S,
                        lastName: item['lastName'].S,
                        img: await s3.getSignedUrlPromise('getObject', { Bucket: 'setukc-private', Key: item['img'].S })
                    })
                }
                logger.info({
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Listed Member`
                })
                return members
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To List Members`
            })
            return null
        })
    },

    async update(member) {
        if (member === null || member === undefined) return false
        if (member.memberId === null || member.memberId === undefined) return false
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
            if (data) {
                logger.info({
                    member: member,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Updated Member`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                member: member,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Update Members`
            })
            return false
        })
    },

    async awardCert(memberId, certId) {
        if (memberId === null || memberId === undefined || certId === null || certId === undefined) return false
        return dynamo.updateItem({
            Key: { 'memberId': { S: memberId } },
            ExpressionAttributeValues: { ':cert': { SS: [certId] } },
            UpdateExpression: 'ADD certs :cert',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    certId: certId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Awarded Certificate`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                certId: certId,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Award Certificate`
            })
            return false
        })
    },

    async revokeCert(memberId, certId) {
        if (memberId === null || memberId === undefined || certId === null || certId === undefined) return false
        return dynamo.updateItem({
            Key: { 'memberId': { S: memberId } },
            ExpressionAttributeValues: { ':cert': { SS: [certId] } },
            UpdateExpression: 'DELETE certs :cert',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    certId: certId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Revoked Certificate`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                certId: certId,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Revoke Certificate`
            })
            return false
        })
    },

    async joinTrip(memberId, tripId) {
        if (memberId === null || memberId === undefined || tripId === null || tripId === undefined) return false
        return dynamo.updateItem({
            Key: { 'tripId': { S: tripId } },
            ExpressionAttributeValues: { ':attendee': { SS: [memberId] } },
            UpdateExpression: 'ADD attendees :attendee',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    tripId: tripId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Joined Trip`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                tripId: tripId,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Join Trip`
            })
            return false
        })
    },

    async leaveTrip(memberId, tripId) {
        if (memberId === null || memberId === undefined || tripId === null || tripId === undefined) return false
        return dynamo.updateItem({
            Key: { 'tripId': { S: tripId } },
            ExpressionAttributeValues: { ':attendee': { SS: [memberId] } },
            UpdateExpression: 'DELETE attendees :attendee',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    tripId: tripId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Left Trip`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                tripId: tripId,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Leave Trip`
            })
            return false
        })
    },

    async delete(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'memberId': { S: memberId } },
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    objectType: 'member',
                    storageType: 'dynamo',
                    message: `Deleted Member`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'member',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Delete Member`
            })
            return false
        })
    }
}

module.exports = members