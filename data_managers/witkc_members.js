'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const certificates = require('./certificates.js')
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

    async setCommitteeMemberForRole(role, memberId) {
        if (!['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers'].includes(role) || memberId === null || memberId === undefined) return false
        return dynamo.updateItem({
            Key: { 'memberId': { S: await this.getCommitteeMemberForRole(role) } },
            UpdateExpression: 'REMOVE committeeRole',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                return dynamo.updateItem({
                    Key: { 'memberId': { S: memberId } },
                    ExpressionAttributeValues: { ':role': { S: role } },
                    UpdateExpression: 'SET committeeRole = :role',
                    TableName: 'witkc-members'
                }).promise().then((data) => {
                    if (data.Items[0] != undefined) {
                        return true
                    } else throw `Failed to add committee role to new member!`
                })
            } else throw `Failed to remove committee role from old member!`
        }).catch((err) => {
            logger.warn(`Could not change committee member for role '${role}'! ${err}`)
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
        }).promise().then((data) => {
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
                            certificates.get(item.S).then((cert) => { member.certs.push(cert) })
                        }
                    }
                    else if (attr == 'trips') {
                        member.trips = []
                        for (var item of data.Item['trips'].L) member.trips.push(item.S)
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
            } else throw `Received unexpected response from AWS! Got: ${data}`
        }).catch((err) => {
            logger.warn(`Failed to retrieve members! ${err}`)
            return null
        })
    },

    async getCommittee() {
        return dynamo.scan({
            ExpressionAttributeNames: {
                '#ID': 'memberId',
                '#FN': 'firstName',
                '#LN': 'lastName',
                '#CR': 'committeeRole',
                '#IMG': 'img'
            },
            FilterExpression: 'attribute_exists(committeeRole)',
            ProjectionExpression: '#ID, #FN, #LN, #CR, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var res = {}
                for (var item of data.Items) {
                    if (!['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers'].includes(item['committeeRole'].S)) {
                        res[item['committeeRole'].S].memberId = item['memberId'].S
                        res[item['committeeRole'].S].firstName = item['firstName'].S
                        res[item['committeeRole'].S].lastName = item['lastName'].S
                        res[item['committeeRole'].S].img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                    }
                }
                return res
            } else throw `Retrieved an unexpected amount of committee members! Got ${data.Items.length}`
        }).catch((err) => {
            logger.warn(`Could not get all members of the committee! ${err}`)
            return null
        })
    },

    async getCommitteeMemberForRole(role) {
        if (!['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers', 'admin'].includes(role)) return null
        return dynamo.scan({
            ExpressionAttributeNames: {
                '#ID': 'memberId',
                '#FN': 'firstName',
                '#LN': 'lastName',
                '#CR': 'committeeRole',
                '#IMG': 'img'
            },
            ExpressionAttributeValues: { ':role': { S: role } },
            FilterExpression: '#CR = :role',
            ProjectionExpression: '#ID, #FN, #LN, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items[0] != undefined) {
                return {
                    memberId: data.Items[0]['memberId'].S,
                    firstName: data.Items[0]['firstName'].S,
                    lastName: data.Items[0]['lastName'].S,
                    committeeRole: role,
                    img: data.Items[0]['img'].S
                }
            } else return null
        }).catch((err) => {
            logger.warn(`Could not get committee member for role '${role}'! ${err}`)
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
            else throw `Received unexpected response from AWS! Got: ${data}`
        }).catch((err) => {
            logger.warn(`Failed to verify existence of member ${memberId}! ${err}`)
            return false
        })
    },

    async isCommittee(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.getItem({
            Key: { 'memberId': { S: memberId } },
            ExpressionAttributeNames: { '#CR': 'committeeRole' },
            ProjectionExpression: '#CR',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Item['committeeRole'] != undefined) {
                if (['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers', 'admin'].includes(data.Item['committeeRole'].S)) return true
                else return false
            } else throw `Received unexpected response from AWS! Got: ${data}`
        }).catch((err) => {
            logger.warn(`Failed to verify committee membership of member ${memberId}! ${err}`)
            return false
        })
    },

    async update(member) {
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
        }).promise().then(() => {
            logger.info(`Member ${member.memberId}: Updated`)
            return true
        }).catch((err) => {
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
            else throw `Failed to add cert to member!`
        }).catch((err) => {
            logger.warn(`Could not award certificate '${certId}' to member '${memberId}'! ${err}`)
            return false
        })
    },

    async rescindCert(memberId, certId) {
        if (memberId === null || memberId === undefined || certId === null || certId === undefined) return false
        return dynamo.updateItem({
            Key: { 'memberId': { S: memberId } },
            ExpressionAttributeValues: { ':cert': { L: [{ S: certId }] } },
            UpdateExpression: 'SET certs = list_append(certs, :cert)',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) return true
            else throw `Failed to remove cert from member!`
        }).catch((err) => {
            logger.warn(`Could not remove certificate '${certId}' from member '${memberId}'! ${err}`)
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