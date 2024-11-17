document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token) {
        alert('Usuário não autenticado');
        window.location.href = '../auth/login.html';
        return;
    }

    console.log('Tentando buscar informações do usuário...');

    try {
        const response = await fetch('http://localhost:8081/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById('name').textContent = userData.name;
            document.getElementById('username').textContent = userData.username;

            const roleText = userData.role === 'ROLE_ADMIN' ? 'Admin' : 'Usuário';
            document.getElementById('role').textContent = roleText;

            if (userData.profilePic) {
                document.getElementById('profile-picture-display').src = `data:image/jpeg;base64,${userData.profilePic}`;
            } else {
                console.warn('Foto de perfil não encontrada.');
                document.getElementById('profile-picture-display').src = '../images/default-profile.png';
            }

            document.getElementById('name-input').value = userData.name;
            document.getElementById('username-input').value = userData.username;
        } else {
            alert('Erro ao carregar informações do usuário');
            console.error('Erro na resposta do servidor:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
    }

    document.getElementById('edit-profile-button').addEventListener('click', () => {
        document.getElementById('user-details').style.display = 'none';
        document.getElementById('edit-profile-button').style.display = 'none';
        document.getElementById('update-profile-form').style.display = 'block';
        document.getElementById('profile-picture-instruction').style.display = 'block';
        document.getElementById('favorite-books').style.display = 'none';
    });

    document.getElementById('profile-picture-display').addEventListener('click', () => {
        document.getElementById('profile-picture').click();
    });

    document.getElementById('profile-picture').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profile-picture-display').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('cancel-update-button').addEventListener('click', () => {
        document.getElementById('user-details').style.display = 'block';
        document.getElementById('edit-profile-button').style.display = 'block';
        document.getElementById('update-profile-form').style.display = 'none';
        document.getElementById('profile-picture-instruction').style.display = 'none';
    });

    document.getElementById('update-profile-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name-input').value;
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;
        const fileInput = document.getElementById('profile-picture');
        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('username', username);
        if (password) {
            formData.append('password', password);
        }
        if (file) {
            formData.append('profilePicture', file);
        }

        try {
            const response = await fetch('http://localhost:8081/auth/update', {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Informações atualizadas com sucesso!');
                if (password) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('username');
                    window.location.href = '../index.html';
                } else {
                    const updatedUserData = await response.json();
                    document.getElementById('name').textContent = updatedUserData.name;
                    document.getElementById('username').textContent = updatedUserData.username;
                    if (updatedUserData.profilePic) {
                        document.getElementById('profile-picture-display').src = `data:image/jpeg;base64,${updatedUserData.profilePic}`;
                    } else {
                        console.warn('Foto de perfil não encontrada após atualização.');
                        document.getElementById('profile-picture-display').src = '../images/default-profile.png';
                    }

                    document.getElementById('name-input').value = updatedUserData.name;
                    document.getElementById('username-input').value = updatedUserData.username;

                    document.getElementById('user-details').style.display = 'block';
                    document.getElementById('edit-profile-button').style.display = 'block';
                    document.getElementById('update-profile-form').style.display = 'none';
                    document.getElementById('profile-picture-instruction').style.display = 'none';
                }
            } else {
                const errorData = await response.json();
                alert(`Erro ao atualizar informações: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Erro ao atualizar informações:', error);
            alert('Erro ao atualizar informações.');
        }
    });

    if (userId) {
        fetchFavoriteBooks(userId);
    } else {
        console.error('ID do usuário não encontrado');
    }

    async function fetchFavoriteBooks(userId) {
        try {
            const response = await fetch('http://localhost:8081/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const userData = await response.json();
            const favoriteBookIds = userData.fav || [];
            displayFavoriteBooks(favoriteBookIds);
        } catch (error) {
            console.error('Erro ao buscar livros favoritos:', error);
        }
    }

    async function displayFavoriteBooks(bookIds) {
        const favoriteBooksContainer = document.getElementById('favorite-books-container');
        favoriteBooksContainer.innerHTML = '';

        for (const bookId of bookIds) {
            try {
                const response = await fetch(`http://localhost:8081/books/${bookId}`);
                const book = await response.json();
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.innerHTML = `
                    <img src="data:image/jpeg;base64,${book.imageData}" alt="${book.title}">
                    <div class="book-details">
                        <h3>${book.title}</h3>
                        <p>Autor: ${book.author}</p>
                        <span class="favorite-icon" data-book-id="${book.id}" data-favorite="true" style="font-size: 24px; cursor: pointer;">
                            &#9829;
                        </span>
                    </div>
                `;
                favoriteBooksContainer.appendChild(bookItem);
            } catch (error) {
                console.error('Erro ao buscar detalhes do livro:', error);
            }
        }

        document.querySelectorAll('.favorite-icon').forEach(icon => {
            icon.addEventListener('click', async function () {
                const bookId = this.dataset.bookId;
                const url = `http://localhost:8081/auth/fav/${bookId}`;
                const options = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                try {
                    const response = await fetch(url, options);
                    if (response.ok) {
                        this.parentElement.parentElement.remove();
                    } else {
                        console.error('Erro ao atualizar favorito');
                    }
                } catch (error) {
                    console.error('Erro ao atualizar favorito:', error);
                }
            });
        });
    }
});