console.log('lets start the script');
let currentSong = new Audio();
let songs

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

async function getSongs() {
    try {
        let a = await fetch("http://127.0.0.1:3000/song/");
        let response = await a.text();
        let div = document.createElement('div');
        div.innerHTML = response;
        let as = div.getElementsByTagName('a');
        let songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith('.mp3')) {
                songs.push(element.href.split('/song/')[1]);
            }
        }
        return songs
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track, puase=false) => {
    currentSong.src = "/song/" + track;
    if (!puase) {   
        let promise = currentSong.play();
        if (promise !== undefined) {
            promise.then(_ => {
                // Autoplay started!
                play.src = "pause.svg";
            }).catch(error => {
                // Autoplay was prevented.
                console.error("Error playing the track:", error);
                // Show a "Play" button so that user can start playback.
                play.src = "playm.svg";
            });
        }
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = " 00:00 / 00:00";
}

async function main() {

    // get the list of all songs
  songs = await getSongs();
  if (songs.length > 0) {
    playMusic(songs[0], true);
}

    // Show all ths songs in the playlist
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="music" src="music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", "")}</div>
                           
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img src="playnow.svg" alt="">
                        </div> </li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            console.log(e.querySelector('.info').firstElementChild.innerHTML);
            playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
        });

    });

    // Attach an event listener to the play , next , previous buttons
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            let promise = currentSong.play();
            if (promise !== undefined) {
                promise.then(_ => {
                    // Autoplay started!
                    play.src = "pause.svg";
                }).catch(error => {
                    // Autoplay was prevented.
                    console.error("Error playing the track:", error);
                    // Show a "Play" button so that user can start playback.
                    play.src = "playm.svg";
                });
            }
        } else {
            currentSong.pause();
            play.src = "playm.svg";
        }
    });
    // Listen for the timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Addd an event listerne to seekbar
    document.querySelector('.seekbar').addEventListener("click", e => {
        const seekbar = e.target.getBoundingClientRect();
        const clickPosition = (e.offsetX / seekbar.width) * 100;
        document.querySelector(".circle").style.left = clickPosition + "%";
        currentSong.currentTime = (clickPosition / 100) * currentSong.duration;
    });
    // Add an envet listener  for  hamburger menu
    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left').style.left= "0";
    })
    // Add an envet listener  for  close button
    document.querySelector('.close').addEventListener('click',()=>{
        document.querySelector('.left').style.left= "-100%";
    })
    // Add an envet listener to previous and next
    previous.addEventListener("click",()=>{
        console.log("previous clidked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index-1)>=0){
            
            playMusic(songs[index-1]);
        }
    })

    // Add an envet listener t next
    next.addEventListener("click",()=>{
        console.log("Next clidked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index+1)<songs.length){
            
            playMusic(songs[index+1]);
        }
    })

}
main()
