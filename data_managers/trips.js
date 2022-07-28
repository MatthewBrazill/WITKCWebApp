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
            if (attr == 'destination') {
                tripItem[attr] = {
                    L: [
                        { S: trip.destination.lineOne },
                        { S: trip.destination.lineTwo },
                        { S: trip.destination.city },
                        { S: trip.destination.county },
                        { S: trip.destination.code }
                    ]
                }
            } else if (attr == 'enoughSafety') tripItem[attr] = { BOOL: trip[attr] }
            else if (attr == 'hazards' || attr == 'safety' || attr == 'attendees') tripItem[attr] = { SS: trip[attr] }
            else tripItem[attr] = { S: trip[attr] }
        }
        tripItem['approved'] = { BOOL: false }
        tripItem['joinable'] = { BOOL: true }
        return dynamo.putItem({
            Item: tripItem,
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    trip: trip,
                    objectType: 'trip',
                    storageType: 'dynamo',
                    message: `Created Trip`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                trip: trip,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Create Trip`
            })
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
                    else if ('SS' in data.Item[attr]) trip[attr] = data.Item[attr].SS
                    else if ('BOOL' in data.Item[attr]) trip[attr] = data.Item[attr].BOOL
                    else if (attr == 'destination') {
                        trip.destination = {
                            lineOne: data.Item['destination'].L[0].S,
                            lineTwo: data.Item['destination'].L[1].S,
                            city: data.Item['destination'].L[2].S,
                            county: data.Item['destination'].L[3].S,
                            code: data.Item['destination'].L[4].S
                        }
                    }
                }
                logger.info({
                    tripId: tripId,
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Got Trip`
                })
                return trip
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                tripId: tripId,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Trip`
            })
            return null
        })
    },

    async getAllFor(memberId) {
        if (memberId === null || memberId === undefined) return null
        return dynamo.scan({
            ExpressionAttributeValues: { ':memberId': { S: memberId } },
            FilterExpression: 'contains(attendees, :memberId)',
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    var trip = {}
                    for (var attr in item) {
                        if ('S' in item[attr]) trip[attr] = item[attr].S
                        else if ('SS' in item[attr]) trip[attr] = item[attr].SS
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'destination') {
                            trip.destination = {
                                lineOne: item['destination'].L[0].S,
                                lineTwo: item['destination'].L[1].S,
                                city: item['destination'].L[2].S,
                                county: item['destination'].L[3].S,
                                code: item['destination'].L[4].S
                            }
                        }
                    }
                    trips.push(trip)
                }
                logger.info({
                    memberId: memberId,
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Got Trips For Member`
                })
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Trips For Member`
            })
            return null
        })
    },

    async getOnDate(date) {
        if (date === null || date === undefined) return null
        return dynamo.scan({
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    if (new Date(item['startDate'].S).setHours(0, 0, 0, 0) <= new Date(date).setHours(0, 0, 0, 0) && new Date(date).setHours(0, 0, 0, 0) <= new Date(item['endDate'].S).setHours(0, 0, 0, 0)) {
                        var trip = {}
                        for (var attr in item) {
                            if ('S' in item[attr]) trip[attr] = item[attr].S
                            else if ('SS' in item[attr]) trip[attr] = item[attr].SS
                            else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                            else if (attr == 'destination') {
                                trip.destination = {
                                    lineOne: item['destination'].L[0].S,
                                    lineTwo: item['destination'].L[1].S,
                                    city: item['destination'].L[2].S,
                                    county: item['destination'].L[3].S,
                                    code: item['destination'].L[4].S
                                }
                            }
                        }
                        trips.push(trip)
                    }
                }
                logger.info({
                    date: date,
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Got Trips On Date`
                })
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                date: date,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Trips On Date`
            })
            return null
        })
    },

    async list() {
        return dynamo.scan({
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) {
                    var trip = {}
                    for (var attr in item) {
                        if ('S' in item[attr]) trip[attr] = item[attr].S
                        else if ('SS' in item[attr]) trip[attr] = item[attr].SS
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'destination') {
                            trip.destination = {
                                lineOne: item['destination'].L[0].S,
                                lineTwo: item['destination'].L[1].S,
                                city: item['destination'].L[2].S,
                                county: item['destination'].L[3].S,
                                code: item['destination'].L[4].S
                            }
                        }
                    }
                    trips.push(trip)
                }
                logger.info({
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Listed Trips`
                })
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To List Trips`
            })
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
                        else if ('SS' in item[attr]) trip[attr] = item[attr].SS
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'destination') {
                            trip.destination = {
                                lineOne: item['destination'].L[0].S,
                                lineTwo: item['destination'].L[1].S,
                                city: item['destination'].L[2].S,
                                county: item['destination'].L[3].S,
                                code: item['destination'].L[4].S
                            }
                        }
                    }
                    trips.push(trip)
                }
                logger.info({
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Got Pending Trips`
                })
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Pending Trips`
            })
            return null
        })
    },

    async since(date) {
        if (!date instanceof Date) return null
        return dynamo.scan({
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) if (date <= new Date(item['startDate'].S) && new Date(item['startDate'].S) <= new Date()) {
                    var trip = {}
                    for (var attr in item) {
                        if ('S' in item[attr]) trip[attr] = item[attr].S
                        else if ('SS' in item[attr]) trip[attr] = item[attr].SS
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'destination') {
                            trip.destination = {
                                lineOne: item['destination'].L[0].S,
                                lineTwo: item['destination'].L[1].S,
                                city: item['destination'].L[2].S,
                                county: item['destination'].L[3].S,
                                code: item['destination'].L[4].S
                            }
                        }
                    }
                    trips.push(trip)
                }
                logger.info({
                    date: date,
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Got Trips Since Date`
                })
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                date: date,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Trips Since Date`
            })
            return null
        })
    },

    async from(date) {
        if (!date instanceof Date) return null
        return dynamo.scan({
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var trips = []
                for (var item of data.Items) if (new Date(item['startDate'].S) >= date) {
                    var trip = {}
                    for (var attr in item) {
                        if ('S' in item[attr]) trip[attr] = item[attr].S
                        else if ('SS' in item[attr]) trip[attr] = item[attr].SS
                        else if ('BOOL' in item[attr]) trip[attr] = item[attr].BOOL
                        else if (attr == 'destination') {
                            trip.destination = {
                                lineOne: item['destination'].L[0].S,
                                lineTwo: item['destination'].L[1].S,
                                city: item['destination'].L[2].S,
                                county: item['destination'].L[3].S,
                                code: item['destination'].L[4].S
                            }
                        }
                    }
                    trips.push(trip)
                }
                logger.info({
                    date: date,
                    objectType: 'tirp',
                    storageType: 'dynamo',
                    message: `Got Trips From Date`
                })
                return trips
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                date: date,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Trips From Date`
            })
            return null
        })
    },

    async update(trip) {
        if (trip === null || trip === undefined) return false
        var attributes = {}
        var expression = 'SET '
        for (var attr in trip) {
            if (attr == 'tripId' || attr == 'attendees') { }
            /*
            else if (attr == 'startDate || endDate') {
                expression += `${attr} = :${attr}, `
                attributes[`:${attr}`] = { S: new Date(item[attr].S).toUTCString()}
            }
            //*/
            else if (attr == 'destination') {
                expression += `${attr} = :${attr}, `
                attributes[`:${attr}`] = {
                    L: [
                        { S: trip.destination.lineOne },
                        { S: trip.destination.lineTwo },
                        { S: trip.destination.city },
                        { S: trip.destination.county },
                        { S: trip.destination.code }
                    ]
                }
            } else if (typeof trip[attr] == 'boolean') {
                expression += `${attr} = :${attr}, `
                attributes[`:${attr}`] = { BOOL: trip[attr] }
            } else if (attr == 'hazards' || attr == 'safety') {
                expression += `${attr} = :${attr}, `
                attributes[`:${attr}`] = { SS: trip[attr] }
            } else {
                expression += `${attr} = :${attr}, `
                attributes[`:${attr}`] = { S: trip[attr] }
            }
        }
        if (expression.slice(-2) == ', ') expression = expression.slice(0, -2)
        return dynamo.updateItem({
            Key: { 'tripId': { S: trip.tripId } },
            ExpressionAttributeValues: attributes,
            UpdateExpression: expression,
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    trip: trip,
                    objectType: 'trip',
                    storageType: 'dynamo',
                    message: `Updated Trip`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                tirp: trip,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Update Trip`
            })
            return false
        })
    },

    async delete(tripId) {
        if (tripId === null || tripId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'tripId': { S: tripId } },
            TableName: 'witkc-trips'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    tripId: tripId,
                    objectType: 'trip',
                    storageType: 'dynamo',
                    message: `Deleted Trip`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                tripId: tripId,
                objectType: 'trip',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Delete Trip`
            })
            return false
        })
    }
}

module.exports = trips