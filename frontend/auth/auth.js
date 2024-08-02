document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(token => {
        if (token) {
            localStorage.setItem('token', token);
            window.location.href = 'http://localhost:5500/';
        } else {
            alert('Login failed!');
        }
    })
    .catch(error => console.error('Error:', error));
});