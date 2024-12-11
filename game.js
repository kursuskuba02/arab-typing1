// Arabic words array
const words = [
    // Basic Nouns
    'كتاب', 'قلم', 'مدرسة', 'طالب', 'معلم', 'بيت', 'شجرة', 'سيارة', 'حديقة', 'مسجد',
    'قمر', 'شمس', 'نجم', 'بحر', 'جبل', 'صديق', 'عائلة', 'طعام', 'ماء', 'هواء',
    // Animals
    'أسد', 'قط', 'كلب', 'حصان', 'جمل', 'طير', 'سمك', 'فيل', 'ثعلب', 'ذئب',
    // Colors
    'أحمر', 'أزرق', 'أصفر', 'أخضر', 'أبيض', 'أسود', 'برتقالي', 'بني', 'رمادي', 'وردي',
    // Food
    'خبز', 'حليب', 'لحم', 'دجاج', 'سمك', 'أرز', 'تفاح', 'موز', 'برتقال', 'عنب',
    // Common Verbs
    'كتب', 'قرأ', 'أكل', 'شرب', 'نام', 'جلس', 'ذهب', 'رجع', 'فتح', 'أغلق',
    // Time
    'يوم', 'ليل', 'صباح', 'مساء', 'ساعة', 'دقيقة', 'ثانية', 'أسبوع', 'شهر', 'سنة',
    // Family
    'أب', 'أم', 'أخ', 'أخت', 'جد', 'جدة', 'عم', 'خال', 'ابن', 'بنت',
    // Numbers
    'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'
];

let score = 0;
let lives = 4;
let balloons = [];
let gameInterval;
let isGameOver = false;
let gameTimer;
let totalSeconds;
let wordsTyped = 0;
let selectedMinutes = 0;

const menuContainer = document.getElementById('menu-container');
const gameContainer = document.getElementById('game-container');
const timerSelection = document.getElementById('timer-selection');
const inputBox = document.getElementById('input-box');
const scoreValue = document.getElementById('score-value');
const livesValue = document.getElementById('lives-value');
const timerValue = document.getElementById('timer-value');
const gameOverScreen = document.getElementById('game-over');
const finalScore = document.getElementById('final-score');
const wpmValue = document.getElementById('words-per-minute');
const leaderboardContainer = document.getElementById('leaderboard-container');
const leaderboardEntries = document.getElementById('leaderboard-entries');

// Balloon colors
const balloonColors = [
    { background: 'radial-gradient(circle at 50% 50%, #ff6b6b, #ff4757)', shadow: 'rgba(255, 71, 87, 0.3)' },
    { background: 'radial-gradient(circle at 50% 50%, #48dbfb, #0abde3)', shadow: 'rgba(10, 189, 227, 0.3)' },
    { background: 'radial-gradient(circle at 50% 50%, #ffd32a, #ffa502)', shadow: 'rgba(255, 165, 2, 0.3)' },
    { background: 'radial-gradient(circle at 50% 50%, #2ecc71, #27ae60)', shadow: 'rgba(46, 204, 113, 0.3)' },
    { background: 'radial-gradient(circle at 50% 50%, #a55eea, #8854d0)', shadow: 'rgba(136, 84, 208, 0.3)' },
    { background: 'radial-gradient(circle at 50% 50%, #ff9ff3, #f368e0)', shadow: 'rgba(243, 104, 224, 0.3)' }
];

// Load leaderboard from localStorage
let leaderboard = JSON.parse(localStorage.getItem('arabicTypingLeaderboard')) || [];

function showMenu() {
    menuContainer.style.display = 'flex';
    gameContainer.style.display = 'none';
    gameOverScreen.style.display = 'none';
    leaderboardContainer.style.display = 'none';
    timerSelection.style.display = 'none';
}

function showTimerSelection() {
    timerSelection.style.display = 'block';
}

function showLeaderboard() {
    menuContainer.style.display = 'none';
    leaderboardContainer.style.display = 'block';
    updateLeaderboardDisplay();
}

