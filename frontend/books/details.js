const token = localStorage.getItem('token');

const adminSection = document.getElementById('admin-section');
const loginButton = document.getElementById('login');
const registerButton = document.getElementById('register');
const logoutButton = document.getElementById('logout');
const profile = document.getElementById('profile');

document.addEventListener('DOMContentLoaded', function() {
    const bookId = getBookIdFromUrl();
    if (bookId) {
        fetchBookDetails(bookId);
    } else {
        console.error('ID do livro não encontrado na URL');
    }

    function getBookIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function fetchBookDetails(bookId) {
        try {
            const response = await fetch(`http://localhost:8081/books/${bookId}`);
            const book = await response.json();
            displayBookDetails(book);
        } catch (error) {
            console.error('Erro ao buscar detalhes do livro:', error);
        }
    }

    function displayBookDetails(book) {
        const bookDetailsDiv = document.getElementById('book-details');
        bookDetailsDiv.innerHTML = `
            <h1>${book.title}</h1>
            <p>Autor: ${book.author}</p>
            <p>Descrição: ${book.description}</p>
            <img src="data:image/jpeg;base64,${book.imageData}" alt="${book.title}">
        `;
    }
});

fetch('http://localhost:8081/auth/me', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => {
    if (data.role === 'ROLE_ADMIN') {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }
})
.catch(error => {
    console.error('Erro ao verificar o papel do usuário:', error);
    adminSection.style.display = 'none';
});

if (token) {
    logoutButton.style.display = 'block';
    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
} else {
    logoutButton.style.display = 'none';
    profile.style.display = 'none';
}

logoutButton.addEventListener('click', function () {
    if (token) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
});