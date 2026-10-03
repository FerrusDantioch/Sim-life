// On récupère notre élément canvas depuis le fichier HTML grâce à son ID
const canvas = document.getElementById('gameCanvas');

// On récupère le "contexte 2D", c'est l'outil qui va nous permettre de dessiner sur le canvas
const ctx = canvas.getContext('2d');

// On définit les propriétés de notre personnage
const player = {
    x: 400, // Position horizontale au centre
    y: 300, // Position verticale au centre
    radius: 15, // Rayon de notre cercle
    speed: 5, // Vitesse de déplacement
    color: "#ff4d4d", // Rouge clair pour le corps
    direction: 'down' // Direction initiale vers laquelle il regarde
};

// --- GÉNÉRATION DES ARBRES ---
const trees = [];
const numTrees = 15;
const treeRadius = 15; // Rayon de collision de la base de l'arbre

// On crée les arbres à des positions aléatoires
for (let i = 0; i < numTrees; i++) {
    let treeX, treeY;
    let distanceToPlayer;

    // On s'assure qu'aucun arbre n'apparaît directement sur le joueur
    do {
        treeX = Math.random() * (canvas.width - 60) + 30; // On évite les bords
        treeY = Math.random() * (canvas.height - 60) + 30;

        // Calcul de la distance entre le joueur et le futur arbre
        const dx = treeX - player.x;
        const dy = treeY - player.y;
        distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    } while (distanceToPlayer < 100); // L'arbre doit être à au moins 100 pixels du joueur au départ

    // On ajoute l'arbre à notre tableau
    trees.push({
        x: treeX,
        y: treeY,
        radius: treeRadius
    });
}

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
    }
});

// Quand on relâche une touche
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// --- LOGIQUE DE COLLISION ---

// Fonction pour vérifier si deux cercles (ex: le joueur et un arbre) se touchent
function checkCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Il y a collision si la distance est plus petite que la somme des rayons
    return distance < (r1 + r2);
}

// Fonction pour vérifier si le joueur peut se déplacer à une nouvelle position
function canMoveTo(newX, newY) {
    // 1. Vérification des bords du canvas
    if (newX - player.radius < 0 || newX + player.radius > canvas.width ||
        newY - player.radius < 0 || newY + player.radius > canvas.height) {
        return false; // Mouvement bloqué par un bord
    }

    // 2. Vérification des collisions avec tous les arbres
    for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];
        if (checkCollision(newX, newY, player.radius, tree.x, tree.y, tree.radius)) {
            return false; // Mouvement bloqué par un arbre
        }
    }

    // Si aucune collision, le mouvement est possible
    return true;
}

// --- LOGIQUE DU JEU ---

// Cette fonction va mettre à jour la position du joueur et le dessiner
function gameLoop() {
    // 1. MISE À JOUR DE LA POSITION

    // On calcule la future position pour chaque axe séparément pour permettre de "glisser"
    // contre les obstacles (au lieu d'être complètement bloqué)

    if (keys.ArrowUp) {
        player.direction = 'up';
        if (canMoveTo(player.x, player.y - player.speed)) {
            player.y -= player.speed;
        }
    }
    if (keys.ArrowDown) {
        player.direction = 'down';
        if (canMoveTo(player.x, player.y + player.speed)) {
            player.y += player.speed;
        }
    }
    if (keys.ArrowLeft) {
        player.direction = 'left';
        if (canMoveTo(player.x - player.speed, player.y)) {
            player.x -= player.speed;
        }
    }
    if (keys.ArrowRight) {
        player.direction = 'right';
        if (canMoveTo(player.x + player.speed, player.y)) {
            player.x += player.speed;
        }
    }

    // 2. DESSIN À L'ÉCRAN

    // On efface tout le canvas avant de redessiner
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // a. Dessin des arbres
    for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];

        // Ombre (un ovale gris foncé transparent)
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        // ctx.ellipse(x, y, rayonX, rayonY, rotation, angleDebut, angleFin)
        ctx.ellipse(tree.x, tree.y + 10, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        // Emoji Arbre
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        // L'émoji est positionné pour que la base de l'arbre corresponde à sa zone de collision
        ctx.fillText("🌲", tree.x, tree.y + 15);
    }

    // b. Dessin du joueur (corps)
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    // c. Dessin des yeux du joueur
    ctx.fillStyle = "black";
    const eyeRadius = 3;
    let eyeOffsetX1 = 0, eyeOffsetY1 = 0;
    let eyeOffsetX2 = 0, eyeOffsetY2 = 0;

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