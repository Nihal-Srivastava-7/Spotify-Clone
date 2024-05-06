console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Pad with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 

                <img class="invert" src="music.svg" alt="">
                <div class="info">
                  <div>${song.replaceAll(
                    "%F0%9F%92%%23motivation101_%23motivation(128k)%F0%9F%92%",
                    " "
                  )}</div>
                  <div>Nihal</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="play.svg" alt="">
                </div>
     </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
}

const playMusic = (track, pause = false) => {
  //let audio = new Audio("/songs/" + track)
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];
      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
      let response = await a.info.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="Bhakti_Song" class="card">
  <div class="play">
    <img
      width="50"
      height="50"
      src="https://img.icons8.com/ios-filled/50/40C057/circled-play.png"
      alt="circled-play"
    />
  </div>
  <img
    src="/songs/${folder}/cover.jpg"
    alt=""
  />
  <h2>${response.title}</h2>
  <p>${response.description}</p>
</div>`;
    }
  }

  // load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e=> {
    e.addEventListener("click", async item => {
      console.log(item.target, item.currentTarget.dataset);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  // get the list of all the songs

  await getSongs("songs/Bhakti_Song");
  console.log(songs);
  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  // attach an event listner to play next and previous

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener for Previous button
  previous.addEventListener("click", () => {
    console.log("previous Clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener for next button
  next.addEventListener("click", () => {
    console.log("Next Clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e, e.target, e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
