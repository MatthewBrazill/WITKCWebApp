'use strict'

const articles = require('../../data_managers/articles.js')
// Imports
const logger = require('../../log.js')
const viewData = require('../../view_data.js')

const home = {
    async homePage(req, res) {
        var data = await viewData.get(req, 'Home')
        data.articles = await articles.getAll()

        logger.info(`Session '${req.sessionID}': Getting Home`)
        res.render('home', data)
    }
}

module.exports = home