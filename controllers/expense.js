'use strict'

// Imports
const formidable = require('formidable')
const logger = require('../log.js')
const viewData = require('../view_data.js')
const uuid = require('uuid')
const sharp = require('sharp')
const fs = require('fs')
const committee = require('../data_managers/committee.js')

const expense = {
    async get(req, res) {
        var data = await viewData.get(req, 'Submit Expense')
        data.scripts.expense = '/expense_scripts.js' //s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/expense_scripts.js' })

        if (data.logged_in) if (data.member.verified) {
            logger.info(`Session '${req.sessionID}': Getting Expenses`)
            res.render('expense', data)
        } else res.redirect('/')
        else res.redirect('/')
    },

    async submit(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) if (data.member.verified) {
                var form = new formidable.IncomingForm()
                new Promise((resolve, reject) => {
                    form.parse(req, (err, fields, files) => {
                        var valid = true

                        if (err) reject('Malformed Input')
                        else {
                            var expenses = []
                            var receipts = []

                            for (var field in fields) {
                                var values = fields[field].split('%')
                                if (field.split('%')[0] == 'expense') {
                                    if (values[0].match(/^.{1,32}$/u) && values[1].match(/^\d+([,.]\d+)?$/)) expenses.push({
                                        description: viewData.capitalize(values[0]),
                                        price: parseFloat(values[1]).toFixed(2)
                                    })
                                    else valid = false
                                }
                            }

                            for (var file in files) if (files[file].mimetype.split('/')[0] == 'image') receipts.push(files[file].filepath)

                            if (!valid) reject('Malformed Input')
                            if (receipts.length == 0) reject('Malformed Input')
                            else resolve([expenses, receipts])
                        }
                    })
                }).then(async (values) => {
                    for (var i in values[1]) {
                        console.log(values[1][i])
                        var newPath = `/receipts/${uuid.v4()}.webp`
                        await sharp(values[1][i]).webp().toFile(`${values[1][i]}.webp`).catch((err) => { throw err })
                        await s3.putObject({
                            Bucket: 'witkc',
                            Key: newPath,
                            Body: fs.readFileSync(`${values[1][i]}.webp`)
                        }).promise().catch((err) => { throw err })
                        values[1][i] = newPath
                    }

                    committee.submitExpense({
                        expenseId: uuid.v4(),
                        memberId: data.member.memberId,
                        expenses: values[0],
                        receipts: values[1]
                    })

                    logger.info(`Member ${data.member.memberId}: Successfully updated image!`)
                    res.sendStatus(200)
                }).catch((err) => { console.log(err); res.status(500).json(err) })
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async resolve(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.logged_in) if (data.member.verified) if (data.committee) {
                var valid = true

                if (res.body.expenseId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                if (res.body.accepted != 'true' && req.body.accepted != 'false') valid = false
                if (res.body.reason.match(/^.{1,200}$/u)) valid = false

                if (valid) {

                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = expense