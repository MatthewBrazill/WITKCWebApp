$(document).ready(() => {
    $('#boat_filters').hide()
    $('#paddle_filters').hide()
    $('#deck_filters').hide()
    $('#ba_filters').hide()
    $('#helmet_filters').hide()
    $('#wetsuit_filters').hide()

    $('.selection.dropdown').dropdown()

    $('#fromDate').calendar({
        selectAdjacentDays: true,
        firstDayOfWeek: 1,
        type: 'date',
        minDate: new Date(),
        endCalendar: $('#toDate')
    })
    $('#toDate').calendar({
        selectAdjacentDays: true,
        firstDayOfWeek: 1,
        type: 'date',
        minDate: new Date(),
        startCalendar: $('#fromDate')
    })

    $('#booking_form').submit((event) => {
        event.preventDefault()
        const form = $('#booking_form')
        const inputs = $("form#booking_form input[type!=button]")
        var valid = true

        inputs.trigger('input')
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
                url: '/api/equipment/find',
                method: 'POST',
                data: data,
                success: (res) => {
                    
                },
                error: () => form.attr('class', 'ui error form')
            })
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
    })

    $('#fromDate').on('change', () => {
        const start = $('#fromDate')
        const date = new Date(start.parent().parent().calendar('get date'))
        const field = start.parent().parent().parent()
        if (date === null) {
            field.attr('class', 'inline field error')
            start.prop('date', '')
            start.prop('valid', false)
        } else {
            field.attr('class', 'inline field success')
            start.prop('date', date.toISOString())
            start.prop('valid', true)
        }
    })

    $('#toDate').on('change', () => {
        const end = $('#toDate')
        const date = new Date(end.parent().parent().calendar('get date'))
        const field = end.parent().parent().parent()
        if (date === null) {
            field.attr('class', 'inline field error')
            end.prop('date', '')
            end.prop('valid', false)
        } else {
            field.attr('class', 'inline field success')
            end.prop('date', date.toISOString())
            end.prop('valid', true)
        }
    })

    $('#')
})