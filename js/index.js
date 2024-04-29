// Api urls

// ProxyApi is used to fetch data from a specific URL using a proxy server when there are errors in direct fetching.
const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";

// IndexApi is the base URL for fetching the home page data.
const IndexApi = "/home";

// recentapi is used to fetch recent animes.
const recentapi = "/recent/";

// Api Server Manager

// AvailableServers is an array containing URLs of available API servers.
const AvailableServers = ["https://api100.anime-dex.workers.dev"];

// getApiServer is a function that returns a random API server URL from the AvailableServers array.
function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions

// getJson is an async function that fetches JSON data from a given path and handles errors by retrying with a proxy server if needed.
async function getJson(path: string, errCount = 0): Promise<any> {
    const ApiServer = getApiServer();

    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const _url_of_site = new URL(window.location.href);
        const referer = _url_of_site.origin;
        const response = await fetch(url, { headers: { referer: referer } });
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
    }
}

// shuffle is a function that reorders the elements in an array randomly.
function shuffle(array: any[]) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

// Adding slider animes (trending animes from anilist)
async function getTrendingAnimes(data: any[]) {
    // SLIDER_HTML is a string that contains the HTML for the slider animes.
    let SLIDER_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        const anime = data[pos];
        const title = anime["title"]["userPreferred"];
        const type = anime["format"];
        const status = anime["status"];
        const genres = anime["genres"].join(", ");
        const description = anime["description"];
        const url = "./anime.html?anime_id=" + encodeURIComponent(title);

        let poster = anime["bannerImage"];
        if (poster == null) {
            poster = anime["coverImage"]["extraLarge"];
        }

        // Adding HTML for each slider anime
        SLIDER_HTML += `<div class="mySlides fade"> <div class="data-slider"> <p class="spotlight">#${pos + 1
            } Spotlight</p><h1>${title}</h1> <div class="extra1"> <span class="year"><i class="fa fa-play-circle"></i>${type}</span> <span class="year year2"><i class="fa fa-calendar"></i>${status}</span> <span class="cbox cbox1">${genres}</span> <span class="cbox cbox2">HD</span> </div><p class="small-synop">${description}</p><div id="watchh"> <a href="${url}" class="watch-btn"> <i class="fa fa-play-circle"></i> Watch Now </a> <a href="${url}" class="watch-btn watch-btn2"> <i class="fa fa-info-circle"></i> Details<i class="fa fa-angle-right"></i> </a> </div></div><div class="shado"> <a href="${url}"></a> </div><img src="${poster}"> </div>`;
    }

    // Inserting the HTML into the slideshow-container element
    document.querySelector(".slideshow-container").innerHTML =
        SLIDER_HTML +
        '<a class="prev" onclick="plusSlides(-1)">&#10094;</a><a class="next" onclick="plusSlides(1)">&#10095;</a>';
}

// Adding popular animes (popular animes from gogoanime)
async function getPopularAnimes(data: any[]) {
    let POPULAR_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        const anime = data[pos];
        const title = anime["title"];
        const id = anime["id"];
        const url = "./anime.html?anime_id=" + id;
        const image = anime["image"];
        let subOrDub;
        if (title.toLowerCase().includes("dub")) {
            subOrDub = "DUB";
        } else {
            subOrDub = "SUB";
        }

        // Adding HTML for each popular anime
        POPULAR_HTML += `<a href="${url}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb"># ${pos + 1
            }</div> <div class="dubb dubb2">${subOrDub}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${image}"> </div><div class="la-details"> <h3>${title}</h3></div></div></a>`;
    }

    // Inserting the HTML into the popularg element
    document.querySelector(".popularg").innerHTML = POPULAR_HTML;
}

// Adding popular animes (popular animes from gogoanime)
async function getRecentAnimes(page = 1) {
    const data = (await getJson(recentapi + page))["results"];
    let RECENT_HTML = "";

    for (let pos = 0; pos < data.length; pos++) {
        const anime = data[pos];
        const title = anime["title"];
        const id = anime["id"].split("-episode-")[0];
        const url = "./anime.html?anime_id=" + id;
        const image = anime["image"];
        const ep = anime["episode"].split(" ")[1];
        let subOrDub;
        if (title.toLowerCase().includes("dub")) {
            subOrDub = "DUB";
        } else {
            subOrDub = "SUB";
        }

        // Adding HTML for each recent anime
        RECENT_HTML += `<a href="${url}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb">${subOrDub}</div><div class="dubb dubb2">EP ${ep}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${image}"> </div><div class="la-details"> <h3>${title}</h3></div></div></a>`;
    }

    // Inserting the HTML into the recento element
    document.querySelector(".recento").innerHTML += RECENT_HTML;
}

// Slider functions
let slideIndex = 0;
let clickes = 0;

// showSlides is a function that displays a specific slide in the slider.
function showSlides(n: number) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
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

// showSlides2 is an async function that periodically changes the slide in the slider.
async function showSlides2() {
    if (clickes == 1) {
        await sleep(10000);
        clickes = 0;
    }
    let i;
    let slides = document.getElementsByClassName("mySlides");
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

// plusSlides is a function that changes the slide in the slider by a given amount.
function plusSlides(n: number) {
    showSlides((slideIndex += n));
    clickes = 1;
}

// currentSlide is a function that changes the slide in the slider to a specific index.
function currentSlide(n: number) {
    showSlides((slideIndex = n));
    clickes = 1;
}

// RefreshLazyLoader is a function that updates the Intersection Observer for lazy loading images.
async function RefreshLazyLoader() {
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

// sleep is a function that returns a Promise that resolves after a specified number of milliseconds.
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// To load more animes when scrolled to bottom
let page = 2;
let isLoading = false;

// loadAnimes is a function that fetches and displays more animes when the user scrolls to the bottom of the page.
async function loadAnimes() {
    try {
        if (isLoading == false) {
            isLoading = true;
            const data = await getJson(recentapi + page);
            const animes = data["results"];
            const RECENT_HTML = animes
                .map(
                    (anime: any) => `<a href="./anime.html?anime_id=${anime["id"].split(
                        "-episode-"
                    )[0]}"><div class="poster la-anime"> <div id="shadow1" class="shadow"><div class="dubb">${
                        anime["subbed"] ? "SUB" : "DUB"
                    }</div><div class="dubb dubb2">EP ${anime["episode"].split(
                        " "
                    )[1]}</div> </div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${anime["image"]}"> </div><div class="la-details"> <h3>${anime["title"]}</h3></div></div></a>`
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

// getJson is called with the IndexApi to fetch the initial data for the page.
(async () => {
    try {
        const data = await getJson(IndexApi);
        const anilistTrending = shuffle(data["anilistTrending"]);
        const gogoanimePopular = shuffle(data["gogoPopular"]);

        // getTrendingAnimes is called with the anilistTrending data to display the trending animes in the slider.
        await getTrendingAnimes(anilistTrending);
        RefreshLazyLoader();
        showSlides(slideIndex);
        showSlides2();
        console.log("Sliders loaded");

        // getPopularAnimes is called with the gogoanimePopular data to display the popular animes.
        await getPopularAnimes(gogoanimePopular);
        RefreshLazyLoader();
        console.log("Popular animes loaded");

        // getRecentAnimes is called with page 1 to display the recent animes.
        await getRecentAnimes(1);
        RefreshLazyLoader();
        console.log("Recent animes loaded");
    } catch (error) {
        console.error(error);
    }
});
