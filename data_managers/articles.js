'use strict'

// Imports
const logger = require('../log.js')
const fs = require('fs')

const articles = {
    async create(article) {
        try {
            if (article == null || article == undefined) throw `Received invalid article!`
            const articles = JSON.parse(fs.readFileSync('./data_managers/articles.json'))
            articles.push(article)
            fs.writeFileSync('./data_managers/articles.json', JSON.stringify(articles))
            return true
        } catch (err) {
            logger.warn(`Failed to create article! ${err}`)
            return false
        }
    },

    async get(articleId) {
        try {
            if (articleId == null || articleId == undefined) throw `Received invalid memberId!`
            const articles = JSON.parse(fs.readFileSync('./data_managers/articles.json'))
            for (var article of articles) if (article.articleId == articleId) return article
            throw 'Failed to find article.'
        } catch (err) {
            logger.warn(`Failed to get article! ${err}`)
            return null
        }
    },

    async getAll() {
        try {
            return JSON.parse(fs.readFileSync('./data_managers/articles.json'))
        } catch (err) {
            logger.warn(`Failed to get article! ${err}`)
            return null
        }
    },

    async update(article) {
        try {
            if (article == null || article == undefined) throw `Received invalid article!`
            const articles = JSON.parse(fs.readFileSync('./data_managers/articles.json'))
            for (var i in articles) if (articles[i].articleId == article.articleId) {
                for (var attr in article) articles[i][attr] = article[attr]
                fs.writeFileSync('./data_managers/articles.json', JSON.stringify(articles))
                return true
            }
            throw 'Failed to find article.'
        } catch (err) {
            logger.warn(`Failed to update article! ${err}`)
            return false
        }
    },

    async delete(articleId) {
        try {
            if (articleId == null || articleId == undefined) throw `Received invalid article!`
            const articles = JSON.parse(fs.readFileSync('./data_managers/articles.json'))
            for (var i in articles) if (articles[i].articleId == articleId) {
                articles.splice(i, 1)
                fs.writeFileSync('./data_managers/articles.json', JSON.stringify(articles))
                return true
            }
            throw 'Failed to find article.'
        } catch (err) {
            logger.warn(`Failed to delete article! ${err}`)
            return false
        }
    }
}

module.exports = articles