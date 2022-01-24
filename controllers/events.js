'use strict'

const events = {
    get(req, res) {
        const viewData = {
            title: 'Events'
        }
        res.render('events', viewData)
    }
}

module.exports = events