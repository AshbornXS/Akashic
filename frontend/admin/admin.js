const addBookButton = document.getElementById('add-book');

const apiUrl = 'http://localhost:8081/books';

addBookButton.addEventListener('click', addBook);

function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    return fetch(url, options);
}

function addBook() {
    const title = document.getElementById('add-title').value;
    const author = document.getElementById('add-author').value;
    if (title && author) {
        makeAuthenticatedRequest(`${apiUrl}/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, author })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Livro adicionado:', data);
            })
            .catch(error => console.error('Erro ao adicionar o livro:', error));
    } else {
        alert('Por favor, preencha todos os campos');
    }
}