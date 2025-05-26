let currentSong = new Audio();
let songs = [];
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    try {
        currFolder = folder;
        let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
        let response = await a.text();
        let div = document.createElement('div');
        div.innerHTML = response;
        let as = div.getElementsByTagName('a');
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith('.mp3')) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function showSongs() {
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = ''; // Clear the existing list
    for (const song of songs) {
        songUL.innerHTML += `<li><img class="music" src="music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", "")}</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img src="playnow.svg" alt="">
                        </div> </li>`;
    }

    // Attach an event listener to each song in the library list
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    const trackPath = `/${currFolder}/` + track;
    currentSong.src = trackPath;
    currentSong.load(); // Ensure the audio is loaded
    if (!pause) {
        let promise = currentSong.play();
        if (promise !== undefined) {
            promise.then(_ => {
                // Autoplay started!
                document.querySelector('#play').src = "pause.svg";
            }).catch(error => {
                // Autoplay was prevented.
                console.error(`Error playing the track: ${trackPath}`, error);
                // Show a "Play" button so that user can start playback.
                document.querySelector('#play').src = "playm.svg";
            });
        }
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = " 00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/song/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector('.cardcontainer');
    Array.from(anchors).forEach(async e => {
        if (e.target && e.target.href.includes("/song")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/song/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="ncs" class="card ">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"
                                fill="none" class="injected-svg"
                                data-src="https://cdn.hugeicons.com/icons/play-circle-02-solid-rounded.svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#1ed760">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M12 1.25C6.06294 1.25 1.25 6.06294 1.25 12C1.25 17.9371 6.06294 22.75 12 22.75C17.9371 22.75 22.75 17.9371 22.75 12C22.75 6.06294 17.9371 1.25 12 1.25ZM9.95576 15.3862C9.5 15.0791 9.5 14.3195 9.5 12.8002V11.1998C9.5 9.6805 9.5 8.92086 9.95576 8.61382C10.4115 8.30678 11.0348 8.6465 12.2815 9.32594L13.7497 10.1262C15.2499 10.9438 16 11.3526 16 12C16 12.6474 15.2499 13.0562 13.7497 13.8738L12.2815 14.6741C11.0348 15.3535 10.4115 15.6932 9.95576 15.3862Z"
                                    fill="#1ed760"></path>
                            </svg>

                        </div>

                        <img src="/song/cover/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    })
}

function attachEventListeners() {
    const playButton = document.querySelector('#play');
    const previousButton = document.querySelector('#previous');
    const nextButton = document.querySelector('#next');
    const muteButton = document.querySelector('.mute');

    if (playButton) {
        playButton.addEventListener('click', () => {
            if (currentSong.paused) {
                let promise = currentSong.play();
                if (promise !== undefined) {
                    promise.then(_ => {
                        // Autoplay started!
                        playButton.src = "pause.svg";
                    }).catch(error => {
                        // Autoplay was prevented.
                        console.error("Error playing the track:", error);
                        // Show a "Play" button so that user can start playback.
                        playButton.src = "playm.svg";
                    });
                }
            } else {
                currentSong.pause();
                playButton.src = "playm.svg";
            }
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });
    }

    if (muteButton) {
        muteButton.addEventListener('click', () => {
            if (currentSong.muted) {
                currentSong.muted = false;
                muteButton.src = "volume.svg";
            } else {
                currentSong.muted = true;
                muteButton.src = "mute.svg";
            }
        });
    }

    // Listen for the timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector('.seekbar').addEventListener("click", e => {
        const seekbar = e.target.getBoundingClientRect();
        const clickPosition = (e.offsetX / seekbar.width) * 100;
        document.querySelector(".circle").style.left = clickPosition + "%";
        currentSong.currentTime = (clickPosition / 100) * currentSong.duration;
    });

    // Add event listeners for hamburger menu
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = "0";
    });

    // Add event listener for close button
    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.left').style.left = "-100%";
    });

    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`song/${item.currentTarget.dataset.folder}`);
            showSongs();
        });
    });

    // Add event listener for volume slider
    document.querySelector('.volume-slider input').addEventListener('input', (e) => {
        currentSong.volume = e.target.value / 100;
    });
}

async function main() {
    // get the list of all songs
    await getSongs("song/ncs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }
    showSongs();

    // Display the album on the page
    displayAlbums();

    // Attach event listeners
    attachEventListeners();
}

main();