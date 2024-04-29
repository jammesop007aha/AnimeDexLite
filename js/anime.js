// Api urls

const ProxyApi = "https://proxy.techzbots1.workers.dev/?u="; // Proxy API URL for fetching data from other servers
const animeapi = "/anime/"; // Base URL for anime API
const recommendationsapi = "/recommendations/"; // Base URL for anime recommendations API

// Api Server Manager

const AvailableServers: readonly string[] = [
  "https://api100.anime-dex.workers.dev",
]; // List of available API servers

/**
 * Returns a random API server from the available list
 * @returns {string} A random API server
 */
function getApiServer(): string {
  if (AvailableServers.length === 0) {
    throw new Error("No available API servers");
  }

  return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions

/**
 * A type guard function for checking if an error is an instance of JsonError
 * @param {unknown} error The error object to check
 * @returns {error is JsonError} True if the error is an instance of JsonError, false otherwise
 */
function isJsonError(error: unknown): error is { message: string } {
  return typeof error === "object" && "message" in error;
}

/**
 * Fetches data from an API endpoint and returns it as JSON
 * @template T The type of the data to be fetched
 * @param {string} path The API endpoint to fetch data from
 * @param {number} errCount The number of errors encountered so far
 * @returns {Promise<T>} A promise that resolves to the fetched data as JSON
 */
async function getJson<T>(path: string, errCount = 0): Promise<T> {
  const ApiServer = getApiServer();
  const url = `${ApiServer}${path}`;

  if (errCount > 2) {
    throw new Error(`Too many errors while fetching ${url}`);
  }

  try {
    const response = await fetch(`${url}`, { method: "GET", referrerPolicy: "no-referrer-when-downgrade" });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return await response.json(); // Return the JSON data
  } catch (error) {
    console.error(error); // Log any fetch errors

    if (path.startsWith(recommendationsapi)) {
      // Use proxy for recommendations API
      const proxyUrl = `${ProxyApi}${url}`;
      try {
        return await getJson<T>(proxyUrl, errCount + 1);
      } catch (error) {
        if (isJsonError(error)) {
          throw error;
        }
      }
    } else {
      throw error;
    }
  }
}

/**
 * Creates HTML for the anime genres
 * @param {string[]} genres The list of anime genres
 * @returns {string} The HTML string for the genres
 */
function getGenreHtml(genres: string[]): string {
  return genres.map((genre) => `<a>${genre.trim()}</a>`).join("");
}

/**
 * Refreshes the lazy loader for images
 */
async function RefreshLazyLoader(): Promise<void> {
  const imageObserver = new IntersectionObserver(
    (entries, imgObserver) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;

          if (lazyImage.dataset.src != null) {
            lazyImage.src = lazyImage.dataset.src; // Set the source of the lazy-loaded image to its data-src attribute value
          }
        }
      }
    }
  );

  const arr = document.querySelectorAll("img.lzy_img");

  for (const v of arr) {
    imageObserver.observe(v); // Observe all lazy-loaded images and load them when they become visible
  }
}

/**
 * Returns the anime title based on the available title types
 * @param {Record<string, string>} title The anime title object
 * @returns {string} The anime title
 */
function getAnilistTitle(title: Record<string, string>): string {
  if ("userPreferred" in title) {
    return title["userPreferred"]; // Return the user-preferred title if it exists
  } else if ("english" in title) {
    return title["english"]; // Return the English title if it exists
  } else if ("romaji" in title) {
    return title["romaji"]; // Return the Romaji title if it exists
  } else if ("native" in title) {
    return title["native"]; // Return the native title if it exists
  } else {
    return "Unknown"; // Return "Unknown" if no title is found
  }
}


type JsonError = { message: string };
