const token = localStorage.getItem('token');

const adminSection = document.getElementById('admin-section');
const loginButton = document.getElementById('login');
const registerButton = document.getElementById('register');
const logoutButton = document.getElementById('logout');
const profile = document.getElementById('profile');

const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const booksContainer = document.getElementById('books-container');
const searchButton = document.getElementById('search-button');
const paginationControls = document.getElementById('pagination-controls');

let currentPage = 0;
let totalPages = 1;

const apiUrl = 'http://localhost:8081/books';

document.addEventListener('DOMContentLoaded', function () {
    prevPageButton.addEventListener('click', () => fetchPageableBooks(currentPage - 1));
    nextPageButton.addEventListener('click', () => fetchPageableBooks(currentPage + 1));
    searchButton.addEventListener('click', searchBookByTitle);

    function fetchPageableBooks(page) {
        if (page < 0 || page >= totalPages) return;
        fetch(`${apiUrl}?page=${page}`)
            .then(response => response.json())
            .then(data => {
                currentPage = data.number;
                totalPages = data.totalPages;
                displayBooks(data.content);
                updatePaginationControls();
            })
            .catch(error => handleError(error));
    }

    function searchBookByTitle() {
        const title = document.getElementById('search-input').value;
        if (title) {
            fetch(`${apiUrl}/search?title=${title}`)
                .then(response => response.json())
                .then(data => displayBooks(data))
                .catch(error => handleError(error));
        } else {
            alert('Por favor, insira um nome');
        }
    }

    function displayBooks(books) {
        booksContainer.innerHTML = '';
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <img src="data:image/jpeg;base64,${book.imageData}" alt="${book.title}">
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p>Autor: ${book.author}</p>
                </div>
            `;
            bookItem.addEventListener('click', () => {
                window.location.href = `/books/details.html?id=${book.id}`;
            });
            booksContainer.appendChild(bookItem);
        });
    }
    

    function handleError(error) {
        console.error('Erro ao buscar a lista de livros:', error);
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = `<div class="card"><p>Erro: ${error.message}</p></div>`;
    }

    function updatePaginationControls() {
        if (totalPages >= 1) {
            pageInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
            prevPageButton.disabled = currentPage === 0;
            nextPageButton.disabled = currentPage === totalPages - 1;
            paginationControls.style.display = 'flex';
        }
    }

    // Chama a função fetchPageableBooks ao carregar a página
    fetchPageableBooks(currentPage);
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