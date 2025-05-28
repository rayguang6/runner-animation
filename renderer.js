// === MOBILE-SCALE SPRITE SYSTEM ===
class Sprite {
    constructor(config) {
        this.image = new Image();
        this.image.src = config.src;
        this.isLoaded = false;
        
        this.image.onload = () => {
            this.isLoaded = true;
            this.createScaledFrames();
            console.log('Sprite loaded and scaled');
        };
        
        // Animation frames - now configurable
        this.frames = config.frames || [[1,2], [0,2], [3,2], [0,2]];
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.frameSpeed = config.frameSpeed || 8;
        
        this.frameWidth = config.frameWidth || 32;
        this.frameHeight = config.frameHeight || 32;
        this.scale = config.scale || 20;
        
        // Pre-scaled frame storage
        this.scaledFrames = [];
    }

    createScaledFrames() {
        this.scaledFrames = [];
        
        this.frames.forEach(([frameX, frameY]) => {
            const frameCanvas = document.createElement('canvas');
            const frameCtx = frameCanvas.getContext('2d');
            
            frameCanvas.width = this.frameWidth * this.scale;
            frameCanvas.height = this.frameHeight * this.scale;
            
            frameCtx.imageSmoothingEnabled = false;
            frameCtx.webkitImageSmoothingEnabled = false;
            frameCtx.mozImageSmoothingEnabled = false;
            frameCtx.msImageSmoothingEnabled = false;
            
            frameCtx.drawImage(
                this.image,
                frameX * this.frameWidth, frameY * this.frameHeight,
                this.frameWidth, this.frameHeight,
                0, 0,
                this.frameWidth * this.scale, this.frameHeight * this.scale
            );
            
            this.scaledFrames.push(frameCanvas);
        });
    }

    update() {
        if (!this.isLoaded) return;
        
        this.frameCounter++;
        if (this.frameCounter >= this.frameSpeed) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
    }

    draw(ctx, x, y) {
        if (!this.isLoaded || this.scaledFrames.length === 0) return false;

        const frameCanvas = this.scaledFrames[this.currentFrame];
        const drawWidth = this.frameWidth * this.scale;
        const drawHeight = this.frameHeight * this.scale;
        
        ctx.drawImage(
            frameCanvas,
            Math.floor(x - drawWidth/2), 
            Math.floor(y - drawHeight)
        );

        return true;
    }
}

// === OPTIMIZED LANDSCAPE DECORATION SYSTEM ===
let backgroundDecorations = [];

// Object pooling for decorations
const decorationPool = [];
const MAX_POOL_SIZE = 30;

function getDecorationFromPool() {
    if (decorationPool.length > 0) {
        return decorationPool.pop();
    }
    return {};
}

function returnDecorationToPool(decoration) {
    if (decorationPool.length < MAX_POOL_SIZE) {
        decorationPool.push(decoration);
    }
}

function initBackgroundDecorations() {
    backgroundDecorations = [];
    
    if (!gameState.selectedBusiness || !gameState.selectedBusiness.background || !gameState.selectedBusiness.background.decorations) {
        return;
    }
    
    // Reduce decoration count on mobile
    const maxDecorations = isMobile ? 8 : 15;
    
    // Create initial decorations with varied positioning
    for (let i = 0; i < maxDecorations; i++) {
        const distance = Math.random() * 4 + 1; // 1 to 5 units away
        spawnDecoration(distance);
    }
}

function spawnDecoration(z = 4) {
    if (!gameState.selectedBusiness || !gameState.selectedBusiness.background || !gameState.selectedBusiness.background.decorations) {
        return;
    }
    
    // Limit max decorations
    const maxDecorations = isMobile ? 8 : 15;
    if (backgroundDecorations.length >= maxDecorations) {
        return;
    }
    
    const decorationEmojis = gameState.selectedBusiness.background.decorations;
    const randomEmoji = decorationEmojis[Math.floor(Math.random() * decorationEmojis.length)];
    
    // Reuse decoration from pool
    const newDecoration = getDecorationFromPool();
    
    // Set properties
    const side = Math.random() > 0.5 ? 1 : -1;
    const sideDistance = Math.random() * 3.0 + 1.0;
    
    newDecoration.emoji = randomEmoji;
    newDecoration.x = sideDistance * side;
    newDecoration.z = z;
    newDecoration.size = Math.random() * 0.4 + 0.6;
    newDecoration.bobOffset = Math.random() * Math.PI * 2;
    
    backgroundDecorations.push(newDecoration);
}

