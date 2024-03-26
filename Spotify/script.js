console.log("Javascript");
let currentsong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
  // Ensure the input is a non-negative number
  seconds = Math.max(0, seconds);

  // Calculate minutes and remaining seconds
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  // Add leading zeros if necessary
  var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  var formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  // Return the formatted time string
  return formattedMinutes + ":" + formattedSeconds;
}

// Example usage:
var totalSeconds = 75;
var formattedTime = formatTime(totalSeconds);
// console.log(formattedTime);  // Output: "01:15"

async function getsongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  if (!a.ok) {
    console.error(`Error: Default file not found for folder ${folder}`);
    return;
  }
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currfolder}/`)[1]);
    }
  }
  //show all the songs as playlist
  // Make sure that ".songlist" exists and contains at least one <ul> element
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  if (!songUL) {
    console.error("Error: Element with class 'songlist' or <ul> not found.");
    return;
  }

  for (const song of songs) {
    songUL.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li> `;
  }
  //attach an event listner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playmusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentsong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontainer");
  let array = Array.from(anchors);
  
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = encodeURIComponent(e.href.split("/").slice(-2)[1]);
      console.log(e.href.split("/").slice(-2)[1])
  
      let folderEncoded = encodeURIComponent(folder);
      let url = `/songs/${folderEncoded}/info.json`;
      console.log("Fetching URL:", url);
      let a = await fetch(url);
      // Get the metadata of the folder

      let infoResponse = await fetch(`songs/${folder}/info.json`);
      
      let infoData = await infoResponse.json();
      
      cardcontainer.innerHTML +=
        `<div data-folder="/songs/" class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" role="img">
                <circle cx="30" cy="30" r="29" fill="#1fdf64" stroke="#000000" stroke-width="1.5" />
                <g transform="translate(24, 23) scale(1.5)">
                  <path d="M0 0L10 5L0 10V0Z" fill="#000000" />
                </g>
              </svg> 
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${infoData.title}</h2>
            <p>${infoData.description}</p>
        </div>`;
    }
  }
  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0]);
    });
  });
}
async function main() {
  //Get the list of all the songs
  songs = await getsongs("songs/ncs");
  playmusic(songs[0], true);
  //Display all the albums
  displayAlbums();
  // attach an event listner to play,next and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });
  //Listen for timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    // console.log(currentsong.currentTime , currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentsong.currentTime
    )} / ${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });
  //add eventlistner to seekbar drag
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // console.log(e.offsetX)
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });
  
  //Add an Hamburger EL
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  
  //add an EL for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  
  //previous and next
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });
  
  next.addEventListener("click", () => {
    currentsong.pause();
    console.log("next clicked");
  
    let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });
  
  // for volume
  document.querySelector(".range").getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Set volume to", e.target.value, "/100");
      currentsong.volume = parseInt(e.target.value) / 100;
      if (currentsong.volume > 0){
        document.querySelector(".volume>img").src =  document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
      }
    });
  
  //Mute
  document.querySelector(".volume>img").addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg","volume.svg")
        currentsong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })
}
main();

