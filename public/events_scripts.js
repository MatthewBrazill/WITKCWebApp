$(document).ready(() => {

    $('#event_calendar').calendar({
        selectAdjacentDays: true,
        initialDate: new Date(),
        type: 'date',
        today: true,
        constantHeight: true,
        firstDayOfWeek: 1,
        onChange: () => $('#event_calendar').trigger('change')
    })

    $('#event_calendar').ready(() => $('#event_calendar').trigger('change'))
    $('#event_calendar').on('change', () => {
        const calendar = $('#event_calendar')
        const list = $('#event_list')

        list.attr('class', 'ui loading placeholder segment')
        $.ajax({
            url: '/api/events/day',
            method: 'POST',
            data: { date: calendar.calendar('get date') },
            success: (res) => {
                console.log(res)
                if (res.events.length == 0) {
                    list.attr('class', 'ui placeholder segment')
                    list.html('<div class="ui icon header"><i class="calendar alternate icon"></i>There are currently no events planed on this day!</div>')
                } else {
                    list.attr('class', 'ui segment')
                    var listContent = '<ul>'
                    for (var event in res.events) {
                        listContent.concat(`<li>${event}</li>`)
                    }
                    listContent.concat('</ul>')
                    list.html(listContent)
                }
            },
            error: () => {
                list.attr('class', 'ui placeholder segment')
                list.html('<div class="ui icon header"><i class="red server icon"></i>There was a problem reaching the server. Try again later!</div>')
            }
        })
    })
})