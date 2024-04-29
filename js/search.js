// Api urls

// The base URL for the proxy API. This is used to fetch data from the main API.
const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";

// The base URL for the search API. This is used to search for anime.
const searchapi = "/search/";

// Api Server Manager

// An array of available servers that can be used to fetch data.
const AvailableServers = ["https://api100.anime-dex.workers.dev"];

// A function that returns a random server from the available servers array.
function getApiServer() {
  // Return a random server from the available servers array.
  return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions

// An async function that takes a path as an argument and returns the JSON data from the API.
async function getJson(path, errCount = 0) {
  const ApiServer = getApiServer();
  let url = ApiServer + path;

  // If the error count is greater than 2, throw an error.
  if (errCount > 2) {
    throw `Too many errors while fetching ${url}`;
  }

  // If the error count is greater than 0, retry fetch using proxy.
  if (errCount > 0) {
    console.log("Retrying fetch using proxy");
    url = ProxyApi + url;
  }

  try {
    // Create a new URL object from the current location.
    const _url_of_site = new URL(window.location.href);
    const referer = _url_of_site.origin;

    // Fetch the data from the API and return it as JSON.
    const response = await fetch(url, { headers: { referer: referer } });
    return await response.json();
  } catch (errors) {
    console.error(errors);
    // If there is an error, increment the error count and retry the function.
    return getJson(path, errCount + 1);
  }
}

// An async function that refreshes the lazy loader.
async function RefreshLazyLoader() {
  const imageObserver = new IntersectionObserver((entries, imgObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.src = lazyImage.dataset.src;
      }
    });
  });
  const arr = document.querySelectorAll("img.lzy_img");
  arr.forEach((v) => {
    imageObserver.observe(v);
  });
}

// A function that converts the first letter of each word in a string to uppercase.
function sentenceCase(str) {
  if (str === null || str === "") return false;
  else str = str.toString();

  // Use regex to replace the first letter of each word with its uppercase equivalent.
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// A variable that keeps track of whether there is a next page or not.
let hasNextPage = true;

// Search function to get anime from gogo

// An async function that takes a query and page number as arguments and returns the anime data from the API.
async function SearchAnime(query, page = 1) {
  const data = await getJson(searchapi + query + "?page=" + page);

  // Extract the anime data from the response.
  const animes = data["results"];
  const contentdiv = document.getElementById("latest2");
  const loader = document.getElementById("load");
  let html = "";

  // If there are no anime found, throw an error.
  if (animes.length == 0) {
    throw "No results found";
  }

  // Loop through the anime data and create HTML elements for each anime.
  for (let i = 0; i < animes.length; i++) {
    const anime = animes[i];
    if (anime["title"].toLowerCase().includes("dub")) {
      anime["subOrDub"] = "DUB";
    } else {
      anime["subOrDub"] = "SUB";
    }

    html += `<a href="./anime.html?anime_id=${anime["id"]
