// Business Types Configuration
const BUSINESS_TYPES = {
    tech: {
        name: 'Tech Startup',
        icon: '💻',
        description: 'Fast growth, high innovation',
        skyColor1: '#4A90E2',
        skyColor2: '#7BB3F4',
        roadColor: '#2C3E50',
        revenue: 150,
        character: {
            src: 'images/hero.png',
            frameWidth: 32,
            frameHeight: 32,
            frameSpeed: 8,
            scale: 10,
            frames: [[1,2], [0,2], [3,2], [0,2]]
        },
        background: {
            groundColor: '#1a1a2e',
            decorations: ['💻', '🖥️', '📱', '⚡', '🚀', '💡', '🔧', '📊'] // Tech emojis
        }
    },
    restaurant: {
        name: 'Restaurant Chain',
        icon: '🍕',
        description: 'Steady income, customer focus',
        skyColor1: '#E67E22',
        skyColor2: '#F39C12',
        roadColor: '#8B4513',
        revenue: 120,
        character: {
            src: 'images/npc1.png',
            frameWidth: 32,
            frameHeight: 32,
            frameSpeed: 6,
            scale: 10,
            frames: [[1,2], [0,2], [3,2], [0,2]]
        },
        background: {
            groundColor: '#654321',
            decorations: ['🍕', '🍔', '🍟', '🥤', '🍰', '🧑‍🍳', '🍽️', '🏪'] // Food emojis
        }
    },
    retail: {
        name: 'Retail Empire',
        icon: '🛍️',
        description: 'Volume business, logistics focused',
        skyColor1: '#9B59B6',
        skyColor2: '#8E44AD',
        roadColor: '#34495E',
        revenue: 100,
        character: {
            src: 'images/npc2.png',
            frameWidth: 32,
            frameHeight: 32,
            frameSpeed: 10,
            scale: 10,
            frames: [[1,2], [0,2], [3,2], [0,2]]
        },
        background: {
            groundColor: '#2C2C2C',
            decorations: ['🛍️', '👕', '👗', '👠', '📦', '🏬', '🛒', '💳'] // Shopping emojis
        }
    },
    finance: {
        name: 'Financial Services',
        icon: '💰',
        description: 'High value transactions',
        skyColor1: '#27AE60',
        skyColor2: '#2ECC71',
        roadColor: '#1E1E1E',
        revenue: 200,
        character: {
            src: 'images/npc4.png',
            frameWidth: 32,
            frameHeight: 32,
            frameSpeed: 4,
            scale: 10,
            frames: [[1,2], [0,2], [3,2], [0,2]]
        },
        background: {
            groundColor: '#1A1A1A',
            decorations: ['💰', '💎', '🏦', '💳', '📈', '💸', '🏛️', '💵'] // Finance emojis
        }
    }
};

// Game Settings
const GAME_SPEED = 0.01;
const ANIMATION_SPEED = 0.1;