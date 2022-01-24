'use strict'

const signup = {
    get(req, res) {
        const viewData = {
            title: 'Sign Up'
        }
        res.render('signup', viewData)
    }
}

module.exports = signup