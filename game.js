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
    setupKeyboardListeners();
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
    
    // Dispatch game over event
    const gameOverEvent = new Event('gameOver');
    document.dispatchEvent(gameOverEvent);
    
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

function setupKeyboardListeners() {
    // Menghapus event listener lama jika ada
    document.removeEventListener('keydown', handleKeyPress);
    // Menambahkan event listener baru
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
    if (isGameOver) return;
    
    // Mengabaikan tombol khusus seperti Shift, Ctrl, Alt, dll
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    
    // Mendapatkan karakter Arab berdasarkan tombol keyboard yang ditekan
    const arabicChar = getArabicChar(event.key);
    if (arabicChar) {
        event.preventDefault();
        inputBox.value += arabicChar;
        // Memicu event input untuk mengecek kata
        const inputEvent = new Event('input');
        inputBox.dispatchEvent(inputEvent);
    }
}

function getArabicChar(key) {
    const keyMap = {
        'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف', 'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح', '[': 'ج',
        'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل', 'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك',
        'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'ى', 'n': 'ة', 'm': 'و', ',': 'ز', '.': 'ظ',
        '`': 'ذ', '1': '١', '2': '٢', '3': '٣', '4': '٤', '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩', '0': '٠'
    };
    
    // Konversi key ke lowercase untuk konsistensi
    const lowerKey = key.toLowerCase();
    return keyMap[lowerKey] || null;
}

function handleVirtualKeyPress(char, isBackspace = false) {
    if (isGameOver) return;
    
    const input = document.getElementById('input-box');
    if (!input) return;
    
    if (isBackspace) {
        // Only remove one character
        if (input.value.length > 0) {
            input.value = input.value.slice(0, -1);
        }
    } else {
        input.value += char;
    }
    
    // Trigger input event
    input.dispatchEvent(new Event('input'));
}

