const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let grid = createGrid(); // Initialiser la grille du jeu

// Fonction pour créer la grille
function createGrid() {
    const rows = 50;
    const cols = 50;
    return new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('public'));

// Lorsque le client se connecte
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Envoyer l'état actuel de la grille au client
    socket.emit('updateGrid', grid);

    // Quand un client clique sur une cellule
    socket.on('cellClick', (x, y) => {
        grid[y][x] = grid[y][x] ? 0 : 1; // Inverser l'état de la cellule
        io.emit('updateGrid', grid); // Diffuser l'état à tous les clients connectés
    });

    // Déconnexion d'un utilisateur
    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Le serveur fonctionne sur http://localhost:${PORT}`);
});
