const socket = io(); // Connexion avec le serveur Socket.IO

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const size = 500;
const rows = 50;
const cols = 50;
const cellSize = size / rows;
let grid = createGrid();
let running = false;
let interval;

canvas.width = canvas.height = size;

function createGrid() {
    return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

function drawGrid() {
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = "gray";
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            if (grid[y][x]) {
                ctx.fillStyle = "white";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function getNextGen(grid) {
    const newGrid = createGrid();
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ny = y + dy, nx = x + dx;
                    if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                        neighbors += grid[ny][nx];
                    }
                }
            }
            if (grid[y][x]) {
                newGrid[y][x] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                newGrid[y][x] = neighbors === 3 ? 1 : 0;
            }
        }
    }
    return newGrid;
}

function update() {
    grid = getNextGen(grid);
    drawGrid();
}

socket.on('updateGrid', (newGrid) => {
    grid = newGrid;
    drawGrid();
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    socket.emit('cellClick', x, y); // Envoyer l'événement de clic au serveur
});

document.getElementById("startBtn").addEventListener("click", () => {
    if (!running) {
        running = true;
        interval = setInterval(update, 100);
    }
});

document.getElementById("stopBtn").addEventListener("click", () => {
    running = false;
    clearInterval(interval);
});

document.getElementById("randomBtn").addEventListener("click", () => {
    grid = createGrid().map(row => row.map(() => Math.random() > 0.7 ? 1 : 0));
    drawGrid();
});

document.getElementById("clearBtn").addEventListener("click", () => {
    grid = createGrid();
    drawGrid();
});

drawGrid();
