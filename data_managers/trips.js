'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const trips = {
    async create(trip) {
        if (trip === null || trip === undefined) return false
        var tripItem = new Map()
        for (var attr in trip) {
            if (attr == 'location') {
                tripItem[attr] = {
                    L: [
                        { S: trip.location.lineOne },
                        { S: trip.location.lineTwo },
                        { S: trip.location.city },
                        { S: trip.location.county },
                        { S: trip.location.code }
                    ]
                }
            } else if (attr == 'enoughSafety') tripItem[attr] = { BOOL: trip[attr] }
            else if (attr == 'hazards' || attr == 'safety') {
                tripItem[attr] = { L: [] }
                for (var item of trip[attr]) tripItem[attr].L.push({ S: item })
            } else tripItem[attr] = { S: trip[attr] }
        }
        tripItem['approved'] = { BOOL: false }
        return dynamo.putItem({
            Item: tripItem,
            TableName: 'witkc-trips'
        }).promise().then(() => {
            logger.info(`Trip '${trip.tripId}': Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create trip '${trip.tripId}'! ${err}`)
            return false
        })
    },

    async get(tripId) {
        // Returns null as a string so that bcrypt doesn't fail
        if (tripId === null || tripId === undefined) return null
        return dynamo.getItem({
            Key: { 'tripId': { S: tripId } },
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                var trip = {}
                for (var attr in data.Item) {
                    if ('S' in data.Item[attr]) trip[attr] = data.Item[attr].S
                    else if ('BOOL' in data.Item[attr]) trip[attr] = data.Item[attr].BOOL
                    else if (attr == 'location') {
                        trip.location = {
                            lineOne: data.Item['location'].L[0].S,
                            lineTwo: data.Item['location'].L[1].S,
                            city: data.Item['location'].L[2].S,
                            county: data.Item['location'].L[3].S,
                            code: data.Item['location'].L[4].S
                        }
                    } else if ('L' in data.Item[attr]) {
                        trip[attr] = []
                        for (var item of data.Item[attr].L) trip[attr].push(item.S)
                    }
                }
                return trip
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to retrieve trip '${tripId}'! ${err}`)
            return null
        })
    },

    async update(trip) {
        if (trip === null || trip === undefined) return false
        return dynamo.putItem({
            Item: {
                'tripId': { S: trip.tripId }
            },
            TableName: 'witkc-trips'
        }).promise().then(() => {
            logger.info(`Trip '${trip.tripId}': Updated`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to update trip '${trip.tripId}'! ${err}`)
            return false
        })
    },

    async delete(tripId) {
        if (tripId === null || tripId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'tripId': { S: tripId } },
            TableName: 'witkc-trips'
        }).promise().then(() => {
            logger.info(`Trip '${tripId}': Deleted`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete trip '${tripId}'! ${err}`)
            return false
        })
    }
}

module.exports = trips