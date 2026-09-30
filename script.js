// On récupère notre élément canvas depuis le fichier HTML grâce à son ID
const canvas = document.getElementById('gameCanvas');

// On récupère le "contexte 2D", c'est l'outil qui va nous permettre de dessiner sur le canvas
const ctx = canvas.getContext('2d');

// On définit les propriétés de notre personnage
const player = {
    x: 400, // Position horizontale (au milieu du canvas de 800px)
    y: 300, // Position verticale (au milieu du canvas de 600px)
    size: 30, // Taille approximative de l'émoji
    speed: 5, // Vitesse de déplacement du personnage
    emoji: "🧍" // L'apparence de notre personnage
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
    // Si la touche pressée fait partie de notre objet 'keys', on dit qu'elle est enfoncée (true)
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

// Quand on relâche une touche
window.addEventListener('keyup', (event) => {
    // On dit que la touche n'est plus enfoncée (false)
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// --- LOGIQUE DU JEU ---

// Cette fonction va mettre à jour la position du joueur et le dessiner
function gameLoop() {
    // 1. MISE À JOUR DE LA POSITION

    // Si on appuie sur la flèche du HAUT et que le personnage ne dépasse pas le haut du canvas (0)
    if (keys.ArrowUp && player.y - player.size > 0) {
        player.y -= player.speed; // On monte (y diminue)
    }
    // Si on appuie sur la flèche du BAS et que le personnage ne dépasse pas le bas du canvas (600)
    // On ajoute 'player.size' car l'émoji est dessiné depuis son coin en bas à gauche par défaut avec la font
    if (keys.ArrowDown && player.y < canvas.height) {
        player.y += player.speed; // On descend (y augmente)
    }
    // Si on appuie sur la flèche de GAUCHE et que le personnage ne dépasse pas la gauche du canvas (0)
    // On soustrait 'player.size' pour ne pas que sa tête dépasse à gauche
    if (keys.ArrowLeft && player.x - player.size / 2 > 0) {
        player.x -= player.speed; // On va à gauche (x diminue)
    }
    // Si on appuie sur la flèche de DROITE et que le personnage ne dépasse pas la droite du canvas (800)
    if (keys.ArrowRight && player.x + player.size / 2 < canvas.width) {
        player.x += player.speed; // On va à droite (x augmente)
    }

    // 2. DESSIN À L'ÉCRAN

    // On efface tout le canvas avant de redessiner à la nouvelle position.
    // Sinon, le personnage laisserait une trace derrière lui !
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // On dessine l'émoji
    ctx.font = `${player.size}px Arial`; // On définit la taille et la police
    ctx.textAlign = "center"; // On centre le texte horizontalement sur 'x'
    ctx.fillText(player.emoji, player.x, player.y); // On dessine l'émoji aux coordonnées x et y

    // 3. BOUCLE

    // On demande au navigateur d'appeler 'gameLoop' à nouveau à la prochaine image (frame)
    // C'est ce qui crée l'animation fluide !
    requestAnimationFrame(gameLoop);
}

// On lance la boucle de jeu pour la première fois pour démarrer
gameLoop();