function updateLeaderboardDisplay() {
    leaderboardEntries.innerHTML = '';
    const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
    sortedLeaderboard.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        entryDiv.innerHTML = `
            #${index + 1} - ${entry.name}
            | النقاط: ${entry.score}
            | السرعة: ${entry.wpm} كلمة/دقيقة
            | الوقت: ${entry.duration} دقيقة
        `;
        leaderboardEntries.appendChild(entryDiv);
    });
}

class Balloon {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'balloon';
        this.word = words[Math.floor(Math.random() * words.length)];
        this.element.textContent = this.word;
        
        // Random color from balloonColors
        const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        this.element.style.background = color.background;
        this.element.style.boxShadow = `2px 2px 10px ${color.shadow}`;
        
        // Ensure balloon stays within visible area
        const padding = 50; // padding from edges
        this.x = padding + Math.random() * (gameContainer.clientWidth - 100 - padding * 2);
        this.y = -120;
        this.speed = 1 + Math.random();
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        gameContainer.appendChild(this.element);
    }

    move() {
        this.y += this.speed;
        this.element.style.top = this.y + 'px';
        
        if (this.y > gameContainer.clientHeight) {
            this.pop();
            lives--;
            livesValue.textContent = lives;
            if (lives <= 0) {
                endGame('lives');
            }
            return false;
        }
        return true;
    }

    pop() {
        this.element.remove();
        return true;
    }
}

function startGameWithTimer(minutes) {
    selectedMinutes = minutes;
    totalSeconds = minutes * 60;
    menuContainer.style.display = 'none';
    gameContainer.style.display = 'block';
    startGame();
}

function updateTimer() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (totalSeconds <= 0) {
        endGame('time');
        return;
    }
    totalSeconds--;
}

function startGame() {
    isGameOver = false;
    score = 0;
    lives = 4;
    wordsTyped = 0;
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    inputBox.value = '';
    inputBox.focus();

    // Clear existing balloons
    balloons.forEach(balloon => balloon.element.remove());
    balloons = [];

    // Start game intervals - update every 50ms, create balloon every 300ms
    gameInterval = setInterval(() => {
        updateGame();
    }, 50);

    // Create balloon every 0.3 seconds
    setInterval(createBalloon, 300);

    // Start timer
    gameTimer = setInterval(updateTimer, 1000);
}

function createBalloon() {
    if (!isGameOver && balloons.length < 5) {
        balloons.push(new Balloon());
    }
}

function updateGame() {
    balloons = balloons.filter(balloon => balloon.move());
}

function endGame(reason) {
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(gameTimer);
    
    const timeElapsed = selectedMinutes - (totalSeconds / 60);
    const wpm = Math.round(wordsTyped / timeElapsed);
    
    finalScore.textContent = score;
    wpmValue.textContent = wpm;
    gameOverScreen.style.display = 'block';
    gameContainer.style.display = 'none';
}

function saveScore() {
    const playerName = document.getElementById('name-input').value.trim();
    if (!playerName) {
        alert('الرجاء إدخال اسمك');
        return;
    }

    const timeElapsed = selectedMinutes - (totalSeconds / 60);
    const wpm = Math.round(wordsTyped / timeElapsed);

    leaderboard.push({
        name: playerName,
        score: score,
        wpm: wpm,
        duration: selectedMinutes
    });

    // Keep only top 10 scores
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }

    localStorage.setItem('arabicTypingLeaderboard', JSON.stringify(leaderboard));
    showMenu();
}

inputBox.addEventListener('input', () => {
    const typedWord = inputBox.value;
    
    for (let i = 0; i < balloons.length; i++) {
        if (balloons[i].word === typedWord) {
            balloons[i].pop();
            balloons.splice(i, 1);
            score += 10;
            wordsTyped++;
            scoreValue.textContent = score;
            inputBox.value = '';
            break;
        }
    }
});

// Start with menu
showMenu();
