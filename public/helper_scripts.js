function checkPassword(form) {
    if (form.password.value != form.passwordConfirm.value) {
        alert("Passwords do not match!")
        document.getElementById("pwconf").value.style.backgroundColour = "yellow"
        return false;
    } else {
        document.getElementById("pwconf").value.style.backgroundColour = "white"
        return true;
    }
}

function checkusr(user) {

}