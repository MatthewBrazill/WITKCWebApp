$(document).ready(() => {

    // Event handlers for the login form
    $('#login_form').submit((event) => {
        event.preventDefault()
        const form = $('#login_form')
        const inputs = $("form#login_form input[type!=button]")
        var valid = true

        inputs.trigger('change')
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
                url: '/api/login',
                method: 'POST',
                data: data,
                success: (res) => window.location = res.url,
                error: () => {
                    form.attr('class', 'ui error form')
                    inputs.each((index, element) => $(element).val(''))
                }
            })
        }
    })

    $('#username').on('input change', () => {
        const username = $('#username')
        if (!username.val().match(/^[\w-]{1,16}$/)) username.prop('valid', false)
        else username.prop('valid', true)
    })

    $('#password').on('input change', () => {
        const password = $('#password')
        if (!password.val().match(/^.{1,64}$/)) password.prop('valid', false)
        else password.prop('valid', true)
    })

    $('#hide_password').click(() => {
        const password = $('#password')

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