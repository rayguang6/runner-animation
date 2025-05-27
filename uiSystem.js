// === UI AND POPUP SYSTEM ===

function hitCard() {
    // Show popup
    showCardPopup();
    
    // Update game state
    gameState.cardsThisMonth += 1;
    
    console.log(`Card hit! Cards this month: ${gameState.cardsThisMonth}/${gameState.maxCardsPerMonth}`);
    
    // Spawn some money immediately when first card is hit (for immediate feedback)
    // if (gameState.cardsThisMonth === 1) {
    //     console.log('First card hit - spawning immediate money for feedback');
    //     setTimeout(() => {
    //         spawnTestMoney();
    //     }, 2000); // Spawn after popup closes
    // }
    
    // Check if month is complete
    if (gameState.cardsThisMonth >= gameState.maxCardsPerMonth) {
        endMonth();
    }
}

function showCardPopup() {
    // Pause the game updates (but keep the loop running)
    gameState.gameStarted = false;
    
    // Show popup
    document.getElementById('cardPopup').style.display = 'flex';
    
    // Update popup content based on business type
    const businessName = gameState.selectedBusiness.name;
    document.getElementById('cardDescription').textContent = 
        `A ${businessName} opportunity appeared! Make your decision.`;
}

function closePopup() {
    // Hide popup
    document.getElementById('cardPopup').style.display = 'none';
    
    // Resume the game
    gameState.gameStarted = true;
    
    // Update UI
    updateUI();
    
    // Spawn next card after a balanced delay - fast enough to maintain engagement, slow enough for decision-making
    setTimeout(() => {
        spawnCard();
    }, 1000); // 🎯 FASTER ENGAGEMENT: 1 second for better flow (was 1.5 seconds)
    
    console.log('Game resumed after popup');
}

function endMonth() {
    // Add revenue to cash
    gameState.cash += gameState.revenue;
    
    // Advance to next month
    gameState.month += 1;
    gameState.cardsThisMonth = 0; // Reset card counter
    
    // Update UI first
    updateUI();
    
    // Show special message for money spawning
    const statusElement = document.getElementById('monthStatus');
    if (statusElement) {
        statusElement.textContent = '💰 Money incoming! Collect the cash bills!';
        statusElement.style.color = '#4CAF50';
        statusElement.style.fontSize = '16px';
        statusElement.style.fontWeight = 'bold';
    }
    
    console.log(`Month ${gameState.month - 1} ended! Collected $${gameState.revenue}. Total cash: $${gameState.cash}`);
    console.log('About to spawn monthly revenue...');
    
    // Trigger money spawn for monthly revenue collection
    spawnMonthlyRevenue();
    
    console.log('Monthly revenue spawn triggered');
    
    // Reset status message after 5 seconds
    setTimeout(() => {
        if (statusElement) {
            statusElement.style.fontSize = '14px';
            updateUI(); // This will reset the status message
        }
    }, 5000);
}

function updateUI() {
    document.getElementById('businessType').textContent = gameState.selectedBusiness.name;
    document.getElementById('cash').textContent = gameState.cash;
    document.getElementById('month').textContent = gameState.month;
    document.getElementById('revenue').textContent = gameState.revenue;
    
    // Update card progress with new format
    const cardProgressElement = document.getElementById('cardProgress');
    if (cardProgressElement) {
        cardProgressElement.textContent = `Card ${gameState.cardsThisMonth} of ${gameState.maxCardsPerMonth}`;
    }
    
    // Update month status
    const statusElement = document.getElementById('monthStatus');
    if (statusElement) {
        if (gameState.cardsThisMonth === 0) {
            statusElement.textContent = 'Hit cards to progress!';
            statusElement.style.color = '#4CAF50';
        } else if (gameState.cardsThisMonth === 1) {
            statusElement.textContent = 'One more card to complete month!';
            statusElement.style.color = '#FF9800';
        } else {
            statusElement.textContent = 'Month complete! Collecting revenue...';
            statusElement.style.color = '#2196F3';
        }
    }
    
    // Log current state for debugging
    console.log(`UI Updated - Month: ${gameState.month}, Cash: $${gameState.cash}, Cards: ${gameState.cardsThisMonth}/2`);
} 