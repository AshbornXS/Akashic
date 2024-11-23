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

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(function () {
        searchBookByTitle();
    }, 300));

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

    async function fetchPageableBooks(page, selectedOrder = 'sort=title,asc') {
        try {
            const response = await fetch(`${apiUrl}?page=${page}&${selectedOrder}`);
            const data = await response.json();
            const books = data.content || [];
            const bookIds = books.map(book => book.id);

            if (token) {
                const userResponse = await fetch('http://localhost:8081/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const userData = await userResponse.json();
                const favoriteBookIds = userData.fav || [];

                for (const favId of favoriteBookIds) {
                    if (!bookIds.includes(favId)) {
                        try {
                            await fetch(`http://localhost:8081/auth/fav/${favId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            favoriteBookIds.splice(favoriteBookIds.indexOf(favId), 1);
                        }
                        catch (error) {
                            console.error('Erro ao remover favorito:', error);
                        }
                    }
                }

                books.forEach(book => {
                    book.isFavorite = favoriteBookIds.includes(book.id);
                });
            }

            displayBooks(books);
            updatePaginationControls();
        } catch (error) {
            handleError(error);
        }
    }

    function fetchBooksByTag(tag) {
        fetch(`${apiUrl}/filter?tags=${tag}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.content) {
                    currentPage = data.number;
                    totalPages = data.totalPages;
                    displayBooks(data.content);
                    updatePaginationControls();
                } else {
                    handleError(new Error('Dados inválidos retornados pela API'));
                }
            })
            .catch(error => handleError(error));
    }

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
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

        booksContainer.innerHTML = '';

        for (const book of books) {
            const bookItem = document.createElement('div');
            bookItem.className = 'container';

            const { average, count } = await fetchAverageRating(book.id);
            const starRatingElement = createStarRating(average, count);

            if (book.description.length > 50) {
                book.description = book.description.substring(0, 50) + '...';
            }

            bookItem.innerHTML = `
            <div class="card">
                <div class="img">
                    <img src="data:image/jpeg;base64,${book.imageData}" alt="${book.title}" />
                    <div class="img-title">${book.title}</div>
                </div>

                <div class="content">
                    <span class="title">${book.title}</span>
                    <p class="desc">${book.description}</p>

                    <!-- Ícone de Favorito -->
                    <div id="favorite-container" style="text-align: center; margin-top: 10px;">
                        <span id="favorite-icon" class="heart" data-book-id="${book.id}" data-favorite="${book.isFavorite}" style="font-size: 24px; cursor: pointer;">
                            ${book.isFavorite ? '&#9829;' : '&#9825;'}
                        </span>
                    </div>

                    <!-- Estrelas de Avaliação (média) -->
                    <div class="star-rating">
                        ${starRatingElement.outerHTML}
                </div>
                <div class="arrow">
                    <span>&#8673;</span>
                </div>
            </div>
            `;
            bookItem.addEventListener('click', () => {
                window.location.href = `/pages/books/details.html?id=${book.id}`;
            });
            booksContainer.appendChild(bookItem);
        }

        document.querySelectorAll('#favorite-icon').forEach(icon => {
            icon.addEventListener('click', async function (event) {
                event.stopPropagation();
                const bookId = this.dataset.bookId;
                const isFavorite = this.dataset.favorite === 'true';
                const method = isFavorite ? 'DELETE' : 'POST';
                const url = `http://localhost:8081/auth/fav/${bookId}`;
                const options = {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                if (!isFavorite) {
                    options.headers['Content-Type'] = 'application/json';
                    options.body = JSON.stringify({ bookId: bookId });
                }
                try {
                    const response = await fetch(url, options);
                    if (response.ok) {
                        this.dataset.favorite = !isFavorite;
                        this.innerHTML = !isFavorite ? '&#9829;' : '&#9825;';
                    } else {
                        console.error('Erro ao atualizar favorito');
                    }
                } catch (error) {
                    console.error('Erro ao atualizar favorito:', error);
                }
            });
        });
    }

    async function fetchAverageRating(bookId) {
        try {
            const response = await fetch(`http://localhost:8081/reviews/book/${bookId}`);
            const reviews = await response.json();
            if (reviews.length === 0) return { average: 0, count: 0 };
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            return { average: (totalRating / reviews.length).toFixed(1), count: reviews.length };
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            return { average: null, count: 0 };
        }
    }

    function createStarRating(rating, count) {
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
        ratingValue.textContent = `${count}`;

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
    fetchAllTags();
    fetchPageableBooks(currentPage);
});

if (token) {
    loginButton.style.display = 'none';
    registerButton.style.display = 'none';
}