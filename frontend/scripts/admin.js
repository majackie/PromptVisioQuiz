// ChatGPT-3.5 (https://chat.openai.com/) was used to code solutions presented in this assignment

// Check if the user is logged in and if the role is 'admin'
if (localStorage.getItem('isLoggedIn') !== 'true' || localStorage.getItem('role') !== 'admin') {
    // If not, redirect to the login page
    window.location.href = 'index.html';
}

window.onload = function() {
    // Get the button
    var button = document.querySelector('.container button');

    // Set the button click event
    button.onclick = function() {
        window.location.href = 'questionaire.html';
    };
};