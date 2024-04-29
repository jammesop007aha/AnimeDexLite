// Api urls

const ProxyApi = "https://proxy.techzbots1.workers.dev/?u="; // Proxy API URL for fetching data from external servers
const animeapi = "/anime/"; // Anime API URL base path
const episodeapi = "/episode/"; // Episode API URL base path
const dlapi = "/download/"; // Download API URL base path

// Api Server Manager

const AvailableServers = ["https://api100.anime-dex.workers.dev"]; // List of available API servers

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)]; // Function to get a random API server from the available list
}

// Usefull functions

async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();
    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`; // Throw an error if there are more than 2 errors while fetching the URL
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const _url_of_site = new URL(window.location.href); // Create a new URL object from the current page URL
        const referer = _url_of_site.origin; // Get the origin of the current page URL
        const response = await fetch(url, { headers: { referer: referer } }); // Fetch the data from the API server with the referer header set to the current page URL's origin
        return await response.json(); // Return the JSON data from the response
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1); // Retry fetching the data with an increased error count
    }
}

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); // Convert the first letter of each word to uppercase and the rest to lowercase
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1); // Convert the first letter of the string to uppercase
}

// Function to get m3u8 url of episode
async function loadVideo(name, stream) {
    try {
        document.getElementById("ep-name").innerHTML = name; // Set the episode name in the HTML element with the ID "ep-name"
        const serversbtn = document.getElementById("serversbtn");

        let url = stream["sources"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./embed.html?url=${url}&episode_id=${EpisodeID}">AD Free 1</a> </div>`; // Add a new server option to the HTML element with the ID "serversbtn"
        document.getElementsByClassName("sactive")[0].click(); // Click the first server option

        url = stream["sources_bk"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="./embed.html?url=${url}&episode_id=${EpisodeID}">AD Free 2</a> </div>`; // Add another server option to the HTML element with the ID "serversbtn"

        return true;
    } catch (err) {
        return false;
    }
}

// Function to available servers
async function loadServers(servers, success = true) {
    const serversbtn = document.getElementById("serversbtn");

    let html = "";

    for (let [key, value] of Object.entries(servers)) {
        if (key != "vidcdn") {
            key = capitalizeFirstLetter(key); // Convert the first letter of the server key to uppercase
            if (key == "Streamwish") {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this,true)" data-value="${value}">${key}</a> </div>`; // Add a new server option to the HTML element with the ID "serversbtn"
            } else {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${value}">${key}</a> </div>`; // Add a new server option to the HTML element with the ID "serversbtn"
            }
        }
    }
    serversbtn.innerHTML += html; // Add the new server options to the HTML element with the ID "serversbtn"

    if (success == false) {
        document.getElementsByClassName("sobtn")[0].click(); // Click the first server option
    }
}

// Function to select server
function selectServer(btn, sandbox = false) {
    const buttons = document.getElementsByClassName("sobtn");
    const iframe = document.getElementById("AnimeDexFrame");

    if (sandbox == true) {
        iframe.sandbox =
            "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"; // Set the sandbox attribute of the iframe element to allow certain features
    } else {
        iframe.removeAttribute("sandbox"); // Remove the sandbox attribute of the iframe element
    }

    iframe.src = btn.getAttribute("data-value"); // Set the source of the iframe element to the value of the selected server option
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = "sobtn";
    }
    btn.className = "sobtn sactive"; // Set the class of the selected server option to "sactive"
}

// Function to show download links
function showDownload() {
    document.getElementById("showdl").style.display = "none"; // Hide the "showdl" HTML element
    document.getElementById("dldiv").classList.toggle("show"); // Toggle the "show" class of the "dldiv" HTML element

    getDownloadLinks(urlParams.get("anime"), urlParams.get("episode")).then(
        () => {
            console.log("Download links loaded"); // Log a message when the download links are loaded
        }
    );
}

// Function to get episode list
let Episode_List = [];

