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
            if (typeof equipment[attr] == 'boolean') attributes[`:${attr}`] = { BOOL: equipment[attr] }
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
            if (data.Item != undefined) return data.Item['hash'].S
            else return null
        }).catch((err) => {
            logger.warn(`Failed to retrieve retrieve equipment '${equipmentId}'! ${err}`)
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
                        img: s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: item['img'].S })
                    }
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
            logger.warn(`Failed to retrieve retrieve all equipment! ${err}`)
            return null
        })
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