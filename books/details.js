const token = localStorage.getItem('token');

const adminSection = document.getElementById('admin-section');
const loginButton = document.getElementById('login');
const registerButton = document.getElementById('register');
const logoutButton = document.getElementById('logout');
const profile = document.getElementById('profile');

document.addEventListener('DOMContentLoaded', function () {
    const bookId = getBookIdFromUrl();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (bookId) {
        fetchBookDetails(bookId);
        fetchReviews(bookId, userId);
        checkIfFavorite(bookId);
    } else {
        console.error('ID do livro não encontrado na URL');
    }

    function getBookIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async function fetchBookDetails(bookId) {
        try {
            const response = await fetch(`http://localhost:8081/books/${bookId}`);
            const book = await response.json();
            displayBookDetails(book);
        } catch (error) {
            console.error('Erro ao buscar detalhes do livro:', error);
        }
    }

    async function fetchReviews(bookId, userId) {
        try {
            const response = await fetch(`http://localhost:8081/reviews/book/${bookId}`);
            const reviews = await response.json();
            displayReviews(reviews, userId);
        } catch (error) {
            console.error('Erro ao buscar reviews:', error);
        }
    }

    async function checkIfFavorite(bookId) {
        try {
            const response = await fetch('http://localhost:8081/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const userData = await response.json();
            const favorites = userData.fav || [];
            console.log(favorites);
            console.log(bookId);
            const isFavorite = favorites.includes(parseInt(bookId));
            console.log(isFavorite);
            updateFavoriteIcon(isFavorite);
        } catch (error) {
            console.error('Erro ao verificar favoritos:', error);
        }
    }

    function updateFavoriteIcon(isFavorite) {
        const favoriteIcon = document.getElementById('favorite-icon');
        favoriteIcon.innerHTML = isFavorite ? '&#9829;' : '&#9825;'; // Coração cheio ou vazio
        favoriteIcon.dataset.favorite = isFavorite;
    }

    document.getElementById('favorite-icon').addEventListener('click', async function () {
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
                updateFavoriteIcon(!isFavorite);
            } else {
                console.error('Erro ao atualizar favorito');
            }
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
        }
    });

    async function displayBookDetails(book) {
        const bookDetailsDiv = document.getElementById('book-details');

        const averageRating = await fetchAverageRating(book.id);
        const starRating = createAverageStarRating(averageRating);

        bookDetailsDiv.innerHTML = `
            <img src="data:image/jpeg;base64,${book.imageData}" alt="${book.title}">
            <h1>${book.title}</h1>
            <p>Autor: ${book.author}</p>
            <p>Descrição: ${book.description}</p>
            <div class="average-rating">
                ${starRating.outerHTML}
            </div>
        `;

        // Processar e exibir as tags em cards
        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');

        const tags = book.tags.split(',');
        tags.forEach(tag => {
            const tagCard = document.createElement('div');
            tagCard.classList.add('tag-card');
            tagCard.textContent = tag.trim();
            tagsContainer.appendChild(tagCard);
        });

        bookDetailsDiv.appendChild(tagsContainer);
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

    function createAverageStarRating(rating) {
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

    function displayReviews(reviews, userId) {
        const reviewsContainer = document.getElementById('reviews-container');
        reviewsContainer.innerHTML = '';

        if (!userId) {
            document.getElementById('review-form').style.display = 'none';
        } else {
            const userReview = reviews.find(review => review.userId === parseInt(userId));
            if (userReview) {
                document.getElementById('review-form').style.display = 'none';
                reviewsContainer.appendChild(createReviewElement(userReview, true));
            } else {
                document.getElementById('review-form').style.display = 'block';
            }
        }

        reviews.forEach(review => {
            if (review.userId !== parseInt(userId)) {
                reviewsContainer.appendChild(createReviewElement(review, false));
            }
        });
    }

    function createReviewElement(review, isUserReview) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.dataset.date = review.date;
        reviewItem.dataset.rating = review.rating;
        reviewItem.innerHTML = `
            <div class="review-rating non-interactive">${createStarRating(review.rating)}</div>
            <p class="review-user">${review.username}</p>
            <p class="review-comment">${review.comment}</p>
            <p class="review-date">${new Date(review.date).toLocaleDateString()}</p>
            <div class="button-container">
                ${!isUserReview ? `<button class="like-button">&#128077 ${review.likes || 0}</button>` : ''}
                ${!isUserReview ? `<button class="dislike-button">&#128078 ${review.dislikes || 0}</button>` : ''}
                ${isUserReview ? '<button class="edit-button">Editar</button><button class="delete-button">Apagar</button>' : ''}
            </div>
        `;
    
        if (isUserReview) {
            reviewItem.querySelector('.edit-button').addEventListener('click', () => enableEditReview(reviewItem, review, isUserReview));
            reviewItem.querySelector('.delete-button').addEventListener('click', () => deleteReview(review.id));
        } else {
            reviewItem.querySelector('.like-button').addEventListener('click', () => {
                updateReviewLikeDislike(review.id, 'like', reviewItem);
            });
    
            reviewItem.querySelector('.dislike-button').addEventListener('click', () => {
                updateReviewLikeDislike(review.id, 'dislike', reviewItem);
            });
        }
    
        return reviewItem;
    }

    function createStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<span class="star ${i <= rating ? 'filled' : ''}" data-value="${i}">&#9733;</span>`;
        }
        return stars;
    }

    document.getElementById('review-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        const rating = document.querySelector('.star-rating .filled:last-child').dataset.value;
        const comment = document.getElementById('comment').value;
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');

        const review = {
            bookId: bookId,
            userId: userId,
            username: username,
            rating: parseInt(rating),
            comment: comment
        };

        console.log('Dados da review:', review); // Log dos dados da review

        try {
            const response = await fetch('http://localhost:8081/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            });

            console.log('Resposta do servidor:', response); // Log da resposta do servidor

            if (response.ok) {
                fetchReviews(bookId, userId);
                clearReviewForm(); // Chame a função para limpar o formulário
            } else {
                const errorText = await response.text();
                console.error('Erro ao enviar review:', errorText); // Log do erro detalhado
            }
        } catch (error) {
            console.error('Erro ao enviar review:', error);
        }
    });

    document.getElementById('sort-reviews').addEventListener('change', function () {
        const sortBy = this.value;
        sortReviews(sortBy);
    });

    document.getElementById('filter-reviews').addEventListener('change', function () {
        const filterBy = this.value;
        filterReviews(filterBy);
    });

    function sortReviews(sortBy) {
        const reviewsContainer = document.getElementById('reviews-container');
        const reviews = Array.from(reviewsContainer.children);

        reviews.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            } else if (sortBy === 'rating') {
                return b.dataset.rating - a.dataset.rating;
            }
        });

        reviewsContainer.innerHTML = '';
        reviews.forEach(review => reviewsContainer.appendChild(review));
    }

    function filterReviews(filterBy) {
        const reviewsContainer = document.getElementById('reviews-container');
        const reviews = Array.from(reviewsContainer.children);

        reviews.forEach(review => {
            if (filterBy === '' || review.dataset.rating === filterBy) {
                review.style.display = 'block';
            } else {
                review.style.display = 'none';
            }
        });
    }

    function enableEditReview(reviewItem, review, isUserReview) {
        reviewItem.classList.add('editing');
        reviewItem.innerHTML = `
            <div class="review-rating">${createStarRating(review.rating)}</div>
            <textarea class="edit-comment">${review.comment}</textarea>
            <div class="button-container">
                <button class="save-button">Salvar</button>
                <button class="cancel-button">Cancelar</button>
            </div>
        `;
    
        reviewItem.querySelector('.save-button').addEventListener('click', () => saveEditReview(reviewItem, review, isUserReview));
        reviewItem.querySelector('.cancel-button').addEventListener('click', () => cancelEditReview(reviewItem, review, isUserReview));
    
        // Adicionar evento de clique para as estrelas
        const starRatingDiv = reviewItem.querySelector('.review-rating');
        starRatingDiv.classList.remove('non-interactive');
        starRatingDiv.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', function () {
                const value = this.dataset.value;
                starRatingDiv.querySelectorAll('.star').forEach(s => {
                    s.classList.remove('filled');
                    if (s.dataset.value <= value) {
                        s.classList.add('filled');
                    }
                });
                review.rating = parseInt(value);
            });
        });
    }

    function saveEditReview(reviewItem, review, isUserReview) {
        const newComment = reviewItem.querySelector('.edit-comment').value;
    
        review.comment = newComment;
        review.date = new Date().toISOString();
    
        try {
            fetch(`http://localhost:8081/reviews/${review.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            }).then(response => {
                if (response.ok) {
                    reviewItem.classList.remove('editing');
                    reviewItem.innerHTML = `
                        <div class="review-rating non-interactive">${createStarRating(review.rating)}</div>
                        <p class="review-user">${review.username}</p>
                        <p class="review-comment">${review.comment}</p>
                        <p class="review-date">Data: ${new Date(review.date).toLocaleDateString()}</p>
                        <div class="button-container">
                            ${!isUserReview ? `<button class="like-button">&#128077 ${review.likes || 0}</button>` : ''}
                            ${!isUserReview ? `<button class="dislike-button">&#128078 ${review.dislikes || 0}</button>` : ''}
                            <button class="edit-button">Editar</button>
                            <button class="delete-button">Apagar</button>
                        </div>
                    `;
                    reviewItem.querySelector('.edit-button').addEventListener('click', () => enableEditReview(reviewItem, review, isUserReview));
                    reviewItem.querySelector('.delete-button').addEventListener('click', () => deleteReview(review.id));
                    
                    if (!isUserReview) {
                        reviewItem.querySelector('.like-button').addEventListener('click', () => {
                            updateReviewLikeDislike(review.id, 'like', reviewItem);
                        });
                        reviewItem.querySelector('.dislike-button').addEventListener('click', () => {
                            updateReviewLikeDislike(review.id, 'dislike', reviewItem);
                        });
                    }
                } else {
                    console.error('Erro ao editar review');
                }
            });
        } catch (error) {
            console.error('Erro ao editar review:', error);
        }
    }
    
    function cancelEditReview(reviewItem, review, isUserReview) {
        reviewItem.classList.remove('editing');
        reviewItem.innerHTML = `
            <div class="review-rating non-interactive">${createStarRating(review.rating)}</div>
            <p class="review-user">${review.username}</p>
            <p class="review-comment">${review.comment}</p>
            <p class="review-date">Data: ${new Date(review.date).toLocaleDateString()}</p>
            <div class="button-container">
                ${!isUserReview ? `<button class="like-button">&#128077 ${review.likes || 0}</button>` : ''}
                ${!isUserReview ? `<button class="dislike-button">&#128078 ${review.dislikes || 0}</button>` : ''}
                <button class="edit-button">Editar</button>
                <button class="delete-button">Apagar</button>
            </div>
        `;
        reviewItem.querySelector('.edit-button').addEventListener('click', () => enableEditReview(reviewItem, review, isUserReview));
        reviewItem.querySelector('.delete-button').addEventListener('click', () => deleteReview(review.id));
        
        if (!isUserReview) {
            reviewItem.querySelector('.like-button').addEventListener('click', () => {
                updateReviewLikeDislike(review.id, 'like', reviewItem);
            });
            reviewItem.querySelector('.dislike-button').addEventListener('click', () => {
                updateReviewLikeDislike(review.id, 'dislike', reviewItem);
            });
        }
    }

    function updateReviewLikeDislike(reviewId, action, reviewItem) {
        const userHasLiked = localStorage.getItem(`review-${reviewId}-liked`);
        const userHasDisliked = localStorage.getItem(`review-${reviewId}-disliked`);
    
        let url = `http://localhost:8081/reviews/${reviewId}/${action}`;
        let oppositeAction = action === 'like' ? 'dislike' : 'like';
        let oppositeHasAction = action === 'like' ? userHasDisliked : userHasLiked;
    
        const updateButtonAndLocalStorage = (button, action, count, add) => {
            button.innerHTML = `${action === 'like' ? '&#128077;' : '&#128078;'} ${count}`;
            if (add) {
                localStorage.setItem(`review-${reviewId}-${action}d`, true);
            } else {
                localStorage.removeItem(`review-${reviewId}-${action}d`);
            }
        };
    
        const removeOppositeAction = () => {
            return new Promise((resolve, reject) => {
                if (oppositeHasAction) {
                    fetch(`http://localhost:8081/reviews/${reviewId}/${oppositeAction}?remove`, {
                        method: 'PATCH'
                    }).then(response => {
                        if (response.ok) {
                            const oppositeButton = reviewItem.querySelector(`.${oppositeAction}-button`);
                            const oppositeCount = parseInt(oppositeButton.textContent.match(/\d+/)[0]) - 1;
                            updateButtonAndLocalStorage(oppositeButton, oppositeAction, oppositeCount, false);
                            resolve();
                        } else {
                            console.error(`Erro ao remover ${oppositeAction === 'like' ? 'curtida' : 'não curtida'} da review`);
                            reject();
                        }
                    }).catch(error => {
                        console.error(`Erro ao remover ${oppositeAction === 'like' ? 'curtida' : 'não curtida'} da review:`, error);
                        reject();
                    });
                } else {
                    resolve();
                }
            });
        };
    
        const addOrRemoveAction = () => {
            fetch(url, {
                method: 'PATCH'
            }).then(response => {
                if (response.ok) {
                    const button = reviewItem.querySelector(`.${action}-button`);
                    const count = parseInt(button.textContent.match(/\d+/)[0]) + (url.includes('?remove') ? -1 : 1);
                    updateButtonAndLocalStorage(button, action, count, !url.includes('?remove'));
                } else {
                    console.error(`Erro ao ${action === 'like' ? 'curtir' : 'não curtir'} review`);
                }
            }).catch(error => {
                console.error(`Erro ao ${action === 'like' ? 'curtir' : 'não curtir'} review:`, error);
            });
        };
    
        if ((action === 'like' && userHasLiked) || (action === 'dislike' && userHasDisliked)) {
            url += '?remove';
        }
    
        removeOppositeAction().then(() => {
            addOrRemoveAction();
        }).catch(() => {
            console.error('Erro ao remover a ação oposta');
        });
    }

    async function deleteReview(reviewId) {
        if (confirm('Tem certeza que deseja apagar esta review?')) {
            try {
                const response = await fetch(`http://localhost:8081/reviews/${reviewId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchReviews(bookId, userId);
                } else {
                    console.error('Erro ao apagar review');
                }
            } catch (error) {
                console.error('Erro ao apagar review:', error);
            }
        }
    }

    document.querySelectorAll('.star-rating .star').forEach(star => {
        star.addEventListener('click', function () {
            const value = this.dataset.value;
            document.querySelectorAll('.star-rating .star').forEach(s => {
                s.classList.remove('filled');
                if (s.dataset.value <= value) {
                    s.classList.add('filled');
                }
            });
        });
    });

    let ratingValue = 0;

    document.querySelectorAll('.star-rating .star').forEach(star => {
        star.addEventListener('click', function () {
            const clickedValue = parseInt(this.dataset.value);

            if (clickedValue === ratingValue) {
                ratingValue = 0;
                document.querySelectorAll('.star-rating .star').forEach(s => s.classList.remove('filled'));
            } else {
                ratingValue = clickedValue;
                document.querySelectorAll('.star-rating .star').forEach(s => {
                    s.classList.remove('filled');
                    if (parseInt(s.dataset.value) <= ratingValue) {
                        s.classList.add('filled');
                    }
                });
            }
        });
    });

    const reviewForm = document.getElementById('review-form');
    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const comment = document.getElementById('comment').value;

        if (comment) {
            const review = {
                userId: userId,
                bookId: bookId,
                rating: parseInt(ratingValue),
                comment: comment,
                username: username,
                date: new Date().toISOString()
            };

            try {
                const response = await fetch(`http://localhost:8081/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(review)
                });

                if (response.ok) {
                    fetchReviews(bookId, userId);
                    clearReviewForm();
                } else {
                    console.error('Erro ao enviar review');
                }
            } catch (error) {
                console.error('Erro ao enviar review:', error);
            }
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    function clearReviewForm() {
        document.getElementById('review-form').reset();
        const stars = document.querySelectorAll('.star-rating .filled');
        stars.forEach(star => star.classList.remove('filled'));
    }
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
        window.location.href = '../index.html';
    }
});