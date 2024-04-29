// Api urls
const PROXY_API = "https://proxy.techzbots1.workers.dev/?u=";
const SEARCH_API = "/search/";

// Api Server Manager
const AVAILABLE_SERVERS = [
  "https://api100.anime-dex.workers.dev",
  "https://api200.anime-dex.workers.dev",
  "https://api300.anime-dex.workers.dev",
];

function getApiServer() {
  const weights = AVAILABLE_SERVERS.map((server) => server.length);
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let weightSum = 0;

  for (let i = 0; i < AVAILABLE_SERVERS.length; i++) {
    weightSum += weights[i];
    if (randomValue < weightSum) {
      return AVAILABLE_SERVERS[i];
    }
  }

  return AVAILABLE_SERVERS[0];
}

async function getJson(path, options = {}) {
  const { referer = window.location.origin, retry = 3 } = options;
  const ApiServer = getApiServer();
  let url = ApiServer + path;

  for (let i = 0; i < retry; i++) {
    try {
      const response = await fetch(url, { headers: { referer } });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retry - 1) {
        throw error;
      }
    }
  }
}

function sentenceCase(str) {
  if (!str || str.length === 0) {
    return "";
  }

  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function handleImageLoad(event) {
  const imgElement = event.target;
  imgElement.classList.remove("lzy_img");
}

function refreshLazyLoader() {
  const arr = document.querySelectorAll("img.lzy_img");
  arr.forEach((v) => {
    v.addEventListener("load", handleImageLoad);
    v.src = v.dataset.src;
  });
}

async function searchAnime(query, page = 1) {
  try {
    const data = await getJson(SEARCH_API + query + "?page=" + page, {
      referer: window.location.origin,
      retry: 3,
    });

    const animes = data["results"];
    const contentdiv = document.getElementById("latest2");
    const loader = document.getElementById("load");

    if (animes.length === 0) {
      throw new Error("No results found");
    }

    const html = animes
      .map(
        (anime) => `<a href="./anime.html?anime_id=${anime["id"]}">
          <div class="anime-card">
            <img class="lzy_img" data-src="${anime["image_url"]}" alt="${anime["title"]}">
            <div class="anime-info">
              <h3>${sentenceCase(anime["title"])}</h3>
              <p>${anime["subOrDub"] || "SUB"}</p>
            </div>
          </div>
        </a>`
      )
      .join("");

    contentdiv.innerHTML = html;
    loader.style.display = "none";
    refreshLazyLoader();
  } catch (error) {
    console.error(error.message);
  }
}

// Call the searchAnime function when the search button is clicked
const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", () => {
  const queryInput = document.getElementById("search-query");
  const query = queryInput.value.trim();
  if (query) {
    searchAnime(query);
  }
});
