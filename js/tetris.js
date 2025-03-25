// Configuración del tablero
const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF3456', // I - rojo brillante
    '#00FFFF', // J - cian brillante
    '#39FF14', // L - verde neón
    '#FF44FF', // O - magenta brillante
    '#FF9933', // S - naranja brillante
    '#FFFF00', // T - amarillo brillante
    '#4488FF'  // Z - azul brillante
];

// Definición de piezas (forma I, J, L, O, S, T, Z)
const PIECES = [
    [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [
        [4, 4],
        [4, 4]
    ],
    [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    [
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// Variables globales
let canvas, ctx;
let nextPieceCanvas, nextPieceCtx;
let board = createBoard();
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let gameOver = false;
let paused = false;
let requestId = null;
let dropStart = Date.now();
let dropInterval = 1000; // Intervalo inicial de caída en ms

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    
    nextPieceCanvas = document.getElementById('next-piece-canvas');
    nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // Ajustamos el tamaño del canvas al tamaño real de los bloques
    ctx.canvas.width = COLS * BLOCK_SIZE;
    ctx.canvas.height = ROWS * BLOCK_SIZE;
    ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    
    // Configuramos el canvas para la siguiente pieza
    nextPieceCtx.canvas.width = 4 * BLOCK_SIZE;
    nextPieceCtx.canvas.height = 4 * BLOCK_SIZE;
    nextPieceCtx.scale(BLOCK_SIZE, BLOCK_SIZE);
    
    document.getElementById('start-button').addEventListener('click', play);
    document.getElementById('pause-button').addEventListener('click', togglePause);
    
    // Eventos de teclado
    document.addEventListener('keydown', handleKeyPress);
});

// Crear un tablero vacío
function createBoard() {
    return Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

// Obtener una pieza aleatoria
function getRandomPiece() {
    const pieceType = Math.floor(Math.random() * PIECES.length);
    const piece = PIECES[pieceType];
    const col = Math.floor(COLS / 2) - Math.floor(piece[0].length / 2);
    const row = 0;
    
    return {
        piece,
        pos: {x: col, y: row},
        type: pieceType + 1
    };
}

// Dibujar el tablero
function drawBoard() {
    // Primero dibujamos un fondo de cuadrícula para mayor visibilidad
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, COLS, ROWS);
    
    // Dibujamos una cuadrícula ligera
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.02;
    
    // Líneas verticales
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ROWS);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(COLS, y);
        ctx.stroke();
    }
    
    // Luego dibujamos las piezas fijadas en el tablero
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                ctx.fillStyle = COLORS[value];
                ctx.fillRect(x, y, 1, 1);
                ctx.strokeStyle = '#FFFFFF'; // Borde blanco para mejor visibilidad
                ctx.lineWidth = 0.05;
                ctx.strokeRect(x, y, 1, 1);
            }
        });
    });
}

// Dibujar una pieza
function drawPiece(piece, context, offsetX = 0, offsetY = 0) {
    piece.piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                context.fillStyle = COLORS[piece.type];
                context.fillRect(x + offsetX, y + offsetY, 1, 1);
                context.strokeStyle = '#FFFFFF'; // Borde blanco para mejor visibilidad
                context.lineWidth = 0.05;
                context.strokeRect(x + offsetX, y + offsetY, 1, 1);
            }
        });
    });
}

// Limpiar el canvas
function clearCanvas(context, canvas) {
    context.clearRect(0, 0, canvas.width / BLOCK_SIZE, canvas.height / BLOCK_SIZE);
}

// Verificar colisión
function checkCollision(piece, pos) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            // Si es un espacio vacío en la pieza, continuamos
            if (piece[y][x] === 0) continue;
            
            // Calcular la posición real en el tablero
            const boardX = pos.x + x;
            const boardY = pos.y + y;
            
            // Comprobar si está fuera de los límites
            if (
                boardX < 0 || 
                boardX >= COLS || 
                boardY >= ROWS || 
                (boardY >= 0 && board[boardY][boardX])
            ) {
                return true;
            }
        }
    }
    return false;
}

// Fijar la pieza en el tablero
function mergePiece() {
    currentPiece.piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                board[y + currentPiece.pos.y][x + currentPiece.pos.x] = currentPiece.type;
            }
        });
    });
}

// Eliminar líneas completadas
function clearLines() {
    let linesCleared = 0;
    
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        
        // Si llega aquí, la línea está completa
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++; // Para volver a revisar la misma posición, que ahora tiene una nueva fila
        
        linesCleared++;
    }
    
    if (linesCleared > 0) {
        // Actualizar puntuación
        lines += linesCleared;
        score += linesCleared * 100 * level;
        
        // Actualizar nivel cada 10 líneas
        level = Math.floor(lines / 10) + 1;
        dropInterval = 1000 - (level - 1) * 100; // Aumentar velocidad con nivel
        
        // Actualizar la interfaz
        document.getElementById('score').textContent = score;
        document.getElementById('lines').textContent = lines;
        document.getElementById('level').textContent = level;
    }
}

// Rotar pieza
function rotatePiece(piece) {
    // Crear una matriz auxiliar para la rotación
    const newPiece = [];
    for (let i = 0; i < piece[0].length; i++) {
        newPiece.push([]);
        for (let j = 0; j < piece.length; j++) {
            newPiece[i].push(piece[piece.length - 1 - j][i]);
        }
    }
    return newPiece;
}

