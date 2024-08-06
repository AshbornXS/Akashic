const addBookButton = document.getElementById('add-book');
const editBookButton = document.getElementById('edit-book');
const deleteBookButton = document.getElementById('delete-book');

const apiUrl = 'http://localhost:8081/books';

addBookButton.addEventListener('click', addBook);
editBookButton.addEventListener('click', editBook);
deleteBookButton.addEventListener('click', deleteBook);

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

function editBook() {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const author = document.getElementById('edit-author').value;
    
    if (id && title && author) {
        makeAuthenticatedRequest(`${apiUrl}/admin`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, title, author })
        })
            .then(response => {
                if (response.ok) {
                    console.log('Livro editado com sucesso');
                } else {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Erro ao editar o livro');
                    });
                }
            })
            .catch(error => console.error('Erro ao editar o livro:', error));
    } else {
        alert('Por favor, forneça todos os dados do livro');
    }
}

    function deleteBook() {
        const id = document.getElementById('delete-id').value;
        if (id) {
            makeAuthenticatedRequest(`${apiUrl}/admin/${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Livro apagado com sucesso');
                    } else {
                        console.error('Erro ao apagar o livro:', response.statusText);
                }
            })
                .catch(error => console.error('Erro ao apagar o livro:', error));
        } else {
            alert('Por favor, preencha todos os campos');
        }

}