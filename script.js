    // Sua chave da API do New York Times (adicione a sua própria chave aqui)
    const apiKey = 'cR3k5qeDoESzDriiy006l3Qp6PV4ksDG';

    // URL da API para buscar a lista de livros de ficção em capa dura
    const apiUrl = `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${apiKey}`;

    async function fetchBooksData() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Erro: ${response.statusText}`);
            }
            const data = await response.json();
            return data.results.books; 
        } catch (error) {
            console.error('Erro ao buscar dados da API:', error);
        }
    }

    function renderBooksList(books, clearList = true) {
        const booksList = document.getElementById('books-list');
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        if (clearList) {
            booksList.innerHTML = ''; 
        }

        books.forEach(book => {
            const li = document.createElement('li');
            
            const isFavorited = favorites.some(fav => fav.title === book.title);

            const star = document.createElement('span');
            star.textContent = isFavorited ? '★' : '';
            star.style.color = 'gold';
            star.style.marginRight = '8px';

            li.appendChild(star);

            li.appendChild(document.createTextNode(`${book.title} - ${book.author}`));

            const favoriteBtn = document.createElement('button');
            favoriteBtn.textContent = isFavorited ? 'Desfavoritar' : 'Favoritar';
            favoriteBtn.addEventListener('click', () => toggleFavorite(book, star, favoriteBtn));

            li.appendChild(favoriteBtn);

            li.addEventListener('click', () => showBookDetail(book));

            booksList.appendChild(li);
        });
    }

    function toggleFavorite(book, star, button) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        const bookIndex = favorites.findIndex(fav => fav.title === book.title);

        if (bookIndex > -1) {
            favorites.splice(bookIndex, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            star.textContent = ''; 
            button.textContent = 'Favoritar'; 
        } else {
            
            favorites.push(book);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            star.textContent = '★'; 
            button.textContent = 'Desfavoritar'; 
        }

        renderFavoritesList(); 
    }

    function renderFavoritesList() {
        const favoritesList = document.getElementById('favorites-list');
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        favoritesList.innerHTML = ''; 

        if (favorites.length === 0) {
            favoritesList.textContent = 'Nenhum favorito adicionado ainda.';
            return;
        }

        favorites.forEach(book => {
            const li = document.createElement('li');
            li.textContent = `${book.title} - ${book.author}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remover';
            removeBtn.addEventListener('click', () => removeFavorite(book));

            li.appendChild(removeBtn);
            favoritesList.appendChild(li);
        });
    }

    function removeFavorite(book) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        favorites = favorites.filter(fav => fav.title !== book.title);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        renderFavoritesList();
        renderBooksList(favorites, false); 
    }

    function showBookDetail(book) {
        alert(`Título: ${book.title}\nAutor: ${book.author}\nDescrição: ${book.description}\nData de Publicação: ${book.published_date}`);
    }

    function filterBooks(books, searchTerm) {
        return books.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    async function infiniteScroll(allBooks) {
        let currentPage = 1;
        let pageSize = 10;
        let totalBooks = allBooks.length;
        let fetching = false;

        window.addEventListener('scroll', async () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !fetching) {
                fetching = true;
                document.getElementById('loader').classList.remove('hidden');

                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;

                if (startIndex >= totalBooks) {
                    currentPage = 1; 
                }

                renderBooksList(allBooks.slice(startIndex, endIndex), false);
                currentPage++;

                document.getElementById('loader').classList.add('hidden');
                fetching = false;
            }
        });
    }

    // Função de inicialização que carrega a lista de livros e configura eventos
    async function init() {
        let allBooks = await fetchBooksData(); // Busca a lista completa de livros
        
        renderBooksList(allBooks.slice(0, 10)); // Renderiza os primeiros 10 livros
        renderFavoritesList(); 

        const filterInput = document.getElementById('filter-input');
        filterInput.addEventListener('input', (e) => {
            const filteredBooks = filterBooks(allBooks, e.target.value);
            renderBooksList(filteredBooks);
        });

        infiniteScroll(allBooks); 
    }

    window.onload = init;




