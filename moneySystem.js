// === OPTIMIZED MONEY SYSTEM ===
let moneyObjects = []; // Array to hold multiple money objects
let collectionEffect = null; // Visual effect when money is collected

// Simple image loading for cash
let cashImage = null;

// Object pooling for money
const moneyPool = [];
const MAX_MONEY_POOL_SIZE = 20;

function getMoneyFromPool() {
    if (moneyPool.length > 0) {
        return moneyPool.pop();
    }
    return {};
}

function returnMoneyToPool(money) {
    if (moneyPool.length < MAX_MONEY_POOL_SIZE) {
        moneyPool.push(money);
    }
}

function initMoneySystem() {
    moneyObjects = [];
    collectionEffect = null;
    
    // Load cash image
    cashImage = new Image();
    cashImage.src = 'images/cash.png';
    cashImage.onload = () => {
        console.log('Cash image loaded successfully');
    };
    cashImage.onerror = () => {
        console.log('Failed to load cash image, will use emoji fallback');
        cashImage = null;
    };
    
    console.log('Money system initialized');
}

function spawnMoney() {
    if (!gameState.selectedBusiness) return;
    
    const newMoney = getMoneyFromPool();
    newMoney.z = 4; // Always spawn 4 units away
    newMoney.value = Math.floor(gameState.revenue * 0.1); // 10% of monthly revenue
    newMoney.x = 0; // Spawn in the middle of the road like cards
    newMoney.collected = false;
    
    moneyObjects.push(newMoney);
    console.log(`Money spawned: $${newMoney.value} (Total money objects: ${moneyObjects.length})`);
}

function updateMoneySystem(deltaMultiplier = 1) {
    if (!gameState.gameStarted) return;
    
    // Update all money objects
    for (let i = moneyObjects.length - 1; i >= 0; i--) {
        const money = moneyObjects[i];
        
        if (money.collected) {
            returnMoneyToPool(money);
            moneyObjects.splice(i, 1);
            continue;
        }
        
        // Move money toward player with delta time adjustment
        money.z -= GAME_SPEED * 2.5 * deltaMultiplier;
        
        // Check collision - money auto-collects when it reaches the player
        if (money.z <= 0.3) {
            collectMoney(money, i);
            continue;
        }
        
        // Remove money that's too far behind
        if (money.z < -2) {
            returnMoneyToPool(money);
            moneyObjects.splice(i, 1);
        }
    }
    
    // Update collection effect
    if (collectionEffect) {
        collectionEffect.timer -= deltaMultiplier;
        if (collectionEffect.timer <= 0) {
            collectionEffect = null;
        }
    }
}

function drawMoneySystem() {
    // Pre-calculate visible bounds
    const leftBound = -100;
    const rightBound = canvas.width + 100;
    
    // Draw all money objects
    moneyObjects.forEach(money => {
        if (money.z > 0 && money.z < 7 && !money.collected) {
            const { x, y, scale } = worldToScreen(money.x, money.z);
            
            // Skip off-screen money
            if (x < leftBound || x > rightBound) return;
            
            const moneySize = Math.floor(300 * scale);
            
            if (moneySize > 10) {
                if (cashImage && cashImage.complete) {
                    // Use the cash image
                    ctx.drawImage(
                        cashImage,
                        x - moneySize/2,
                        y - moneySize/2,
                        moneySize,
                        moneySize
                    );
                } else {
                    // Simple emoji fallback
                    ctx.save();
                    ctx.font = `${moneySize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('💰', x, y);
                    ctx.restore();
                }
                
                // Show value text only for larger sizes
                if (scale > 0.3) {
                    ctx.save();
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.font = `bold ${Math.floor(14 * scale)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.strokeText(`$${money.value}`, x, y + moneySize/2 + 5);
                    ctx.fillText(`$${money.value}`, x, y + moneySize/2 + 5);
                    ctx.restore();
                }
            }
        }
    });
    
    // Draw collection effect
    if (collectionEffect) {
        const alpha = collectionEffect.timer / 30;
        const yOffset = (30 - collectionEffect.timer) * 2;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+$${collectionEffect.value}`, collectionEffect.x, collectionEffect.y - yOffset);
        ctx.restore();
    }
}

function collectMoney(money, index) {
    if (!money) return;
    
    // Play cash sound
    playSound('cash');
    
    // Create collection effect at money position
    const { x, y } = worldToScreen(money.x, money.z);
    collectionEffect = {
        x: x,
        y: y,
        timer: 30,
        value: money.value
    };
    
    // Add money to cash
    gameState.cash += money.value;
    
    // Update UI
    updateUI();
    
    console.log(`💰 Collected $${money.value}! Total cash: $${gameState.cash}`);
    
    // Mark as collected (will be removed in update loop)
    money.collected = true;
}

function resetMoneySystem() {
    // Return all money to pool
    moneyObjects.forEach(money => returnMoneyToPool(money));
    moneyObjects = [];
    collectionEffect = null;
    console.log('Money system reset');
}

// Check if there's enough space to spawn money (avoid collision with cards)
function hasEnoughSpaceForMoney(z) {
    // Require enough distance from cards
    if (currentCard && Math.abs(currentCard.z - z) < 2.0) {
        return false;
    }
    
    // Check if there's other money too close
    for (let money of moneyObjects) {
        if (Math.abs(money.z - z) < 1.2) {
            return false;
        }
    }
    
    return true;
}

function spawnMonthlyRevenue() {
    const totalRevenue = gameState.revenue;
    const numBills = Math.floor(Math.random() * 3) + 3; // 3-5 bills
    
    for (let i = 0; i < numBills; i++) {
        setTimeout(() => {
            if (gameState.gameStarted) {
                const billValue = Math.floor(totalRevenue / numBills);
                let spawnZ = 3.5 + (i * 1.5);
                
                while (!hasEnoughSpaceForMoney(spawnZ) && spawnZ < 10) {
                    spawnZ += 0.5;
                }
                
                const newMoney = getMoneyFromPool();
                newMoney.z = spawnZ;
                newMoney.value = billValue;
                newMoney.x = 0;
                newMoney.collected = false;
                
                moneyObjects.push(newMoney);
                console.log(`Monthly revenue bill spawned: $${billValue} at z=${spawnZ} (${i + 1}/${numBills})`);
            }
        }, i * 600);
    }
}

// Test spawning functions
function spawnMoneyAt(distance, value = 50) {
    const newMoney = getMoneyFromPool();
    newMoney.z = distance;
    newMoney.value = value;
    newMoney.x = 0;
    newMoney.collected = false;
    
    moneyObjects.push(newMoney);
    console.log(`Money spawned at distance ${distance}: $${value}`);
}

function spawnTestMoney() {
    spawnMoneyAt(4, 50);
}

function spawnMoneyLine(count = 5, startDistance = 3, spacing = 1.2) {
    for (let i = 0; i < count; i++) {
        spawnMoneyAt(startDistance + (i * spacing), 25);
    }
}