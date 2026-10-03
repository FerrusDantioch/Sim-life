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

        const dx = treeX - player.x;
        const dy = treeY - player.y;
        distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    } while (distanceToPlayer < 100);

    // On ajoute l'arbre à notre tableau
    // Nouvelle propriété: shaken (secoué)
    trees.push({
        x: treeX,
        y: treeY,
        radius: treeRadius,
        shaken: false
    });
}

// --- OBJETS AU SOL ---
const items = [];

// On garde une trace des touches du clavier actuellement pressées
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Action: false // Représente la touche "E" ou le bouton Action
};

// --- GESTION DES ENTRÉES (CLAVIER ET BOUTONS TACTILES) ---

// Fonction pour gérer les actions (secouer un arbre)
function performAction() {
    // On cherche l'arbre le plus proche
    let closestTree = null;
    let minDistance = 50; // Distance max pour pouvoir secouer l'arbre (50 pixels)

    for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];
        if (!tree.shaken) {
            const dx = player.x - tree.x;
            const dy = player.y - tree.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                closestTree = tree;
                minDistance = distance;
            }
        }
    }

    // Si on a trouvé un arbre assez proche et non secoué
    if (closestTree) {
        closestTree.shaken = true; // On marque l'arbre comme secoué

        // On fait apparaître une pomme juste au pied de l'arbre
        items.push({
            type: 'apple',
            x: closestTree.x,
            y: closestTree.y + 25, // Un peu plus bas que le centre de l'arbre
            radius: 10 // Rayon de collision de la pomme
        });
    }
}

// Écouteurs de clavier
window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
    // Si on appuie sur 'E' ou 'e', on déclenche l'action
    if (event.key === 'e' || event.key === 'E') {
        if (!keys.Action) { // Pour ne le faire qu'une fois par appui
            performAction();
            keys.Action = true;
        }
    }
});

window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
    if (event.key === 'e' || event.key === 'E') {
        keys.Action = false;
    }
});

// Écouteurs pour les boutons tactiles
const btnMap = {
    'btn-up': 'ArrowUp',
    'btn-down': 'ArrowDown',
    'btn-left': 'ArrowLeft',
    'btn-right': 'ArrowRight'
};

// Ajouter les événements pour chaque bouton directionnel
for (const [btnId, keyName] of Object.entries(btnMap)) {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('mousedown', () => keys[keyName] = true);
        btn.addEventListener('mouseup', () => keys[keyName] = false);
        btn.addEventListener('mouseleave', () => keys[keyName] = false);

        // Pour le tactile sur mobile
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyName] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyName] = false; });
    }
}

// Bouton d'action tactile
const btnAction = document.getElementById('btn-action');
if (btnAction) {
    // Pour l'ordinateur
    btnAction.addEventListener('mousedown', () => {
        performAction();
        btnAction.classList.add('active'); // Effet visuel
    });
    btnAction.addEventListener('mouseup', () => btnAction.classList.remove('active'));
    btnAction.addEventListener('mouseleave', () => btnAction.classList.remove('active'));

    // Pour le mobile
    btnAction.addEventListener('touchstart', (e) => {
        e.preventDefault();
        performAction();
        btnAction.classList.add('active');
    });
    btnAction.addEventListener('touchend', (e) => {
        e.preventDefault();
        btnAction.classList.remove('active');
    });
}

// --- LOGIQUE DE COLLISION ---

// Fonction pour vérifier si deux cercles se touchent
function checkCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (r1 + r2);
}

// Fonction pour vérifier si le joueur peut se déplacer (collisions murs/arbres)
function canMoveTo(newX, newY) {
    if (newX - player.radius < 0 || newX + player.radius > canvas.width ||
        newY - player.radius < 0 || newY + player.radius > canvas.height) {
        return false;
    }

    for (let i = 0; i < trees.length; i++) {
        const tree = trees[i];
        if (checkCollision(newX, newY, player.radius, tree.x, tree.y, tree.radius)) {
            return false;
        }
    }

    return true;
}

// Fonction pour vérifier si on ramasse un objet
function checkItemPickup() {
    // On boucle à l'envers pour pouvoir supprimer des éléments du tableau sans problème
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        // Si le joueur touche la pomme
        if (checkCollision(player.x, player.y, player.radius, item.x, item.y, item.radius)) {
            // On la retire du tableau (elle est ramassée !)
            items.splice(i, 1);
        }
    }
}

