$(document).ready(() => {

    // Event handlers for the login form
    $('#login_form').submit((event) => {
        event.preventDefault()
        const form = $('#login_form')
        const inputs = $("form#login_form input[type!=button]")
        var valid = true

        inputs.trigger('input')
        inputs.each((index, element) => {
            var input = $(element)
            if (!input.prop('valid')) valid = false
        })

        if (!valid) form.attr('class', 'ui error form')
        else {
            form.attr('class', 'ui loading form')
            var data = {}
            inputs.each((index, element) => {
                var input = $(element)
                data[input.attr('id')] = input.val()
            })
            $.ajax({
                url: '/login',
                method: 'POST',
                data: data,
                error: () => form.attr('class', 'ui error form')
            })
        }
    })

    $('#username').on('input', () => {
        const username = $('#username')
        if (!username.val().match(/^[\w-]{1,16}$/)) username.prop('valid', false)
        else username.prop('valid', true)
    })

    $('#password').on('input', () => {
        const password = $('#password')
        if (!password.val().match(/^.{1,64}$/)) password.prop('valid', false)
        else password.prop('valid', true)
    })

    $('#hide_password').click(() => {
        const password = $('#password')
        console.log(password.attr('type'))

        if (password.attr('type') == 'password') {
            password.attr('type', 'text')
            password.siblings().attr('class', 'eye icon')

        } else {
            password.attr('type', 'password')
            password.siblings().attr('class', 'eye slash icon')
        }
        password.focus()
    })
})