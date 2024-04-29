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
  const url = `${ApiServer}${path}`;

  if (errCount > 2) {
    throw `Too many errors while fetching ${url}`; // Throws an error if there are too many fetch errors
  }

  if (errCount > 0) {
    // Retry fetch using proxy
    console.log("Retrying fetch using proxy");
    const proxyUrl = `${ProxyApi}${url}`;
    try {
      const response = await fetch(proxyUrl, { method: 'GET', referrerPolicy: 'no-referrer-when-downgrade' });
      return await response.json(); // Return the JSON data
    } catch (errors) {
      console.error(errors); // Log any fetch errors
      return getJson<T>(path, errCount + 1); // Retry fetching the data with an increased error count
    }
  }

  try {
    const response = await fetch(`${url}`, { method: 'GET', referrerPolicy: 'no-referrer-when-downgrade' });
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
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src; // Set the source of the lazy-loaded image to its data-src attribute value
        }
      }
    }
  );
  const arr = document.querySelectorAll("img.lzy_img");
  for (const v of arr) {
    imageObserver.observe(v); // Observe all lazy-loaded images and load them when they become visible
  }
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
  }
}
