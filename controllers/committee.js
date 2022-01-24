'use strict'

const committee = {
    get(req, res) {
        const viewData = {
            title: 'Committee'
        }
        res.render('committee', viewData)
    }
}

module.exports = committee