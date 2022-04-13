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
    },

    async submitExpense(expense) {
        if (expense === null || expense === undefined) return false
        var value = {
            L: [{
                M: {
                    'expenseId': { S: expense.expenseId },
                    'memberId': { S: expense.memberId },
                    'expenses': [],
                    'receipts': []
                }
            }]
        }
        for (var exp of expense.expenses) value.L[0].M['expenses'].push({
            M: {
                'description': exp.description,
                'price': exp.price
            }
        })
        for (var receipt of expense.receipts) value.L[0].M['receipts'].push({ S: receipt })
        return dynamo.updateItem({
            Key: { 'roleId': { S: 'treasurer' } },
            ExpressionAttributeValues: { ':expense': value },
            UpdateExpression: 'SET expenses = list_append(expenses, :expense)',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data) return true
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Could not submit expense '${expense.expenseId}'! ${err}`)
            return false
        })
    },

    async deleteExpense(expenseId) {
        if (expenseId === null || expenseId === undefined) return false
        return dynamo.getItem({
            ExpressionAttributeNames: { '#EXP': 'expenses' },
            Key: { 'roleId': { S: 'treasurer' } },
            ProjectionExpression: '#EXP',
            TableName: 'witkc-committee'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                for (var i in data.Item['expenses'].L) if (data.Item['certs'].L[i].M['expenseId'].S == expenseId) return i
                return -1
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).then((index) => {
            if (index != -1) return dynamo.updateItem({
                Key: { 'roleId': { S: 'treasurer' } },
                UpdateExpression: `REMOVE expenses[${index}]`,
                TableName: 'witkc-committee'
            }).promise().then((data) => {
                if (data) return true
                else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
            }).catch((err) => { throw err })
            else return false
        }).catch((err) => {
            logger.warn(`Could not delete expense '${expenseId}'! ${err}`)
            return false
        })
    }
}

module.exports = committee