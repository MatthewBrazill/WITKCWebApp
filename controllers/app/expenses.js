'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const formidable = require('formidable')
const logger = require('../../log.js')
const helper = require('../helper.js')
const uuid = require('uuid')
const sharp = require('sharp')
const fs = require('fs')
const committee = require('../../data_managers/committee.js')

const expenses = {
    async expensesPage(req, res) {
        var data = await helper.viewData(req, 'Submit Expense')
        data.scripts.expense = process.env.DD_ENV == 'prod' ? 'https://setukc.s3.eu-west-1.amazonaws.com/js/expense_scripts.js' : '/js/expense_scripts.js'

        // Autheticate user
        if (data.loggedIn) if (data.member.verified) {

            res.render('expense', data)
        } else res.status(403).redirect('/profile/me')
        else res.status(401).redirect('/login')
    },

    async submit(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {
                var expenseId = uuid.v4()
                var valid = true
                var expenses = []
                var receipts = []

                // Use formidable for image transfer
                var { fields, files } = await new Promise((resolve, reject) => new formidable.IncomingForm().parse(req, (err, fields, files) => {
                    // Check for any errors
                    if (err) reject(err)
                    else resolve({ fields, files })
                }))

                // Loop through fields and deconstruct transport string
                logger.debug({
                    fields: fields,
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Recieved ${Object.keys(fields).length} Fields`
                })
                for (var field in fields) {
                    var values = fields[field].split('%')
                    if (field.split('%')[0] == 'expense') {
                        if (values[0].match(/^.{1,32}$/u) && values[1].match(/^\d+([,.]\d+)?$/)) expenses.push({
                            description: helper.capitalize(values[0]),
                            price: values[1]
                        })
                        else valid = false
                    }
                }

                // Loop through images
                logger.debug({
                    files: files,
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Recieved ${Object.keys(files).length} Files`
                })
                for (var file in files) if (files[file].mimetype.split('/')[0] == 'image') receipts.push(files[file].filepath)
                if (receipts.length == 0) valid = false

                if (valid) {

                    // Upload all the receipts to S3
                    for (var i in receipts) {
                        var newPath = `expenseRequests/${expenseId}/receipts/${uuid.v4()}.webp`
                        await sharp(receipts[i]).webp().toFile(`${receipts[i]}.webp`).catch((err) => { throw err })
                        s3.putObject({
                            Bucket: 'witkc',
                            Key: newPath,
                            Body: fs.readFileSync(`${receipts[i]}.webp`)
                        })
                        receipts[i] = newPath
                    }
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `Put ${receipts.length} Objects to S3`
                    })

                    // Calculate total
                    var total = parseFloat(0)
                    for (var expense of expenses) total = parseFloat(total) + parseFloat(expense.price)
                    logger.debug({
                        sessionId: req.sessionID,
                        loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                        memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                        method: req.method,
                        urlPath: req.url,
                        message: `Expense Total => ${total}`
                    })

                    if (await committee.submitExpense({
                        expenseId: expenseId,
                        memberId: data.member.memberId,
                        total: total.toFixed(2),
                        expenses: expenses,
                        receipts: receipts
                    })) res.sendStatus(201)
                    else res.sendStatus(503)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) {
            logger.error({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                error: err,
                stack: err.stack,
                message: `${req.method} ${req.url} Failed => ${err}`
            })
            res.status(500).json(err)
        }
    },

    async get(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Autheticate user
            if (data.loggedIn) if (data.committee == 'treasurer' || data.admin) {

                // Validate input
                if (req.body.expenseId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    var treasurer = await committee.getRole('treasurer')

                    // Filter expense request out
                    for (var expenseRequest of treasurer.expenseRequests) {
                        if (expenseRequest.expenseId == req.body.expenseId) {
                            for (var i in expenseRequest.receipts) expenseRequest.receipts[i] = s3.getSignedUrl('getObject', { Bucket: 'setukc-private', Key: expenseRequest.receipts[i] })
                            res.status(200).json(expenseRequest)
                            return
                        }
                    }

                    // If not found
                    res.sendStatus(404)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) {
            logger.error({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                error: err,
                stack: err.stack,
                message: `${req.method} ${req.url} Failed => ${err}`
            })
            res.status(500).json(err)
        }
    },

    async resolve(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Autheticate user
            if (data.loggedIn) if (data.committee == 'treasurer' || data.admin) {
                var valid = true

                // Validate input
                if (!req.body.expenseId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                if (req.body.accepted != 'true' && req.body.accepted != 'false') valid = false
                if (!(req.body.accepted == 'true')) if (!req.body.reason.match(/^[^<>]{1,200}$/u)) valid = false

                if (valid) {
                    var treasurer = await committee.getRole('treasurer')
                    var request = false
                    for (var expenseRequest of treasurer.expenseRequests) {
                        if (expenseRequest.expenseId == req.body.expenseId) request = expenseRequest
                    }

                    if (request) {
                        if (req.body.accepted == 'true') {
                            logger.debug({
                                sessionId: req.sessionID,
                                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                                method: req.method,
                                urlPath: req.url,
                                message: `Expense Report Accepted`
                            })
                            s3.putObject({
                                Bucket: 'witkc',
                                Key: `expenseRequests / ${expenseRequest.expenseId} /request.json`,
                                Body: JSON.stringify(request)
                            })

                            // TODO Tell Creator Accepted

                            if (await committee.deleteExpense(req.body.expenseId)) res.sendStatus(204)
                            else res.sendStatus(503)
                        } else {
                            logger.debug({
                                sessionId: req.sessionID,
                                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                                method: req.method,
                                urlPath: req.url,
                                message: `Expense Report Rejected`
                            })
                            for (var receipt of request.receipts) await s3.deleteObject({
                                Bucket: 'witkc',
                                Key: receipt,
                            }).promise().catch((err) => { throw err })

                            // TODO Tell Creator Denied

                            if (await committee.deleteExpense(req.body.expenseId)) res.sendStatus(204)
                            else res.sendStatus(503)
                        }
                    } else res.sendStatus(404)
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) {
            logger.error({
                sessionId: req.sessionID,
                loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                method: req.method,
                urlPath: req.url,
                error: err,
                stack: err.stack,
                message: `${req.method} ${req.url} Failed => ${err}`
            })
            res.status(500).json(err)
        }
    }
}

module.exports = expenses