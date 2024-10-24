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
const searchInput = document.getElementById('search-input');
const paginationControls = document.getElementById('pagination-controls');
const tagFilter = document.getElementById('tag-filter');
const orderBy = document.getElementById('order-by');

let currentPage = 0;
let totalPages = 1;

const apiUrl = 'http://localhost:8081/books';

document.addEventListener('DOMContentLoaded', function () {
    prevPageButton.addEventListener('click', () => fetchPageableBooks(currentPage - 1));
    nextPageButton.addEventListener('click', () => fetchPageableBooks(currentPage + 1));
    searchInput.addEventListener('input', debounce(searchBookByTitle, 300));

    tagFilter.addEventListener('change', function () {
        const selectedTag = tagFilter.value;
        if (selectedTag) {
            fetchBooksByTag(selectedTag);
        } else {
            fetchPageableBooks(0);
        }
    });

    orderBy.addEventListener('change', function () {
        const selectedOrder = orderBy.value;
        fetchPageableBooks(0, selectedOrder);
    });

    function fetchPageableBooks(page, params) {
        if (!params) params = 'sort=title,asc';
        if (page < 0 || page >= totalPages) return;
        fetch(`${apiUrl}?page=${page}&${params}`)
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
        const title = searchInput.value;
        if (title) {
            fetch(`${apiUrl}/search?title=${title}`)
                .then(response => response.json())
                .then(data => {
                    currentPage = data.number;
                    totalPages = data.totalPages;
                    displayBooks(data.content);
                    updatePaginationControls();
                })
                .catch(error => handleError(error));
        } else {
            fetchPageableBooks(0);
        }
    }

    async function displayBooks(books) {
        if (!books || books.length === 0) {
            booksContainer.innerHTML = '<p>Nenhum livro encontrado.</p>';
            return;
        }
    
        books.sort((a, b) => a.title.localeCompare(b.title));
        booksContainer.innerHTML = '';
    
        for (const book of books) {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
    
            const averageRating = await fetchAverageRating(book.id);
            const starRatingElement = createStarRating(averageRating);
    
            bookItem.innerHTML = `
                <img src="data:image/jpeg;base64,${book.imageData}" alt="${book.title}">
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p>Autor: ${book.author}</p>
                </div>
            `;
            bookItem.querySelector('.book-details').appendChild(starRatingElement);
            bookItem.addEventListener('click', () => {
                window.location.href = `/books/details.html?id=${book.id}`;
            });
            booksContainer.appendChild(bookItem);
        }
    }
    
    async function fetchAverageRating(bookId) {
        try {
            const response = await fetch(`http://localhost:8081/reviews/book/${bookId}`);
            const reviews = await response.json();
            if (reviews.length === 0) return null;
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            return (totalRating / reviews.length).toFixed(1);
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            return null;
        }
    }

    function createStarRating(rating) {
        const starContainer = document.createElement('div');
        starContainer.className = 'star-rating';
    
        if (rating === null) {
            starContainer.textContent = 'Sem avaliações';
            return starContainer;
        }
    
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star empty';
    
            if (rating >= i) {
                star.classList.add('filled');
                star.innerHTML = '&#9733;';
            } else if (rating >= i - 0.5) {
                star.classList.add('half-filled');
                star.innerHTML = `
                    <span class="half">&#9733;</span>
                    <span class="empty">&#9734;</span>
                `;
            } else {
                star.innerHTML = '&#9734;';
            }
            starContainer.appendChild(star);
        }
    
        const ratingValue = document.createElement('span');
        ratingValue.className = 'rating-value';
        ratingValue.textContent = ` ${rating}`;
    
        starContainer.appendChild(ratingValue);
    
        return starContainer;
    }

    function createOrderBy() {
        const desc = document.createElement('option');
        desc.value = 'sort=title,desc';
        desc.textContent = 'Título (Z-A)';
        orderBy.appendChild(desc);
    }

    function updatePaginationControls() {
        if (totalPages > 1) {
            pageInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
            prevPageButton.disabled = currentPage === 0;
            nextPageButton.disabled = currentPage === totalPages - 1;
            paginationControls.style.display = 'flex';
        } else {
            paginationControls.style.display = 'none';
        }
    }

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    function handleError(error) {
        console.error('Erro ao buscar a lista de livros:', error);
        const bookList = document.getElementById('book-list');
        if (bookList) {
            bookList.innerHTML = `<div class="card"><p>Erro: ${error.message}</p></div>`;
        }
    }    

    function fetchAllTags() {
        fetch(`${apiUrl}/all-tags`)
            .then(response => response.text())
            .then(tagsString => {
                const tags = tagsString.split(', ');
                tags.forEach(tag => {
                    const option = document.createElement('option');
                    option.value = tag;
                    option.textContent = tag;
                    tagFilter.appendChild(option);
                });
            })
            .catch(error => console.error('Erro ao buscar as tags:', error));
    }

    createOrderBy();
    // Chama a função fetchAllTags ao carregar a página
    fetchAllTags();
    // Chama a função fetchPageableBooks ao carregar a página
    fetchPageableBooks(currentPage);
});

adminSection.style.display = 'none';

if (token) {
    logoutButton.style.display = 'block';
    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
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
} else {
    logoutButton.style.display = 'none';
    profile.style.display = 'none';
}

logoutButton.addEventListener('click', function () {
    if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
});
if (token) {
    logoutButton.style.display = 'block';
    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
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
} else {
    logoutButton.style.display = 'none';
    profile.style.display = 'none';
}

logoutButton.addEventListener('click', function () {
    if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
});