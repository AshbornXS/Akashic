const addBookButton = document.getElementById('add-book');
const editBookButton = document.getElementById('edit-book');
const deleteBookButton = document.getElementById('delete-book');
const addNewTagButton = document.getElementById('add-new-tag');
const addNewEditTagButton = document.getElementById('add-new-edit-tag');
const addTagsSelect = document.getElementById('add-tags');
const editTagsSelect = document.getElementById('edit-tags');
const newTagInput = document.getElementById('new-tag');
const newEditTagInput = document.getElementById('new-edit-tag');

const token = localStorage.getItem('token');

const apiUrl = 'http://localhost:8081/books';

addBookButton.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
});
editBookButton.addEventListener('submit', function (event) {
    event.preventDefault();
    editBook();
});
deleteBookButton.addEventListener('submit', function (event) {
    event.preventDefault();
    deleteBook();
});

addNewTagButton.addEventListener('click', function () {
    const newTag = newTagInput.value.trim();
    if (newTag) {
        const option = document.createElement('option');
        option.value = newTag;
        option.textContent = newTag;
        option.selected = true;
        addTagsSelect.appendChild(option);
        newTagInput.value = '';
    }
});

addNewEditTagButton.addEventListener('click', function () {
    const newTag = newEditTagInput.value.trim();
    if (newTag) {
        const option = document.createElement('option');
        option.value = newTag;
        option.textContent = newTag;
        option.selected = true;
        editTagsSelect.appendChild(option);
        newEditTagInput.value = '';
    }
});


fetch(`${apiUrl}/all-tags`)
    .then(response => response.text())
    .then(tagsString => {
        const tags = tagsString.split(', ');
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            addTagsSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Erro ao buscar as tags:', error));


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
    const description = document.getElementById('add-desc').value;
    const image = document.getElementById('add-image').files[0];
    const tags = Array.from(addTagsSelect.selectedOptions).map(option => option.value);

    if (title && author && image && description && tags.length) {
        const formData = new FormData();
        const bookPostRequestBody = {
            title: title,
            author: author,
            description: description,
            tags: tags.join(','), // Convertendo o array de tags para uma string separada por vírgulas
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
                    alert('Livro adicionado com sucesso');
                    cleanFields();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.message || 'Erro ao adicionar o livro');
                    });
                }
            })
            .catch(error => console.error('Erro ao adicionar o livro:', error));
    }
}

function editBook() {
    const id = document.getElementById('edit-id').value;

    if (id) {
        fetch(`${apiUrl}/search?id=${id}`)
            .then(response => response.json())
            .then(book => {
                document.getElementById('edit-title').value = book.title;
                document.getElementById('edit-author').value = book.author;
                document.getElementById('edit-desc').value = book.description;

                const imageData = book.imageData;
                const imageName = book.imageName;

                if (imageData) {
                    let base64Image = imageData;
                    let mimeType = 'image/jpeg';

                    const mimeMatch = imageData.match(/data:(.*);base64,/);
                    if (mimeMatch) {
                        mimeType = mimeMatch[1];
                    } else {
                        base64Image = `data:${mimeType};base64,${imageData}`;
                    }

                    const blob = base64ToBlob(base64Image, mimeType);
                    const file = blobToFile(blob, imageName);

                    const editImageInput = document.getElementById('edit-image');
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    editImageInput.files = dataTransfer.files;
                } else {
                    console.error('Formato de imagem base64 inválido');
                }


                const editTagsSelect = document.getElementById('edit-tags');
                editTagsSelect.innerHTML = '';

                fetch(`${apiUrl}/all-tags`)
                    .then(response => response.text())
                    .then(tagsString => {
                        const allTags = tagsString.split(', ');
                        const bookTags = Array.isArray(book.tags) ? book.tags : (book.tags ? [book.tags] : []);

                        allTags.forEach(tag => {
                            const option = document.createElement('option');
                            option.value = tag;
                            option.textContent = tag;
                            option.selected = bookTags.includes(tag);
                            editTagsSelect.appendChild(option);
                        });
                    })
                    .catch(error => console.error('Erro ao buscar as tags:', error));

                const editBookForm = document.getElementById('editBookForm');
                editBookForm.onsubmit = function (event) {
                    event.preventDefault();

                    const id = document.getElementById('edit-id').value;
                    const title = document.getElementById('edit-title').value;
                    const author = document.getElementById('edit-author').value;
                    const description = document.getElementById('edit-desc').value;
                    const image = document.getElementById('edit-image').files[0];
                    const tags = Array.from(editTagsSelect.selectedOptions).map(option => option.value);

                    if (title && author && description && tags.length) {
                        const formData = new FormData();
                        const bookPutRequestBody = {
                            id: id,
                            title: title,
                            author: author,
                            description: description,
                            tags: tags.join(','),
                            imageData: image ? "" : imageData,
                            imageName: image ? image.name : imageName
                        };


                        formData.append('book', new Blob([JSON.stringify(bookPutRequestBody)], { type: 'application/json' }));
                        formData.append('image', image);

                        makeAuthenticatedRequest(`${apiUrl}/admin`, {
                            method: 'PUT',
                            body: formData
                        })
                            .then(response => {
                                if (response.ok) {
                                    console.log('Livro atualizado com sucesso');
                                    cleanFields();
                                } else {
                                    return response.json().then(data => {
                                        throw new Error(data.message || 'Erro ao atualizar o livro');
                                    });
                                }
                            })
                            .catch(error => console.error('Erro ao atualizar o livro:', error));
                    } else {
                        console.error('Todos os campos são obrigatórios');
                    }
                };
            })
            .catch(error => console.error('Erro ao buscar os detalhes do livro:', error));
    }
}

function deleteBook() {
    const deleteForm = document.getElementById('deleteBookForm');
    const id = document.getElementById('delete-id').value;

    if (id) {
        fetch(`${apiUrl}/search?id=${id}`)
            .then(response => response.json())
            .then(book => {
                document.getElementById('delete-title').textContent = book.title;
                document.getElementById('delete-author').textContent = book.author;
                document.getElementById('delete-desc').textContent = book.description;
                document.getElementById('delete-tags').textContent = book.tags;

                deleteForm.onreset = function () {
                    document.getElementById('delete-title').textContent = "";
                    document.getElementById('delete-author').textContent = "";
                    document.getElementById('delete-desc').textContent = "";
                    document.getElementById('delete-tags').textContent = "";
                };

                document.getElementById('confirm-delete').onclick = function () {
                    makeAuthenticatedRequest(`${apiUrl}/admin/${id}`, {
                        method: 'DELETE',
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log('Livro apagado com sucesso');
                                document.getElementById('delete-title').textContent = "";
                                document.getElementById('delete-author').textContent = "";
                                document.getElementById('delete-desc').textContent = "";
                                document.getElementById('delete-tags').textContent = "";
                            } else {
                                console.error('Erro ao apagar o livro:', response.statusText);
                            }
                        })
                        .catch(error => console.error('Erro ao apagar o livro:', error));
                };
            })
    }
}

function cleanFields() {
    const fields = document.querySelectorAll('input');
    const textareas = document.querySelectorAll('textarea');
    const selects = document.querySelectorAll('select');
    fields.forEach(field => field.value = '');
    textareas.forEach(textarea => textarea.value = '');
    selects.forEach(select => select.selectedIndex = -1);
}

function base64ToBlob(base64, mime) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
}

function blobToFile(blob, fileName) {
    return new File([blob], fileName, { type: blob.type });
}