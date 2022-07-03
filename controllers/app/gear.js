'use strict'

const equipment = require('../../data_managers/equipment.js')
// Imports
const logger = require('../../log.js')
const viewData = require('../../view_data.js')
const formidable = require('formidable')
const uuid = require('uuid')

const gear = {
    async book(req, res) {
        var data = await viewData.get(req, 'Book Equipment')
        data.scripts.gear = s3.getSignedUrl('getObject', { Bucket: 'witkc', Key: 'js/gear_scripts.js' })

        if (data.loggedIn) if (data.member.verified) {
            logger.info(`Session '${req.sessionID}': Getting Book Equipment`)
            res.render('gear', data)
        } else res.redirect('/')
        else res.redirect('/')
    },

    async create(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.committee == 'safety' || data.admin) {
                var form = new formidable.IncomingForm()
                new Promise((resolve, reject) => {
                    form.parse(req, (err, fields, files) => {
                        var valid = true

                        if (err) reject(err)
                        else {

                            // Server-Side Validation
                            if (!fields.name.match(/^[\w- ]{1,24}$/)) valid = false
                            if (!fields.brand.match(/^[\w- ]{1,24}$/)) valid = false
                            if (!['boat', 'paddle', 'deck', 'ba', 'helmet', 'wetsuit'].includes(fields.type)) valid = false

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

                            if (!valid) reject()
                            else resolve([fields, files])
                        }
                    })
                }).then(async (values) => {

                    var gear = {
                        equipmentId: uuid.v4(),
                        name: viewData.capitalize(values[0].name),
                        type: values[0].type,
                        brand: viewData.capitalize(values[0].brand),
                        dateAdded: new Date().toUTCString(),
                        img: 'img/placeholder_equipment.webp'
                    }

                    if (values[0].type == 'boat') {
                        gear.boatType = values[0].boat_type
                        gear.boatSize = values[0].boat_size
                        gear.boatCockpit = values[0].boat_cockpit
                    } else if (values[0].type == 'paddle') {
                        gear.paddleType = values[0].paddle_type
                        gear.paddleLength = values[0].paddle_length
                    } else if (values[0].type == 'deck') {
                        gear.deckType = values[0].deck_type
                        gear.deckSize = values[0].deck_size
                    } else if (values[0].type == 'ba') {
                        gear.baSize = values[0].ba_size
                    } else if (values[0].type == 'helmet') {
                        gear.helmetType = values[0].helmet_type
                        gear.helmetSize = values[0].helmet_size
                    } else if (values[0].type == 'wetsuit') {
                        gear.wetsuitSize = values[0].wetsuit_size
                    }

                    if (values[1].file != undefined) if (values[1].file.mimetype.split('/')[0] == 'image') {
                        await sharp(values[1].file.filepath).webp().toFile(`${values[1].file.filepath}.webp`).catch((err) => { throw err })
                        await s3.putObject({
                            Bucket: 'witkc',
                            Key: `img/equipment/${gear.equipmentId}.webp`,
                            Body: fs.readFileSync(`${values[1][i]}.webp`)
                        }).promise().catch((err) => { throw err })
                    }

                    equipment.create(gear).then((success) => {
                        if (success) res.sendStatus(200)
                        else res.sendStatus(400)
                    }).catch((err) => { res.status(400).json(err) })
                }).catch((err) => { res.status(400).json(err) })
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) { res.status(500).json(err) }
    },

    async get(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.member.verified) {
                if (req.body.equipmentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    equipment.get(req.body.equipmentId).then((result) => {
                        if (result != null) res.status(200).json(result)
                        else res.sendStatus(404)
                    }).catch((err) => { res.status(400).json(err) })
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) { res.status(500).json(err) }
    },

    async list(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.member.verified) {
                if (req.body.filter == undefined || req.body.filter == '') {
                    equipment.getAll().then((result) => {
                        if (result != null) res.status(200).json(result)
                        else res.sendStatus(404)
                    }).catch((err) => { res.status(400).json(err) })
                } else if (['boats', 'paddles', 'decks', 'bas', 'helmets', 'wetsuits'].includes(req.body.filter)) {
                    equipment.getAll().then((result) => {
                        if (result != null) res.status(200).json(result[req.body.filter])
                        else res.sendStatus(404)
                    }).catch((err) => { res.status(400).json(err) })
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) { res.status(500).json(err) }
    },

    async delete(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.committee == 'equipments' || data.admin) {
                if (req.body.equipmentId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    equipment.delete(req.body.equipmentId).then((success) => {
                        if (success) res.sendStatus(200)
                        else res.sendStatus(400)
                    }).catch((err) => { res.status(400).json(err) })
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(401)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = gear