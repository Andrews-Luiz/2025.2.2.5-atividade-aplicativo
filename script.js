// 1. Configuração do Banco de Dados (IndexedDB)
let db;
const request = indexedDB.open("CineListaDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    // Criamos a 'tabela' movies com um ID autoincrementável
    db.createObjectStore("movies", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    displayMovies(); // READ: Mostrar filmes ao carregar a página
};

// Variável para controlar se estamos editando um filme existente
let editId = null;

const movieForm = document.getElementById("movie-form");

// 2. Função para Adicionar ou Atualizar (CREATE / UPDATE)
movieForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const title = document.getElementById("movie-title").value;
    const rating = document.getElementById("movie-rating").value;

    const transaction = db.transaction(["movies"], "readwrite");
    const store = transaction.objectStore("movies");

    if (editId === null) {
        // Operação: CREATE
        store.add({ title, rating });
    } else {
        // Operação: UPDATE
        // O .put() atualiza o registro se o ID já existir
        store.put({ id: editId, title, rating });
        editId = null; // Limpa o ID de edição
        movieForm.querySelector("button").textContent = "Salvar Filme";
    }

    transaction.oncomplete = () => {
        movieForm.reset();
        displayMovies(); // Atualiza a lista na tela
    };
});

// 3. Função para Exibir Filmes (READ/RETRIEVE)
function displayMovies() {
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = ""; // Limpa a lista para reconstruir dinamicamente

    const transaction = db.transaction(["movies"], "readonly");
    const store = transaction.objectStore("movies");
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const li = document.createElement("li");
            li.innerHTML = `
                <span><strong>${cursor.value.title}</strong> - Nota: ${cursor.value.rating}</span>
                <div>
                    <button class="edit-btn" onclick="prepareEdit(${cursor.value.id}, '${cursor.value.title}', ${cursor.value.rating})">Editar</button>
                    <button class="delete-btn" onclick="deleteMovie(${cursor.value.id})">Remover</button>
                </div>
            `;
            movieList.appendChild(li);
            cursor.continue();
        }
    };
}

// 4. Função para preparar a Edição (Auxiliar do UPDATE)
function prepareEdit(id, title, rating) {
    document.getElementById("movie-title").value = title;
    document.getElementById("movie-rating").value = rating;
    editId = id; // Guarda o ID para o .put() saber qual filme alterar
    movieForm.querySelector("button").textContent = "Atualizar Filme";
}

// 5. Função para Deletar Filme (DELETE)
function deleteMovie(id) {
    if(confirm("Tem certeza que deseja remover este filme?")) {
        const transaction = db.transaction(["movies"], "readwrite");
        const store = transaction.objectStore("movies");
        store.delete(id); // Deleta do IndexedDB pelo ID
        transaction.oncomplete = () => displayMovies();
    }
}