const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

// Load bird image
const birdImg = new Image();
birdImg.src = 'Bird.png';

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let gameStarted = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.textContent = `High Score: ${highScore}`;

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 40,  // Width of the bird image
    height: 30, // Height of the bird image
    velocity: 0,
    gravity: 0.3,
    jump: -6,
    rotation: 0
};

// Pipe properties
const pipeWidth = 50;
const pipeGap = 150;
const pipes = [];
let pipeSpawnTimer = 0;
const pipeSpawnInterval = 150;

// Animation frame tracking
let animationFrameId;

// Event listeners
document.addEventListener('keydown', handleJump);
document.addEventListener('touchstart', handleJump);
canvas.addEventListener('click', handleJump);
startButton.addEventListener('click', startGame);

// Game functions
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    startScreen.style.display = 'none';
    animate();
}

function handleJump(e) {
    if (gameStarted && !gameOver) {
        bird.velocity = bird.jump;
    }
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

    pipes.push({
        x: canvas.width,
        height: height,
        passed: false
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    // Calculate rotation based on velocity
    bird.rotation = Math.min(Math.PI/4, Math.max(-Math.PI/4, bird.velocity * 0.1));
    ctx.rotate(bird.rotation);
    
    // Draw the bird image centered at its position
    ctx.drawImage(birdImg, -bird.width/2, -bird.height/2, bird.width, bird.height);
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);

        // Draw bottom pipe
        ctx.fillRect(
            pipe.x,
            pipe.height + pipeGap,
            pipeWidth,
            canvas.height - (pipe.height + pipeGap)
        );
    });
}

function checkCollision(pipe) {
    // Adjust collision detection for rectangular bird
    const birdBox = {
        left: bird.x - bird.width/2,
        right: bird.x + bird.width/2,
        top: bird.y - bird.height/2,
        bottom: bird.y + bird.height/2
    };

    // Check collision with top pipe
    if (
        birdBox.right > pipe.x &&
        birdBox.left < pipe.x + pipeWidth &&
        birdBox.top < pipe.height
    ) {
        return true;
    }

    // Check collision with bottom pipe
    if (
        birdBox.right > pipe.x &&
        birdBox.left < pipe.x + pipeWidth &&
        birdBox.bottom > pipe.height + pipeGap
    ) {
        return true;
    }

    return false;
}

function updateGame() {
    if (!gameStarted || gameOver) return;

    // Update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Check for collision with canvas boundaries
    if (bird.y + bird.height/2 > canvas.height || bird.y - bird.height/2 < 0) {
        gameOver = true;
        handleGameOver();
        return;
    }

    // Spawn new pipes
    pipeSpawnTimer++;
    if (pipeSpawnTimer > pipeSpawnInterval) {
        createPipe();
        pipeSpawnTimer = 0;
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 1.5;

        // Check for collision
        if (checkCollision(pipes[i])) {
            gameOver = true;
            handleGameOver();
            return;
        }

        // Update score
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }

        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

function handleGameOver() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
    startScreen.style.display = 'block';
    cancelAnimationFrame(animationFrameId);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawBird();
    drawPipes();
}

function animate() {
    updateGame();
    draw();
    if (!gameOver) {
        animationFrameId = requestAnimationFrame(animate);
    }
}

// Initialize high score display
highScoreElement.textContent = `High Score: ${highScore}`; 