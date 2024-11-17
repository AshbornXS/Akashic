document.addEventListener('DOMContentLoaded', function() {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
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
            .then(data => {
                const [token, userId, username] = data.split(', ');

                if (token && userId && username) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('username', username);
                    window.location.href = 'http://localhost:5500/';
                } else {
                    alert('Login failed!');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    // Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = "ROLE_USER";

            fetch('http://localhost:8081/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, username, password, role })
            })
            .then(response => {
                if (response.status === 201) {
                    return response.json();
                } else {
                    throw new Error('Registration failed!');
                }
            })
            .then(data => {
                // Automatically log in the user
                return fetch('http://localhost:8081/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
            })
            .then(response => response.text())
            .then(data => {
                const [token, userId, username] = data.split(', ');
                
                if (token && userId && username) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('username', username);
                    window.location.href = 'http://localhost:5500/';
                } else {
                    alert('Login after registration failed!');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
});