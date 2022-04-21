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
            setTimeout(updateStats, 1000 * 60 * 5)
        }
    })
}