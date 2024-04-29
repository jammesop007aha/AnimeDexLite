// Api urls
const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";
const IndexApi = "/home";
const RecentApi = "/recent/";

// Api Server Manager
const AvailableServers = ["https://api100.anime-dex.workers.dev"];

type JsonPromise<T> = Promise<T | Error>;

async function getJson<T>(path: string): JsonPromise<T> {
  const ApiServer = getApiServer();
  let url = ApiServer + path;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (errors) {
    console.error(errors);
    return Promise.reject(errors);
  }
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

class Slider {
  constructor(private data: any[], private target: Element) {}

  createSlides(): void {
    const SLIDER_HTML = this.data
      .map(
        (anime: any, index: number) => `<div class="mySlides fade">
          <div class="data-slider">
            <p class="spotlight">#${index + 1} Spotlight</p>
            <h1>${anime.title.userPreferred}</h1>
            <div class="extra1">
              <span class="year"><i class="fa fa-play-circle"></i>${anime.format}</span>
              <span class="year year2"><i class="fa fa-calendar"></i>${anime.status}</span>
              <span class="cbox cbox1">${anime.genres.join(", ")}</span>
              <span class="cbox cbox2">HD</span>
            </div>
            <p class="small-synop">${anime.description}</p>
            <div id="watchh">
              <a href="./anime.html?anime_id=${encodeURIComponent(
                anime.title.userPreferred
              )}" class="watch-btn">
                <i class="fa fa-play-circle"></i> Watch Now
              </a>
              <a href="./anime.html?anime_id=${encodeURIComponent(
                anime.title.userPreferred
              )}" class="watch-btn watch-btn2">
                <i class="fa fa-info-circle"></i> Details<i class="fa fa-angle-right"></i>
              </a>
            </div>
          </div>
          <div class="shado">
            <a href="./anime.html?anime_id=${encodeURIComponent(
              anime.title.userPreferred
            )}"></a>
          </div>
          <img src="${anime.bannerImage || anime.coverImage.extraLarge}" />
        </div>`
      )
      .join("");

    this.target.innerHTML = SLIDER_HTML;
  }
}

class PopularAnimes {
  constructor(private data: any[], private target: Element) {}

  createPopularAnimes(): void {
    const POPULAR_HTML = this.data
      .map(
        (anime: any, index: number) => `<a href="./anime.html?anime_id=${anime.id}">
          <div class="poster la-anime">
            <div id="shadow1" class="shadow">
              <div class="dubb"># ${index + 1}</div>
              <div class="dubb dubb2">${
                anime.title.toLowerCase().includes("dub") ? "DUB" : "SUB"
              }</div>
            </div>
            <div id="shadow2" class="shadow">
              <img class="lzy_img" data-src="${anime.image}" />
            </div>
            <div class="la-details">
              <h3>${anime.title}</h3>
            </div>
          </div>
        </a>`
      )
      .join("");

    this.target.innerHTML = POPULAR_HTML;

    // Initialize lazy loading for popular animes
    const imageObserver = new IntersectionObserver(
      (entries, imgObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
          }
        });
      }
    );
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
      imageObserver.observe(v);
    });
  }
}

class RecentAnimes {
  constructor(private target: Element) {}

