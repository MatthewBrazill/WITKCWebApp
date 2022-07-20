'use strict'

const equipment = require('../../data_managers/equipment.js')
// Imports
const logger = require('../../log.js')
const sharp = require('sharp')
const helper = require('../helper.js')
const formidable = require('formidable')
const uuid = require('uuid')

const gear = {
    async bookPage(req, res) {
        var data = await helper.viewData(req, 'Book Equipment')
        data.scripts.gear = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/gear_scripts.js' })

        //Authenticate user
        if (data.loggedIn) if (data.member.verified) {
            res.render('gear', data)
        } else res.status(403).redirect('/profile/me')
        else res.status(401).redirect('/login')
    },

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
                if (!fields.name.match(/^[\w- ]{1,24}$/)) valid = false
                if (!fields.brand.match(/^[\w- ]{1,24}$/)) valid = false
                if (!['boat', 'paddle', 'deck', 'ba', 'helmet', 'wetsuit'].includes(fields.type)) valid = false

                // Validate based on the type of equipment
                if (fields.type == 'boat') {
                    if (!['polo', 'whitewater', 'freestyle', 'other'].includes(fields.boat_type)) valid = false
                    if (!['s', 'm', 'l'].includes(fields.boat_size)) valid = false
                    if (!['big', 'key'].includes(fields.boat_cockpit)) valid = false
                } else if (fields.type == 'paddle') {
                    if (!['polo', 'straight', 'crank'].includes(fields.paddle_type)) valid = false
                    if (fields.paddle_length < 0 || fields.paddle_length > 1000) valid = false
                } else if (fields.type == 'deck') {
                    if (!['big', 'key'].includes(fields.deck_type)) valid = false
                    if (!['xxxs/xxs', 'xxs/xs', 'xs/s', 'm/l', 'xl/xxl'].includes(fields.deck_size)) valid = false
                } else if (fields.type == 'ba') {
                    if (!['s', 'l'].includes(fields.ba_size)) valid = false
                } else if (fields.type == 'helmet') {
                    if (!['polo', 'full', 'half'].includes(fields.helmet_type)) valid = false
                    if (!['s', 'm', 'l', 'xl'].includes(fields.helmet_size)) valid = false
                } else if (fields.type == 'wetsuit') {
                    if (!['s', 'm', 'l', 'xl'].includes(fields.wetsuit_size)) valid = false
                }

                // Loop through images
                logger.debug({
                    sessionId: req.sessionID,
                    loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                    memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                    method: req.method,
                    urlPath: req.url,
                    message: `Recieved File => ${files}`
                })
                if (files[0].mimetype.split('/')[0] == 'image') receipts.push(files[0].filepath)

                if (valid) {

                    // Create gear object
                    var gear = {
                        equipmentId: uuid.v4(),
                        name: helper.capitalize(fields.name),
                        type: fields.type,
                        brand: helper.capitalize(fields.brand),
                        dateAdded: new Date().toUTCString(),
                        img: 'img/placeholder_equipment.webp'
                    }

                    // Populate gear object based on type
                    if (fields.type == 'boat') {
                        gear.boatType = fields.boat_type
                        gear.boatSize = fields.boat_size
                        gear.boatCockpit = fields.boat_cockpit
                    } else if (fields.type == 'paddle') {
                        gear.paddleType = fields.paddle_type
                        gear.paddleLength = fields.paddle_length
                    } else if (fields.type == 'deck') {
                        gear.deckType = fields.deck_type
                        gear.deckSize = fields.deck_size
                    } else if (fields.type == 'ba') {
                        gear.baSize = fields.ba_size
                    } else if (fields.type == 'helmet') {
                        gear.helmetType = fields.helmet_type
                        gear.helmetSize = fields.helmet_size
                    } else if (fields.type == 'wetsuit') {
                        gear.wetsuitSize = fields.wetsuit_size
                    }

                    // If file exists put to S3
                    if (files.file != undefined) {
                        await sharp(files.file.filepath).webp().toFile(`${files.file.filepath}.webp`).catch((err) => { throw err })
                        await s3.putObject({
                            Bucket: 'witkc',
                            Key: `img/equipment/${gear.equipmentId}.webp`,
                            Body: fs.readFileSync(`${files[i]}.webp`)
                        }).promise().catch((err) => { throw err })
                        logger.debug({
                            sessionId: req.sessionID,
                            loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
                            memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
                            method: req.method,
                            urlPath: req.url,
                            message: `Put ${files.length} Objects to S3`
                        })
                    }

                    if (equipment.create(gear)) res.sendStatus(201)
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

    async update() {
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
                    if (equipment.delete(req.body.equipmentId)) res.sendStatus(204)
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