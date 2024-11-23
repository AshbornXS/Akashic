document.addEventListener('DOMContentLoaded', () => {
    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username-login').value;
            const password = document.getElementById('password-login').value;

            login(username, password);
        });
    }

    // Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const username = document.getElementById('username-register').value;
            const password = document.getElementById('password-register').value;
            const role = 'ROLE_USER';

            // Carregar a imagem padrão
            const response = await fetch('/assets/images/avatar.png');
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('name', name);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('role', role);
            formData.append('profilePicture', blob, 'avatar.png');

            console.log(formData);
            register(formData);
        });
    }

    function login(username, password) {
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
                    window.location.href = 'http://localhost:5500/pages/';
                    history.replaceState(null, '', '/pages'); // Adicione esta linha
                } else {
                    alert('Login failed!');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function register(formData) {
        fetch('http://localhost:8081/auth/register', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                response.json()
                if (response.status === 201) {
                    alert('Cadastro realizado com sucesso!');
                    login(formData.get('username'), formData.get('password'));
                } else {
                    alert('Erro ao cadastrar usuário: ' + data.message);
                }

            })
    }

});