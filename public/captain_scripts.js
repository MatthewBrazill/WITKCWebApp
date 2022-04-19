$(document).ready(() => {
    updateStats()
})

function updateStats() {
    $.ajax({
        url: '/api/captain/stats',
        method: 'GET',
        success: (stats) => {
            $('#captain_members_stat').text(stats.members)
            $('#captain_trips_stat').text(stats.trips)
            $('#captain_boats_stat').text(stats.boats)
            $('#captain_expenses_stat').text(`€ ${stats.expenses}`)
        }
    })
}