'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const members = require('./witkc_members.js')
const dynamo = new AWS.DynamoDB()

const committee = {

    async setMemberForRole(roleId, memberId) {
        if (roleId === null || roleId === undefined || memberId === null || memberId === undefined) return false
        return dynamo.updateItem({
            Key: { 'roleId': { S: roleId } },
            ExpressionAttributeValues: { ':memberId': { S: memberId } },
            UpdateExpression: 'SET memberId = :memberId',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not change committee member for role '${role}'! ${err}`)
            return false
        })
    },

    async getRole(roleId) {
        if (roleId === null || roleId === undefined) return null
        return dynamo.getItem({
            Key: { 'roleId': { S: roleId } },
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                return {
                    roleId: data.Item['roleId'].S,
                    role: data.Item['role'].S,
                    member: members.get(data.Item['memberId'].S).then((memberId) => memberId),
                    description: data.Item['description'].S
                }
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not get all members of the committee! ${err}`)
            return null
        })
    },

    async getAll() {
        return dynamo.scan({
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                console.log(data.Items)
                var committee = []
                for (var item of data.Items) {
                    var role = {
                        roleId: item['roleId'].S,
                        role: item['role'].S,
                        description: item['description'].S
                    }
                    if (item['memberId'].S == '') role.member = {
                        firstName: 'Currently',
                        lastName: 'Vacant',
                        img: 'img/placeholder_avatar.webp'
                    }
                    else role.member = members.get(item['memberId'].S).then((memberId) => memberId)
                    committee.push(role)
                }
                return committee
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not get all members of the committee! ${err}`)
            return null
        })
    },

    async isCommittee(memberId) {
        if (memberId === null || memberId === undefined) return null
        return dynamo.scan({
            ExpressionAttributeNames: { '#ID': 'roleId' },
            ExpressionAttributeValues: { ':memberId': { S: memberId } },
            FilterExpression: 'memberId = :memberId',
            ProjectionExpression: '#ID',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data.Items[0] != undefined) return data.Items[0]['roleId']
            else null
        }).catch((err) => {
            logger.warn(`Could not determine committee membership of member '${memberId}'! ${err}`)
            return null
        })
    }
}

module.exports = committee