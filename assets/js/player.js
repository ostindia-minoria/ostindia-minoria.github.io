
const tracks = [
  { title: "Track 1", file: "../assets/music/track1.mp3" }
];
let currentTrack = 0;
const audio = new Audio(tracks[currentTrack].file);
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const trackTitle = document.getElementById("track-title");
const progress = document.querySelector("progress");

function updateTrack() {
  audio.src = tracks[currentTrack].file;
  trackTitle.textContent = tracks[currentTrack].title;
  audio.play();
}

playBtn.onclick = () => audio.paused ? audio.play() : audio.pause();
prevBtn.onclick = () => {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  updateTrack();
};
nextBtn.onclick = () => {
  currentTrack = (currentTrack + 1) % tracks.length;
  updateTrack();
};
audio.ontimeupdate = () => progress.value = audio.currentTime / audio.duration;
progress.onclick = e => {
  const clickX = e.offsetX;
  const width = progress.offsetWidth;
  audio.currentTime = (clickX / width) * audio.duration;
};
audio.onended = () => nextBtn.onclick();
updateTrack();
