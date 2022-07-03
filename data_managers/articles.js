'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const articles = {
    async create(article) {
        if (article == undefined || article == null) return false
        return dynamo.putItem({
            Item: {
                'articleId': { S: article.articleId },
                'title': { S: article.title },
                'article': { S: article.article },
                'date': { S: article.date }
            },
            TableName: 'witkc-articles'
        }).promise().then(() => {
            logger.info(`Article '${article.articleId}': Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create article '${article.articleId}'! ${err}`)
            return false
        })
    },

    async get(articleId) {
        if (articleId === null || articleId === undefined) return null
        return dynamo.getItem({
            Key: { 'articleId': { S: articleId } },
            TableName: 'witkc-articles'
        }).promise().then(async (data) => {
            if (data.Item != undefined) return {
                articleId: data.Item['articleId'].S,
                title: data.Item['title'].S,
                article: data.Item['article'].S,
                date: new Date(data.Item['date'].S).toUTCString().substring(5, 16)
            }
            else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to get article ${articleId}! ${err}`)
            return null
        })
    },

    async getAll() {
        return dynamo.scan({
            TableName: 'witkc-articles'
        }).promise().then(async (data) => {
            if (data.Items != undefined) {
                var articles = []
                for (var item of data.Items) {
                    articles.push({
                        articleId: item['articleId'].S,
                        title: item['title'].S,
                        article: item['article'].S,
                        date: new Date(item['date'].S).toUTCString().substring(5, 16)
                    })
                }
                return articles
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn(`Failed to get all articles! ${err}`)
            return null
        })
    },

    async update(article) {
        if (article == undefined || article == null) return false
        return dynamo.updateItem({
            Key: { 'articleId': { S: article.articleId } },
            ExpressionAttributeValues: {
                ':title': { S: article.title },
                ':article': { S: article.article }
            },
            UpdateExpression: 'SET title = :title, article = :article',
            TableName: 'witkc-articles'
        }).promise().then(() => {
            logger.info(`Article '${article.articleId}': Updated`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to update article '${article.articleId}'! ${err}`)
            return false
        })
    },

    async delete(articleId) {
        if (articleId == undefined || articleId == null) return false
        return dynamo.deleteItem({
            Key: { 'articleId': { S: articleId } },
            TableName: 'witkc-articles'
        }).promise().then(() => {
            logger.info(`Article '${articleId}': Deleted`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to delete article '${articleId}'! ${err}`)
            return false
        })
    }
}

module.exports = articles