  async loadRecentAnimes(page: number = 1): Promise<void> {
    try {
      const data = await getJson<{ results: any[] }>(RecentApi + page);
      const animes = data.results;

      const RECENT_HTML = animes
        .map(
          (anime: any) => `<a href="./anime.html?anime_id=${anime.id.split(
            "-episode-"
          )[0]}">
          <div class="poster la-anime">
            <div id="shadow1" class="shadow">
              <div class="dubb">${
                anime.subbed ? "SUB" : "DUB"
              }</div>
              <div class="dubb dubb2">EP ${anime.episode.split(" ")[1]}</div>
            </div>
            <div id="shadow2" class="shadow">
              <img class="lzy_img" data-src="${anime.image}" />
            </div>
            <div class="la-details">
              <h3>${anime.title}</h3>
            </div>
          </div>
        </a>`
        )
        .join("");

      this.target.innerHTML += RECENT_HTML;

      // Initialize lazy loading for recent animes
      const imageObserver = new IntersectionObserver(
        (entries, imgObserver) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazyImage = entry.target;
              lazyImage.src = lazyImage.dataset.src;
            }
          });
        }
      );
      const arr = document.querySelectorAll("img.lzy_img");
      arr.forEach((v) => {
        imageObserver.observe(v);
      });
    } catch (error) {
      console.error(`Failed To Load Recent Animes Page : ${page}`);
      page += 1;
    }
  }
}

// Slider functions
let slideIndex = 0;
let clickes = 0;

function showSlides(n: number): void {
  let i;
  const slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "flex";
}

async function showSlides2(): Promise<void> {
  if (clickes == 1) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    clickes = 0;
  }
  let i;
  const slides = document.getElementsByClassName("mySlides");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  }
  slides[slideIndex - 1].style.display = "flex";
  setTimeout(showSlides2, 5000);
}

function plusSlides(n: number): void {
  showSlides((slideIndex += n));
  clickes = 1;
}

function currentSlide(n: number): void {
  showSlides((slideIndex = n));
  clickes = 1;
}

// To load more animes when scrolled to bottom
let page = 2;
let isLoading = false;

async function loadAnimes(): Promise<void> {
  try {
    if (isLoading == false) {
      isLoading = true;
      const data = await getJson<{ results: any[] }>(RecentApi + page);
      const animes = data.results;
      const RECENT_HTML = animes
        .map(
          (anime: any) => `<a href="./anime.html?anime_id=${anime.id.split(
            "-episode-"
          )[0]}">
          <div class="poster la-anime">
            <div id="shadow1" class="shadow">
              <div class="dubb">${
                anime.subbed ? "SUB" : "DUB"
              }</div>
              <div class="dubb dubb2">EP ${anime.episode.split(" ")[1]}</div>
            </div>
            <div id="shadow2" class="shadow">
              <img class="lzy_img" data-src="${anime.image}" />
            </div>
            <div class="la-details">
              <h3>${anime.title}</h3>
            </div>
          </div>
        </a>`
        )
        .join("");
      document.querySelector(".recento").innerHTML += RECENT_HTML;

      // Initialize lazy loading for newly loaded animes
      const imageObserver = new IntersectionObserver(
        (entries, imgObserver) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazyImage = entry.target;
              lazyImage.src = lazyImage.dataset.src;
            }
          });
        }
      );
      const arr = document.querySelectorAll("img.lzy_img");
      arr.forEach((v) => {
        imageObserver.observe(v);
      });

      console.log("Recent animes loaded");
      page += 1;
      isLoading = false;
    }
  } catch (error) {
    isLoading = false;
    console.error(`Failed To Load Recent Animes Page : ${page}`);
    page += 1;
  }
}

// Add a scroll event listener
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await getJson<{ anilistTrending: any[]; gogoPopular: any[] }>(IndexApi);
    const anilistTrending = data.anilistTrending;
    const gogoanimePopular = data.gogoPopular;

    new Slider(shuffle(anilistTrending), document.querySelector(".slideshow-container")).createSlides();

    new PopularAnimes(shuffle(gogoanimePopular), document.querySelector(".popularg")).createPopularAnimes();

    const recentAnimes = new RecentAnimes(document.querySelector(".recento"));
    recentAnimes.loadRecentAnimes();

    // Initialize lazy loading for popular and slider animes
    const imageObserver = new IntersectionObserver(
      (entries, imgObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
          }
        });
      }
    );
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
      imageObserver.observe(v);
    });

    showSlides2();
  } catch (error) {
    console.error(error);
  }
});
