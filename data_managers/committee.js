'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const members = require('./members.js')
const equipment = require('./equipment.js')
const trips = require('./trips.js')
const dynamo = new AWS.DynamoDB()

const committee = {
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

                if (role.roleId == 'captain') if (data.Item['verificationRequests'] != undefined) {
                    role.verificationRequests = []
                    for (var verificationRequest of data.Item['verificationRequests'].SS) role.verificationRequests.push(await members.get(verificationRequest))
                } else role.verificationRequests = []
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
                logger.info({
                    roleId: roleId,
                    objectType: 'committee',
                    storageType: 'dynamo',
                    message: `Got Member For Role`
                })
                return role
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                roleId: roleId,
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Member For Role`
            })
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
                        memberId: '',
                        firstName: 'Currently',
                        lastName: 'Vacant',
                        img: 'img/placeholder_avatar.webp'
                    }
                    else role.member = await members.get(item['memberId'].S)
                    committee.push(role)
                }
                logger.info({
                    objectType: 'committee',
                    storageType: 'dynamo',
                    message: `Got All Roles`
                })
                return committee
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get All Roles`
            })
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

    async setMemberForRole(roleId, memberId) {
        if (roleId === null || roleId === undefined || memberId === null || memberId === undefined) return false
        return dynamo.updateItem({
            Key: { 'roleId': { S: roleId } },
            ExpressionAttributeValues: { ':memberId': { S: memberId } },
            UpdateExpression: 'SET memberId = :memberId',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    roleId: roleId,
                    memberId: memberId,
                    objectType: 'committee',
                    storageType: 'dynamo',
                    message: `Set Member For Role`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                roleId: roleId,
                memberId: memberId,
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Set Member For Role`
            })
            return false
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
            if (data) {
                logger.info({
                    expenseRequeset: expenseRequest,
                    objectType: 'committee',
                    storageType: 'dynamo',
                    message: `Submit Expense`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                expenseRequeset: expenseRequest,
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Submit Expense`
            })
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
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).then((index) => {
            if (index != -1) return dynamo.updateItem({
                Key: { 'roleId': { S: 'treasurer' } },
                UpdateExpression: `REMOVE expenseRequests[${index}]`,
                TableName: 'witkc-committee'
            }).promise().then((data) => {
                if (data) {
                    logger.info({
                        expenseRequeset: expenseRequest,
                        objectType: 'committee',
                        storageType: 'dynamo',
                        message: `Deleted Expense`
                    })
                    return true
                } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
            }).catch((err) => { throw err })
            else throw `Could not find expense.`
        }).catch((err) => {
            logger.warn({
                expenseId: expenseId,
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Delete Expense`
            })
            return false
        })
    },

    requestVerification(memberId) {
        if (memberId === null || memberId === undefined) return false
        return dynamo.updateItem({
            Key: { 'roleId': { S: 'captain' } },
            ExpressionAttributeValues: { ':memberId': { SS: [memberId] } },
            UpdateExpression: 'ADD verificationRequests :memberId',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    objectType: 'committee',
                    storageType: 'dynamo',
                    message: `Submit Verification Request`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Submit Verification Request`
            })
            return false
        })
    },

    resolveVerification(memberId, decision) {
        if (memberId === null || memberId === undefined || decision === null || decision === undefined) return false
        if (decision) dynamo.updateItem({
            Key: { 'memberId': { S: memberId } },
            ExpressionAttributeValues: { ':bool': { BOOL: true } },
            UpdateExpression: 'SET verified = :bool',
            TableName: 'witkc-members'
        }).promise().then((data) => {
            if (data) logger.info({
                memberId: memberId,
                decision: decision,
                objectType: 'committee',
                storageType: 'dynamo',
                message: `Verified Member`
            })
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => logger.warn({
            memberId: memberId,
            decision: decision,
            objectType: 'committee',
            storageType: 'dynamo',
            error: err,
            stack: err.stack,
            message: `Failed To Verify Member`
        }))
        return dynamo.updateItem({
            Key: { 'roleId': { S: 'captain' } },
            ExpressionAttributeValues: { ':memberId': { SS: [memberId] } },
            UpdateExpression: 'DELETE verificationRequests :memberId',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    decision: decision,
                    objectType: 'committee',
                    storageType: 'dynamo',
                    message: `Removed Verification Request`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                decision: decision,
                objectType: 'committee',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Remove Verification Request`
            })
            return false
        })
    }
}

module.exports = committee