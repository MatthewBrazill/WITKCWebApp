'use strict'

const events = {
    index(req, res) {
        const viewData = {
            title: 'Events'
        }
        res.render('events', viewData)
    }
}

module.exports = events