function setupVirtualKeyboard() {
    const keyboard = document.getElementById('keyboard-container');
    const mobileKeyboard = document.getElementById('mobile-keyboard');
    const pcKeyboard = document.getElementById('pc-keyboard');
    
    // Show appropriate keyboard based on device
    if (window.innerWidth < 768) {
        mobileKeyboard.style.display = 'block';
        pcKeyboard.style.display = 'none';
    } else {
        mobileKeyboard.style.display = 'none';
        pcKeyboard.style.display = 'block';
    }

    // Setup PC keyboard
    const pcKeys = pcKeyboard.querySelectorAll('.key');
    pcKeys.forEach(key => {
        const newKey = key.cloneNode(true);
        key.parentNode.replaceChild(newKey, key);
        
        newKey.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const char = newKey.getAttribute('data-normal');
            if (char) {
                handleVirtualKeyPress(char, false);
            }
        });
    });

    // Setup PC backspace
    const pcBackspace = pcKeyboard.querySelector('.backspace-key');
    if (pcBackspace) {
        pcBackspace.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVirtualKeyPress('', true);
        });
    }

    // Setup PC shift key
    const shiftKeys = pcKeyboard.querySelectorAll('.shift-key');
    let isShiftPressed = false;
    
    shiftKeys.forEach(shiftKey => {
        shiftKey.addEventListener('mousedown', () => {
            isShiftPressed = true;
            updateKeyDisplay();
        });

        shiftKey.addEventListener('mouseup', () => {
            isShiftPressed = false;
            updateKeyDisplay();
        });

        shiftKey.addEventListener('mouseleave', () => {
            isShiftPressed = false;
            updateKeyDisplay();
        });
    });

    function updateKeyDisplay() {
        pcKeys.forEach(key => {
            if (!key.classList.contains('shift-key') && !key.classList.contains('backspace-key')) {
                const arabicChar = key.querySelector('.arabic-char');
                if (arabicChar) {
                    arabicChar.textContent = isShiftPressed ? 
                        key.getAttribute('data-shift') || key.getAttribute('data-normal') : 
                        key.getAttribute('data-normal');
                }
            }
        });
    }

    // Mobile keyboard setup
    const oldKeys = mobileKeyboard.querySelectorAll('.key, .backspace-key');
    oldKeys.forEach(key => {
        const newKey = key.cloneNode(true);
        key.parentNode.replaceChild(newKey, key);
    });

    // Setup all mobile keyboard keys
    const mobileKeys = mobileKeyboard.querySelectorAll('.key:not(.variant-key)');
    mobileKeys.forEach(key => {
        if (!key.classList.contains('alif-key')) {
            key.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const char = key.getAttribute('data-normal');
                if (char) {
                    handleVirtualKeyPress(char, false);
                }
            });
        }
    });

    // Setup mobile backspace
    const mobileBackspace = mobileKeyboard.querySelector('.backspace-key');
    if (mobileBackspace) {
        mobileBackspace.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleVirtualKeyPress('', true);
        });
    }

    // Setup Alif long press
    const alifKey = mobileKeyboard.querySelector('.alif-key');
    const alifPopup = mobileKeyboard.querySelector('.alif-popup');
    
    if (alifKey && alifPopup) {
        let longPressTimer;
        let isLongPress = false;

        const showAlifVariants = (rect) => {
            isLongPress = true;
            alifPopup.style.display = 'block';
            // Position popup above the alif key
            alifPopup.style.bottom = `${window.innerHeight - rect.top + 5}px`;
            alifPopup.style.left = `${rect.left}px`;
        };

        const handleAlifStart = (e) => {
            e.preventDefault();
            isLongPress = false;
            const rect = alifKey.getBoundingClientRect();
            longPressTimer = setTimeout(() => showAlifVariants(rect), 500);
        };

        const handleAlifEnd = (e) => {
            clearTimeout(longPressTimer);
            if (!isLongPress) {
                handleVirtualKeyPress('ا');
            }
        };

        // Touch events for alif key
        alifKey.addEventListener('touchstart', handleAlifStart);
        alifKey.addEventListener('touchend', handleAlifEnd);
        
        // Mouse events for alif key
        alifKey.addEventListener('mousedown', handleAlifStart);
        alifKey.addEventListener('mouseup', handleAlifEnd);
        alifKey.addEventListener('mouseleave', handleAlifEnd);

        // Setup alif variant buttons
        const alifVariants = alifPopup.querySelectorAll('.variant-key');
        alifVariants.forEach(variant => {
            variant.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const char = variant.getAttribute('data-normal');
                if (char) {
                    handleVirtualKeyPress(char);
                }
                alifPopup.style.display = 'none';
                isLongPress = false;
            }, { once: true }); // Add once: true to prevent multiple handlers
        });

        // Hide popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!alifPopup.contains(e.target) && e.target !== alifKey) {
                alifPopup.style.display = 'none';
                isLongPress = false;
            }
        });
    }
}

// Initialize virtual keyboard when page loads
document.addEventListener('DOMContentLoaded', setupVirtualKeyboard);

// Update keyboard on window resize
window.addEventListener('resize', setupVirtualKeyboard);

// Event listener untuk input box
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

// Mencegah default keyboard di mobile
inputBox.addEventListener('focus', (e) => {
    if (window.innerWidth <= 768) {
        e.preventDefault();
        const keyboardContainer = document.getElementById('keyboard-container');
        const mobileKeyboard = document.getElementById('mobile-keyboard');
        const pcKeyboard = document.getElementById('pc-keyboard');
        
        keyboardContainer.style.display = 'block';
        mobileKeyboard.style.display = 'block';
        pcKeyboard.style.display = 'none';
        setupVirtualKeyboard();
    }
});

inputBox.addEventListener('blur', () => {
    if (window.innerWidth > 768) {
        const keyboardContainer = document.getElementById('keyboard-container');
        keyboardContainer.style.display = 'none';
    }
});

// Start with menu
showMenu();
