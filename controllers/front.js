'use strict'

const front = {
    index(req, res) {
        const viewData = {
            title: 'Welcome'
        }
        res.render('front', viewData)
    }
}

module.exports = front