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
        if (role === null || role === undefined || memberId === null || memberId === undefined) return null
        return dynamo.updateItem({
            Key: { 'member-id': { S: await this.getCommitteeMemberForRole(role) } },
            UpdateExpression: 'REMOVE committee_role',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) {
                return dynamo.updateItem({
                    Key: { 'member-id': { S: memberId } },
                    ExpressionAttributeValues: { ':role': { S: role } },
                    UpdateExpression: 'SET committee_role = :role',
                    TableName: 'witkc-members'
                }).promise().then((data) => {
                    if (data.Items[0] != undefined) {
                        return {
                            first_name: data.Items[0]['first_name'].S,
                            last_name: data.Items[0]['last_name'].S,
                            committee_role: role,
                            img: data.Items[0]['img'].S
                        }
                    } else throw `Failed to add committee role to new member!`
                })
            } else throw `Failed to remove committee role from old member!`
        }).catch((err) => {
            logger.warn(`Could not change committee member for role '${role}'! ${err}`)
            return null
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

    async getCommittee() {
        return dynamo.scan({
            ExpressionAttributeNames: {
                '#FN': 'first_name',
                '#LN': 'last_name',
                '#CR': 'committee_role',
                '#IMG': 'img'
            },
            FilterExpression: 'attribute_exists(committee_role)',
            ProjectionExpression: '#FN, #LN, #CR, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items.length == 7) {
                var res = {}
                for (var item in data.Items) {
                    switch (item['committee_role'].S) {
                        case 'captain':
                            res.captain.first_name = item['first_name'].S
                            res.captain.last_name = item['last_name'].S
                            res.captain.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'vice':
                            res.vice.first_name = item['first_name'].S
                            res.vice.last_name = item['last_name'].S
                            res.vice.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'safety':
                            res.safety.first_name = item['first_name'].S
                            res.safety.last_name = item['last_name'].S
                            res.safety.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'treasurer':
                            res.treasurer.first_name = item['first_name'].S
                            res.treasurer.last_name = item['last_name'].S
                            res.treasurer.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'equipments':
                            res.equipments.first_name = item['first_name'].S
                            res.equipments.last_name = item['last_name'].S
                            res.equipments.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'pro':
                            res.pro.first_name = item['first_name'].S
                            res.pro.last_name = item['last_name'].S
                            res.pro.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        case 'freshers':
                            res.freshers.first_name = item['first_name'].S
                            res.freshers.last_name = item['last_name'].S
                            res.freshers.img = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                            break;

                        default:
                            throw `Unexpected name for a committee position! Got: ${item['committee_role'].S}`
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
        if (role === null || role === undefined) return null
        return dynamo.scan({
            ExpressionAttributeNames: {
                '#FN': 'first_name',
                '#LN': 'last_name',
                '#IMG': 'img'
            },
            ExpressionAttributeValues: { ':role': { S: role } },
            FilterExpression: 'committee_role = :role',
            ProjectionExpression: '#FN, #LN, #IMG',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data.Items[0] != undefined) {
                return {
                    first_name: data.Items[0]['first_name'].S,
                    last_name: data.Items[0]['last_name'].S,
                    committee_role: role,
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