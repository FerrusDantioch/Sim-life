// On récupère notre élément canvas depuis le fichier HTML grâce à son ID
const canvas = document.getElementById('gameCanvas');

// On récupère le "contexte 2D", c'est l'outil qui va nous permettre de dessiner sur le canvas
const ctx = canvas.getContext('2d');

// On définit les propriétés de notre personnage
const player = {
    x: 400, // Position horizontale au centre
    y: 300, // Position verticale au centre
    radius: 15, // Rayon de notre cercle (remplace la taille de l'émoji)
    speed: 5, // Vitesse de déplacement
    color: "#ff4d4d", // Rouge clair pour le corps
    direction: 'down' // Direction initiale vers laquelle il regarde
};

// On garde une trace des touches du clavier actuellement pressées
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// --- GESTION DES TOUCHES DU CLAVIER ---

// Quand on appuie sur une touche
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
        // On met à jour la direction selon la touche pressée
        if (event.key === 'ArrowUp') player.direction = 'up';
        if (event.key === 'ArrowDown') player.direction = 'down';
        if (event.key === 'ArrowLeft') player.direction = 'left';
        if (event.key === 'ArrowRight') player.direction = 'right';
    }
});

// Quand on relâche une touche
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// --- LOGIQUE DU JEU ---

// Cette fonction va mettre à jour la position du joueur et le dessiner
function gameLoop() {
    // 1. MISE À JOUR DE LA POSITION

    // Pour ne pas sortir du canvas, on prend en compte le rayon (radius) du cercle
    // au lieu de la taille de l'émoji

    // Haut
    if (keys.ArrowUp && player.y - player.radius > 0) {
        player.y -= player.speed;
        player.direction = 'up'; // Met à jour la direction en continu si maintenu
    }
    // Bas
    if (keys.ArrowDown && player.y + player.radius < canvas.height) {
        player.y += player.speed;
        player.direction = 'down';
    }
    // Gauche
    if (keys.ArrowLeft && player.x - player.radius > 0) {
        player.x -= player.speed;
        player.direction = 'left';
    }
    // Droite
    if (keys.ArrowRight && player.x + player.radius < canvas.width) {
        player.x += player.speed;
        player.direction = 'right';
    }

    // 2. DESSIN À L'ÉCRAN

    // On efface tout le canvas avant de redessiner
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessin du corps (un cercle)
    ctx.beginPath(); // On commence un nouveau tracé
    // arc(x, y, rayon, angle_debut, angle_fin) crée un cercle complet
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color; // Couleur de remplissage
    ctx.fill(); // On remplit le cercle
    ctx.closePath(); // On ferme le tracé

    // Dessin des yeux (deux petits cercles noirs)
    ctx.fillStyle = "black";
    const eyeRadius = 3; // Taille des yeux
    let eyeOffsetX1 = 0, eyeOffsetY1 = 0; // Position relative de l'oeil 1
    let eyeOffsetX2 = 0, eyeOffsetY2 = 0; // Position relative de l'oeil 2

    // On positionne les yeux selon la direction
    if (player.direction === 'up') {
        eyeOffsetX1 = -5; eyeOffsetY1 = -7;
        eyeOffsetX2 = 5;  eyeOffsetY2 = -7;
    } else if (player.direction === 'down') {
        eyeOffsetX1 = -5; eyeOffsetY1 = 7;
        eyeOffsetX2 = 5;  eyeOffsetY2 = 7;
    } else if (player.direction === 'left') {
        eyeOffsetX1 = -7; eyeOffsetY1 = -5;
        eyeOffsetX2 = -7; eyeOffsetY2 = 5;
    } else if (player.direction === 'right') {
        eyeOffsetX1 = 7; eyeOffsetY1 = -5;
        eyeOffsetX2 = 7; eyeOffsetY2 = 5;
    }

    // Oeil 1
    ctx.beginPath();
    ctx.arc(player.x + eyeOffsetX1, player.y + eyeOffsetY1, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Oeil 2
    ctx.beginPath();
    ctx.arc(player.x + eyeOffsetX2, player.y + eyeOffsetY2, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // 3. BOUCLE
    requestAnimationFrame(gameLoop);
}

// On lance la boucle de jeu pour la première fois
gameLoop();