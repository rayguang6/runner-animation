// === AUDIO SYSTEM ===

// Audio settings
let audioSettings = {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.5,
    musicVolume: 0.2
};

const audioFiles = {
    card: new Audio('audio/card.mp3'),
    cash: new Audio('audio/cash.mp3'),
    bg: new Audio('audio/bg.mp3'),
};

// Set initial volumes
function updateAudioVolumes() {
    audioFiles.card.volume = audioSettings.soundEnabled ? audioSettings.soundVolume : 0;
    audioFiles.cash.volume = audioSettings.soundEnabled ? audioSettings.soundVolume : 0;
    audioFiles.bg.volume = audioSettings.musicEnabled ? audioSettings.musicVolume : 0;
}

updateAudioVolumes();
audioFiles.bg.loop = true;

// Play a sound by name
function playSound(name) {
    if (!audioSettings.soundEnabled) return;
    
    const sound = audioFiles[name];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

// Start background music
function startBackgroundMusic() {
    if (!audioSettings.musicEnabled) return;
    
    if (audioFiles.bg.paused) {
        audioFiles.bg.currentTime = 0;
        audioFiles.bg.play().catch(e => console.log('Background music failed:', e));
    }
}

// Stop background music
function stopBackgroundMusic() {
    if (!audioFiles.bg.paused) {
        audioFiles.bg.pause();
        audioFiles.bg.currentTime = 0;
    }
}

// Audio control functions
function toggleSound() {
    audioSettings.soundEnabled = !audioSettings.soundEnabled;
    updateAudioVolumes();
    updateSoundButton();
    console.log('Sound effects:', audioSettings.soundEnabled ? 'ON' : 'OFF');
}

function toggleMusic() {
    audioSettings.musicEnabled = !audioSettings.musicEnabled;
    updateAudioVolumes();
    updateMusicButton();
    
    if (!audioSettings.musicEnabled) {
        stopBackgroundMusic();
    } else if (gameState && gameState.gameStarted && !gameState.paused) {
        startBackgroundMusic();
    }
    console.log('Background music:', audioSettings.musicEnabled ? 'ON' : 'OFF');
}

function updateSoundButton() {
    const button = document.getElementById('soundToggle');
    if (button) {
        if (audioSettings.soundEnabled) {
            button.textContent = '🔊 Sound';
            button.style.background = '#4CAF50';
            button.style.textDecoration = 'none';
        } else {
            button.textContent = '🔇 Sound';
            button.style.background = '#757575';
            button.style.textDecoration = 'line-through';
        }
    }
}

function updateMusicButton() {
    const button = document.getElementById('musicToggle');
    if (button) {
        if (audioSettings.musicEnabled) {
            button.textContent = '🎵 Music';
            button.style.background = '#2196F3';
            button.style.textDecoration = 'none';
        } else {
            button.textContent = '🔇 Music';
            button.style.background = '#757575';
            button.style.textDecoration = 'line-through';
        }
    }
}

function setSoundVolume(volume) {
    audioSettings.soundVolume = Math.max(0, Math.min(1, volume));
    updateAudioVolumes();
}

function setMusicVolume(volume) {
    audioSettings.musicVolume = Math.max(0, Math.min(1, volume));
    updateAudioVolumes();
}

console.log('Audio system loaded with controls'); 