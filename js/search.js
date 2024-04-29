// Api urls
const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";
const searchapi = "/search/";

// Api Server Manager
const AvailableServers = [
  "https://api100.anime-dex.workers.dev",
  "https://api200.anime-dex.workers.dev",
  "https://api300.anime-dex.workers.dev",
];

function getApiServer() {
  const weights = AvailableServers.map((server) => server.length);
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let weightSum = 0;

  for (let i = 0; i < AvailableServers.length; i++) {
    weightSum += weights[i];
    if (randomValue < weightSum) {
      return AvailableServers[i];
    }
  }

  return AvailableServers[0];
}

async function getJson(path, options = {}) {
  const { referer = window.location.origin, retry = 3 } = options;
  const ApiServer = getApiServer();
  let url = ApiServer + path;

  for (let i = 0; i < retry; i++) {
    try {
      const response = await fetch(url, { headers: { referer } });
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

async function RefreshLazyLoader() {
  const arr = document.querySelectorAll("img.lzy_img");
  arr.forEach((v) => {
    v.addEventListener("load", () => {
      v.classList.remove("lzy_img");
    });
    v.src = v.dataset.src;
  });
}

async function SearchAnime(query, page = 1) {
  try {
    const data = await getJson(searchapi + query + "?page=" + page, {
      referer: window.location.origin,
      retry: 3,
    });

    const animes = data["results"];
    const contentdiv = document.getElementById("latest2");
    const loader = document.getElementById("load");
    let html = "";

    if (animes.length === 0) {
      throw "No results found";
    }

    html = animes
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
    RefreshLazyLoader();
  } catch (error) {
    console.error(error);
  }
}
