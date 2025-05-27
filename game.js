// Game State
let gameState = {
    selectedBusiness: null,
    cash: 0,
    revenue: 100,
    month: 1,
    gameStarted: false,
    roadOffset: 0,
    cardsThisMonth: 0, // Track cards encountered this month
    maxCardsPerMonth: 2 // 2 cards = 1 month
};

// Player sprite
let playerSprite = null;

function initPlayerSprite() {
    if (!gameState.selectedBusiness) return;
    
    const characterConfig = gameState.selectedBusiness.character;
    
    playerSprite = new Sprite({
        src: characterConfig.src,
        frameWidth: characterConfig.frameWidth,
        frameHeight: characterConfig.frameHeight,
        frameSpeed: characterConfig.frameSpeed,
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
    
    // Update UI
    updateUI();
    
    // Start game
    initCanvas();
    initPlayerSprite();
    initBackgroundDecorations();
    initGameCards(); // Initialize card system
    initMoneySystem(); // Initialize money system
    gameState.gameStarted = true;
    gameLoop();
}

function goBack() {
    gameState.gameStarted = false;
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
        maxCardsPerMonth: 2
    };
    
    document.getElementById('businessSelection').style.display = 'flex';
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('backButton').style.display = 'none';
}

function updateUI() {
    document.getElementById('businessType').textContent = gameState.selectedBusiness.name;
    document.getElementById('cash').textContent = gameState.cash;
    document.getElementById('month').textContent = gameState.month;
    document.getElementById('revenue').textContent = gameState.revenue;
}

function update() {
    if (!gameState.gameStarted) return;
    
    // Update road animation
    gameState.roadOffset += GAME_SPEED;
    if (gameState.roadOffset > 1.0) {
        gameState.roadOffset -= 1.0;
    }
    
    // Update sprite animation
    if (playerSprite) {
        playerSprite.update();
    }
    
    // Update background decorations
    updateBackgroundDecorations();
    
    // Update game cards
    updateGameCards();
    
    // Update money system
    updateMoneySystem();
}

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

function gameLoop() {
    // Always run the loop, but only update/draw when game is started
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Initialize
window.addEventListener('resize', () => {
    if (gameState.gameStarted) {
        initCanvas();
    }
});

window.addEventListener('load', () => {
    generateBusinessCards();
    initCanvas();
});