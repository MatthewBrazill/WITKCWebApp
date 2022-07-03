'use strict'

// Imports
const logger = require('../../log.js')
const uuid = require('uuid')
const viewData = require('../../view_data.js')
const articles = require('../../data_managers/articles.js')

const pro = {
    async createArticle(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.loggedIn) if (data.committee == 'pro' || data.admin) {

                // Server-Side Validation
                if (!req.body.title.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (req.body.article.match(/<\s*script.*>/)) valid = false

                if (valid) {
                    if (await articles.create({
                        articleId: uuid.v4(),
                        title: viewData.capitalize(req.body.title),
                        article: req.body.article,
                        files: [],
                        date: new Date().toUTCString()
                    })) res.sendStatus(200)
                    else throw 'Could not create article.'
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async getArticle(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) {

                // Server-Side Validation
                if (req.body.articleId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    articles.get(req.body.articleId).then((article) => {
                        if (article != null) res.status(200).json(article)
                        else res.sendStatus(404)
                    })
                } else res.sendStatus(400)
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async listArticles(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) {
                articles.getAll().then((articles) => {
                    if (articles.length > 0) res.status(200).json(articles)
                    else res.sendStatus(404)
                })
            } else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async updateArticle(req, res) {
        try {
            var data = await viewData.get(req, 'API')
            var valid = true

            if (data.loggedIn) if (data.committee == 'pro' || data.admin) {

                // Server-Side Validation
                if (!req.body.articleId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) valid = false
                if (!req.body.title.match(/^[\p{L}\d!?&() ]{1,64}$/u)) valid = false
                if (req.body.article.match(/<\s*script.*>/)) valid = false

                if (valid) {
                    if (await articles.update({
                        articleId: req.body.articleId,
                        title: viewData.capitalize(req.body.title),
                        article: req.body.article
                    })) res.sendStatus(200)
                    else throw 'Could not update article.'
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    },

    async deleteArticle(req, res) {
        try {
            var data = await viewData.get(req, 'API')

            if (data.loggedIn) if (data.committee == 'pro' || data.admin) {

                // Server-Side Validation
                if (req.body.articleId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i)) {
                    if (await articles.delete(req.body.articleId)) res.sendStatus(200)
                    else throw 'Could not delete article.'
                } else res.sendStatus(400)
            } else res.sendStatus(403)
            else res.sendStatus(403)
        } catch (err) { res.status(500).json(err) }
    }
}

module.exports = pro