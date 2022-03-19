// Function to validate the Login form
function checkLogin(form) {
    // Validate fields
    if (!form.username.value.match(/^[\w-]{1,16}$/)) return false
    if (!form.password.value.match(/^.{1,64}$/)) return false

    return true
}