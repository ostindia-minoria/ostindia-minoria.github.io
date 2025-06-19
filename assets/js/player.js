
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const progress = document.getElementById('progress');
const trackName = document.getElementById('track-name');

const tracks = ['track1.mp3'];
let current = 0;

function loadTrack(index) {
  audio.src = 'assets/music/' + tracks[index];
  trackName.textContent = tracks[index];
}
function playTrack() {
  audio.play();
  playBtn.textContent = '⏸';
}
function pauseTrack() {
  audio.pause();
  playBtn.textContent = '▶️';
}
function togglePlay() {
  if (audio.paused) playTrack();
  else pauseTrack();
}
function nextTrack() {
  current = (current + 1) % tracks.length;
  loadTrack(current);
  playTrack();
}
function prevTrack() {
  current = (current - 1 + tracks.length) % tracks.length;
  loadTrack(current);
  playTrack();
}

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

audio.addEventListener('timeupdate', () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
});

progress.addEventListener('input', () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

loadTrack(current);
