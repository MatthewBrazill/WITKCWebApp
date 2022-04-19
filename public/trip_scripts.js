$(document).ready(() => {

    $.ajax({
        url: '/api/safety_boaters',
        method: 'GET',
        success: (members) => {

            $('#trip_form').attr('class', 'ui form')
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

            $('#trip_form').on('submit', (event) => {
                event.preventDefault()
                const form = $('#trip_form')
                const inputs = $("form#trip_form input[type!=button][class!=search], textarea")
                var valid = true

                inputs.trigger('change')
                inputs.trigger('input')
                inputs.each((index, element) => {
                    var input = $(element)
                    if (!input.prop('valid') && input.attr('type') != 'checkbox') valid = false
                })

                if (!valid) form.attr('class', 'ui error form')
                else {
                    form.attr('class', 'ui loading form')
                    var data = { hazards: [] }
                    inputs.each((index, element) => {
                        var input = $(element)
                        if (input.attr('type') == 'checkbox') {
                            if (input.attr('id') == 'enough_safety') data.enough_safety = input.prop('checked')
                            else if (input.attr('id') == 'other_hazards_checkbox' && input.prop('checked')) data.hazards.push($('#other_hazards').val())
                            else if (input.prop('checked')) data.hazards.push(input.attr('id'))
                        } else if (input.attr('id').split('_')[1] == 'date') data[input.attr('id')] = input.prop('date')
                        else if (input.attr('id') != 'other_hazards') data[input.attr('id')] = input.val()
                    })
                    $.ajax({
                        url: '/api/trip/create',
                        method: 'POST',
                        data: data,
                        success: (res) => window.location = res.url,
                        error: () => form.attr('class', 'ui error form')
                    })
                }
            })

            $('#name').on('input', () => {
                const name = $('#name')
                const field = name.parent()
                if (!name.val().match(/^[\p{L} ]{1,64}$/u)) {
                    field.attr('class', 'field error')
                    name.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    name.prop('valid', true)
                }
            })

            $('#start_date').on('change', () => {
                const start = $('#start_date')
                const date = new Date(start.parent().parent().calendar('get date'))
                const field = start.parent().parent().parent()
                if (date === null) {
                    field.attr('class', 'inline field error')
                    start.prop('date', '')
                    start.prop('valid', false)
                } else {
                    field.attr('class', 'inline field success')
                    start.prop('date', date.toISOString().substring(0, 10))
                    start.prop('valid', true)
                }
            })

            $('#end_date').on('change', () => {
                const end = $('#end_date')
                const date = new Date(end.parent().parent().calendar('get date'))
                const field = end.parent().parent().parent()
                if (date === null) {
                    field.attr('class', 'inline field error')
                    end.prop('date', '')
                    end.prop('valid', false)
                } else {
                    field.attr('class', 'inline field success')
                    end.prop('date', date.toISOString().substring(0, 10))
                    end.prop('valid', true)
                }
            })

            $('#description').on('input', () => {
                const description = $('#description')
                const field = description.parent()
                if (!description.val().match(/^.{1,500}$/u)) {
                    field.attr('class', 'field error')
                    description.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    description.prop('valid', true)
                }
            })

            $('#line_one').on('input', () => {
                const line = $('#line_one')
                const field = line.parent()
                if (!line.val().match(/^[\w- ]{1,32}$/)) {
                    field.attr('class', 'field error')
                    line.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    line.prop('valid', true)
                }
            })

            $('#line_two').on('input', () => {
                const line = $('#line_two')
                const field = line.parent()
                if (line.val() == '') {
                    field.attr('class', 'field')
                    line.prop('valid', true)
                } else if (!line.val().match(/^[\w- ]{1,32}$/)) {
                    field.attr('class', 'field error')
                    line.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    line.prop('valid', true)
                }
            })

            $('#city').on('input', () => {
                const city = $('#city')
                const field = city.parent()
                if (!city.val().match(/^[\w- ]{1,32}$/)) {
                    field.attr('class', 'field error')
                    city.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    city.prop('valid', true)
                }
            })

            $('#county_dropdown').dropdown()
            $('#county').on('change', () => {
                const county = $('#county')
                const field = county.parent().parent()
                var counties = [
                    'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
                    'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
                    'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
                    'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
                ]

                if (!counties.includes(county.val())) {
                    field.attr('class', 'ten wide field error')
                    county.prop('valid', false)
                } else {
                    field.attr('class', 'ten wide field success')
                    county.prop('valid', true)
                }
            })

            $('#code').on('input', () => {
                const code = $('#code')
                const field = code.parent()
                if (!code.val().match(/^[a-z0-9]{3}[ ]?[a-z0-9]{4}$/i) && !code.val().match(/^[a-z0-9]{2,4}[ ]?[a-z0-9]{3}$/i)) {
                    field.attr('class', 'six wide field error')
                    code.prop('valid', false)
                } else {
                    field.attr('class', 'six wide field success')
                    code.prop('valid', true)
                }
            })

            $('#level_dropdown').dropdown()
            $('#level').on('change', () => {
                const level = $('#level')
                const field = level.parent().parent()

                if (level.val() < 1 || level.val() > 5 || level.val() == '') {
                    field.attr('class', 'field error')
                    level.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    level.prop('valid', true)
                }
            })

            var values = []
            var memberIds = []
            for (var member of members) {
                memberIds.push(member.memberId)
                values.push({
                    name: `${member.firstName} ${member.lastName}`,
                    value: member.memberId,
                    image: member.img
                })
            }
            $('#safety_dropdown').dropdown({
                placeholder: 'Safety Boaters',
                match: 'text',
                fullTextSearch: 'exact',
                ignoreDiacritics: 'true',
                className: {
                    image: 'ui avatar image'
                },
                values: values
            })
            $('#safety').on('change', () => {
                const safety = $('#safety')
                const field = safety.parent().parent()
                if (!safety.val().split(',').every(item => memberIds.includes(item))) {
                    field.attr('class', 'field error')
                    safety.prop('valid', false)
                } else {
                    field.attr('class', 'field success')
                    safety.prop('valid', true)
                }
            })

            $('#enough_safety').on('change', () => {
                const box = $('#enough_safety')

                if (!box.prop('checked')) box.siblings().text(`No (This does not mean your trip will be denied! We will try to find additional safety boaters for your trip.)`)
                else box.siblings().text('Yes')
            })
            $('#enough_safety').trigger('change')

            $('#other_hazards_checkbox').on('change', () => {
                const box = $('#other_hazards_checkbox')
                const text = $('#other_hazards')

                if (!box.prop('checked')) {
                    text.attr('disabled', true)
                    text.val('')
                } else text.attr('disabled', false)
                text.trigger('input')
            })

            $('#other_hazards').on('input', () => {
                const text = $('#other_hazards')
                const field = text.parent()

                if ($('#other_hazards_checkbox').prop('checked')) {
                    if (!text.val().match(/^[\w- ,]{1,24}$/)) {
                        field.attr('class', 'field error')
                        text.prop('valid', false)
                    } else {
                        field.attr('class', 'field success')
                        text.prop('valid', true)
                    }
                } else {
                    field.attr('class', 'field')
                    text.prop('valid', true)
                }
            })
        },
        error: () => { form.attr('class', 'ui error form') }
    })


})