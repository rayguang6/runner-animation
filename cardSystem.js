// === SIMPLE CARD SYSTEM ===
let currentCard = null; // Just one card at a time

// Simple image loading for cards
let cardImage = null;

function initGameCards() {
    currentCard = null;
    
    // Load card image
    cardImage = new Image();
    cardImage.src = 'images/card.png';
    cardImage.onload = () => {
        console.log('Card image loaded successfully');
    };
    cardImage.onerror = () => {
        console.log('Failed to load card image, will use emoji fallback');
        cardImage = null;
    };
    
    spawnCard();
    console.log('Card system initialized');
}

function spawnCard() {
    // 🎯 FASTER ENGAGEMENT: Check for money conflicts before spawning card
    let spawnDistance = 3; // Start at distance 3 (was 4) - much closer!
    
    // Check if there's money too close and find a safe distance
    let safeToSpawn = false;
    while (!safeToSpawn && spawnDistance < 4) { // Reduced max distance from 10 to 8
        safeToSpawn = true;
        
        // Check all money objects
        for (let money of moneyObjects) {
            if (Math.abs(money.z - spawnDistance) < 2.0) { // Reduced from 2.5 to 2.0 for closer spacing
                safeToSpawn = false;
                break;
            }
        }
        
        if (!safeToSpawn) {
            spawnDistance += 0.5; // Even smaller jumps (was 1.0) for precise positioning
        }
    }
    
    currentCard = {
        z: spawnDistance, // Spawn at safe distance
        type: 'business' // Simple for now
    };
    console.log(`New card spawned at distance ${spawnDistance}`);
}

function updateGameCards() {
    if (!gameState.gameStarted || !currentCard) return;
    
    // Move card toward player
    currentCard.z -= GAME_SPEED * 2.5;
    
    // Check collision
    if (currentCard.z <= 0.2) {
        hitCard(); // Trigger game logic
        currentCard = null; // Remove current card
        
        // Don't spawn immediately - let the popup system handle it
        console.log('Card hit, waiting for popup to close');
    }
}

function drawGameCards() {
    if (!currentCard || currentCard.z <= 0) return;
    
    const { x, y, scale } = worldToScreen(0, currentCard.z); // Always center of road
    
    // 🎯 HOW TO CONTROL SIZE: Change this number to make cards bigger/smaller
    const cardSize = Math.floor(300 * scale); // 150 = bigger size! (was 100)
    
    if (cardSize > 10) {
        if (cardImage && cardImage.complete) {
            // Use the card image
            ctx.drawImage(
                cardImage,
                x - cardSize/2,
                y - cardSize,
                cardSize,
                cardSize * 1.4 // Make it taller like a card
            );
        } else {
            // Simple emoji fallback - no complex drawing!
            ctx.font = `${cardSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('🃏', x, y);
        }
    }
}

function resetCardSystem() {
    currentCard = null;
}

// 🎯 EASY SPAWNING FUNCTIONS - Add these to spawn cards easily!

// Spawn a card at specific distance
function spawnCardAt(distance = 4) {
    currentCard = {
        z: distance, // How far away to spawn
        type: 'business'
    };
    console.log(`Card spawned at distance ${distance}`);
}

// Check if there's currently a card
function hasCard() {
    return currentCard !== null;
} 