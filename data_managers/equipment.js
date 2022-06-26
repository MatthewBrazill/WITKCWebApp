'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()
const s3 = new AWS.S3()

const equipment = {
    async create(equipment) {
        if (equipment === null || equipment === undefined) return false
        var attributes = {}
        for (var attr in equipment) {
            if (typeof equipment[attr] == 'boolean') attributes[`${attr}`] = { BOOL: equipment[attr] }
            else attributes[`${attr}`] = { S: equipment[attr] }
        }
        return dynamo.putItem({
            Item: attributes,
            TableName: 'witkc-equipment'
        }).promise().then(() => {
            logger.info(`Equipment '${equipment.equipmentId}': Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create equipment '${equipment.equipmentId}'! ${err}`)
            return false
        })
    },

    async get(equipmentId) {
        if (equipmentId === null || equipmentId === undefined) return null
        return dynamo.getItem({
            Key: { 'equipmentId': { S: equipmentId } },
            TableName: 'witkc-equipment'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                var gear = {
                    equipmentId: data.Item['equipmentId'].S,
                    name: data.Item['name'].S,
                    brand: data.Item['brand'].S,
                    img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: data.Item['img'].S })
                }
                if (data.Item['unavailableDates'] != undefined) gear.unavailableDates = data.Item['unavailableDates'].SS
                if (data.Item['type'].S == 'boat') {
                    gear.boatType = data.Item['boatType'].S
                    gear.boatSize = data.Item['boatSize'].S
                    gear.boatCockpit = data.Item['boatCockpit'].S
                    equipment.boats.push(gear)
                } else if (data.Item['type'].S == 'paddle') {
                    gear.paddleType = data.Item['paddleType'].S
                    gear.paddleLength = data.Item['paddleLength'].S
                    equipment.paddles.push(gear)
                } else if (data.Item['type'].S == 'deck') {
                    gear.deckType = data.Item['deckType'].S
                    gear.deckSize = data.Item['deckSize'].S
                    equipment.decks.push(gear)
                } else if (data.Item['type'].S == 'ba') {
                    gear.baSize = item['baSize'].S
                    equipment.bas.push(gear)
                } else if (data.Item['type'].S == 'helmet') {
                    gear.helmetType = data.Item['helmetType'].S
                    gear.helmetSize = data.Item['helmetSize'].S
                    equipment.helmets.push(gear)
                } else if (data.Item['type'].S == 'wetsuit') {
                    gear.wetsuitSize = data.Item['wetsuitSize'].S
                    equipment.wetsuits.push(gear)
                }
                return gear
            }
            else return null
        }).catch((err) => {
            logger.warn(`Failed to retrieve equipment '${equipmentId}'! ${err}`)
            return null
        })
    },

    async getAll() {
        return dynamo.scan({
            TableName: 'witkc-equipment'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var equipment = {
                    boats: [],
                    paddles: [],
                    decks: [],
                    bas: [],
                    helmets: [],
                    wetsuits: []
                }
                for (var item of data.Items) {
                    var gear = {
                        equipmentId: item['equipmentId'].S,
                        name: item['name'].S,
                        brand: item['brand'].S,
                        unavailableDates: [],
                        img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                    }
                    if (item['unavailableDates'] != undefined) gear.unavailableDates = item['unavailableDates'].SS
                    if (item['type'].S == 'boat') {
                        gear.boatType = item['boatType'].S
                        gear.boatSize = item['boatSize'].S
                        gear.boatCockpit = item['boatCockpit'].S
                        equipment.boats.push(gear)
                    } else if (item['type'].S == 'paddle') {
                        gear.paddleType = item['paddleType'].S
                        gear.paddleLength = item['paddleLength'].S
                        equipment.paddles.push(gear)
                    } else if (item['type'].S == 'deck') {
                        gear.deckType = item['deckType'].S
                        gear.deckSize = item['deckSize'].S
                        equipment.decks.push(gear)
                    } else if (item['type'].S == 'ba') {
                        gear.baSize = item['baSize'].S
                        equipment.bas.push(gear)
                    } else if (item['type'].S == 'helmet') {
                        gear.helmetType = item['helmetType'].S
                        gear.helmetSize = item['helmetSize'].S
                        equipment.helmets.push(gear)
                    } else if (item['type'].S == 'wetsuit') {
                        gear.wetsuitSize = item['wetsuitSize'].S
                        equipment.wetsuits.push(gear)
                    }
                }
                return equipment
            } else return null
        }).catch((err) => {
            logger.warn(`Failed to retrieve all equipment! ${err}`)
            return null
        })
    },

    async update() {

    },

    async delete(equipmentId) {
        if (equipmentId === null || equipmentId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'equipmentId': { S: equipmentId } },
            TableName: 'witkc-equipment'
        }).promise().then(() => {
            logger.info(`Equipment '${equipmentId}': Deleted`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete equipment '${equipmentId}'! ${err}`)
            return false
        })
    }
}

module.exports = equipment