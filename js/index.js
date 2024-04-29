// Api urls
const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";
const IndexApi = "/home";
const RecentApi = "/recent/";

// Api Server Manager
const AvailableServers = ["https://api100.anime-dex.workers.dev"];

function getApiServer(): string {
  return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions
async function getJson(path: string, errCount = 0): Promise<any> {
  const ApiServer = getApiServer();
  let url = ApiServer + path;

  if (errCount > 2) {
    throw `Too many errors while fetching ${url}`;
  }

  if (errCount > 0) {
    url = ProxyApi + url;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (errors) {
    console.error(errors);
    return getJson(path, errCount + 1);
  }
}

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
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
              <img class="lzy_img" src="./static/loading1.gif" data-src="${anime.image}" />
            </div>
            <div class="la-details">
              <h3>${anime.title}</h3>
            </div>
          </div>
        </a>`
      )
      .join("");

    this.target.innerHTML = POPULAR_HTML;
  }
}

class RecentAnimes {
  constructor(private target: Element) {}

  async loadRecentAnimes(page: number = 1): Promise<void> {
    try {
      const data = await getJson(RecentApi + page);
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
              <img class="lzy_img" src="./static/loading1.gif" data-src="${anime.image}" />
            </div>
            <div class="la-details">
              <h3>${anime.title}</h3>
            </div>
          </div>
        </a>`
        )
        .join("");

      this.target.innerHTML += RECENT_HTML;
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
    await sleep(10000);
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

function RefreshLazyLoader(): void {
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// To load more animes when scrolled to bottom
let page = 2;
let isLoading = false;

async function loadAnimes(): Promise<void> {
  try {
    if (isLoading == false) {
      isLoading = true;
      const data = await getJson(RecentApi + page);
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
              <img class="lzy_img" src="./static/loading1.gif" data-src="${anime.image}" />
            </div>
            <div class="la-details">
              <h3>${anime.title}</h3>
            </div>
          </div>
        </a>`
        )
        .join("");
      document.querySelector(".recento").innerHTML += RECENT_HTML;
      RefreshLazyLoader();
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
window.addEventListener("scroll", function () {
  // Calculate how far the user has scrolled
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollPosition + 3 * windowHeight >= documentHeight) {
    loadAnimes();
  }
});

// Running functions
(async () => {
  try {
    const data = await getJson(IndexApi);
    const anilistTrending = shuffle(data.anilistTrending);
    const gogoanimePopular = shuffle(data.gogoPopular);

    new Slider(anilistTrending, document.querySelector(".slideshow-container")).createSlides();
    RefreshLazyLoader();
    showSlides(slideIndex);
    showSlides2();
    console.log("Sliders loaded");

    new PopularAnimes(gogoanimePopular, document.querySelector(".popularg")).createPopularAnimes();
    RefreshLazyLoader();
    console.log("Popular animes loaded");

    const recentAnimes = new RecentAnimes(document.querySelector(".recento"));
    recentAnimes.loadRecentAnimes();
    RefreshLazyLoader();
    console.log("Recent animes loaded");
  } catch (error) {
    console.error(error);
  }
})();
