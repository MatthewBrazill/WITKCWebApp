'use strict'

const committee = {
    index(req, res) {
        const viewData = {
            title: 'Committee'
        }
        res.render('committee', viewData)
    }
}

module.exports = committee