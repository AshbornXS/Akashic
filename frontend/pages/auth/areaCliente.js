document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const overlayContainer = document.querySelector('.overlay-container');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayText = document.getElementById('overlay-text');

    // Função para carregar o formulário correto com base no hash da URL
    function loadFormFromHash() {
        const hash = window.location.hash;

        // Exibe o formulário correto baseado no hash
        if (hash === '#cadastro') {
            registerForm.classList.add('visible');
            loginForm.classList.remove('visible');
            overlayTitle.textContent = 'Bem-vindo!';
            overlayText.textContent = 'Já possui conta? Clique no botão abaixo!';
            toggleBtn.textContent = 'Login';
            overlayContainer.classList.add('hidden-overlay');
            document.title = "Readverse - Cadastro";
        } else {
            loginForm.classList.add('visible');
            registerForm.classList.remove('visible');
            overlayTitle.textContent = 'Bem-vindo!';
            overlayText.textContent = 'Caso não tenha uma conta, clique no botão abaixo!';
            toggleBtn.textContent = 'Cadastrar';
            overlayContainer.classList.remove('hidden-overlay');
            document.title = "Readverse - Login";
        }
    }

    // Carrega o estado inicial baseado no hash da URL
    loadFormFromHash();

    // Alterna entre login e cadastro ao clicar no botão
    toggleBtn.addEventListener('click', () => {
        if (window.location.hash === '#cadastro') {
            window.location.hash = '#login';
        } else {
            window.location.hash = '#cadastro';
        }
    });

    // Escuta as mudanças no hash para atualizar a interface
    window.addEventListener('hashchange', loadFormFromHash);
});
