'use strict'

// Imports
const logger = require('../../log.js')
const articles = require('../../data_managers/articles.js')
const helper = require('../helper.js')

const home = {
    async homePage(req, res) {
        var data = await helper.viewData(req, 'Home')
        data.articles = await articles.getAll()
        console.log(req.device)
        res.render(`${req.device.type}/home`, data)
    }
}

module.exports = home