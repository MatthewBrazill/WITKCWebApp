'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const bookings = {
    async create(booking) {
        if (booking === null || booking === undefined) return false
        return dynamo.putItem({
            Item: {
                'bookingId': { S: booking.bookingId },
                'equipmentId': { S: booking.equipmentId },
                'memberId': { S: booking.memberId },
                'fromDate': { S: booking.fromDate },
                'toDate': { S: booking.toDate }
            },
            TableName: 'witkc-bookings'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    booking: booking,
                    objectType: 'booking',
                    storageType: 'dynamo',
                    message: `Created Booking`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                booking: booking,
                objectType: 'booking',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Create Booking`
            })
            return false
        })
    },

    async available(equipmentId, fromDate, toDate) {
        if (equipmentId === null || equipmentId === undefined) return false
        if (fromDate === null || fromDate === undefined) return false
        if (toDate === null || toDate === undefined) return false
        return dynamo.scan({
            ExpressionAttributeValues: { ':equipmentId': { S: equipmentId } },
            FilterExpression: 'equipmentId = :equipmentId',
            TableName: 'witkc-bookings'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var bookedDates = []
                for (var booking of data.Items) {
                    // Preapre for Formatic Calendar formating
                    var date = new Date(booking[fromDate]).setHours(0, 0, 0, 0)
                    while (date <= booking[new Date(toDate).setHours(0, 0, 0, 0)]) {
                        bookedDates.push(date)
                        date.setDate(date.getDate() + 1)
                    }
                }

                for (var bookedDate of bookedDates) {
                    if (new Date(fromDate).setHours(0, 0, 0, 0) <= bookedDate && bookedDate <= new Date(toDate).setHours(0, 0, 0, 0)) {
                        logger.info({
                            equipmentId: equipmentId,
                            fromDate: fromDate,
                            toDate: toDate,
                            available: false,
                            objectType: 'booking',
                            storageType: 'dynamo',
                            message: `Checked Booking Availability`
                        })
                        return false
                    }
                }

                logger.info({
                    equipmentId: equipmentId,
                    fromDate: fromDate,
                    toDate: toDate,
                    available: true,
                    objectType: 'booking',
                    storageType: 'dynamo',
                    message: `Checked Booking Availability`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                equipmentId: equipmentId,
                fromDate: fromDate,
                toDate: toDate,
                objectType: 'booking',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Check Equipment Availability`
            })
            return false
        })
    },

    async get(bookingId) {
        if (bookingId === null || bookingId === undefined) return null
        return dynamo.getItem({
            Key: { 'bookingId': { S: bookingId } },
            TableName: 'witkc-bookings'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                var booking = {}
                for (var attr in data.Item) booking[attr] = data.Item[attr].S
                logger.info({
                    bookingId: bookingId,
                    objectType: 'booking',
                    storageType: 'dynamo',
                    message: `Got Booking`
                })
                return booking
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                bookingId: bookingId,
                objectType: 'booking',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Booking`
            })
            return null
        })
    },

    async getAllFor(memberId) {
        if (memberId === null || memberId === undefined) return null
        return dynamo.scan({
            ExpressionAttributeValues: { ':memberId': { S: memberId } },
            FilterExpression: 'memberId = :memberId',
            TableName: 'witkc-bookings'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var bookings = []
                for (var booking of data.Items) bookings.push({
                    bookingId: booking['bookingId'].S,
                    equipmentId: booking['equipmentId'].S,
                    memberId: booking['memberId'].S,
                    fromDate: booking['fromDate'].S,
                    toDate: booking['toDate'].S,
                })
                logger.info({
                    memberId: memberId,
                    objectType: 'booking',
                    storageType: 'dynamo',
                    message: `Got All Bookings For Member`
                })
                return bookings
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                memberId: memberId,
                objectType: 'booking',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get All Bookings for Member`
            })
            return null
        })
    },

    async update(booking) {
        if (booking === null || booking === undefined) return false
        var attributes = {}
        var expression = 'SET '
        for (var attr in trip) {
            expression += `${attr} = :${attr}, `
            attributes[`:${attr}`] = { S: trip[attr] }
        }
        if (expression.slice(-2) == ', ') expression = expression.slice(0, -2)
        return dynamo.updateItem({
            Key: { 'bookingId': { S: booking.bookingId } },
            ExpressionAttributeValues: attributes,
            UpdateExpression: expression,
            TableName: 'witkc-bookings'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    booking: booking,
                    objectType: 'booking',
                    storageType: 'dynamo',
                    message: `Updated Booking`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                booking: booking,
                objectType: 'booking',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Update Booking`
            })
            return false
        })
    },

    async delete(bookingId) {
        if (bookingId === null || bookingId === undefined) return false
        return dynamo.deleteItem({
            Key: { 'bookingId': { S: bookingId } },
            TableName: 'witkc-bookings'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    bookingId: bookingId,
                    objectType: 'booking',
                    storageType: 'dynamo',
                    message: `Deleted Booking`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                bookingId: bookingId,
                objectType: 'booking',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Delete Booking`
            })
            return false
        })
    }
}

module.exports = bookings