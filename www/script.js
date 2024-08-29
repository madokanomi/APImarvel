let input = document.getElementById("input-box");
let button = document.getElementById("submit-button");
let showContainer = document.getElementById("show-container");
let listContainer = document.querySelector(".list");

const [timestamp, apiKey, hashValue] = [ts, publicKey, hashVal];
let lastQuery = '';

function removeElements() {
  listContainer.innerHTML = "";
}
function abrirPagina() {
    window.location.href = 'pagina.html';
  }

const cacheData = (key, data) => {
  localStorage.setItem(key, JSON.stringify({ data: data, timestamp: new Date().getTime() }));
};

const getCachedData = (key, cacheDuration) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (new Date().getTime() - parsedCache.timestamp < cacheDuration) {
      return parsedCache.data;
    } else {
      localStorage.removeItem(key);
    }
  }
  return null;
};

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const fetchCharacters = async () => {
  const currentQuery = input.value.trim();

  if (currentQuery.length < 4) {
    removeElements();
    return;
  }

  if (currentQuery === lastQuery) {
    return;
  }

  lastQuery = currentQuery;

  const cacheKey = `characters_${currentQuery}`;
  const cachedData = getCachedData(cacheKey, 3600000);

  if (cachedData) {
    displaySuggestions(cachedData);
    return;
  }

  const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${apiKey}&hash=${hashValue}&nameStartsWith=${currentQuery}&limit=10`;

  try {
    const response = await fetch(url);
    const jsonData = await response.json();

    if (jsonData.data.results.length > 0) {
      cacheData(cacheKey, jsonData.data.results);
      displaySuggestions(jsonData.data.results);
    } else {
      removeElements();
    }
  } catch (error) {
    console.error("Erro ao buscar personagens:", error);
  }
};

const displaySuggestions = (results) => {
  removeElements();
  results.forEach((result) => {
    let name = result.name;
    let div = document.createElement("div");
    div.style.cursor = "pointer";
    div.classList.add("autocomplete-items");
    div.setAttribute("onclick", `displayWords('${name}')`);
    let word = `<b>${name.substr(0, input.value.length)}</b>${name.substr(input.value.length)}`;
    div.innerHTML = `<p class="item">${word}</p>`;
    listContainer.appendChild(div);
  });
};

function displayWords(value) {
  input.value = value;
  removeElements();
}

input.addEventListener("keyup", debounce(fetchCharacters, 300));

const showLoading = () => {
  showContainer.innerHTML = "<p style='color: #ffffff;'>Carregando...</p>";
};

const showError = (message) => {
  showContainer.innerHTML = `<p>${message}</p>`;
};

button.addEventListener("click", async () => {
  if (input.value.trim().length < 1) {
    alert("O Input não pode ser nulo");
    return;
  }

  showLoading();

  const currentQuery = input.value.trim();
  const cacheKey = `character_${currentQuery}`;
  const cachedData = getCachedData(cacheKey, 3600000);

  lastQuery = currentQuery;

  if (cachedData) {
    displayCharacter(cachedData);
    return;
  }

  const url = `https://gateway.marvel.com:443/v1/public/characters?ts=${timestamp}&apikey=${apiKey}&hash=${hashValue}&name=${currentQuery}`;

  try {
    const response = await fetch(url);
    const jsonData = await response.json();

    if (jsonData.data.results.length > 0) {
      const element = jsonData.data.results[0];
      cacheData(cacheKey, element);
      displayCharacter(element);
    } else {
      showError("Nenhum personagem encontrado.");
    }
  } catch (error) {
    showError("Erro ao carregar os dados.");
    console.error("Erro ao buscar dados:", error);
  }
});

const displayCharacter = (element) => {
  const MAX_DESCRIPTION_LENGTH = 200;
  const truncatedDescription = element.description.length > MAX_DESCRIPTION_LENGTH 
    ? element.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..." 
    : element.description;

  showContainer.innerHTML = `<div class="card-container">
    <div class="container-character-image">
      <img src="${element.thumbnail.path}.${element.thumbnail.extension}" alt="${element.name}"/>
    </div>
    <div class="character-name">${element.name}</div>
    <div class="character-description">${truncatedDescription}</div>
  </div>`;
};

window.onload = () => {

};
