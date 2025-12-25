// 1. PASTE YOUR API KEY HERE
const API_KEY = 'AIzaSyCs9FJ61xogd3ZVVn_kUHA6LSHxyKcutDE'; 
const GRID = document.getElementById('video-grid');

// GLOBAL VARIABLES
let nextPageToken = '';
let isLoading = false;
let currentQuery = '';

// --- INITIALIZATION ---
// Check if we are on the Home Page or Settings Page
if (GRID) {
    // We are on Home Page
    fetchVideos(); 
    applySavedTheme();
    
    // INFINITE SCROLL LISTENER
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            fetchVideos(currentQuery, true);
        }
    });
} else {
    // We are on Settings Page
    applySavedTheme();
}

// --- FETCH VIDEOS (With Infinite Support) ---
async function fetchVideos(query = '', isNextPage = false) {
    if (isLoading) return;
    isLoading = true;
    
    // Show spinner if loading next page
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');

    currentQuery = query;
    const searchQuery = query ? `${query} Mundari song` : 'New Mundari Song 2025';
    
    // Construct URL with Page Token if scrolling
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchQuery}&type=video&key=${API_KEY}`;
    if (isNextPage && nextPageToken) {
        url += `&pageToken=${nextPageToken}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            nextPageToken = data.nextPageToken || ''; // Save token for next scroll
            displayVideos(data.items);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
    isLoading = false;
    if (spinner) spinner.classList.add('hidden');
}

// --- DISPLAY VIDEOS ---
function displayVideos(videos) {
    videos.forEach(video => {
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const thumb = video.snippet.thumbnails.high.url;
        const videoId = video.id.videoId;

        const card = document.createElement('div');
        card.classList.add('video-card');

        card.innerHTML = `
            <div class="thumb-box" onclick="playVideo(this, '${videoId}', '${title.replace(/'/g, "")}', '${thumb}')">
                <img src="${thumb}" class="thumb-img" alt="${title}">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="details">
                <div class="title">${title}</div>
                <div class="channel">${channel}</div>
                <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="watch-btn">
                    <i class="fas fa-external-link-alt"></i> Watch on App
                </a>
            </div>
        `;
        GRID.appendChild(card);
    });
}

// --- PLAY VIDEO & SAVE HISTORY (FIXED) ---
function playVideo(element, videoId, title, thumb) {
    // 1. Save to History
    saveToHistory(videoId, title, thumb);

    // 2. Play Video
    // FIXED: Added 'position: absolute; top: 0; left: 0;' to make it fit perfectly
    element.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0" 
            allow="autoplay; encrypted-media; picture-in-picture" 
            allowfullscreen
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
        </iframe>
    `;
}

function searchMundari() {
    const query = document.getElementById('searchInput').value;
    GRID.innerHTML = ''; // Clear current videos
    nextPageToken = ''; // Reset scroll
    fetchVideos(query);
}

// --- HISTORY SYSTEM ---
function saveToHistory(id, title, thumb) {
    let history = JSON.parse(localStorage.getItem('mundariHistory')) || [];
    
    // Avoid duplicates: Remove if already exists, then add to top
    history = history.filter(item => item.id !== id);
    history.unshift({ id, title, thumb });
    
    // Limit to 20 items
    if (history.length > 20) history.pop();
    
    localStorage.setItem('mundariHistory', JSON.stringify(history));
}

function loadHistory() {
    const historyList = document.getElementById('history-grid');
    if (!historyList) return;

    const history = JSON.parse(localStorage.getItem('mundariHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; color:#777;">No videos watched yet.</p>';
        return;
    }

    historyList.innerHTML = '';
    history.forEach(vid => {
        historyList.innerHTML += `
            <div class="history-item">
                <img src="${vid.thumb}" class="history-thumb">
                <div class="history-title">
                    <a href="https://www.youtube.com/watch?v=${vid.id}" target="_blank" style="color:var(--text); text-decoration:none;">
                        ${vid.title}
                    </a>
                </div>
            </div>
        `;
    });
}

function clearHistory() {
    localStorage.removeItem('mundariHistory');
    loadHistory();
}

// --- THEME SYSTEM ---
function changeTheme(mode) {
    const body = document.body;
    if (mode === 'light') {
        body.classList.add('light-mode');
        localStorage.setItem('mundariThemeMode', 'light');
    } else {
        body.classList.remove('light-mode');
        localStorage.setItem('mundariThemeMode', 'dark');
    }
}

function applySavedTheme() {
    const savedMode = localStorage.getItem('mundariThemeMode');
    const selector = document.getElementById('themeSelector');
    
    if (savedMode === 'light') {
        document.body.classList.add('light-mode');
        if (selector) selector.value = 'light';
    } else {
        if (selector) selector.value = 'dark';
    }
}