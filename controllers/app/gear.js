'use strict'

// Imports
const logger = require('../../log.js')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const sharp = require('sharp')
const helper = require('../helper.js')
const formidable = require('formidable')
const uuid = require('uuid')
const equipment = require('../../data_managers/equipment.js')

const gear = {
    async create(req, res) {
        try {
            var data = await helper.viewData(req, 'API')
            var valid = true

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {

                // Use formidable for image transfer
                var { fields, files } = new formidable.IncomingForm().parse(req, (err, fields, files) => {
                    // Check for any errors
                    if (err) throw err
                    else return { fields, files }
                })

                // Server-Side Validation
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Recieved Fields => ${fields}`
                })
                if (!fields.gearName.match(/^[\w- ]{1,24}$/)) valid = false
                if (!fields.brand.match(/^[\w- ]{1,24}$/)) valid = false
                if (!['boat', 'paddle', 'deck', 'ba', 'helmet', 'wetsuit'].includes(fields.type)) valid = false

                // Validate based on the type of equipment
                if (fields.type == 'boat') {
                    if (!['polo', 'whitewater', 'freestyle', 'other'].includes(fields.boatType)) valid = false
                    if (!['s', 'm', 'l'].includes(fields.boatSize)) valid = false
                    if (!['big', 'key'].includes(fields.boatCockpit)) valid = false
                } else if (fields.type == 'paddle') {
                    if (!['polo', 'straight', 'crank'].includes(fields.paddleType)) valid = false
                    if (fields.paddle_length < 0 || fields.paddle_length > 1000) valid = false
                } else if (fields.type == 'deck') {
                    if (!['big', 'key'].includes(fields.deckType)) valid = false
                    if (!['xxxs/xxs', 'xxs/xs', 'xs/s', 'm/l', 'xl/xxl'].includes(fields.deckSize)) valid = false
                } else if (fields.type == 'ba') {
                    if (!['s', 'l'].includes(fields.baSize)) valid = false
                } else if (fields.type == 'helmet') {
                    if (!['polo', 'full', 'half'].includes(fields.helmetType)) valid = false
                    if (!['s', 'm', 'l', 'xl'].includes(fields.helmetSize)) valid = false
                } else if (fields.type == 'wetsuit') {
                    if (!['s', 'm', 'l', 'xl'].includes(fields.wetsuitSize)) valid = false
                }

                // Check image
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Recieved File => ${files}`
                })
                if (files[0].mimetype.split('/')[0] != 'image') valid = false

                if (valid) {

                    // Create gear object
                    var gear = {
                        equipmentId: uuid.v4(),
                        gearName: helper.capitalize(fields.gearName),
                        type: fields.type,
                        brand: helper.capitalize(fields.brand),
                        dateAdded: new Date().toUTCString(),
                        img: 'img/placeholder_equipment.webp'
                    }

                    // Populate gear object based on type
                    if (fields.type == 'boat') {
                        gear.boatType = fields.boatType
                        gear.boatSize = fields.boatSize
                        gear.boatCockpit = fields.boatCockpit
                    } else if (fields.type == 'paddle') {
                        gear.paddleType = fields.paddleType
                        gear.paddleLength = fields.paddle_length
                    } else if (fields.type == 'deck') {
                        gear.deckType = fields.deckType
                        gear.deckSize = fields.deckSize
                    } else if (fields.type == 'ba') {
                        gear.baSize = fields.baSize
                    } else if (fields.type == 'helmet') {
                        gear.helmetType = fields.helmetType
                        gear.helmetSize = fields.helmetSize
                    } else if (fields.type == 'wetsuit') {
                        gear.wetsuitSize = fields.wetsuitSize
                    }

                    // If file exists put to S3
                    if (files.file != undefined) {
                        await sharp(files.file.filepath).webp().toFile(`${files.file.filepath}.webp`).catch((err) => { throw err })
                        s3.putObject({
                            Bucket: 'witkc',
                            Key: `img/equipment/${gear.equipmentId}.webp`,
                            Body: fs.readFileSync(`${files[i]}.webp`)
                        })
                        logger.debug({
                            sessionId: req.sessionID,
                            loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                            memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                            method: req.method,
                            urlPath: req.url,
                            message: `Put ${files.length} Objects to S3`
                        })
                    }

                    if (await equipment.create(gear)) res.sendStatus(201)
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

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                // Validate input
                if (req.body.equipmentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {

                    var result = await equipment.get(req.body.equipmentId)
                    if (result != null) res.status(200).json(result)
                    else res.sendStatus(404)
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

    async list(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {

                var result = await equipment.getAll()
                if (result != null) res.status(200).json(result)
                else res.sendStatus(404)
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

    async find(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.member.verified) {
                var valid = true

                // Validate Input
                if (!req.body.search.match(/^[\w- ]{0,64}$/)) valid = false
                if (!['boat', 'paddle', 'deck', 'ba', 'helmet', 'wetsuit', undefined].includes(req.body.type)) valid = false
                if (!['polo', 'whitewater', 'freestyle', 'other', undefined].includes(req.body.boatType)) valid = false
                if (!['s', 'm', 'l', undefined].includes(req.body.boatSize)) valid = false
                if (!['big', 'key', undefined].includes(req.body.boatCockpit)) valid = false
                if (!['polo', 'straight', 'crank', undefined].includes(req.body.paddleType)) valid = false
                if (!['big', 'key', undefined].includes(req.body.deckType)) valid = false
                if (!['xxxs/xxs', 'xxs/xs', 'xs/s', 'm/l', 'xl/xxl', undefined].includes(req.body.deckSize)) valid = false
                if (!['s', 'l', undefined].includes(req.body.baSize)) valid = false
                if (!['polo', 'full', 'half', undefined].includes(req.body.helmetType)) valid = false
                if (!['s', 'm', 'l', 'xl', undefined].includes(req.body.helmetSize)) valid = false
                if (!['s', 'm', 'l', 'xl', undefined].includes(req.body.wetsuitSize)) valid = false

                if (valid) {
                    var result = await equipment.getAll()
                    if (result != null) {
                        result = result.boats.concat(result.paddles, result.decks, result.bas, result.helmets, result.wetsuits)

                        /* Had to write some shitty custom filter. Should probably have just used a better kind of database 
                        for this but hey, not like this will ever get scaling issues. If youre the new guy handeling this, and
                        by some miricle you have too many pieces of equipment to handle: May god have mercy on you; don't call me. */
                        for (var i in result) {
                            if (req.body.search != undefined && !result[i].gearName.toLowerCase().includes(req.body.search.toLowerCase())) result.splice(i)
                            else if (req.body.type != undefined && result[i].type != req.body.type) result.splice(i)
                            else if (req.body.boatType != undefined && result[i].boatType != req.body.boatType) result.splice(i)
                            else if (req.body.boatSize != undefined && result[i].boatSize != req.body.boatSize) result.splice(i)
                            else if (req.body.boatCockpit != undefined && result[i].boatCockpit != req.body.boatCockpit) result.splice(i)
                            else if (req.body.paddleType != undefined && result[i].paddleType != req.body.paddleType) result.splice(i)
                            else if (req.body.deckType != undefined && result[i].deckType != req.body.deckType) result.splice(i)
                            else if (req.body.deckSize != undefined && result[i].deckSize != req.body.deckSize) result.splice(i)
                            else if (req.body.baSize != undefined && result[i].baSize != req.body.baSize) result.splice(i)
                            else if (req.body.helmetType != undefined && result[i].helmetType != req.body.helmetType) result.splice(i)
                            else if (req.body.helmetSize != undefined && result[i].helmetSize != req.body.helmetSize) result.splice(i)
                            else if (req.body.wetsuitSize != undefined && result[i].wetsuitSize != req.body.wetsuitSize) result.splice(i)
                        }

                        res.status(200).json(result)
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
    },

    async update(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'equipments' || data.admin) {




                res.sendStatus(501)
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

    async delete(req, res) {
        try {
            var data = await helper.viewData(req, 'API')

            // Authenticate user
            if (data.loggedIn) if (data.committee == 'equipments' || data.admin) {

                // Validate input
                if (req.body.equipmentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await equipment.delete(req.body.equipmentId)) res.sendStatus(204)
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
    }
}

module.exports = gear