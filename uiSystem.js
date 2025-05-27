// === UI AND POPUP SYSTEM ===

function hitCard() {
    // Play card sound
    playSound('card');
    
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
    
    // Generate simple business decision
    const decisions = [
        {
            title: "💼 Expand Operations?",
            description: "You can expand your business operations.",
            option1: { text: "📈 Expand (+$20 revenue)", effect: () => gameState.revenue += 20 },
            option2: { text: "💰 Save Cash (+$50 cash)", effect: () => gameState.cash += 50 }
        },
        {
            title: "🤝 Partnership Offer",
            description: "A partner wants to join your business.",
            option1: { text: "✅ Accept (+$30 revenue)", effect: () => gameState.revenue += 30 },
            option2: { text: "❌ Decline (+$100 cash)", effect: () => gameState.cash += 100 }
        },
        {
            title: "💡 New Technology",
            description: "Invest in new technology for your business?",
            option1: { text: "🚀 Invest (+$25 revenue)", effect: () => gameState.revenue += 25 },
            option2: { text: "💵 Keep Cash (+$75 cash)", effect: () => gameState.cash += 75 }
        }
    ];
    
    // Pick random decision
    const decision = decisions[Math.floor(Math.random() * decisions.length)];
    
    // Update popup content
    document.getElementById('cardDescription').innerHTML = `
        <h3>${decision.title}</h3>
        <p>${decision.description}</p>
    `;
    
    // Update buttons with choices
    const popupButtons = document.querySelector('.popup-buttons');
    popupButtons.innerHTML = `
        <button onclick="makeDecision(0)" class="popup-btn" style="background: #4CAF50;">${decision.option1.text}</button>
        <button onclick="makeDecision(1)" class="popup-btn" style="background: #2196F3;">${decision.option2.text}</button>
    `;
    
    // Store current decision globally
    window.currentDecision = decision;
}

function makeDecision(choice) {
    const decision = window.currentDecision;
    
    if (choice === 0) {
        decision.option1.effect();
        console.log('Chose option 1:', decision.option1.text);
    } else {
        decision.option2.effect();
        console.log('Chose option 2:', decision.option2.text);
    }
    
    // Hide popup immediately - no effect screen
    document.getElementById('cardPopup').style.display = 'none';
    
    // Resume the game immediately
    gameState.gameStarted = true;
    
    // Update UI to show changes
    updateUI();
    
    // Spawn next card after a delay
    setTimeout(() => {
        spawnCard();
    }, 1000);
    
    console.log('Decision applied, game resumed immediately');
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
    
    // Check win condition
    if (gameState.cash >= gameState.targetCash) {
        showVictoryScreen();
        return;
    }
    
    // Check game over condition
    if (gameState.month > gameState.maxMonths) {
        showGameOverScreen();
        return;
    }
    
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

function showVictoryScreen() {
    gameState.gameStarted = false;
    gameState.gameEnded = true;
    
    // Stop background music
    stopBackgroundMusic();
    
    // Show victory popup
    document.getElementById('cardPopup').style.display = 'flex';
    document.getElementById('cardDescription').innerHTML = `
        <h2 style="color: #4CAF50; margin-bottom: 15px;">🎉 VICTORY! 🎉</h2>
        <p>Congratulations! You've built a successful business!</p>
        <p><strong>Final Cash: $${gameState.cash}</strong></p>
        <p><strong>Months Played: ${gameState.month - 1}</strong></p>
        <p><strong>Business: ${gameState.selectedBusiness.name}</strong></p>
    `;
    
    // Change button to restart
    const popupButtons = document.querySelector('.popup-buttons');
    popupButtons.innerHTML = `
        <button onclick="restartGame()" class="popup-btn" style="background: #4CAF50;">🎮 Play Again</button>
        <button onclick="goBack()" class="popup-btn" style="background: #2196F3;">🏢 Choose Business</button>
    `;
}

function showGameOverScreen() {
    gameState.gameStarted = false;
    gameState.gameEnded = true;
    
    // Stop background music
    stopBackgroundMusic();
    
    // Show game over popup
    document.getElementById('cardPopup').style.display = 'flex';
    document.getElementById('cardDescription').innerHTML = `
        <h2 style="color: #e74c3c; margin-bottom: 15px;">💼 TIME'S UP! 💼</h2>
        <p>You ran out of time to reach your goal!</p>
        <p><strong>Final Cash: $${gameState.cash}</strong></p>
        <p><strong>Target: $${gameState.targetCash}</strong></p>
        <p><strong>Months Played: ${gameState.maxMonths}</strong></p>
        <p>Try a different strategy next time!</p>
    `;
    
    // Change button to restart
    const popupButtons = document.querySelector('.popup-buttons');
    popupButtons.innerHTML = `
        <button onclick="restartGame()" class="popup-btn" style="background: #e74c3c;">🎮 Try Again</button>
        <button onclick="goBack()" class="popup-btn" style="background: #2196F3;">🏢 Choose Business</button>
    `;
}

function restartGame() {
    // Reset game state but keep selected business
    const selectedBusiness = gameState.selectedBusiness;
    
    gameState = {
        selectedBusiness: selectedBusiness,
        cash: 0,
        revenue: selectedBusiness.revenue,
        month: 1,
        gameStarted: false,
        roadOffset: 0,
        cardsThisMonth: 0,
        maxCardsPerMonth: 2,
        targetCash: 1000,
        maxMonths: 12,
        gameEnded: false
    };
    
    // Hide popup
    document.getElementById('cardPopup').style.display = 'none';
    
    // Reset systems
    resetCardSystem();
    resetMoneySystem();
    
    // Restart game
    initGameCards();
    initMoneySystem();
    gameState.gameStarted = true;
    
    // Start background music
    startBackgroundMusic();
    
    // Update UI
    updateUI();
    
    console.log('Game restarted');
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
    
    // Update month status with progress info
    const statusElement = document.getElementById('monthStatus');
    if (statusElement) {
        if (gameState.cardsThisMonth === 0) {
            const progress = Math.round((gameState.cash / gameState.targetCash) * 100);
            const monthsLeft = gameState.maxMonths - gameState.month + 1;
            statusElement.textContent = `Goal: $${gameState.targetCash} (${progress}%) | ${monthsLeft} months left`;
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