// Manejar eventos de teclado
function handleKeyPress(e) {
    if (gameOver || paused) return;
    
    // Guardar la posición actual
    const pos = {...currentPiece.pos};
    
    switch (e.keyCode) {
        case 37: // Izquierda
            pos.x--;
            break;
        case 39: // Derecha
            pos.x++;
            break;
        case 40: // Abajo (movimiento rápido)
            pos.y++;
            break;
        case 38: // Arriba (rotar)
            const newPiece = rotatePiece(currentPiece.piece);
            if (!checkCollision(newPiece, pos)) {
                currentPiece.piece = newPiece;
            }
            break;
        case 32: // Espacio (caída instantánea)
            while (!checkCollision(currentPiece.piece, pos)) {
                pos.y++;
            }
            pos.y--; // Retroceder una posición (la última válida)
            break;
        case 80: // P (pausa)
            togglePause();
            break;
    }
    
    // Verificar si el movimiento es válido
    if (!checkCollision(currentPiece.piece, pos)) {
        currentPiece.pos = pos;
    }
    
    // Si se presionó espacio, actualizar inmediatamente
    if (e.keyCode === 32) {
        mergePiece();
        clearLines();
        
        // Generar nueva pieza
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
        drawNextPiece();
        
        // Verificar game over después de generar la nueva pieza
        checkGameOver();
    }
}

// Dibujar la siguiente pieza
function drawNextPiece() {
    clearCanvas(nextPieceCtx, nextPieceCanvas);
    
    // Añadir un fondo claro para el canvas de la siguiente pieza
    nextPieceCtx.fillStyle = '#222';
    nextPieceCtx.fillRect(0, 0, 4, 4);
    
    // Dibujamos una cuadrícula ligera
    nextPieceCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    nextPieceCtx.lineWidth = 0.02;
    
    // Líneas verticales
    for (let x = 0; x <= 4; x++) {
        nextPieceCtx.beginPath();
        nextPieceCtx.moveTo(x, 0);
        nextPieceCtx.lineTo(x, 4);
        nextPieceCtx.stroke();
    }
    
    // Líneas horizontales
    for (let y = 0; y <= 4; y++) {
        nextPieceCtx.beginPath();
        nextPieceCtx.moveTo(0, y);
        nextPieceCtx.lineTo(4, y);
        nextPieceCtx.stroke();
    }
    
    // Centrar la pieza en el canvas
    const offsetX = (4 - nextPiece.piece[0].length) / 2;
    const offsetY = (4 - nextPiece.piece.length) / 2;
    
    drawPiece(nextPiece, nextPieceCtx, offsetX, offsetY);
}

// Verificar si el juego ha terminado
function checkGameOver() {
    // El juego termina solo cuando una nueva pieza colisiona al generarse
    // Es decir, cuando no hay espacio para colocar la nueva pieza en la parte superior
    if (currentPiece.pos.y === 0 && checkCollision(currentPiece.piece, currentPiece.pos)) {
        gameOver = true;
        cancelAnimationFrame(requestId);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width / BLOCK_SIZE, canvas.height / BLOCK_SIZE);
        ctx.font = '1px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', COLS / 2, ROWS / 2);
    }
}

// Actualizar el juego
function update() {
    const now = Date.now();
    const delta = now - dropStart;
    
    if (delta > dropInterval) {
        movePieceDown();
        dropStart = now;
    }
    
    if (!gameOver) {
        draw();
        requestId = requestAnimationFrame(update);
    }
}

// Mover la pieza hacia abajo
function movePieceDown() {
    const pos = {...currentPiece.pos};
    pos.y++;
    
    if (!checkCollision(currentPiece.piece, pos)) {
        // Si no hay colisión, la pieza sigue bajando
        currentPiece.pos = pos;
    } else {
        // La pieza ha tocado el fondo o colisiona con otra pieza
        mergePiece();
        clearLines();
        
        // Generar nueva pieza
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
        drawNextPiece();
        
        // Verificar si el juego ha terminado después de generar la nueva pieza
        checkGameOver();
    }
}

// Dibujar todo el juego
function draw() {
    // No limpiamos todo el canvas, solo lo repintamos directamente
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece, ctx, currentPiece.pos.x, currentPiece.pos.y);
    }
}

// Iniciar el juego
function play() {
    // Reiniciar estado del juego
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    dropInterval = 1000;
    
    // Actualizar la interfaz
    document.getElementById('score').textContent = score;
    document.getElementById('lines').textContent = lines;
    document.getElementById('level').textContent = level;
    
    // Generar piezas iniciales
    currentPiece = getRandomPiece();
    nextPiece = getRandomPiece();
    drawNextPiece();
    
    // Iniciar el bucle del juego
    if (requestId) {
        cancelAnimationFrame(requestId);
    }
    
    update();
}

// Pausar/reanudar el juego
function togglePause() {
    if (gameOver) return;
    
    paused = !paused;
    
    if (paused) {
        cancelAnimationFrame(requestId);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width / BLOCK_SIZE, canvas.height / BLOCK_SIZE);
        ctx.font = '1px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSE', COLS / 2, ROWS / 2);
        document.getElementById('pause-button').textContent = "Reanudar";
    } else {
        document.getElementById('pause-button').textContent = "Pausa";
        update();
    }
} 