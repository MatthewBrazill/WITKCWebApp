$(document).ready(() => {
    $('#boat_filters').hide()
    $('#paddle_filters').hide()
    $('#deck_filters').hide()
    $('#ba_filters').hide()
    $('#helmet_filters').hide()
    $('#wetsuit_filters').hide()

    $('.selection.dropdown').dropdown()

    $('#from_calendar').calendar({
        selectAdjacentDays: true,
        firstDayOfWeek: 1,
        type: 'date',
        minDate: new Date(),
        endCalendar: $('#to_calendar'),
        onChange: () => fromDateChange()
    })

    $('#booking_button').click(() => {
        fromDateChange()
        toDateChange()
        var valid = true
        if (!$('#fromDate').prop('valid')) valid = false
        if (!$('#toDate').prop('valid')) valid = false

        if (!valid) form.attr('class', 'ui error form')
        else {
            var cookies = document.cookie.replace(' ', '').split(';')
            var cart = []
            if (cookies != '') for (var cookie of cookies) if (cookie.split('=')[0] == 'setukcGearCart') cart = JSON.parse(cookie.split('=')[1])

            for (var item of cart) {
                var data = {
                    fromDate: $('#fromDate').prop('date'),
                    toDate: $('#toDate').prop('date'),
                    equipmentId: item,
                }

                $.ajax({
                    url: '/api/equipment/book',
                    method: 'POST',
                    data: data
                })
            }

            document.cookie = 'setukcGearCart=[];expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/'
            window.location = '/profile/me'
        }
    })

    $('#type').on('change', () => {
        const type = $('#type')
        $('#boat_filters').hide()
        $('#paddle_filters').hide()
        $('#deck_filters').hide()
        $('#ba_filters').hide()
        $('#helmet_filters').hide()
        $('#wetsuit_filters').hide()

        if (type.val() == 'boat') $('#boat_filters').show()
        if (type.val() == 'paddle') $('#paddle_filters').show()
        if (type.val() == 'deck') $('#deck_filters').show()
        if (type.val() == 'ba') $('#ba_filters').show()
        if (type.val() == 'helmet') $('#helmet_filters').show()
        if (type.val() == 'wetsuit') $('#wetsuit_filters').show()

        updateQuery()
    })

    $('#search').on('input', () => {
        const search = $('#search')
        const field = search.parent()
        if (!search.val().match(/^[\w- ]{0,32}$/)) {
            field.attr('class', 'ten wide field error')
            search.prop('valid', false)
        } else {
            field.attr('class', 'ten wide field')
            search.prop('valid', true)
            updateQuery()
        }
    })

    $('.filter').on('change', function () {
        const dropdown = $(this)
        if (dropdown.val() == null || dropdown.val() == '') {
            dropdown.prop('valid', true)
            dropdown.parent().parent().attr('class', 'four wide field')
        } else {
            dropdown.prop('valid', true)
            dropdown.parent().parent().attr('class', 'four wide field success')
        }
        updateQuery()
    })

    updateCart()
    $('#cart_button').click(() => {
        const from = $('#fromDate')
        const to = $('#toDate')
        fromDateChange()
        toDateChange()
        if (from.prop('valid') && to.prop('valid')) {
            $('#cart_header').text('Gear Cart - Book From ' + from.prop('date').substring(0, 10) + ' To ' + to.prop('date').substring(0, 10))
            $('#cart_screen').modal('show')
        }
    })

    $("form#booking_form input[type!=button][id!=fromDate][id!=toDate]").trigger('change')
    $("form#booking_form input[type!=button][id!=fromDate][id!=toDate]").trigger('input')
})

