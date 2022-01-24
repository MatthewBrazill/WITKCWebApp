'use strict'

const home = {
    index(req, res) {
        const viewData = {
            title: 'Home',
            logged_in: true,
            image_url: "",
            name: "John Smith",
            date_joined: "03/09/2019"
        }
        res.render('home', viewData)
    }
}

module.exports = home