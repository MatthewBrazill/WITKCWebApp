$(document).ready(() => {
    updateStats()

    $('.accept-verification').click(function () {
        var card = $(this).parent().parent().parent()
        $.ajax({
            url: '/api/captain/verify',
            method: 'POST',
            data: { 'memberId': card.attr('id'), 'decision': true },
            success: () => card.remove()
        })
    })

    $('.deny-verification').click(function () {
        var card = $(this).parent().parent().parent()
        $.ajax({
            url: '/api/captain/verify',
            method: 'POST',
            data: { 'memberId': card.attr('id'), 'decision': false },
            success: () => card.remove()
        })
    })
})

function updateStats() {
    $.ajax({
        url: '/api/captain/stats',
        method: 'GET',
        success: (stats) => {
            $('#captain_members_stat').text(stats.members)
            $('#captain_trips_stat').text(stats.trips)
            $('#captain_boats_stat').text(stats.boats)
            setTimeout(updateStats, 1000 * 60 * 5)
        }
    })
}