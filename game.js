// Game State
let gameState = {
    selectedBusiness: null,
    cash: 0,
    revenue: 100,
    month: 1,
    gameStarted: false,
    roadOffset: 0,
    cardsThisMonth: 0, // Track cards encountered this month
    maxCardsPerMonth: 2, // 2 cards = 1 month
    // Game progression
    targetCash: 1000, // Win condition: reach $1000
    maxMonths: 12, // Game over after 12 months if target not reached
    gameEnded: false,
    // Pause system
    paused: false
};

// Performance optimization variables
let animationId = null;
let lastTime = 0;
const targetFPS = 30; // Lower FPS for mobile (was 60)
const frameTime = 1000 / targetFPS;
let deltaTime = 0;
let currentTime = 0;

// Player sprite
let playerSprite = null;

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function initPlayerSprite() {
    if (!gameState.selectedBusiness) return;
    
    const characterConfig = gameState.selectedBusiness.character;
    
    playerSprite = new Sprite({
        src: characterConfig.src,
        frameWidth: characterConfig.frameWidth,
        frameHeight: characterConfig.frameHeight,
        frameSpeed: 4, // Faster animation - lower number = faster
        scale: characterConfig.scale,
        frames: characterConfig.frames
    });
}

// Business Selection
function generateBusinessCards() {
    const grid = document.getElementById('businessGrid');
    grid.innerHTML = '';
    
    Object.entries(BUSINESS_TYPES).forEach(([id, business]) => {
        const card = document.createElement('div');
        card.className = 'business-card';
        card.onclick = () => selectBusiness(id);
        card.innerHTML = `
            <div class="business-icon">${business.icon}</div>
            <div class="business-name">${business.name}</div>
            <div class="business-desc">${business.description}</div>
        `;
        grid.appendChild(card);
    });
}

function selectBusiness(businessId) {
    gameState.selectedBusiness = BUSINESS_TYPES[businessId];
    gameState.revenue = gameState.selectedBusiness.revenue;
    
    // Show game
    document.getElementById('businessSelection').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('gameUI').style.display = 'block';
    document.getElementById('backButton').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'block';
    
    // Update UI
    updateUI();
    
    // Start background music
    startBackgroundMusic();
    
    // Start game
    initCanvas();
    initPlayerSprite();
    initBackgroundDecorations();
    initGameCards(); // Initialize card system
    initMoneySystem(); // Initialize money system
    gameState.gameStarted = true;
    
    // Start optimized game loop
    lastTime = performance.now();
    gameLoop(lastTime);
}

function goBack() {
    cleanup();
    gameState.gameStarted = false;
    
    // Stop background music
    stopBackgroundMusic();
    
    backgroundDecorations = [];
    resetCardSystem(); // Reset card system
    resetMoneySystem(); // Reset money system
    
    gameState = {
        selectedBusiness: null,
        cash: 0,
        revenue: 100,
        month: 1,
        gameStarted: false,
        roadOffset: 0,
        cardsThisMonth: 0,
        maxCardsPerMonth: 2,
        targetCash: 1000,
        maxMonths: 12,
        gameEnded: false,
        paused: false
    };
    
    document.getElementById('businessSelection').style.display = 'flex';
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'none';
}

// FIX: Function to go back from pause screen
function goBackFromPause() {
    // Hide pause screen first
    hidePauseScreen();
    
    // Reset pause state
    gameState.paused = false;
    
    // Then go back to menu
    goBack();
}

// FIX: Function to go back from end game screens
function goBackFromEnd() {
    // Hide popup first
    document.getElementById('cardPopup').style.display = 'none';
    
    // Reset popup content to default
    document.getElementById('cardDescription').textContent = 'You encountered a business opportunity!';
    const popupButtons = document.querySelector('.popup-buttons');
    popupButtons.innerHTML = `<button onclick="closePopup()" class="popup-btn">Continue</button>`;
    
    // Then call the regular goBack function
    goBack();
}

function updateUI() {
    document.getElementById('businessType').textContent = gameState.selectedBusiness.name;
    document.getElementById('cash').textContent = gameState.cash;
    document.getElementById('month').textContent = gameState.month;
    document.getElementById('revenue').textContent = gameState.revenue;
}

// OPTIMIZED UPDATE FUNCTION
function update() {
    if (!gameState.gameStarted || gameState.paused) return;
    
    // Update road animation with delta time normalization
    const deltaMultiplier = deltaTime / 16.67; // Normalize to 60fps baseline
    gameState.roadOffset += GAME_SPEED * deltaMultiplier;
    if (gameState.roadOffset > 1.0) {
        gameState.roadOffset -= 1.0;
    }
    
    // Update sprite animation on every frame for smooth running
    if (playerSprite) {
        playerSprite.update();
    }
    
    // Update background decorations
    updateBackgroundDecorations(deltaMultiplier);
    
    // Update game cards
    updateGameCards(deltaMultiplier);
    
    // Update money system
    updateMoneySystem(deltaMultiplier);
}

