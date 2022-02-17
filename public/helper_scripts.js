function checkPassword(form) {
    if (form.password.value != form.passwordConfirm.value) {
        alert("Passwords do not match!")
        document.getElementById("pw_conf").value.style.backgroundColour = "yellow"
        return false;
    } else {
        document.getElementById("pw_conf").value.style.backgroundColour = "white"
        return true;
    }
}

function checkSignUp(user) {
    
}