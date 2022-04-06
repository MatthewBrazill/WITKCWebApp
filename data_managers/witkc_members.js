'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()
const s3 = new AWS.S3()

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

    async setCommitteeMemberForRole(role, memberId) {
        if (!['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers'].includes(role) || memberId === null || memberId === undefined) return false
        return dynamo.updateItem({
            Key: { 'member-id': { S: await this.getCommitteeMemberForRole(role) } },
            UpdateExpression: 'REMOVE committee-role',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                return dynamo.updateItem({
                    Key: { 'member-id': { S: memberId } },
                    ExpressionAttributeValues: { ':role': { S: role } },
                    UpdateExpression: 'SET committee-role = :role',
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
                promotion: data.Item['promotion'].BOOL,
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

    async list() {
        return dynamo.scan({
            ExpressionAttributeNames: {
                '#ID': 'member-id',
                '#FN': 'first-name',
                '#LN': 'last-name',
                '#IMG': 'img'
            },
            ProjectionExpression: '#ID, #FN, #LN, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var members = []
                for (var item of data.Items) {
                    members.push({
                        memberId: item['member-id'].S,
                        firstName: item['first-name'].S,
                        lastName: item['last-name'].S,
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
                '#ID': 'member-id',
                '#FN': 'first-name',
                '#LN': 'last-name',
                '#CR': 'committee-role',
                '#IMG': 'img'
            },
            FilterExpression: 'attribute_exists(committee-role)',
            ProjectionExpression: '#ID, #FN, #LN, #CR, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items.length == 7) {
                var res = {}
                for (var item of data.Items) {
                    switch (item['committee-role'].S) {
                        case 'captain':
                            res.captain.memberId = item['member-id'].S
                            res.captain.firstName = item['first-name'].S
                            res.captain.lastName = item['last-name'].S
                            res.captain.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'vice':
                            res.vice.memberId = item['member-id'].S
                            res.vice.firstName = item['first-name'].S
                            res.vice.lastName = item['last-name'].S
                            res.vice.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'safety':
                            res.safety.memberId = item['member-id'].S
                            res.safety.firstName = item['first-name'].S
                            res.safety.lastName = item['last-name'].S
                            res.safety.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'treasurer':
                            res.treasurer.memberId = item['member-id'].S
                            res.treasurer.firstName = item['first-name'].S
                            res.treasurer.lastName = item['last-name'].S
                            res.treasurer.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'equipments':
                            res.equipments.memberId = item['member-id'].S
                            res.equipments.firstName = item['first-name'].S
                            res.equipments.lastName = item['last-name'].S
                            res.equipments.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'pro':
                            res.pro.memberId = item['member-id'].S
                            res.pro.firstName = item['first-name'].S
                            res.pro.lastName = item['last-name'].S
                            res.pro.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'freshers':
                            res.freshers.memberId = item['member-id'].S
                            res.freshers.firstName = item['first-name'].S
                            res.freshers.lastName = item['last-name'].S
                            res.freshers.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        default:
                            throw `Unexpected name for a committee position! Got: ${item['committee-role'].S}`
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
                '#ID': 'member-id',
                '#FN': 'first-name',
                '#LN': 'last-name',
                '#CR': 'committee-role',
                '#IMG': 'img'
            },
            ExpressionAttributeValues: { ':role': { S: role } },
            FilterExpression: '#CR = :role',
            ProjectionExpression: '#ID, #FN, #LN, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items[0] != undefined) {
                return {
                    memberId: data.Items[0]['member-id'].S,
                    firstName: data.Items[0]['first-name'].S,
                    lastName: data.Items[0]['last-name'].S,
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
            Key: { 'member-id': { S: memberId } },
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
            Key: { 'member-id': { S: memberId } },
            ExpressionAttributeNames: { '#CR': 'committee-role' },
            ProjectionExpression: '#CR',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                if (['captain', 'vice', 'safety', 'treasurer', 'equipments', 'pro', 'freshers', 'admin'].includes(data.Item['committee-role'].S)) return true
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
                'member-id': { S: member.memberId },
                'username': { S: member.username },
                'first-name': { S: member.firstName },
                'last-name': { S: member.lastName },
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

    async awardCert(memberId, certId) {
        if (memberId === null || memberId === undefined || certId === null || certId === undefined) return false
        return dynamo.updateItem({
            Key: { 'member-id': { S: memberId } },
            ExpressionAttributeValues: { ':cert': { L: [{ S: certId }] } },
            UpdateExpression: 'SET certs = list_append(certs, :cert)',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            console.log(data)
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
            Key: { 'member-id': { S: memberId } },
            ExpressionAttributeValues: { ':cert': { L: [{ S: certId }] } },
            UpdateExpression: 'SET certs = list_append(certs, :cert)',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            console.log(data)
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