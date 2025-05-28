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

// === LANDSCAPE DECORATION SYSTEM ===
let backgroundDecorations = [];

function initBackgroundDecorations() {
    backgroundDecorations = [];
    
    if (!gameState.selectedBusiness || !gameState.selectedBusiness.background || !gameState.selectedBusiness.background.decorations) {
        return;
    }
    
    // Detect mobile devices and reduce decoration count
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const maxDecorations = isMobile ? 12 : 20; // Reduce from 20 to 12 on mobile
    
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
    
    const decorationEmojis = gameState.selectedBusiness.background.decorations;
    const randomEmoji = decorationEmojis[Math.floor(Math.random() * decorationEmojis.length)];
    
    // Much wider spread - can be anywhere on the landscape
    const side = Math.random() > 0.5 ? 1 : -1;
    
    // Three zones with better distribution: roadside (close), landscape (medium), horizon (far)
    const zoneRandom = Math.random();
    let sideDistance;
    let baseSize;
    
    if (zoneRandom < 0.5) { // Increased roadside probability from 0.4 to 0.5
        // Roadside zone - close to road
        sideDistance = Math.random() * 2.0 + 1.0; // Increased range: 1.0 to 3.0 units from center
        baseSize = Math.random() * 0.6 + 0.8; // 0.8 to 1.4 size
    } else if (zoneRandom < 0.8) { // Increased landscape probability from 0.7 to 0.8
        // Landscape zone - medium distance
        sideDistance = Math.random() * 3.0 + 2.0; // Increased range: 2.0 to 5.0 units from center
        baseSize = Math.random() * 0.4 + 0.6; // 0.6 to 1.0 size
    } else {
        // Horizon zone - far in the distance
        sideDistance = Math.random() * 5 + 3; // Increased range: 3 to 8 units from center
        baseSize = Math.random() * 0.3 + 0.4; // 0.4 to 0.7 size
    }
    
    const sideOffset = sideDistance * side;
    
    const newDecoration = {
        emoji: randomEmoji,
        x: sideOffset,
        z: z,
        size: baseSize,
        rotation: 0,
        bobOffset: Math.random() * Math.PI * 2,
        zone: zoneRandom < 0.5 ? 'roadside' : (zoneRandom < 0.8 ? 'landscape' : 'horizon')
    };
    
    backgroundDecorations.push(newDecoration);
}

function updateBackgroundDecorations() {
    if (!gameState.gameStarted) return;
    
    // Update existing decorations - use for loop instead of filter for better performance
    for (let i = backgroundDecorations.length - 1; i >= 0; i--) {
        const decoration = backgroundDecorations[i];
        decoration.z -= GAME_SPEED * 2.5; // Move toward player
        decoration.bobOffset += 0.015; // Gentle bobbing
        
        // Remove decorations that are behind player OR too far to the sides to be visible
        if (decoration.z <= -0.5) {
            backgroundDecorations.splice(i, 1);
            continue;
        }
        
        // Check visibility only for decorations that might be off-screen
        if (decoration.z > 0.3) {
            const { x: screenX } = worldToScreen(decoration.x, decoration.z);
            const isVisible = screenX > -200 && screenX < canvas.width + 200;
            if (!isVisible) {
                backgroundDecorations.splice(i, 1);
            }
        }
    }
    
    // Spawn new decorations more frequently for better distribution
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const spawnRate = isMobile ? 0.015 : 0.025; // Reduce spawn rate on mobile
    
    if (Math.random() < spawnRate) {
        spawnDecoration(Math.random() * 2 + 4); // Spawn between 4-6 units away
    }
}

function drawBackgroundDecorations() {
    if (backgroundDecorations.length === 0) return;
    
    // Sort by distance (far to near) for proper layering
    const sortedDecorations = [...backgroundDecorations].sort((a, b) => b.z - a.z);
    
    sortedDecorations.forEach(decoration => {
        if (decoration.z >= 0 && decoration.z <= 6) {
            const { x, y, scale } = worldToScreen(decoration.x, decoration.z);
            
            // Check if decoration is visible on screen
            if (x < -100 || x > canvas.width + 100) return;
            
            // Bigger base size for better visibility
            const emojiSize = Math.floor(120 * scale * decoration.size); // Increased from 80 to 120
            
            if (emojiSize > 12) { // Increased minimum size from 8 to 12
                // Better visibility for distant objects
                const alpha = Math.min(1, Math.max(0.5, scale * 2.5)); // Increased min alpha from 0.3 to 0.5
                
                // Very subtle bobbing motion
                const bobAmount = Math.sin(decoration.bobOffset) * 2 * scale;
                const finalY = y + bobAmount;
                
                ctx.save();
                ctx.globalAlpha = alpha; // Fade distant objects
                
                ctx.font = `${emojiSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(decoration.emoji, Math.floor(x), Math.floor(finalY));
                
                ctx.restore();
            }
        }
    });
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

function drawRoad() {
    const vanishing = getVanishingPoint();
    const roadWidth = getRoadWidth();
    const theme = gameState.selectedBusiness;
    
    // Road surface
    ctx.fillStyle = theme.roadColor;
    ctx.beginPath();
    ctx.moveTo(vanishing.x - 30, vanishing.y);
    ctx.lineTo(vanishing.x + 30, vanishing.y);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height);
    ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Road edges
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.moveTo(vanishing.x - 30, vanishing.y);
    ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(vanishing.x + 30, vanishing.y);
    ctx.lineTo(canvas.width / 2 + roadWidth / 2, canvas.height);
    ctx.stroke();
    
    // Center line dashes moving toward player
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    
    for (let i = 0; i < 10; i++) {
        let dashZ = 1.5 - ((gameState.roadOffset * 4 + i * 0.3) % 2.0);
        
        if (dashZ >= 0 && dashZ <= 1.5) {
            const start = worldToScreen(0, dashZ);
            const end = worldToScreen(0, Math.max(0, dashZ - 0.15));
            
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    }
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