// --- LOGIQUE DU JEU ---

// Cette fonction va mettre à jour la position du joueur et le dessiner
function gameLoop() {
    // 1. MISE À JOUR DE LA POSITION ET INTERACTIONS

    if (keys.ArrowUp) {
        player.direction = 'up';
        if (canMoveTo(player.x, player.y - player.speed)) player.y -= player.speed;
    }
    if (keys.ArrowDown) {
        player.direction = 'down';
        if (canMoveTo(player.x, player.y + player.speed)) player.y += player.speed;
    }
    if (keys.ArrowLeft) {
        player.direction = 'left';
        if (canMoveTo(player.x - player.speed, player.y)) player.x -= player.speed;
    }
    if (keys.ArrowRight) {
        player.direction = 'right';
        if (canMoveTo(player.x + player.speed, player.y)) player.x += player.speed;
    }

    // Vérifier si le joueur marche sur un objet
    checkItemPickup();

    // 2. DESSIN À L'ÉCRAN
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // On crée une liste d'éléments à dessiner pour les trier par profondeur (Y)
    const renderQueue = [];

    // Ajouter les arbres à la file
    for (let i = 0; i < trees.length; i++) {
        renderQueue.push({ type: 'tree', data: trees[i], y: trees[i].y });
    }

    // Ajouter les objets au sol (pommes)
    for (let i = 0; i < items.length; i++) {
        renderQueue.push({ type: 'item', data: items[i], y: items[i].y });
    }

    // Ajouter le joueur
    renderQueue.push({ type: 'player', data: player, y: player.y });

    // Trier la file de rendu du haut vers le bas de l'écran (Y croissant)
    // Cela permet de dessiner ce qui est "devant" après ce qui est "derrière"
    renderQueue.sort((a, b) => a.y - b.y);

    // Dessiner les éléments dans le bon ordre
    for (let i = 0; i < renderQueue.length; i++) {
        const entity = renderQueue[i];

        if (entity.type === 'tree') {
            const tree = entity.data;
            // Ombre
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.ellipse(tree.x, tree.y + 10, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            // Emoji Arbre
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🌲", tree.x, tree.y + 15);
        }
        else if (entity.type === 'item') {
            const item = entity.data;
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🍎", item.x, item.y + 7); // +7 pour centrer l'émoji sur la coordonnée
        }
        else if (entity.type === 'player') {
            // Dessin du corps
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fillStyle = player.color;
            ctx.fill();
            ctx.closePath();

            // Dessin des yeux
            ctx.fillStyle = "black";
            const eyeRadius = 3;
            let eyeOffsetX1 = 0, eyeOffsetY1 = 0;
            let eyeOffsetX2 = 0, eyeOffsetY2 = 0;

            if (player.direction === 'up') {
                eyeOffsetX1 = -5; eyeOffsetY1 = -7; eyeOffsetX2 = 5;  eyeOffsetY2 = -7;
            } else if (player.direction === 'down') {
                eyeOffsetX1 = -5; eyeOffsetY1 = 7; eyeOffsetX2 = 5;  eyeOffsetY2 = 7;
            } else if (player.direction === 'left') {
                eyeOffsetX1 = -7; eyeOffsetY1 = -5; eyeOffsetX2 = -7; eyeOffsetY2 = 5;
            } else if (player.direction === 'right') {
                eyeOffsetX1 = 7; eyeOffsetY1 = -5; eyeOffsetX2 = 7; eyeOffsetY2 = 5;
            }

            ctx.beginPath(); ctx.arc(player.x + eyeOffsetX1, player.y + eyeOffsetY1, eyeRadius, 0, Math.PI * 2); ctx.fill(); ctx.closePath();
            ctx.beginPath(); ctx.arc(player.x + eyeOffsetX2, player.y + eyeOffsetY2, eyeRadius, 0, Math.PI * 2); ctx.fill(); ctx.closePath();
        }
    }

    // 3. BOUCLE
    requestAnimationFrame(gameLoop);
}

// On lance la boucle de jeu
gameLoop();