// OPTIMIZED DRAW FUNCTION
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Always draw the basic scene
    if (gameState.selectedBusiness) {
        drawSky();
        drawGround();
        drawBackgroundDecorations(); // Now properly positioned roadside decorations
        drawRoad();
        drawMoneySystem(); // Draw money pickups FIRST (behind cards)
        drawGameCards(); // Draw cards SECOND (in front of money)
        drawPlayer();
    }
}

// OPTIMIZED GAME LOOP
function gameLoop(timestamp) {
    animationId = requestAnimationFrame(gameLoop);
    
    currentTime = timestamp;
    deltaTime = timestamp - lastTime;
    
    // Skip frame if not enough time has passed
    if (deltaTime < frameTime) {
        return;
    }
    
    // Update time for next frame
    lastTime = timestamp - (deltaTime % frameTime);
    
    // Always run update and draw when game is active
    update();
    draw();
}

// CLEANUP FUNCTION
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function togglePause() {
    if (gameState.gameEnded) return;
    
    gameState.paused = !gameState.paused;
    
    if (gameState.paused) {
        // Pause background music
        if (audioSettings.musicEnabled) {
            stopBackgroundMusic();
        }
        // Show pause overlay
        showPauseScreen();
    } else {
        // Resume background music if enabled
        if (audioSettings.musicEnabled) {
            startBackgroundMusic();
        }
        // Hide pause overlay
        hidePauseScreen();
    }
    
    console.log('Game', gameState.paused ? 'paused' : 'resumed');
}

function showPauseScreen() {
    // Show pause popup
    document.getElementById('cardPopup').style.display = 'flex';
    document.getElementById('cardDescription').innerHTML = `
        <h2 style="color: #FF9800; margin-bottom: 15px;">⏸️ GAME PAUSED</h2>
        <p>Game is paused. Click Resume to continue.</p>
        <p><strong>Current Cash: ${gameState.cash}</strong></p>
        <p><strong>Month: ${gameState.month}</strong></p>
        <p><strong>Goal: ${gameState.targetCash}</strong></p>
    `;
    
    // Change button to resume - FIX: Use goBackFromPause instead of goBack
    const popupButtons = document.querySelector('.popup-buttons');
    popupButtons.innerHTML = `
        <button onclick="togglePause()" class="popup-btn" style="background: #4CAF50;">▶️ Resume</button>
        <button onclick="goBackFromPause()" class="popup-btn" style="background: #e74c3c;">🏠 Main Menu</button>
    `;
}

function hidePauseScreen() {
    document.getElementById('cardPopup').style.display = 'none';
    
    // Restore original popup content
    document.getElementById('cardDescription').textContent = 'You encountered a business opportunity!';
    const popupButtons = document.querySelector('.popup-buttons');
    popupButtons.innerHTML = `<button onclick="closePopup()" class="popup-btn">Continue</button>`;
}

// Mobile-specific optimizations
function initMobileOptimizations() {
    if (isMobile) {
        // Reduce canvas resolution on very high DPI screens
        const pixelRatio = window.devicePixelRatio || 1;
        if (pixelRatio > 2) {
            const scale = 0.75;
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
            canvas.width = Math.floor(canvas.width * scale);
            canvas.height = Math.floor(canvas.height * scale);
            ctx.scale(scale, scale);
        }
        
        // Use CSS to ensure crisp rendering
        canvas.style.imageRendering = 'crisp-edges';
        canvas.style.imageRendering = 'pixelated';
        
        console.log('Mobile optimizations applied');
    }
}

// Initialize
window.addEventListener('resize', () => {
    if (gameState.gameStarted) {
        initCanvas();
        if (isMobile) {
            initMobileOptimizations();
        }
    }
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
        if (gameState.gameStarted && !gameState.gameEnded) {
            togglePause();
        }
    }
});

// Touch controls for mobile with throttling
let touchThrottle = false;
canvas.addEventListener('touchstart', (e) => {
    if (touchThrottle) return;
    touchThrottle = true;
    
    e.preventDefault();
    if (!gameState.gameStarted || gameState.paused || gameState.gameEnded) {
        touchThrottle = false;
        return;
    }
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touching a card (simple collision detection)
    if (currentCard && currentCard.z > 0 && currentCard.z < 5) {
        const { x: cardX, y: cardY, scale } = worldToScreen(currentCard.x, currentCard.z);
        const cardSize = Math.floor(150 * scale);
        
        if (Math.abs(x - cardX) < cardSize/2 && Math.abs(y - cardY) < cardSize/2) {
            hitCard();
        }
    }
    
    setTimeout(() => { touchThrottle = false; }, 100);
}, { passive: false });

// Double tap to pause on mobile
let lastTouchTime = 0;
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touchTime = new Date().getTime();
    const tapLength = touchTime - lastTouchTime;
    
    if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        if (gameState.gameStarted && !gameState.gameEnded) {
            togglePause();
        }
    }
    lastTouchTime = touchTime;
}, { passive: false });

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

window.addEventListener('load', () => {
    generateBusinessCards();
    initCanvas();
    initMobileOptimizations();
});