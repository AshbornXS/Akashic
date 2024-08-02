document.addEventListener('DOMContentLoaded', function() {
    const fetchAllBooksButton = document.getElementById('fetch-all-books');
    const fetchPageableBooksButton = document.getElementById('fetch-pageable-books');
    const searchByIdButton = document.getElementById('search-by-id');
    const searchByTitleButton = document.getElementById('search-by-title');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const addBookButton = document.getElementById('add-book');
    
    let currentPage = 0;
    let totalPages = 1;

    const apiUrl = 'http://localhost:8081/books';

    fetchAllBooksButton.addEventListener('click', fetchAllBooks);
    fetchPageableBooksButton.addEventListener('click', () => fetchPageableBooks(currentPage));
    searchByIdButton.addEventListener('click', searchBookById);
    searchByTitleButton.addEventListener('click', searchBookByTitle);
    prevPageButton.addEventListener('click', () => fetchPageableBooks(currentPage - 1));
    nextPageButton.addEventListener('click', () => fetchPageableBooks(currentPage + 1));

    function fetchAllBooks() {
        hidePaginationControls();
        fetch(`${apiUrl}/all`)
            .then(response => response.json())
            .then(data => displayBooks(data))
            .catch(error => handleError(error));
    }

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

    function searchBookById() {
        hidePaginationControls();
        const id = document.getElementById('search-id').value;
        if (id) {
            fetch(`${apiUrl}/search?id=${id}`)
                .then(response => response.json())
                .then(data => displayBooks([data]))
                .catch(error => handleError(error));
        } else {
            alert('Por favor, insira um ID');
        }
    }

    function searchBookByTitle() {
        hidePaginationControls();
        const title = document.getElementById('search-title').value;
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
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = ''; // Limpa a lista antes de adicionar os itens
        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const title = document.createElement('h2');
            title.textContent = `${book.title}`;
            
            const author = document.createElement('p');
            author.textContent = `Autor: ${book.author}`;
            
            card.appendChild(title);
            card.appendChild(author);
            bookList.appendChild(card);
        });
    }

    function handleError(error) {
        console.error('Erro ao buscar a lista de livros:', error);
        const bookList = document.getElementById('book-list');
        bookList.innerHTML = `<div class="card"><p>Erro: ${error.message}</p></div>`;
    }

    function updatePaginationControls() {
        pageInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
        prevPageButton.disabled = currentPage === 0;
        nextPageButton.disabled = currentPage === totalPages - 1;
        document.getElementById('pagination-controls').style.display = 'block';
    }

    function hidePaginationControls() {
        document.getElementById('pagination-controls').style.display = 'none';
    }

    //**------------------ Admin Painel ---------------------**/
    
});
