$(document).ready(() => {
    $('#language_dropdown').dropdown({
        values: [{
            name: 'English',
            value: 'en-IE',
            icon: 'uk',
            iconClass: 'flag',
            selected: true
        },{
            name: 'Irish',
            value: 'ga-IE',
            icon: 'ie',
            iconClass: 'flag'
        }, {
            name: 'German',
            value: 'de-DE',
            icon: 'de',
            iconClass: 'flag'
        }, {
            name: 'Spanish',
            value: 'es-ES',
            icon: 'es',
            iconClass: 'flag'
        }, {
            name: 'French',
            value: 'fr-FR',
            icon: 'fr',
            iconClass: 'flag'
        }]
    })
})