function updateQuery() {
    const inputs = $("form#booking_form input[type!=button][id!=fromDate][id!=toDate]")
    var valid = true

    inputs.each((index, element) => {
        var input = $(element)
        if (!input.prop('valid')) valid = false
    })

    if (valid) {
        var data = {}
        inputs.each((index, element) => {
            var input = $(element)
            data[input.attr('id')] = input.val()
        })
        $.ajax({
            url: '/api/equipment/find',
            method: 'POST',
            data: data,
            success: (res) => {
                $('#search_results').html('')
                for (gear of res) {
                    var content = $(`<div class="content"></div>`)
                    var cookies = document.cookie.replace(' ', '').split(';')
                    var cart = []
                    if (cookies != '') for (var cookie of cookies) if (cookie.split('=')[0] == 'setukcGearCart') cart = JSON.parse(cookie.split('=')[1])

                    if (!cart.includes(gear.equipmentId)) content.append($(`<button class="ui right floated blue icon button add_cart_button" style="margin-top: 3px;">Add to <i class="ui cart icon"></i></button>`).click(function () {
                        const button = $(this)
                        const card = $(this).parent().parent()

                        var cookies = document.cookie.replace(' ', '').split(';')
                        var cart = []
                        if (cookies != '') for (var cookie of cookies) if (cookie.split('=')[0] == 'setukcGearCart') cart = JSON.parse(cookie.split('=')[1])

                        fromDateChange()
                        toDateChange()
                        if (!cart.includes(card.attr('id'))) {
                            button.html('Added <i class="ui check icon"></i>')
                            button.unbind()
                            cart.push(card.attr('id'))
                            document.cookie = `setukcGearCart=${JSON.stringify(cart)};path=/`
                            updateCart()
                        }
                    }))
                    else content.append($(`<button class="ui right floated blue icon button add_cart_button" style="margin-top: 3px;">Added <i class="ui check icon"></i></button>`))
                    content.append($(`<div class="ui header" style="margin: 0px;">${gear.brand}: ${gear.gearName}</div>`))

                    if (gear.type == 'boat') content.append($(`<div>Type: ${gear.boatType[0].toUpperCase() + gear.boatType.slice(1)}, Size: ${gear.boatSize.toUpperCase()}, Cockpit: ${gear.boatCockpit[0].toUpperCase() + gear.boatCockpit.slice(1)}</div>`))
                    else if (gear.type == 'paddle') content.append($(`<div>Type: ${gear.paddleType[0].toUpperCase() + gear.paddleType.slice(1)}, Length: ${gear.paddleLength}</div>`))
                    else if (gear.type == 'deck') content.append($(`<div>Type: ${gear.deckType[0].toUpperCase() + gear.deckType.slice(1)}, Size: ${gear.deckSize.toUpperCase()}</div>`))
                    else if (gear.type == 'ba') content.append($(`<div>Size: ${gear.baSize.toUpperCase()}</div>`))
                    else if (gear.type == 'helmet') content.append($(`<div>Type: ${gear.helmetType[0].toUpperCase() + gear.helmetType.slice(1)}, Size: ${gear.helmetSize.toUpperCase()}</div>`))
                    else if (gear.type == 'wetsuit') content.append($(`<div>Size: ${gear.wetsuitSize.toUpperCase()}</div>`))

                    $('#search_results').append($(`<div class="ui fluid card" id="${gear.equipmentId}"></div>`).append(content))
                }
            },
            error: () => form.attr('class', 'ui error form')
        })
    }
}

function updateCart() {
    var cookies = document.cookie.replace(' ', '').split(';')
    var cart = []
    if (cookies != '') for (var cookie of cookies) if (cookie.split('=')[0] == 'setukcGearCart') cart = JSON.parse(cookie.split('=')[1])

    $('#cart_content').html('')
    for (var gear of cart) $.ajax({
        url: '/api/equipment/get',
        method: 'POST',
        data: { equipmentId: gear },
        success: (item) => {
            $('#cart_content').append($(`<div class="ui fluid card" id="modal_${item.equipmentId}"></div>`)
                .append($(`<div class="content"></div>`)
                    .append($(`<div class="ui right floated negative icon button">Delete <i class="ui trash icon"></i></div>`).click(function () {
                        const card = $(this).parent().parent()
                        var cookies = document.cookie.replace(' ', '').split(';')
                        var cart = []
                        if (cookies != '') for (var cookie of cookies) if (cookie.split('=')[0] == 'setukcGearCart') cart = JSON.parse(cookie.split('=')[1])
                        if (cart.includes(card.attr('id').substring(6))) cart.splice(cart.indexOf(card.attr('id').substring(6)))
                        document.cookie = `setukcGearCart=${JSON.stringify(cart)};path=/`
                        updateCart()
                        updateQuery()
                    }))
                    .append($(`<div class="ui header" style="margin: 0px; padding-top: 6px;">${item.brand}: ${item.gearName}</div>`))))
        }
    })
    $('#cart_button').html(`${cart.length} <i class="ui cart icon"></i>`)
}

function fromDateChange() {
    const from = $('#fromDate')
    const fromDate = $('#from_calendar').calendar('get date')
    const fromField = $('#from_calendar').parent()
    if (fromDate == null) {
        fromField.attr('class', 'four wide field error')
        from.prop('date', '')
        from.prop('valid', false)
    } else {
        fromField.attr('class', 'four wide field success')
        from.prop('date', new Date(fromDate).toISOString())
        from.prop('valid', true)
        $('#to_calendar').parent().show()
        $('#to_calendar').calendar({
            selectAdjacentDays: true,
            firstDayOfWeek: 1,
            type: 'date',
            minDate: new Date(),
            startCalendar: $('#from_calendar'),
            onChange: () => toDateChange()
        })
    }
}

function toDateChange() {
    const to = $('#toDate')
    const toDate = $('#to_calendar').calendar('get date')
    const toField = $('#to_calendar').parent()
    if (toDate == null) {
        toField.attr('class', 'four wide field error')
        to.prop('date', '')
        to.prop('valid', false)
    } else {
        toField.attr('class', 'four wide field success')
        to.prop('date', new Date(toDate).toISOString())
        to.prop('valid', true)
    }
}