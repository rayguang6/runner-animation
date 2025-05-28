// === SIMPLE CARD SYSTEM ===
let currentCard = null; // Just one card at a time

// Simple image loading for cards
let cardImage = null;

const CARD_TYPES = ['card1', 'card2', 'card3', 'card4'];
const cardImages = {};

function loadCardImages() {
    CARD_TYPES.forEach(type => {
        const img = new Image();
        img.src = `images/cards/${type}.png`;
        cardImages[type] = img;
    });
}

let isFirstCard = true;

function getRandomCardType() {
    return CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
}

function initGameCards() {
    currentCard = null;
    isFirstCard = true;
    loadCardImages();
    cardImage = new Image();
    cardImage.src = 'images/card.png';
    cardImage.onload = () => {
        console.log('Fallback card image loaded successfully');
    };
    cardImage.onerror = () => {
        console.log('Failed to load fallback card image, will use emoji fallback');
        cardImage = null;
    };
    spawnCard(getRandomCardType());
    console.log('Card system initialized');
}

function spawnCard(type) {
    // First card far, others close
    let spawnDistance = isFirstCard ? 6 : 3.5;
    isFirstCard = false;
    // Check if there's money too close and find a safe distance
    let safeToSpawn = false;
    while (!safeToSpawn && spawnDistance < 12) {
        safeToSpawn = true;
        for (let money of moneyObjects) {
            if (Math.abs(money.z - spawnDistance) < 2.0) {
                safeToSpawn = false;
                break;
            }
        }
        if (!safeToSpawn) {
            spawnDistance += 0.5;
        }
    }
    const cardType = type || getRandomCardType();
    currentCard = {
        z: spawnDistance,
        type: cardType,
        x: 0
    };
    console.log(`New card spawned at distance ${spawnDistance} with type ${cardType}`);
}

function updateGameCards(deltaMultiplier = 1) {
    if (!gameState.gameStarted || !currentCard) return;
    
    // Move card toward player with delta time adjustment
    currentCard.z -= GAME_SPEED * 2.5 * deltaMultiplier;
    
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
    const { x, y, scale } = worldToScreen(currentCard.x, currentCard.z);
    const cardSize = Math.floor(300 * scale);
    if (cardSize > 10) {
        // Try to use the type-specific image
        let img = cardImages[currentCard.type];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
                img,
                x - cardSize/2,
                y - cardSize,
                cardSize,
                cardSize * 1.4
            );
        } else if (cardImage && cardImage.complete && cardImage.naturalWidth > 0) {
            // Fallback to default card image
            ctx.drawImage(
                cardImage,
                x - cardSize/2,
                y - cardSize,
                cardSize,
                cardSize * 1.4
            );
        } else {
            // Fallback to emoji
            ctx.font = `${cardSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText('🃏', x, y);
        }
    }
}

function resetCardSystem() {
    currentCard = null;
    isFirstCard = true;
}

// 🎯 EASY SPAWNING FUNCTIONS - Add these to spawn cards easily!

// Spawn a card at specific distance and type
function spawnCardAt(distance = 3.5, type) {
    const cardType = type || getRandomCardType();
    currentCard = {
        z: distance,
        type: cardType,
        x: 0
    };
    isFirstCard = false;
    console.log(`Card spawned at distance ${distance} with type ${cardType}`);
}

// Check if there's currently a card
function hasCard() {
    return currentCard !== null;
}