async function getEpUpperList(eplist) {
    const current_ep = Number(EpisodeID.split("-episode-")[1].replace("-", ".")); // Get the current episode number
    Episode_List = eplist; // Set the episode list
    const TotalEp = eplist.length; // Get the total number of episodes
    let html = "";

    for (let i = 0; i < eplist.length; i++) {
        const epnum = Number(eplist[i][0].replaceAll("-", ".")); // Convert the episode number to a number

        if ((epnum - 1) % 100 === 0) {
            let epUpperBtnText;
            if (TotalEp - epnum < 100) {
                epUpperBtnText = `${epnum} - ${TotalEp}`; // Create the text for the episode button

                if (epnum <= current_ep && current_ep <= TotalEp) {
                    html += `<option id="default-ep-option" class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`; // Add a new episode button with the "default-ep-option" ID and the "ep-btn" class
                    getEpLowerList(epnum, TotalEp); // Get the lower episode list
                } else {
                    html += `<option class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`; // Add a new episode button with the "ep-btn" class
                }
            } else {
                epUpperBtnText = `${epnum} - ${epnum + 99}`; // Create the text for the episode button

                if (epnum <= current_ep && current_ep <= epnum + 99) {
                    html += `<option id="default-ep-option" class="ep-btn" data-from=${epnum} data-to=${epnum + 99
                        }>${epUpperBtnText}</option>`; // Add a new episode button with the "default-ep-option" ID and the "ep-btn" class
                    getEpLowerList(epnum, epnum + 99); // Get the lower episode list
                } else {
                    html += `<option class="ep-btn" data-from=${epnum} data-to=${epnum + 99
                        }>${epUpperBtnText}</option>`; // Add a new episode button with the "ep-btn" class
                }
            }
        }
    }
    document.getElementById("ep-upper-div").innerHTML = html; // Set the HTML content of the "ep-upper-div" HTML element to the new episode buttons
    document.getElementById("default-ep-option").selected = true; // Select the first episode button
    console.log("Episode list loaded"); // Log a message when the episode list is loaded
}

async function getEpLowerList(start, end) {
    const current_ep = Number(EpisodeID.split("-episode-")[1].replace("-", ".")); // Get the current episode number

    let html = "";
    const eplist = Episode_List.slice(start - 1, end); // Get the lower episode list

    for (let i = 0; i < eplist.length; i++) {
        const episode_id = eplist[i][1];
        let epnum = Number(eplist[i][0].replaceAll("-", ".")); // Convert the episode number to a number

        let epLowerBtnText;
        epLowerBtnText = `${epnum}`; // Create the text for the episode button

        if (epnum === current_ep) {
            epnum = String(epnum).replaceAll(".", "-"); // Replace the dots in the episode number with dashes
            html += `<a class="ep-btn-playing ep-btn" href="./episode.html?anime_id=${AnimeID}&episode_id=${episode_id}">${epLowerBtnText}</a>`; // Add a new episode button with the "ep-btn-playing" class
        } else {
            html += `<a class="ep-btn" href="./episode.html?anime_id=${AnimeID}&episode_id=${episode_id}">${epLowerBtnText}</a>`; // Add a new episode button with the "ep-btn" class
        }
    }
    document.getElementById("ep-lower-div").innerHTML = html; // Set the HTML content of the "ep-lower-div" HTML element to the new episode buttons
}

async function episodeSelectChange(elem) {
    const option = elem.options[elem.selectedIndex];
    getEpLowerList(
        parseInt(option.getAttribute("data-from")),
        parseInt(option.getAttribute("data-to"))
    );
}

// Function to get download links
async function getDownloadLinks(anime, episode) {
    const data = (await getJson(dlapi + EpisodeID))["results"]; // Get the download links for the current episode
    let html = "";

    for (const [key, value] of Object.entries(data)) {
        const quality = key.split("x")[1]; // Get the quality of the download link
        const url = value;
        html += `<div class="sitem"> <a class="sobtn download" target="_blank" href="${url}"><i class="fa fa-download"></i>${quality}p</a> </div>`; // Add a new download link to the HTML
    }
    document.getElementById("dllinks").innerHTML = html; // Set the HTML content of the "dllinks" HTML element to the new download links
}

function isShortNumber(n) {
    let x = Number(String(n).replace(".", "")); // Convert the number to a string, replace the dots with nothing, and convert it back to a number

    if (x < 20) {
        return true; // Return true if the number is less than 20
    } else {
        return false; // Return false otherwise
    }
}

