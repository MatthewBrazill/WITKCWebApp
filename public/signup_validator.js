// Function to validate the Sign Up form
function checkSignUp(form) {
    var valid = true
    for (element of form.getElementsByClassName('field')) {
        if (element.className.includes('error')) valid = false
        if (element.firstElementChild.value == '' && !['phone', 'line_two'].includes(element.firstElementChild.name)) valid = false
    }

    if (!valid) {
        form.className = 'ui form error'
        validateName(form.first_name)
        validateName(form.last_name)
        validateUsername(form.username)
        validateEmail(form.email)
        validateAddress(form.line_one)
        validateAddress(form.city)
        validateCounty(form.county)
        validateEir(form.eir)
        validatePassword(form.password)
        confirmPassword(form.confirm_password)
    }
    else form.className = 'ui loading form'
    return valid
}



// Validator for first name field
function validateName(field) {
    if (!field.value.match(/^\p{L}{1,16}$/u)) field.parentElement.className = 'field error'
    else field.parentElement.className = 'field success'
}

// Validator for username field
function validateUsername(field) {
    if (!field.value.match(/^[\w-]{1,16}$/)) field.parentElement.className = 'field error'
    else field.parentElement.className = 'field success'
}

// Validator for email field
function validateEmail(field) {
    if (!field.value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*$/)) field.parentElement.className = 'field error'
    else field.parentElement.className = 'field success'
}

// Validator for phone number field
function validatePhone(field, allowEmpty) {
    if (allowEmpty && field.value == '') field.parentElement.className = 'field'
    else if (!field.value.match(/^[+0]+\d{8,12}$/)) field.parentElement.className = 'field error'
    else field.parentElement.className = 'field success'
}

// Validate address line one field
function validateAddress(field, allowEmpty) {
    if (allowEmpty && field.value == '') field.parentElement.className = 'field'
    else if (!field.value.match(/^[\w-]{1,24}$/)) field.parentElement.className = 'field error'
    else field.parentElement.className = 'field success'
}

// Validate county field
function validateCounty(filed) {
    var counties = [
        'antrim', 'armagh', 'carlow', 'cavan', 'clare', 'cork', 'derry', 'donegal', 'down',
        'dublin', 'fermanagh', 'galway', 'kerry', 'kildare', 'kilkenny', 'laois', 'leitrim',
        'limerick', 'longford', 'louth', 'mayo', 'meath', 'monaghan', 'offaly', 'roscommon',
        'sligo', 'tipperary', 'tyrone', 'waterford', 'westmeath', 'wexford', 'wicklow'
    ]

    if (!filed.value in counties) filed.parentElement.parentElement.className = 'eleven wide field error'
    else filed.parentElement.parentElement.className = 'eleven wide field success'
}

// Validate eir field
function validateEir(field) {
    if (!field.value.match(/^[a-zA-Z0-9]{3}[ ]?[a-zA-Z0-9]{4}$/)) field.parentElement.className = 'five wide field error'
    else field.parentElement.className = 'five wide field success'
}


// Validator for password field
function validatePassword(field) {
    var res = zxcvbn(field.value)
    var warn = 'Your password is weak!'
    var tips = ''

    if (field.value == '') {
        field.parentElement.parentElement.className = 'field error'
        field.parentElement.parentElement.parentElement.className = 'ui form'
    } else if (res.score < 3) {
        field.parentElement.parentElement.className = 'field error'
        field.parentElement.parentElement.parentElement.className = 'ui form warning'

        // Build and set warning message
        if (res.feedback.warning != '') warn = `${warn} ${res.feedback.warning}:`
        document.getElementById('password_warning_header').innerHTML = warn
        for (suggestion of res.feedback.suggestions) tips = `${tips} ${suggestion}<br style="padding: 0px 10px">`
        document.getElementById('password_warning').innerHTML = `${tips}`
    } else if (res.score < 4) {
        field.parentElement.parentElement.className = 'field info'
        field.parentElement.parentElement.parentElement.className = 'ui form info'
    } else if (res.score == 4) {
        field.parentElement.parentElement.className = 'field success'
        field.parentElement.parentElement.parentElement.className = 'ui form'
    } else field.parentElement.parentElement.className = 'field error'
}

// See password button
function hidePassword(button) {
    const password = document.getElementById('password')
    const confirmPassword = document.getElementById('confirm_password')
    if (password.type == 'password') {
        password.type = 'text'
        confirmPassword.disabled = true
        button.firstElementChild.className = 'eye icon'

    } else {
        password.type = 'password' 
        confirmPassword.disabled = false
        button.firstElementChild.className = 'eye slash icon'
    }
    password.focus()
}

// Validate confirm_password field
function confirmPassword(field) {
    if (field.value != field.parentElement.parentElement.password.value || field.value == '') field.parentElement.className = 'field error'
    else field.parentElement.className = 'field success'
}