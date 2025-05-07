// Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const size = 500;
const resolution = 40;
const cellSize = size / resolution;
let grid = createGrid();
let running = false;
let animationId;
let speed = 300;
let isDrawing = false;

// Initialisation
canvas.width = canvas.height = size;
drawGrid();

function createGrid() {
    return Array(resolution).fill().map(() => Array(resolution).fill(0));
}

function drawGrid() {
    ctx.clearRect(0, 0, size, size);
    
    // Cellules en blanc
    ctx.fillStyle = '#FFFFFF';
    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            if (grid[y][x]) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
            }
        }
    }
    
    // Grille
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= resolution; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(size, i * cellSize);
        ctx.stroke();
    }
}

function update() {
    const newGrid = createGrid();
    for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx, ny = y + dy;
                    if (nx >= 0 && nx < resolution && ny >= 0 && ny < resolution) {
                        neighbors += grid[ny][nx];
                    }
                }
            }
            newGrid[y][x] = (grid[y][x] && (neighbors === 2 || neighbors === 3)) || (!grid[y][x] && neighbors === 3) ? 1 : 0;
        }
    }
    grid = newGrid;
    drawGrid();
}

function gameLoop() {
    if (running) {
        update();
        setTimeout(() => {
            animationId = requestAnimationFrame(gameLoop);
        }, speed);
    }
}

// Gestion précise du dessin
function getExactCell(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((e.clientX - rect.left) / cellSize),
        y: Math.floor((e.clientY - rect.top) / cellSize)
    };
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const {x, y} = getExactCell(e);
    if (x >= 0 && x < resolution && y >= 0 && y < resolution) {
        grid[y][x] = grid[y][x] ? 0 : 1;
        drawGrid();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const {x, y} = getExactCell(e);
    if (x >= 0 && x < resolution && y >= 0 && y < resolution) {
        grid[y][x] = 1;
        drawGrid();
    }
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Contrôles
document.getElementById('startBtn').addEventListener('click', () => {
    if (!running) {
        running = true;
        gameLoop();
    }
});

document.getElementById('stopBtn').addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(animationId);
});

document.getElementById('randomBtn').addEventListener('click', () => {
    grid = createGrid().map(row => 
        row.map(() => Math.random() > 0.7 ? 1 : 0)
    );
    drawGrid();
});

document.getElementById('clearBtn').addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(animationId);
    grid = createGrid();
    drawGrid();
});