function updateBackgroundDecorations(deltaMultiplier = 1) {
    if (!gameState.gameStarted) return;
    
    // Update existing decorations
    for (let i = backgroundDecorations.length - 1; i >= 0; i--) {
        const decoration = backgroundDecorations[i];
        decoration.z -= GAME_SPEED * 2.5 * deltaMultiplier;
        
        // Only update bob for visible decorations
        if (decoration.z > 0 && decoration.z < 6) {
            decoration.bobOffset += 0.015 * deltaMultiplier;
        }
        
        // Remove decorations that are behind player
        if (decoration.z <= -0.5) {
            returnDecorationToPool(decoration);
            backgroundDecorations.splice(i, 1);
        }
    }
    
    // Spawn new decorations less frequently on mobile
    const spawnRate = isMobile ? 0.008 : 0.015;
    
    if (Math.random() < spawnRate) {
        spawnDecoration(Math.random() * 2 + 4);
    }
}

function drawBackgroundDecorations() {
    if (backgroundDecorations.length === 0) return;
    
    // Pre-calculate visible bounds
    const leftBound = -100;
    const rightBound = canvas.width + 100;
    
    // Set common properties once
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Draw visible decorations
    for (let decoration of backgroundDecorations) {
        if (decoration.z <= 0 || decoration.z > 6) continue;
        
        const { x, y, scale } = worldToScreen(decoration.x, decoration.z);
        
        // Skip off-screen decorations
        if (x < leftBound || x > rightBound) continue;
        
        const emojiSize = Math.floor(120 * scale * decoration.size);
        
        if (emojiSize > 15) {
            const alpha = Math.min(1, Math.max(0.6, scale * 2));
            const bobAmount = Math.sin(decoration.bobOffset) * 2 * scale;
            
            ctx.globalAlpha = alpha;
            ctx.font = `${emojiSize}px Arial`;
            ctx.fillText(decoration.emoji, Math.floor(x), Math.floor(y + bobAmount));
        }
    }
    
    ctx.restore();
}

// Canvas and 3D Rendering
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function initCanvas() {
    // Set canvas size to window size first
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Disable image smoothing for pixel art
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
}

function getVanishingPoint() {
    return {
        x: canvas.width / 2,
        y: canvas.height * 0.4
    };
}

function getRoadWidth() {
    return canvas.width * 0.6;
}

function worldToScreen(worldX, worldZ) {
    const scale = 1 / (1 + worldZ * 2);
    const vanishing = getVanishingPoint();
    const roadWidthAtZ = getRoadWidth() * scale;
    
    const screenX = vanishing.x + worldX * roadWidthAtZ / 3;
    const screenY = vanishing.y + (canvas.height - vanishing.y) * scale;
    
    return { x: screenX, y: screenY, scale: scale };
}

function drawSky() {
    const theme = gameState.selectedBusiness;
    const horizon = canvas.height * 0.4;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
    gradient.addColorStop(0, theme.skyColor1);
    gradient.addColorStop(1, theme.skyColor2);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, horizon);
}

function drawGround() {
    const horizon = canvas.height * 0.4;
    const theme = gameState.selectedBusiness;
    const groundColor = theme.background ? theme.background.groundColor : '#4A4A4A';
    
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, horizon, canvas.width, canvas.height - horizon);
}

// OPTIMIZED ROAD DRAWING
function drawRoad() {
    const vanishing = getVanishingPoint();
    const roadWidth = getRoadWidth();
    const theme = gameState.selectedBusiness;
    
    ctx.save();
    
    // Road surface
    ctx.fillStyle = theme.roadColor;
    ctx.beginPath();
    ctx.moveTo(vanishing.x - 30, vanishing.y);
    ctx.lineTo(vanishing.x + 30, vanishing.y);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height);
    ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Road edges - single path
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(vanishing.x - 30, vanishing.y);
    ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height);
    ctx.moveTo(vanishing.x + 30, vanishing.y);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height);
    ctx.stroke();
    
    // Center line dashes - draw fewer on mobile
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    const dashCount = isMobile ? 5 : 8;
    for (let i = 0; i < dashCount; i++) {
        let dashZ = 1.5 - ((gameState.roadOffset * 4 + i * 0.4) % 2.0);
        
        if (dashZ >= 0 && dashZ <= 1.5) {
            const start = worldToScreen(0, dashZ);
            const end = worldToScreen(0, Math.max(0, dashZ - 0.15));
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
        }
    }
    ctx.stroke();
    
    ctx.restore();
}

function drawPlayer() {
    const { x, y } = worldToScreen(0, 0);
    
    // Mobile-scale shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    const shadowSize = 32 * 10;
    ctx.fillRect(Math.floor(x - shadowSize/2), Math.floor(y + 20), shadowSize, 40);
    
    // Draw sprite
    if (playerSprite && playerSprite.isLoaded) {
        playerSprite.draw(ctx, x, y);
    } else {
        // Large fallback
        const size = 32 * 10;
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(Math.floor(x - size/2), Math.floor(y - size), size, size);
        ctx.fillStyle = '#F39C12';
        ctx.fillRect(Math.floor(x - size/3), Math.floor(y - size * 1.2), size * 0.66, size * 0.4);
    }
}