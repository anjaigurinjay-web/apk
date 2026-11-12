// ================= STATE & DATA STORAGE =================
let playlist = [];
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Elemen DOM Utama
const audio = document.getElementById('audioPlayer');
const songListEl = document.getElementById('dynamicSongList');
const favSongListEl = document.getElementById('favSongList');
const miniPlayer = document.getElementById('miniPlayer');
const miniTitle = document.getElementById('miniTitle');
const miniArtist = document.getElementById('miniArtist');
const miniPlayBtn = document.getElementById('miniPlayBtn');
const miniPlayIcon = document.getElementById('miniPlayIcon');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const fullSongTitle = document.getElementById('fullSongTitle');
const fullArtistName = document.getElementById('fullArtistName');
const progressTrack = document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const volumeSlider = document.getElementById('volumeSlider');
const favBtn = document.getElementById('favBtn');
const heartIcon = document.getElementById('heartIcon');
const searchInput = document.getElementById('searchInput');

// ================= 1. NAVIGASI MENU BAWAH =================
const navItems = document.querySelectorAll('.nav-item');
const viewPanes = document.querySelectorAll('.view-pane');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        viewPanes.forEach(v => v.classList.remove('active'));

        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');
    });
});

// ================= 2. NAVIGASI PEMUTAR FULL SCREEN =================
const playerView = document.getElementById('playerView');
const backBtn = document.getElementById('backBtn');
const openPlayerTriggers = document.querySelectorAll('[data-open-player]');

openPlayerTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
        if(playlist.length > 0) playerView.classList.add('open');
    });
});

backBtn.addEventListener('click', () => {
    playerView.classList.remove('open');
});

// ================= 3. UPLOAD FILE MP3 LOKAL =================
const mp3FileInput = document.getElementById('mp3FileInput');
mp3FileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        for (let file of files) {
            // Buat objek URL lokal untuk file audio
            const songObj = {
                title: file.name.replace(/\.[^/.]+$/, ""), // Hapus ekstensi .mp3
                artist: "Lokal Perangkat",
                url: URL.createObjectURL(file),
                isFav: false
            };
            playlist.push(songObj);
        }
        renderPlaylist();
        alert(`Berhasil menambahkan ${files.length} lagu!`);
        // Pindah otomatis ke tab Beranda
        document.querySelector('[data-target="viewHome"]').click();
    }
});

