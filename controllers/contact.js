'use strict'

const contact = {
    index(req, res) {
        const viewData = {
            title: 'Contact Us'
        }
        res.render('contact', viewData)
    }
}

module.exports = contact