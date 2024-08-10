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
    const image = document.getElementById('add-image').files[0];

    if (title && author && image) {
        const formData = new FormData();
        const bookPostRequestBody = {
            title: title,
            author: author,
            imageData: "",
            imageName: image.name
        };

        formData.append('book', new Blob([JSON.stringify(bookPostRequestBody)], { type: 'application/json' }));
        formData.append('image', image);

        makeAuthenticatedRequest(`${apiUrl}/admin`, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    console.log('Livro adicionado com sucesso');
                } else {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Erro ao adicionar o livro');
                    });
                }
            })
            .catch(error => console.error('Erro ao adicionar o livro:', error));
    } else {
        alert('Por favor, forneça todos os dados do livro e a imagem');
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