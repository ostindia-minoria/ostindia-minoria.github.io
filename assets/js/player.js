document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeBar = document.getElementById('volume-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const currentTrackEl = document.getElementById('current-track');
    const trackListEl = document.getElementById('track-list');
    
    // Плейлист с треками
    const tracks = [
        { 
            title: "НАВАЛЬНЫЙ ЛЕХА УУУУ", 
            artist: " ",
            src: "assets/music/track1.mp3",
            duration: "3:45"
        },
        { 
            title: "рэп фортнайт трэшер америка 2017", 
            artist: "канье восточная европа",
            src: "assets/music/track2.mp3",
            duration: "4:20"
        }
    ];
    
    let currentTrackIndex = 0;
    let isPlaying = false;
    
    // Создание плейлиста
    function createPlaylist() {
        trackListEl.innerHTML = '';
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.dataset.index = index;
            
            li.innerHTML = `
                <span class="track-title">${track.title}</span>
                <span class="track-artist">${track.artist}</span>
                <span class="track-duration">${track.duration}</span>
            `;
            
            li.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                playTrack();
            });
            
            trackListEl.appendChild(li);
        });
    }
    
    // Загрузка трека
    function loadTrack(index) {
        const track = tracks[index];
        audioPlayer.src = track.src;
        currentTrackEl.textContent = `${track.title} - ${track.artist}`;
        
        // Обновление активного трека в плейлисте
        document.querySelectorAll('#track-list li').forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Воспроизведение
    function playTrack() {
        audioPlayer.play();
        isPlaying = true;
        playBtn.textContent = "⏸";
        playBtn.title = "Пауза";
    }
    
    // Пауза
    function pauseTrack() {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.textContent = "▶";
        playBtn.title = "Воспроизвести";
    }
    
    // Следующий трек
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        playTrack();
    }
    
    // Предыдущий трек
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        playTrack();
    }
    
    // Обновление прогресс-бара
    function updateProgress() {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = percent || 0;
        
        // Форматирование времени
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
    
    // Форматирование времени (мм:сс)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Перемотка
    function setProgress() {
        const percent = progressBar.value;
        audioPlayer.currentTime = (percent / 100) * audioPlayer.duration;
    }
    
    // Регулировка громкости
    function setVolume() {
        audioPlayer.volume = volumeBar.value / 100;
    }
    
    // Инициализация
    function initPlayer() {
        createPlaylist();
        loadTrack(currentTrackIndex);
        
        // Установка громкости
        audioPlayer.volume = volumeBar.value / 100;
    }
    
    // Обработчики событий
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    });
    
    nextBtn.addEventListener('click', nextTrack);
    prevBtn.addEventListener('click', prevTrack);
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextTrack);
    
    progressBar.addEventListener('input', setProgress);
    volumeBar.addEventListener('input', setVolume);
    
    // Инициализация плеера
    initPlayer();
});