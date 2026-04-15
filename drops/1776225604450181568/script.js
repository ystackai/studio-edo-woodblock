// Main script for The Indigo Breath experience
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const instructions = document.getElementById('instructions');
const kanji = document.getElementById('kanji');
const printImg = document.getElementById('print');

// Set canvas to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Audio context for sound effects
let audioContext;
let shingSound;
let rotSound;
let exhaleSound;

// Game state
let gameState = 'waiting'; // waiting, breathing, slashing, success, failure
let inkLine = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 2,
    height: 200
};

let cursor = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    trail: [],
    isDown: false,
    lastTrailTime: 0
};

let inkTrail = [];
let breathTimer = 0;
let slashStartTime = 0;
let slashThreshold = 500; // ms to hold before slash

// Colors
const colors = {
    black: '#000000',
    indigo: '#0B1026',
    white: '#FFFFFF'
};

// Procedural noise for ink texture
function generateNoise(width, height, scale = 10) {
    const noise = [];
    for (let y = 0; y < height; y++) {
        noise[y] = [];
        for (let x = 0; x < width; x++) {
            // Simple 2D noise function
            const value = Math.sin(x / scale) * Math.cos(y / scale);
            noise[y][x] = value;
        }
    }
    return noise;
}

// Initialize noise
const noise = generateNoise(canvas.width, canvas.height, 20);

// Draw the ink line with procedural texture
function drawInkLine() {
    ctx.save();
    
    // Draw ink line with some noise texture
    const gradient = ctx.createLinearGradient(
        inkLine.x - inkLine.width/2, 
        inkLine.y - inkLine.height/2,
        inkLine.x + inkLine.width/2, 
        inkLine.y + inkLine.height/2
    );
    
    gradient.addColorStop(0, colors.indigo);
    gradient.addColorStop(0.5, colors.indigo);
    gradient.addColorStop(1, colors.indigo);
    
    ctx.fillStyle = gradient;
    
    // Draw with noise texture
    ctx.globalAlpha = 0.8;
    ctx.fillRect(
        inkLine.x - inkLine.width/2, 
        inkLine.y - inkLine.height/2, 
        inkLine.width, 
        inkLine.height
    );
    
    // Add some noise effect
    ctx.globalCompositeOperation = 'overlay';
    for (let y = 0; y < canvas.height; y += 20) {
        for (let x = 0; x < canvas.width; x += 20) {
            const value = noise[Math.floor(y)][Math.floor(x)] || 0;
            ctx.globalAlpha = Math.abs(value) * 0.1;
            ctx.fillStyle = colors.indigo;
            ctx.fillRect(x, y, 10, 10);
        }
    }
    
    ctx.restore();
}

// Draw the cursor trail
function drawCursorTrail() {
    if (inkTrail.length === 0) return;
    
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = colors.indigo;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(inkTrail[0].x, inkTrail[0].y);
    
    for (let i = 1; i < inkTrail.length; i++) {
        ctx.lineTo(inkTrail[i].x, inkTrail[i].y);
    }
    
    ctx.stroke();
    ctx.restore();
}

// Draw the entire scene
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = colors.black;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ink line
    drawInkLine();
    
    // Draw cursor trail
    drawCursorTrail();
    
    // Draw cursor
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = colors.indigo;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// Initialize audio context and sounds
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create shing sound (sharp snap)
    shingSound = createShingSound();
    
    // Create rot sound (wet cloth tearing)
    rotSound = createRotSound();
    
    // Create exhale sound (wet breath)
    exhaleSound = createExhaleSound();
}

// Create shing sound with Web Audio API
function createShingSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
    
    return { oscillator, gainNode };
}

// Create rot sound (wet cloth tearing)
function createRotSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    return { oscillator, gainNode, filter };
}

// Create exhale sound (wet breath)
function createExhaleSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(40, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
    
    return { oscillator, gainNode, filter };
}

// Handle mouse/touch movement
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    cursor.x = e.clientX - rect.left;
    cursor.y = e.clientY - rect.top;
    
    // Add to trail
    if (gameState === 'breathing' || gameState === 'slashing') {
        const now = Date.now();
        if (now - cursor.lastTrailTime > 30) { // Limit trail updates
            inkTrail.push({ x: cursor.x, y: cursor.y, time: now });
            cursor.lastTrailTime = now;
        }
    }
}

function handleMouseDown() {
    if (gameState === 'waiting') {
        // Start breathing
        gameState = 'breathing';
        breathTimer = Date.now();
        instructions.style.opacity = 0;
    } else if (gameState === 'breathing') {
        // Start slashing
        slashStartTime = Date.now();
        gameState = 'slashing';
        // Play rot sound
        if (rotSound) {
            createRotSound();
        }
    }
}

function handleMouseUp() {
    if (gameState === 'slashing') {
        const slashDuration = Date.now() - slashStartTime;
        if (slashDuration < slashThreshold) {
            // Successful slash
            success();
        } else {
            // Failed slash (too slow)
            failure();
        }
    }
}

// Successful slash
function success() {
    gameState = 'success';
    // Play shing sound
    if (shingSound) {
        createShingSound();
    }
    
    // Show kanji
    kanji.style.opacity = 1;
    kanji.style.transform = 'translate(-50%, -50%) scale(1.2)';
    
    // Fade out kanji after 3 seconds
    setTimeout(() => {
        kanji.style.opacity = 0;
        kanji.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 3000);
    
    // Show print after 1 second
    setTimeout(() => {
        printImg.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="white"/><circle cx="400" cy="300" r="100" fill="blue"/></svg>';
        printImg.style.opacity = 1;
    }, 1000);
}

// Failed slash (too slow)
function failure() {
    gameState = 'failure';
    // Play exhale sound
    if (exhaleSound) {
        createExhaleSound();
    }
    
    // Fade to black
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reset after delay
    setTimeout(() => {
        reset();
    }, 2000);
}

// Reset the experience
function reset() {
    gameState = 'waiting';
    inkTrail = [];
    instructions.style.opacity = 0.7;
    kanji.style.opacity = 0;
    printImg.style.opacity = 0;
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Animation loop
function animate() {
    if (gameState === 'breathing' || gameState === 'slashing') {
        // Update breath timer
        if (gameState === 'breathing') {
            const timeElapsed = Date.now() - breathTimer;
            if (timeElapsed > slashThreshold) {
                // Auto-fail if user holds too long
                failure();
            }
        }
        
        // Update trail
        if (inkTrail.length > 0) {
            // Remove old trail points
            const now = Date.now();
            inkTrail = inkTrail.filter(point => now - point.time < 1000);
        }
    }
    
    draw();
    requestAnimationFrame(animate);
}

// Event listeners
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    cursor.x = touch.clientX - rect.left;
    cursor.y = touch.clientY - rect.top;
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'waiting') {
        gameState = 'breathing';
        breathTimer = Date.now();
        instructions.style.opacity = 0;
    } else if (gameState === 'breathing') {
        slashStartTime = Date.now();
        gameState = 'slashing';
        if (rotSound) {
            createRotSound();
        }
    }
});
canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState === 'slashing') {
        const slashDuration = Date.now() - slashStartTime;
        if (slashDuration < slashThreshold) {
            success();
        } else {
            failure();
        }
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Initialize
initAudio();
animate();
