# 🎮 Simple Game Tutorial

## 📦 What We Simplified

### Before (Complex):
- 50+ lines of complex canvas drawing code
- Gradients, borders, shadows, patterns
- Multiple fallback systems

### After (Simple):
- Just `ctx.drawImage()` for images
- Simple emoji fallback (💰 and 🃏)
- Clean, readable code

---

## 💰 Money System

### 🎯 How to Make Money Bigger/Smaller

In `moneySystem.js`, find this line:
```javascript
const moneySize = Math.floor(80 * scale); // 80 = base size
```

**Change the number 80:**
- `60` = smaller money
- `80` = current size  
- `120` = bigger money
- `200` = huge money

### 🎯 How to Spawn Money

#### Option 1: Spawn Single Money
```javascript
spawnMoneyAt(6, 100); // Spawn $100 at distance 6
spawnMoneyAt(8, 50);  // Spawn $50 at distance 8
```

#### Option 2: Spawn Multiple Money
```javascript
spawnMoneyLine(5, 4, 1.5); // 5 money, starting at distance 4, spaced 1.5 apart
```

#### Option 3: Manual Test Money
```javascript
spawnTestMoney(); // Spawns $50 at distance 6
```

### 🎯 How to Control Automatic Spawning

In `spawnMonthlyRevenue()` function:
```javascript
const numBills = Math.floor(Math.random() * 3) + 3; // 3-5 bills
```

**Change these numbers:**
- `+ 3` = minimum bills
- `* 3` = range (so 3-5 total)
- `* 500` = delay between bills (milliseconds)

---

## 🃏 Card System

### 🎯 How to Make Cards Bigger/Smaller

In `cardSystem.js`, find this line:
```javascript
const cardSize = Math.floor(100 * scale); // 100 = base size
```

**Change the number 100:**
- `80` = smaller cards
- `100` = current size
- `150` = bigger cards
- `200` = huge cards

### 🎯 How to Spawn Cards

#### Spawn Card at Distance
```javascript
spawnCardAt(5); // Spawn card at distance 5
spawnCardAt(8); // Spawn card at distance 8
```

#### Check if Card Exists
```javascript
if (hasCard()) {
    console.log("There's already a card!");
} else {
    spawnCardAt(6);
}
```

---

## 🎮 Quick Testing

### Open Browser Console (F12) and try:

```javascript
// Make money huge
// (Edit moneySystem.js, change 80 to 200)

// Spawn lots of money
spawnMoneyLine(10, 4, 1);

// Make cards huge  
// (Edit cardSystem.js, change 100 to 200)

// Spawn card far away
spawnCardAt(10);
```

---

## 🔧 Easy Modifications

### Want Different Emojis?
Change these lines:
```javascript
// Money emoji (in moneySystem.js)
ctx.fillText('💰', x, y); // Change 💰 to 💵 or 🪙

// Card emoji (in cardSystem.js)  
ctx.fillText('🃏', x, y); // Change 🃏 to 🎴 or 📇
```

### Want Different Images?
Just replace the files:
- `images/cash.png` - your money image
- `images/card.png` - your card image

### Want Different Positions?
```javascript
// Spawn money to the left/right
const newMoney = {
    z: 6,
    value: 50,
    x: -2, // Negative = left, Positive = right, 0 = center
    collected: false
};
```

---

## 🚀 That's It!

The code is now super simple:
1. **Images first** - uses your PNG files
2. **Emoji fallback** - if images fail, shows 💰 or 🃏
3. **Easy controls** - just change numbers to resize
4. **Simple spawning** - call functions to create objects

No more complex drawing code! 🎉 