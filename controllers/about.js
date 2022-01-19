'use strict'

const about = {
    index(req, res) {
        const viewData = {
            title: 'About Us'
        }
        res.render('about', viewData)
    }
}

module.exports = about