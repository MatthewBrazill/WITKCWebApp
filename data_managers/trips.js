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
            else if (attr == 'hazards' || attr == 'safety' || attr == 'attendees') {
                tripItem[attr] = { L: [] }
                for (var item of trip[attr]) tripItem[attr].L.push({ S: item })
            } else tripItem[attr] = { S: trip[attr] }
        }
        tripItem['approved'] = { BOOL: false }
        tripItem['joinable'] = { BOOL: true }
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
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to retrieve trip '${tripId}'! ${err}`)
            return null
        })
    },

    async getAllFor(memberId) {
        if (memberId === null || memberId === undefined) return null
        return dynamo.scan({
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    var included = false
                    for (var i of item['attendees'].L) if (i.S == memberId) included = true

                    if (included) {
                        var trip = {}
                        for (var attr in item) {
                            if ('S' in item[attr]) trip[attr] = item[attr].S
                            else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                            else if (attr == 'location') {
                                trip.location = {
                                    lineOne: item['location'].L[0].S,
                                    lineTwo: item['location'].L[1].S,
                                    city: item['location'].L[2].S,
                                    county: item['location'].L[3].S,
                                    code: item['location'].L[4].S
                                }
                            } else if ('L' in item[attr]) {
                                trip[attr] = []
                                for (var i of item[attr].L) trip[attr].push(i.S)
                            }
                        }
                        trips.push(trip)
                    }
                }
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to list trips for member '${memberId}'! ${err}`)
            return null
        })
    },

    async list(memberId) {
        if (memberId === null || memberId === undefined) return null
        return dynamo.scan({
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    var trip = {}
                    for (var attr in item) {
                        if ('S' in item[attr]) trip[attr] = item[attr].S
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'location') {
                            trip.location = {
                                lineOne: item['location'].L[0].S,
                                lineTwo: item['location'].L[1].S,
                                city: item['location'].L[2].S,
                                county: item['location'].L[3].S,
                                code: item['location'].L[4].S
                            }
                        } else if ('L' in item[attr]) {
                            trip[attr] = []
                            for (var i of item[attr].L) trip[attr].push(i.S)
                        }
                    }
                    trips.push(trip)
                }
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to list trips for member '${memberId}'! ${err}`)
            return null
        })
    },

    async pending() {
        return dynamo.scan({
            ExpressionAttributeValues: { ':false': { BOOL: false } },
            FilterExpression: 'approved = :false',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    var trip = {}
                    for (var attr in item) {
                        if ('S' in item[attr]) trip[attr] = item[attr].S
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'location') {
                            trip.location = {
                                lineOne: item['location'].L[0].S,
                                lineTwo: item['location'].L[1].S,
                                city: item['location'].L[2].S,
                                county: item['location'].L[3].S,
                                code: item['location'].L[4].S
                            }
                        } else if ('L' in item[attr]) {
                            trip[attr] = []
                            for (var i of item[attr].L) trip[attr].push(i.S)
                        }
                    }
                    trips.push(trip)
                }
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to list pending trips! ${err.stack}`)
            return null
        })
    },

    async since(date) {
        if (date === null || date === undefined) return null
        return dynamo.scan({
            ExpressionAttributeNames: { '#SD': 'startDate' },
            ProjectionExpression: '#SD',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    if (new Date(date) <= new Date(item['startDate'].S) && new Date(item['startDate'].S) <= new Date()) {
                        trips.push(item['startDate'].S)
                    }
                }
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to list trips since ${date}! ${err}`)
            return null
        })
    },

    async update(trip) {
        if (trip === null || trip === undefined) return false
        var attributes = {}
        var expression = 'SET '
        for (var attr in trip) {
            if (attr == 'tripId') { }
            else if (attr == 'location') {
                attributes[attr] = {
                    L: [
                        { S: trip.location.lineOne },
                        { S: trip.location.lineTwo },
                        { S: trip.location.city },
                        { S: trip.location.county },
                        { S: trip.location.code }
                    ]
                }
                expression += `${attr} = :${attr}, `
            }
            else if (typeof trip[attr] == 'boolean') {
                attributes[`:${attr}`] = { BOOL: trip[attr] }
                expression += `${attr} = :${attr}, `
            } else if (attr == 'hazards' || attr == 'safety') {
                attributes[attr] = { L: [] }
                for (var item of trip[attr]) attributes[attr].L.push({ S: item })
            } else attributes[attr] = { S: trip[attr] }
        }
        if (expression.slice(-2) == ', ') expression = expression.slice(0, -2)
        return dynamo.updateItem({
            Key: { 'tripId': { S: trip.tripId } },
            ExpressionAttributeValues: attributes,
            UpdateExpression: expression,
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