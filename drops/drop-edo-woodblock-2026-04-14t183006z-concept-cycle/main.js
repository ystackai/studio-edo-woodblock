// Main JavaScript implementation for Edo Woodblock Drop

// Global variables
let webcamFeed = document.getElementById('webcam-feed');
let fallbackImage = document.getElementById('fallback-image');
let reflectionCanvas = document.getElementById('reflection-canvas');
let effectsCanvas = document.getElementById('effects-canvas');
let reflectionCtx = reflectionCanvas.getContext('2d');
let effectsCtx = effectsCanvas.getContext('2d');
let despairFill = document.getElementById('despair-fill');
let message = document.getElementById('message');
let saltTexture = document.getElementById('salt-texture');

// Canvas sizing
function resizeCanvases() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    reflectionCanvas.width = width;
    reflectionCanvas.height = height;
    effectsCanvas.width = width;
    effectsCanvas.height = height;
}

// Initialize canvases
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// Despair state
let despair = 0;
let despairRate = 0.005;
let anchorActive = false;
let anchorStartTime = 0;
let anchorDuration = 2000; // 2 seconds to drain despair
let lastDespairTime = 0;
let lastSnapTime = 0;
let snapCooldown = 500; // 500ms cooldown between snaps
let snapActive = false;
let audioContext = null;
let crinklingSound = null;
let clickSound = null;

// Particle system for ink bleeding
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.life = 100;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.size *= 0.97;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life / 100;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

let particles = [];

// Initialize webcam
function initWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                webcamFeed.srcObject = stream;
                webcamFeed.style.display = 'block';
                fallbackImage.style.display = 'none';
            })
            .catch(function(err) {
                console.log("Webcam error: " + err);
                webcamFeed.style.display = 'none';
                fallbackImage.style.display = 'block';
            });
    } else {
        webcamFeed.style.display = 'none';
        fallbackImage.style.display = 'block';
    }
}

// Draw reflection on canvas
function drawReflection() {
    if (webcamFeed.style.display === 'block') {
        // Draw webcam feed with indigo filter
        reflectionCtx.globalAlpha = 0.3;
        reflectionCtx.drawImage(webcamFeed, 0, 0, reflectionCanvas.width, reflectionCanvas.height);
    } else {
        // Draw fallback image
        reflectionCtx.globalAlpha = 0.3;
        reflectionCtx.drawImage(fallbackImage, 0, 0, reflectionCanvas.width, reflectionCanvas.height);
    }
    
    // Apply indigo filter effect
    const imageData = reflectionCtx.getImageData(0, 0, reflectionCanvas.width, reflectionCanvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale first
        const gray = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11);
        
        // Apply indigo tint
        data[i] = gray * 0.3;     // Red
        data[i + 1] = gray * 0.2;  // Green
        data[i + 2] = gray * 0.8;  // Blue
        
        // Apply slight opacity for subtle effect
        data[i + 3] = gray * 0.3;
    }
    
    reflectionCtx.putImageData(imageData, 0, 0);
}

// Ink bleeding effect
function createInkBleed(x, y, intensity) {
    for (let i = 0; i < intensity * 10; i++) {
        particles.push(new Particle(x, y, `rgba(106, 90, 205, ${Math.random() * 0.5 + 0.3})`));
    }
}

// Handle despair meter
function updateDespair() {
    const now = Date.now();
    
    // Regular despair increase
    if (now - lastDespairTime > 100) {
        despair += despairRate;
        lastDespairTime = now;
        
        // Trigger ink bleeding when despair rises
        if (despair > 0.1 && Math.random() < 0.1) {
            createInkBleed(
                Math.random() * reflectionCanvas.width,
                Math.random() * reflectionCanvas.height,
                1
            );
        }
        
        // Trigger more bleeding as despair increases
        if (despair > 0.3 && Math.random() < 0.2) {
            createInkBleed(
                Math.random() * reflectionCanvas.width,
                Math.random() * reflectionCanvas.height,
                2
            );
        }
    }
    
    // Anchor mechanic
    if (anchorActive && now - anchorStartTime > 500) {
        despair -= 0.01;
    }
    
    // Clamp despair between 0 and 1
    despair = Math.max(0, Math.min(1, despair));
    
    // Update despair meter display
    despairFill.style.width = (despair * 100) + '%';
    
    // Check for salt texture state
    if (despair >= 1) {
        showSaltTexture();
    }
}

// Show salt texture and message
function showSaltTexture() {
    saltTexture.style.display = 'block';
    message.style.opacity = '1';
    message.style.color = '#8a2be2';
}

// Handle audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create crinkling sound
        crinklingSound = createCrinklingSound();
        
        // Create click sound
        clickSound = createClickSound();
    } catch (e) {
        console.log("Audio not supported: " + e);
    }
}

// Create crinkling sound
function createCrinklingSound() {
    if (!audioContext) return null;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
    
    return oscillator;
}

// Create click sound
function createClickSound() {
    if (!audioContext) return null;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
    
    return oscillator;
}

// Handle scroll events for anchor and snap mechanics
let scrollY = 0;
let lastScrollY = 0;

function handleScroll() {
    const now = Date.now();
    scrollY = window.scrollY;
    
    // Anchor mechanic - check if user is holding scroll
    if (scrollY > lastScrollY) {
        anchorActive = true;
        anchorStartTime = now;
    } else {
        anchorActive = false;
    }
    
    // Snap mechanic - quick scroll triggers click
    const scrollDiff = Math.abs(scrollY - lastScrollY);
    if (scrollDiff > 200 && now - lastSnapTime > snapCooldown) {
        lastSnapTime = now;
        snapActive = true;
        
        // Trigger delayed click
        setTimeout(() => {
            // Create click effect
            if (clickSound) {
                createClickSound();
            }
            
            // Simulate click at center of screen
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: window.innerWidth / 2,
                clientY: window.innerHeight / 2
            });
            
            // Trigger click on body
            document.body.dispatchEvent(clickEvent);
            
            // Reset snap state
            snapActive = false;
        }, 100);
        
        // Play crinkling sound
        if (crinklingSound) {
            createCrinklingSound();
        }
    }
    
    lastScrollY = scrollY;
}

// Main animation loop
function animate() {
    // Clear canvases
    reflectionCtx.clearRect(0, 0, reflectionCanvas.width, reflectionCanvas.height);
    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
    
    // Draw reflection
    drawReflection();
    
    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(effectsCtx);
        
        // Remove dead particles
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    
    // Update despair meter
    updateDespair();
    
    // Continue animation loop
    requestAnimationFrame(animate);
}

// Initialize everything
function init() {
    initWebcam();
    initAudio();
    window.addEventListener('scroll', handleScroll);
    animate();
}

// Start the application
window.addEventListener('load', init);