// ================= 4. RENDER DAFTAR LAGU =================
function renderPlaylist(filter = '') {
    songListEl.innerHTML = '';
    favSongListEl.innerHTML = '';

    if (playlist.length === 0) {
        songListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Belum ada lagu. Masuk ke menu <b>Tambah</b>.</p></div>`;
        favSongListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Belum ada lagu favorit.</p></div>`;
        return;
    }

    let hasHomeResults = false;
    let hasFavResults = false;

    playlist.forEach((song, index) => {
        // Filter Pencarian
        if (filter && !song.title.toLowerCase().includes(filter.toLowerCase()) && !song.artist.toLowerCase().includes(filter.toLowerCase())) {
            return;
        }

        hasHomeResults = true;
        const cardHTML = `
            <div class="song-card liquid-glass" onclick="playSong(${index})">
                <div class="mini-cover">♪</div>
                <div class="song-meta">
                    <h3 class="song-name">${song.title}</h3>
                    <p class="song-artist">${song.artist}</p>
                </div>
                <span class="song-duration">MP3</span>
            </div>
        `;
        songListEl.innerHTML += cardHTML;

        // Render tab Favorit
        if (song.isFav) {
            hasFavResults = true;
            favSongListEl.innerHTML += cardHTML;
        }
    });

    if (!hasHomeResults) {
        songListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Lagu tidak ditemukan.</p></div>`;
    }
    if (!hasFavResults) {
        favSongListEl.innerHTML = `<div class="empty-state"><p style="color: #f3e8ff; opacity: 0.7; font-size: 14px; text-align: center; padding: 40px 0;">Belum ada lagu favorit.</p></div>`;
    }
}

// Pencarian Lagu
searchInput.addEventListener('input', (e) => {
    renderPlaylist(e.target.value);
});

// ================= 5. KONTROL PEMUTAR AUDIO =================
function playSong(index) {
    currentIndex = index;
    const song = playlist[currentIndex];

    audio.src = song.url;
    audio.play().then(() => {
        isPlaying = true;
        updatePlayStateUI();
        miniPlayer.style.display = 'flex';
        
        // Update Info Tampilan
        miniTitle.textContent = song.title;
        miniArtist.textContent = song.artist;
        fullSongTitle.textContent = song.title;
        fullArtistName.textContent = song.artist;
        
        // Status Tombol Favorit
        if (song.isFav) {
            favBtn.classList.add('liked');
            heartIcon.textContent = '♥';
        } else {
            favBtn.classList.remove('liked');
            heartIcon.textContent = '♡';
        }
    }).catch(err => console.log("Gagal memutar audio:", err));
}

function togglePlayState() {
    if (playlist.length === 0) return;
    
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        if (!audio.src && playlist.length > 0) {
            playSong(0);
            return;
        }
        audio.play();
        isPlaying = true;
    }
    updatePlayStateUI();
}

function updatePlayStateUI() {
    const iconPath = isPlaying 
        ? '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>' 
        : '<path d="M8 5v14l11-7z"/>';
    
    playIcon.innerHTML = iconPath;
    miniPlayIcon.innerHTML = iconPath;
}

playBtn.addEventListener('click', togglePlayState);
miniPlayBtn.addEventListener('click', togglePlayState);

// Tombol Next & Prev
nextBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    if (isShuffle) {
        currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentIndex = (currentIndex + 1) % playlist.length;
    }
    playSong(currentIndex);
});

prevBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(currentIndex);
});

// Audio Event: Selesai Putar
audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.play();
    } else {
        nextBtn.click();
    }
});

// Update Progress Bar & Waktu
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalDurationEl.textContent = formatTime(audio.duration);
    }
});

// Klik Progress Bar untuk Lompat Waktu
progressTrack.addEventListener('click', (e) => {
    const rect = progressTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    if (audio.duration) {
        audio.currentTime = (clickX / width) * audio.duration;
    }
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Volume Slider
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Tombol Shuffle & Repeat
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
});

// ================= 6. MORPHING MENU & FAVORIT =================
const morphMenu = document.getElementById('morphMenu');
const menuTrigger = document.getElementById('menuTrigger');

menuTrigger.addEventListener('click', () => {
    morphMenu.classList.toggle('open');
});

favBtn.addEventListener('click', () => {
    if (playlist.length === 0) return;
    const currentSong = playlist[currentIndex];
    currentSong.isFav = !currentSong.isFav;
    
    if (currentSong.isFav) {
        favBtn.classList.add('liked');
        heartIcon.textContent = '♥';
    } else {
        favBtn.classList.remove('liked');
        heartIcon.textContent = '♡';
    }
    renderPlaylist(searchInput.value);
});

// ================= 7. TAB FILTER (BERANDA) =================
const tabs = document.querySelectorAll('.tab-pill[data-tab]');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('active');
            t.classList.add('liquid-glass');
        });
        tab.classList.add('active');
        tab.classList.remove('liquid-glass');
    });
});

// ================= 8. GESTURE USAP LAYAR (SWIPE NAVIGATION) =================
let touchStartX = 0;
let touchEndX = 0;

const viewsWrapper = document.querySelector('.views-wrapper');

viewsWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

viewsWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    const swipeThreshold = 50; // Minimum jarak usapan (dalam piksel) untuk memicu perpindahan
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) < swipeThreshold) return; // Abaikan jika usapan terlalu pendek

    const navList = Array.from(document.querySelectorAll('.nav-item'));
    const activeIndex = navList.findIndex(item => item.classList.contains('active'));

    if (activeIndex === -1) return;

    if (diff > 0) {
        // Usap ke Kiri -> Pindah ke tab berikutnya
        const nextIndex = (activeIndex + 1) % navList.length;
        navList[nextIndex].click();
    } else {
        // Usap ke Kanan -> Pindah ke tab sebelumnya
        const prevIndex = (activeIndex - 1 + navList.length) % navList.length;
        navList[prevIndex].click();
    }
}

// ================= 9. DAFTARKAN PWA SERVICE WORKER =================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('PWA Service Worker Berhasil Didaftarkan!'))
            .catch((err) => console.log('PWA Gagal:', err));
    });
}