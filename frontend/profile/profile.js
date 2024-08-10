document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const roleMap = {
        'ROLE_ADMIN': 'Admin',
        'ROLE_USER': 'Usuário'
    };

    if (!token) {
        alert('Token não encontrado. Faça login novamente.');
        window.location.href = '../auth/login.html';
        return;
    }

    fetch('http://localhost:8081/auth/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('name').textContent = `Nome: ${data.name}`;
        document.getElementById('username').textContent = `Username: ${data.username}`;
        document.getElementById('role').textContent = `Role: ${roleMap[data.role] || data.role}`;
    })
    .catch(error => {
        console.error('Erro ao buscar informações do usuário:', error);
        alert('Erro ao buscar informações do usuário. Tente novamente mais tarde.');
    });
});