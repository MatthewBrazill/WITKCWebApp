'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const members = require('./witkc_members.js')
const equipment = require('./equipment.js')
const trips = require('./trips.js')
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
        }).promise().then(async (data) => {
            if (data.Item != undefined) {
                var role = {
                    roleId: data.Item['roleId'].S,
                    role: data.Item['role'].S,
                    description: data.Item['description'].S
                }
                if (data.Item['memberId'].S == '') role.member = {
                    firstName: 'Currently',
                    lastName: 'Vacant',
                    img: 'img/placeholder_avatar.webp'
                }
                else role.member = await members.get(data.Item['memberId'].S)
                if (role.roleId == 'captain') {
                    role.verificationRequest = []
                    for (var verificationRequest of data.Item['verificationRequest'].L) {
                        role.verificationRequest.push({
                            requestId: verificationRequest.M['requestId'].S,
                            member: await members.get(verificationRequest.M['memberId'].S),
                        })
                    }
                }
                if (role.roleId == 'treasurer') {
                    role.expenseRequests = []
                    for (var expenseRequest of data.Item['expenseRequests'].L) {
                        var item = {
                            expenseId: expenseRequest.M['expenseId'].S,
                            member: await members.get(expenseRequest.M['memberId'].S),
                            total: expenseRequest.M['total'].S,
                            expenses: [],
                            receipts: []
                        }
                        for (var expense of expenseRequest.M['expenses'].L) {
                            item.expenses.push({
                                description: expense.M['description'].S,
                                price: expense.M['price'].S
                            })
                        }
                        for (var receipt of expenseRequest.M['receipts'].L) {
                            item.receipts.push(receipt.S)
                        }
                        role.expenseRequests.push(item)
                    }
                }
                if (role.roleId == 'safety') role.trips = await trips.pending()
                if (role.roleId == 'equipments') role.equipment = await equipment.getAll()
                return role
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not get committee member for role '${roleId}'! ${err}`)
            return null
        })
    },

    async getAll() {
        return dynamo.scan({
            TableName: 'witkc-committee'
        }).promise().then(async (data) => {
            if (data.Items != undefined) {
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
                    else role.member = await members.get(item['memberId'].S)
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
            if (data.Items[0] != undefined) return data.Items[0]['roleId'].S
            else null
        }).catch((err) => {
            logger.warn(`Could not determine committee membership of member '${memberId}'! ${err}`)
            return null
        })
    },

    async submitExpense(expenseRequest) {
        if (expenseRequest === null || expenseRequest === undefined) return false
        var value = {
            L: [{
                M: {
                    'expenseId': { S: expenseRequest.expenseId },
                    'memberId': { S: expenseRequest.memberId },
                    'total': { S: expenseRequest.total },
                    'expenses': { L: [] },
                    'receipts': { L: [] }
                }
            }]
        }
        for (var expense of expenseRequest.expenses) value.L[0].M['expenses'].L.push({
            M: {
                'description': { S: expense.description },
                'price': { S: expense.price }
            }
        })
        for (var receipt of expenseRequest.receipts) value.L[0].M['receipts'].L.push({ S: receipt })
        return dynamo.updateItem({
            Key: { 'roleId': { S: 'treasurer' } },
            ExpressionAttributeValues: { ':expenseRequest': value },
            UpdateExpression: 'SET expenseRequests = list_append(expenseRequests, :expenseRequest)',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not submit expense request '${expenseRequest.expenseId}'! ${err}`)
            return false
        })
    },

    async deleteExpense(expenseId) {
        if (expenseId === null || expenseId === undefined) return false
        return dynamo.getItem({
            ExpressionAttributeNames: { '#EXP': 'expenseRequests' },
            Key: { 'roleId': { S: 'treasurer' } },
            ProjectionExpression: '#EXP',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                for (var i in data.Item['expenseRequests'].L) if (data.Item['expenseRequests'].L[i].M['expenseId'].S == expenseId) return i
                return -1
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).then((index) => {
            if (index != -1) return dynamo.updateItem({
                Key: { 'roleId': { S: 'treasurer' } },
                UpdateExpression: `REMOVE expenseRequests[${index}]`,
                TableName: 'witkc-committee'
            }).promise().then((data) => {
                if (data) return true
                else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
            }).catch((err) => { throw err })
            else return false
        }).catch((err) => {
            logger.warn(`Could not delete expense request '${expenseId}'! ${err}`)
            return false
        })
    },

    requestVerification(verificationRequest) {
        if (verificationRequest === null || verificationRequest === undefined) return false
        return dynamo.updateItem({
            Key: { 'roleId': { S: 'treasurer' } },
            ExpressionAttributeValues: {
                ':verificationRequest': {
                    L: [{
                        M: {
                            'expenseId': { S: verificationRequest.requestId },
                            'memberId': { S: verificationRequest.memberId }
                        }
                    }]
                }
            },
            UpdateExpression: 'SET verificationRequests = list_append(verificationRequests, :verificationRequest)',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not submit verification request '${verificationRequest.requestId}'! ${err}`)
            return false
        })
    },

    resolveVerification(requestId, decision) {
        if (requestId === null || requestId === undefined || decision === null || decision === undefined) return false
        return dynamo.getItem({
            ExpressionAttributeNames: { '#REQ': 'verificationRequests' },
            Key: { 'roleId': { S: 'captain' } },
            ProjectionExpression: '#REQ',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                for (var i in data.Item['verificationRequests'].L) if (data.Item['verificationRequests'].L[i].M['requestId'].S == requestId) return [i, data.Item['verificationRequests'].L[i].M['memberId'].S]
                return -1
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).then((result) => {
            if (result[0] != -1) {
                if (decision) members.verify(result[1])
                dynamo.updateItem({
                    Key: { 'roleId': { S: 'captain' } },
                    UpdateExpression: `REMOVE verificationRequests[${result[0]}]`,
                    TableName: 'witkc-committee'
                }).promise().then((data) => {
                    if (data) return true
                    else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
                }).catch((err) => { throw err })
            }
            else return false
        }).catch((err) => {
            logger.warn(`Could not resolve verification request '${requestId}'! ${err}`)
            return false
        })
    }
}

module.exports = committee