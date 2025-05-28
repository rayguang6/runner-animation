// === SIMPLE MONEY SYSTEM ===
let moneyObjects = []; // Array to hold multiple money objects
let collectionEffect = null; // Visual effect when money is collected

// Simple image loading for cash
let cashImage = null;

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
    
    // Spawn some test money after 2 seconds for immediate testing
    // setTimeout(() => {
    //     if (gameState.gameStarted) {
    //         console.log('Spawning test money for immediate testing...');
    //         spawnTestMoney();
    //     }
    // }, 2000);
    
    console.log('Money system initialized');
}

function spawnMoney() {
    if (!gameState.selectedBusiness) return;
    
    const newMoney = {
        z: 4, // Always spawn 4 units away
        value: Math.floor(gameState.revenue * 0.1), // 10% of monthly revenue
        x: 0, // Spawn in the middle of the road like cards
        collected: false
    };
    
    moneyObjects.push(newMoney);
    console.log(`Money spawned: $${newMoney.value} (Total money objects: ${moneyObjects.length})`);
}

function updateMoneySystem() {
    if (!gameState.gameStarted) return;
    
    // Update all money objects - use for loop instead of filter for better performance
    for (let i = moneyObjects.length - 1; i >= 0; i--) {
        const money = moneyObjects[i];
        
        if (money.collected) {
            moneyObjects.splice(i, 1);
            continue;
        }
        
        // Move money toward player
        money.z -= GAME_SPEED * 2.5;
        
        // Check collision - money auto-collects when it reaches the player
        if (money.z <= 0.3) {
            collectMoney(money, i);
            continue;
        }
        
        // Remove money that's too far behind
        if (money.z < -2) {
            moneyObjects.splice(i, 1);
        }
    }
    
    // Update collection effect
    if (collectionEffect) {
        collectionEffect.timer--;
        if (collectionEffect.timer <= 0) {
            collectionEffect = null;
        }
    }
}

function drawMoneySystem() {
    // Draw all money objects
    moneyObjects.forEach(money => {
        if (money.z > 0 && !money.collected) {
            const { x, y, scale } = worldToScreen(money.x, money.z);
            
            // 🎯 HOW TO CONTROL SIZE: Change this number to make money bigger/smaller
            const moneySize = Math.floor(300 * scale); // 120 = bigger size! (was 80)
            
            if (moneySize > 10) { // Minimum visible size
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
                    // Simple emoji fallback - no complex drawing!
                    ctx.font = `${moneySize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('💰', x, y);
                }
                
                // Show value text
                if (scale > 0.3) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.font = `bold ${Math.floor(14 * scale)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.strokeText(`$${money.value}`, x, y + moneySize/2 + 5);
                    ctx.fillText(`$${money.value}`, x, y + moneySize/2 + 5);
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
    
    // Remove money from moneyObjects
    moneyObjects.splice(index, 1);
}

function resetMoneySystem() {
    moneyObjects = [];
    collectionEffect = null;
    console.log('Money system reset');
}

// Check if there's enough space to spawn money (avoid collision with cards)
function hasEnoughSpaceForMoney(z) {
    // 🎯 FASTER FLOW: Require enough distance from cards but allow closer spawning
    if (currentCard && Math.abs(currentCard.z - z) < 2.0) { // Reduced from 2.5 to 2.0
        return false;
    }
    
    // Check if there's other money too close
    for (let money of moneyObjects) {
        if (Math.abs(money.z - z) < 1.2) { // Reduced from 1.5 to 1.2 for tighter spacing
            return false;
        }
    }
    
    return true;
}

// 🎯 HOW TO CONTROL SPAWNING: This function controls when money appears
function spawnMonthlyRevenue() {
    const totalRevenue = gameState.revenue;
    const numBills = Math.floor(Math.random() * 3) + 3; // 3-5 bills (change these numbers!)
    
    for (let i = 0; i < numBills; i++) {
        setTimeout(() => {
            if (gameState.gameStarted) {
                const billValue = Math.floor(totalRevenue / numBills);
                let spawnZ = 1 + (i * 0.5); // 🎯 MUCH CLOSER: Start at 3.5, space by 1.5 units
                
                while (!hasEnoughSpaceForMoney(spawnZ) && spawnZ < 10) { // Reduced max distance from 12 to 10
                    spawnZ += 0.5; // Smaller jumps for precise positioning
                }
                
                const newMoney = {
                    z: spawnZ, // Distance from player
                    value: billValue, // How much money
                    x: 0, // Position left/right (0 = center)
                    collected: false
                };
                moneyObjects.push(newMoney);
                console.log(`Monthly revenue bill spawned: $${billValue} at z=${spawnZ} (${i + 1}/${numBills})`);
            }
        }, i * 600); // 🎯 SLIGHTLY FASTER: 0.6 seconds between each bill (was 0.8 seconds)
    }
}

// 🎯 EASY SPAWNING FUNCTIONS - Add these to spawn money easily!

// Spawn a single money at specific distance
function spawnMoneyAt(distance, value = 50) {
    const newMoney = {
        z: distance,
        value: value,
        x: 0,
        collected: false
    };
    moneyObjects.push(newMoney);
    console.log(`Money spawned at distance ${distance}: $${value}`);
}

// 🎯 SIMPLE TEST FUNCTION: Spawn money at reasonable distance for testing
function spawnTestMoney() {
    const testMoney = {
        z: 4, // Closer distance (was 5) for faster engagement
        value: 50, // How much money
        x: 0, // Position (0 = center, negative = left, positive = right)
        collected: false
    };
    moneyObjects.push(testMoney);
    console.log(`Test money spawned: $${testMoney.value} at distance ${testMoney.z}`);
}

// Spawn multiple money in a line
function spawnMoneyLine(count = 5, startDistance = 3, spacing = 1.2) { // Closer start and tighter spacing
    for (let i = 0; i < count; i++) {
        spawnMoneyAt(startDistance + (i * spacing), 25);
    }
} 