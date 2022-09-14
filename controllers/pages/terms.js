'use strict'

// Imports
const logger = require('../../log.js')
const helper = require('../helper.js')

const terms = {
    async termsPage(req, res) {
        var data = await helper.viewData(req, 'Terms and Services')
        res.render(`${req.device.type}/terms`, data)
    },

    async privacyPage(req, res) {
        var data = await helper.viewData(req, 'Privacy Policy')
        res.render(`${req.device.type}/privacy`, data)
    }
}

module.exports = terms