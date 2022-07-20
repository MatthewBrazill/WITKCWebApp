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
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    article: article,
                    objectType: 'article',
                    storageType: 'dynamo',
                    message: `Created Article`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                article: article,
                objectType: 'article',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Create Article`
            })
            return false
        })
    },

    async get(articleId) {
        if (articleId === null || articleId === undefined) return null
        return dynamo.getItem({
            Key: { 'articleId': { S: articleId } },
            TableName: 'witkc-articles'
        }).promise().then((data) => {
            if (data.Item != undefined) {
                logger.info({
                    articleId: articleId,
                    objectType: 'article',
                    storageType: 'dynamo',
                    message: `Got Article`
                })
                return {
                    articleId: data.Item['articleId'].S,
                    title: data.Item['title'].S,
                    article: data.Item['article'].S,
                    date: data.Item['date'].S
                }
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                articleId: articleId,
                objectType: 'article',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get Article`
            })
            return null
        })
    },

    async getAll() {
        return dynamo.scan({
            TableName: 'witkc-articles'
        }).promise().then((data) => {
            if (data.Items != undefined) {
                var articles = []
                for (var item of data.Items) articles.push({
                    articleId: item['articleId'].S,
                    title: item['title'].S,
                    article: item['article'].S,
                    date: item['date'].S
                })
                logger.info({
                    objectType: 'article',
                    storageType: 'dynamo',
                    message: `Got All Articles`
                })
                return articles
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                objectType: 'article',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Get All Articles`
            })
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
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    article: article,
                    objectType: 'article',
                    storageType: 'dynamo',
                    message: `Updated Article`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                article: article,
                objectType: 'article',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Update Article`
            })
            return false
        })
    },

    async delete(articleId) {
        if (articleId == undefined || articleId == null) return false
        return dynamo.deleteItem({
            Key: { 'articleId': { S: articleId } },
            TableName: 'witkc-articles'
        }).promise().then((data) => {
            if (data) {
                logger.info({
                    memberId: memberId,
                    objectType: 'article',
                    storageType: 'dynamo',
                    message: `Deleted Article`
                })
                return true
            } else throw `Received unexpected response from AWS! Got: ${JSON.stringify(data)}`
        }).catch((err) => {
            logger.warn({
                articleId: articleId,
                objectType: 'article',
                storageType: 'dynamo',
                error: err,
                stack: err.stack,
                message: `Failed To Delete Article`
            })
            return false
        })
    }
}

module.exports = articles