// Function to get episode Slider
async function getEpSlider(total) {
    let ephtml = "";

    for (let i = 0; i < total.length; i++) {
        const episodeId = total[i][1];
        const epNum = total[i][0];
        if (episodeId == EpisodeID) {
            if (isShortNumber(epNum)) {
                ephtml += `<div class="ep-slide ep-slider-playing"><a href="./episode.html?anime_id=${AnimeID}&episode_id=${episodeId}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.techzbots1.workers.dev/thumb/${episodeId}><div class=ep-title><span>Episode ${epNum} - Playing</span></div></a></div>`; // Add a new episode slider with the "ep-slider-playing" class
            } else {
                ephtml += `<div class="ep-slide ep-slider-playing"><a href="./episode.html?anime_id=${AnimeID}&episode_id=${episodeId}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.techzbots1.workers.dev/thumb/${episodeId}><div class=ep-title><span>Ep ${epNum} - Playing</span></div></a></div>`; // Add a new episode slider with the "ep-slider-playing" class
            }
        } else {
            if (isShortNumber(epNum)) {
                ephtml += `<div class=ep-slide><a href="./episode.html?anime_id=${AnimeID}&episode_id=${episodeId}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.techzbots1.workers.dev/thumb/${episodeId}><div class=ep-title><span>Episode ${epNum}</span></div></a></div>`; // Add a new episode slider
            } else {
                ephtml += `<div class=ep-slide><a href="./episode.html?anime_id=${AnimeID}&episode_id=${episodeId}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.techzbots1.workers.dev/thumb/${episodeId}><div class=ep-title><span>Ep ${epNum}</span></div></a></div>`; // Add a new episode slider
            }
        }
    }
    document.getElementById("ep-slider").innerHTML = ephtml; // Set the HTML content of the "ep-slider" HTML element to the new episode sliders
    document.getElementById("slider-main").style.display = "block"; // Show the "slider-main" HTML element
    RefreshLazyLoader(); // Refresh the lazy loader

    // Scroll to playing episode
    document.getElementById("main-section").style.display = "block";
    document
        .getElementsByClassName("ep-slider-playing")[0]
        .scrollIntoView({ behavior: "instant", inline: "start", block: "end" });
    document
        .getElementsByClassName("ep-btn-playing")[0]
        .scrollIntoView({ behavior: "instant", inline: "start", block: "end" });
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
    });

    setTimeout(() => {
        document.getElementById("main-section").style.opacity = 1;
        document.getElementById("load").style.display = "none";
    }, 100);
}

// Retry image load
function retryImageLoad(img) {
    const ImageUrl = img.src;
    img.src = "./static/loading1.gif";

    // load after 3 second

    setTimeout(() => {
        if (ImageUrl.includes("?t=")) {
            const t = Number(ImageUrl.split("?t=")[1]) + 1;

            // Retry 10 times
            if (t < 5) {
                img.src = ImageUrl.split("?t=")[0] + "?t=" + String(t);
            }
        } else {
            img.src = ImageUrl + "?t=1";
        }
    }, 3000);
}

// Function to scroll episode slider
const windowWidth = window.innerWidth;

function plusSlides(n) {
    if (n === 1) {
        document.getElementById("slider-carousel").scrollLeft += windowWidth / 2; // Scroll the episode slider to the right
    } else if (n === -1) {
        document.getElementById("slider-carousel").scrollLeft -= windowWidth / 2; // Scroll the episode slider to the left
    }
}

async function RefreshLazyLoader() {
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src; // Set the source of the lazy image to its data-src attribute
            }
        });
    });
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
        imageObserver.observe(v); // Observe each lazy image and set its source when it intersects with the viewport
    });
}

// Running functions

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const AnimeID = urlParams.get("anime_id");
const EpisodeID = urlParams.get("episode_id");

if (AnimeID == null || EpisodeID == null) {
    window.location = "./index.html"; // Redirect to the index page if the anime ID or episode ID is not present in the URL
}

async function loadEpisodeData(data) {
    data = data["results"];
    const name = data["name"];
    const stream = data["stream"];
    const servers = data["servers"];

    document.documentElement.innerHTML =
        document.documentElement.innerHTML.replaceAll("{{ title }}", name); // Replace the "{{ title }}" placeholder in the HTML with the episode name

    try {
        if (stream == null) {
            throw "Failed To Load Ad Free Servers";
        }
        loadVideo(name, stream).then(() => {
            console.log("Video loaded"); // Log a message when the video is loaded
            loadServers(servers, true).then(() => {
                console.log("Servers loaded"); // Log a message when the servers are loaded
            });
        });
    } catch (err) {
        loadServers(servers, false).then(() => {
            console.log("Servers loaded"); // Log a message when the servers are loaded
        });
    }
}

async function loadData() {
    try {
        let data = await getJson(episodeapi + EpisodeID);

        await loadEpisodeData(data);

        const eplist = (await getJson(animeapi + AnimeID))["results"]["episodes"];
        getEpUpperList(eplist);
        console.log("Episode list loaded"); // Log a message when the episode list is loaded

        try {
            await getEpSlider(eplist, urlParams.get("episode"));
        } catch {
            document.getElementById("main-section").style.display = "block";
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });

            setTimeout(() => {
                document.getElementById("main-section").style.opacity = 1;
                document.getElementById("load").style.display = "none";
            }, 100);
        }
        console.log("Episode Slider loaded"); // Log a message when the episode slider is loaded
    } catch (err) {
        document.getElementById("main-section").style.display = "none";
        document.getElementById("error-page").style.display = "block";
        document.getElementById("error-desc").innerHTML = err;
        console.error(err); // Log the error message
    }
    document.getElementById("AnimeDexFrame").focus();
}

loadData(); // Call the loadData function to start loading the data
