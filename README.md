# Akashic (ReadVerse) 📚

**Akashic** é uma aplicação web completa para catalogação, revisão e gerenciamento de livros. O projeto consiste em uma API robusta em Java com Spring Boot e um frontend interativo em HTML/CSS/JavaScript puro.

O sistema permite que usuários naveguem por uma biblioteca, favoritem livros, deixem avaliações (com sistema de like/dislike) e gerenciem seus perfis. Administradores possuem painéis exclusivos para o cadastro e manutenção do acervo.

## 🚀 Tecnologias Utilizadas

### Backend (API)

  * **Java 22**
  * **Spring Boot 3.3.2**
  * **Spring Security & JWT** (Autenticação e Autorização)
  * **Spring Data JPA** (Persistência de dados)
  * **MySQL** (Banco de dados principal)
  * **H2 Database** (Banco de dados para testes)
  * **Lombok** (Redução de boilerplate code)
  * **MapStruct** (Mapeamento de objetos/DTOs)
  * **SpringDoc OpenAPI** (Documentação Swagger)
  * **Actuator & Prometheus** (Monitoramento e Métricas)
  * **Docker & Docker Compose** (Containerização do ambiente)

### Frontend

  * **HTML5 & CSS3**
  * **JavaScript (Vanilla ES6+)**
  * **Font Awesome** (Ícones)

## ✨ Funcionalidades

### 👤 Usuário Comum

  * **Cadastro e Login:** Autenticação segura via Token JWT.
  * **Catálogo:** Visualização de livros com paginação, busca por título e filtro por tags.
  * **Perfil:** Edição de dados pessoais e upload de foto de perfil.
  * **Favoritos:** Adicionar ou remover livros da lista de favoritos.
  * **Avaliações:** Dar notas (estrelas) e comentar em livros.
  * **Interação:** Dar "Like" ou "Dislike" em avaliações de outros usuários.

### 🛡️ Administrador

  * **Painel Administrativo:** Acesso exclusivo via role `ROLE_ADMIN`.
  * **Gerenciamento de Livros:** Criar, Editar e Deletar livros.
  * **Gerenciamento de Imagens:** Upload automático de capas de livros com compressão.
  * **Gerenciamento de Tags:** Adição dinâmica de novas tags para categorização.

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

  * [Java JDK 22](https://adoptium.net/)
  * [Docker](https://www.docker.com/) e Docker Compose
  * [Maven](https://maven.apache.org/) (Opcional, pois o projeto possui wrapper `mvnw`)

## 📦 Como Rodar o Projeto

### 1\. Configurar o Banco de Dados e Monitoramento

O projeto utiliza Docker Compose para subir o MySQL, Prometheus e Grafana. Na pasta `backend`:

```bash
cd backend
docker-compose up -d
```

*Isso iniciará o MySQL na porta `3307` (mapeada para 3306 interna), Prometheus na `9090` e Grafana na `3000`.*

### 2\. Executar o Backend

Ainda na pasta `backend`, execute a aplicação Spring Boot:

**Via linha de comando (Windows):**

```bash
./mvnw.cmd spring-boot:run
```

**Via linha de comando (Linux/Mac):**

```bash
./mvnw spring-boot:run
```

A API estará disponível em: `http://localhost:8081`

> **Nota:** Certifique-se de que o `application.yml` está apontando para o banco de dados correto. Se você estiver rodando o Java localmente e o banco no Docker, a URL JDBC deve conectar na porta exposta pelo Docker (ex: 3307 ou localhost se estiver na rede host).

### 3\. Executar o Frontend

O frontend é estático. Você pode abri-lo de duas formas:

1.  Utilizando uma extensão como **Live Server** no VS Code (Recomendado).
2.  Abrindo o arquivo `frontend/pages/index.html` diretamente no navegador.

Certifique-se de que a API esteja rodando antes de tentar fazer login ou carregar livros.

## 📖 Documentação da API (Swagger)

Com o backend rodando, você pode acessar a documentação interativa dos endpoints através do Swagger UI:

🔗 **URL:** `http://localhost:8081/swagger-ui.html`

Lá você poderá testar rotas como:

  * `POST /auth/login`
  * `GET /books`
  * `POST /reviews`
  * Entre outras.

## 📊 Monitoramento

O projeto já vem configurado com métricas.

  * **Prometheus:** `http://localhost:9090`
  * **Grafana:** `http://localhost:3000` (Login padrão: admin/admin)

## 📂 Estrutura de Pastas

```
Akashic/
├── backend/            # Código fonte da API Java
│   ├── src/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pom.xml
└── frontend/           # Código fonte da Interface Web
    ├── assets/         # CSS, Imagens e Scripts globais
    └── pages/          # Páginas HTML e Scripts específicos
```

## 🤝 Contribuição

Contribuições são bem-vindas\! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📝 Licença

Este projeto está sob a licença [MIT](https://opensource.org/licenses/MIT).

-----

Desenvolvido por **Pedro Henrique Alves de Azevedo**
