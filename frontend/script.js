document.addEventListener('DOMContentLoaded', function () {
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const booksContainer = document.getElementById('books-container');
    const searchButton = document.getElementById('search-button');
    const paginationControls = document.getElementById('pagination-controls');

    let currentPage = 0;
    let totalPages = 1;

    const apiUrl = 'http://localhost:8081/books';

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
            const bookElement = document.createElement('div');
            bookElement.className = 'book-item';

            const imageElement = document.createElement('img');
            imageElement.src = `data:image/jpeg;base64,${book.imageData}`;
            imageElement.alt = `Cover of ${book.title}`;

            const detailsElement = document.createElement('div');
            detailsElement.className = 'book-details';

            const titleElement = document.createElement('h3');
            titleElement.textContent = book.title;

            const authorElement = document.createElement('p');
            authorElement.textContent = `Author: ${book.author}`;

            detailsElement.appendChild(titleElement);
            detailsElement.appendChild(authorElement);

            bookElement.appendChild(imageElement);
            bookElement.appendChild(detailsElement);

            booksContainer.appendChild(bookElement);
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

    //**------------------ Admin Painel ---------------------**/

    // Chama a função fetchPageableBooks ao carregar a página
    fetchPageableBooks(currentPage);
});

const adminSection = document.getElementById('admin-section');

fetch('http://localhost:8081/auth/me', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
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

const logoutButton = document.getElementById('logoutButton');
const profile = document.getElementById('profile');

if (localStorage.getItem('token')) {
    logoutButton.style.display = 'block';
} else {
    logoutButton.style.display = 'none';
    profile.style.display = 'none';
}

logoutButton.addEventListener('click', function () {
    if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }
});