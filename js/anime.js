// Api urls

const ProxyApi = "https://proxy.techzbots1.workers.dev/?u="; // Proxy API URL for fetching data from other servers
const animeapi = "/anime/"; // Base URL for anime API
const recommendationsapi = "/recommendations/"; // Base URL for anime recommendations API

// Api Server Manager

const AvailableServers = [
  "https://api100.anime-dex.workers.dev",
] as const; // List of available API servers

function getApiServer(): string {
  return AvailableServers[Math.floor(Math.random() * AvailableServers.length)]; // Returns a random API server from the available list
}

// Usefull functions

async function getJson<T>(path: string, errCount = 0): Promise<T> {
  const ApiServer = getApiServer();
  let url = ApiServer + path;

  if (errCount > 2) {
    throw `Too many errors while fetching ${url}`; // Throws an error if there are too many fetch errors
  }

  if (errCount > 0) {
    // Retry fetch using proxy
    console.log("Retrying fetch using proxy");
    url = ProxyApi + url;
  }

  try {
    const _url_of_site = new URL(window.location.href); // Create a new URL object from the current page URL
    const referer = _url_of_site.origin; // Get the origin of the current page URL
    const response = await fetch(url, { headers: { referer: referer } }); // Fetch the data from the API server with the referer header set to the current page URL origin
    return await response.json(); // Return the JSON data
  } catch (errors) {
    console.error(errors); // Log any fetch errors
    return getJson<T>(path, errCount + 1); // Retry fetching the data with an increased error count
  }
}

function getGenreHtml(genres: string[]): string {
  return genres.map((genre) => `<a>${genre.trim()}</a>`).join(""); // Create HTML for the anime genres
}

async function RefreshLazyLoader(): Promise<void> {
  const imageObserver = new IntersectionObserver(
    (entries, imgObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src; // Set the source of the lazy-loaded image to its data-src attribute value
        }
      });
    }
  );
  const arr = document.querySelectorAll("img.lzy_img");
  arr.forEach((v) => {
    imageObserver.observe(v); // Observe all lazy-loaded images and load them when they become visible
  });
}

function getAnilistTitle(title: { [key: string]: string }): string {
  if (title["userPreferred"] != null) {
    return title["userPreferred"]; // Return the user-preferred title if it exists
  } else if (title["english"] != null) {
    return title["english"]; // Return the English title if it exists
  } else if (title["romaji"] != null) {
    return title["romaji"]; // Return the Romaji title if it exists
  } else if (title["native"] != null) {
    return title["native"]; // Return the native title if it exists
  } else {
    return "Unknown"; // Return "Unknown" if no title is found
 
