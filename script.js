// 1. Configuração do Banco de Dados (IndexedDB)
let db;
const request = indexedDB.open("CineListaDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore("movies", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    displayMovies(); // Mostrar filmes ao carregar
};

// 2. Função para Adicionar Filme (CREATE)
const movieForm = document.getElementById("movie-form");
movieForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const title = document.getElementById("movie-title").value;
    const rating = document.getElementById("movie-rating").value;

    const transaction = db.transaction(["movies"], "readwrite");
    const store = transaction.objectStore("movies");
    store.add({ title, rating });

    transaction.oncomplete = () => {
        movieForm.reset();
        displayMovies();
    };
});

// 3. Função para Exibir Filmes (READ)
function displayMovies() {
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = "";

    const transaction = db.transaction(["movies"], "readonly");
    const store = transaction.objectStore("movies");
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.innerHTML = `
                <span><strong>${cursor.value.title}</strong> - Nota: ${cursor.value.rating}</span>
                <button class="delete-btn" onclick="deleteMovie(${cursor.value.id})">Remover</button>
            `;
            movieList.appendChild(li);
            cursor.continue();
        }
    };
}

// 4. Função para Deletar Filme (DELETE)
function deleteMovie(id) {
    const transaction = db.transaction(["movies"], "readwrite");
    const store = transaction.objectStore("movies");
    store.delete(id);
    transaction.oncomplete = () => displayMovies();
}