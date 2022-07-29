$(document).ready(() => {

    $('.selection.dropdown').dropdown()
    $.ajax({
        url: '/api/equipment/get_boats',
        method: 'GET',
        success: (boats) => {
            var values = []
            for (var boat of boats) values.push({
                value: boat.equipmentId,
                name: boat.gearName,
                image: boat.img
            })
            $('#boat_dropdown').removeClass('loading')
            $('#boat_dropdown').dropdown({
                placeholder: 'Select Boat',
                className: {
                    image: 'ui avatar image'
                },
                values: values
            })
        }
    })

    $('#start_calendar').calendar({
        selectAdjacentDays: true,
        firstDayOfWeek: 1,
        type: 'date',
        minDate: new Date(),
        endCalendar: $('#end_calendar')
    })
    $('#end_calendar').calendar({
        selectAdjacentDays: true,
        firstDayOfWeek: 1,
        type: 'date',
        minDate: new Date(),
        startCalendar: $('#start_calendar')
    })

    $(':input[type = checkbox]').click(function () {
        const box = $(this)
        if (!box.prop('checked')) {
            box.siblings().text('No')
            $(`#${box.attr('id')}_fields`).hide()
        } else {
            box.siblings().text('Yes')
            $(`#${box.attr('id')}_fields`).show()
        }
    })

    $('#start_date, #end_date').on('change input', function () {
        const calendar = $(this)
        const date = new Date(calendar.parent().parent().calendar('get date'))
        const field = calendar.parent().parent().parent()
        if (date === null) {
            field.attr('class', 'field error')
            calendar.prop('date', '')
            calendar.prop('valid', false)
        } else {
            field.attr('class', 'field success')
            calendar.prop('date', date.toISOString())
            calendar.prop('valid', true)
        }
    })
})