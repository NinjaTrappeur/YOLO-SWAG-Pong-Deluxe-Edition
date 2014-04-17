/*
 * This composant compute the game state.
 * It needs a GameState to compute it.
 */

/*global THREE, Position, Size, extendClass, number, string, GameState, Ball, Bat,
Obstacle, THREEx, console*/

/*jslint plusplus: true */
var lastObstacleId = null;

var GameEngine = function (gameState) {
    "use strict";
    if (gameState instanceof GameState) {
        this.gameState = gameState;
        this.batStep = 0.01;
        this.obstacles = {};
        //yMin is the position where the obstacles disapear.
        this.ymin = -this.gameState.arena.length / 2 - 0.4;
        //When we need to generate a new obstacle.
        this.nextObstaclePositionY = 0;
        this.obstacleLength = 0.1;
        this.obstaclesVelocity = new THREE.Vector3(0, -0.005, 0);
        this.lastObstacleGenerated = null;
        this.keyboard = new THREEx.KeyboardState();
        this.initGame();
    } else { throw ("The game engine needs a GameState in parameter."); }
};

GameEngine.prototype.initGame = function () {
    "use strict";
    this.gameState.bat = new Bat(new THREE.Vector3(0, -0.8, 0), new Size(0.1, 0.1));
    this.bat = this.createMesh(this.gameState.bat.position, this.gameState.bat.size);
};

GameEngine.prototype.computeKeyboard = function () {
    "use strict";
    if (this.keyboard.pressed("right")) {
        this.moveMesh(this.bat, new THREE.Vector3(this.batStep, 0, 0));
        this.gameState.bat.position = this.bat[1].position;
    } else if (this.keyboard.pressed("left")) {
        this.moveMesh(this.bat, new THREE.Vector3(-this.batStep, 0, 0));
        this.gameState.bat.position = this.bat[1].position;
    } else if (this.keyboard.pressed("s")) {
        this.gameState.gameState = "running";
    } else if (this.keyboard.pressed("p")) {
        this.gameState.gameState = "paused";
    }
};

GameEngine.prototype.compute = function () {
    "use strict";
    this.computeKeyboard();
    if (this.gameState.gameState === "running") {
        this.computeObstacles();
    }
};

//GameEngine.prototype.computeCollisions = function () {
//    "use strict";
//    if (this.batInvincibleTime < 0) {
//        this.computeBatsCollisions();
//    } else {
//        this.batInvincibleTime -= 1;
//    }
//    this.computeBallsCollisions();
//};


//GameEngine.prototype.createBoxRayOrigin = function (position, size, nbRays) {
//    "use strict";
//    var i, j, origins, center, lengths, nbLength;
//    origins = [];
//    center = new THREE.Vector3(position.x, position.y, position.z);
//    origins.push(center);
//    lengths = [-size.length / 2, size.length / 2];
//    for (i = 0; i < lengths.length; i++) {
//        nbLength = lengths[i];
//        for (j = 0; j < nbRays; j++) {
//            origins.push(new THREE.Vector3(j * size.width / nbRays +
//                                           (position.x - size.width / 2),
//                                           position.y + nbLength,
//                                           position.z));
//        }
//    }
//    return origins;
//};

//Meshes handling
//-------------------

GameEngine.prototype.createMesh = function (position, size) {
    "use strict";
    var i, geometry, material, mesh, meshTab;
    geometry = new THREE.CubeGeometry(size.width, size.length, size.length);
    material = new THREE.MeshBasicMaterial();
    meshTab = [];
    for (i = 0; i < 3; i++) {
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = position.x +
            ((-2 * this.gameState.arena.size.width / 2 * i) +
             (2 * this.gameState.arena.size.width / 2 * i));
        mesh.position.y = position.y;
        mesh.position.z = 0;
        meshTab.push(mesh);
    }
    return meshTab;
};

GameEngine.prototype.moveMesh = function (meshes, velocityVector) {
    "use strict";
    var arenaWidth, meshX, trueVelocityX, i, mesh;
    arenaWidth = this.gameState.arena.size.width / 2;
    meshX = meshes[1].position.x;
    if (meshX + velocityVector.x < -arenaWidth) {
        trueVelocityX = arenaWidth * 2 + velocityVector.x;
    } else if (meshX + velocityVector.x > arenaWidth) {
        trueVelocityX = velocityVector.x - arenaWidth * 2;
    } else {
        trueVelocityX = velocityVector.x;
    }
    for (i = 0; i < meshes.length; i++) {
        mesh = meshes[i];
        mesh.position =
            new THREE.Vector3(mesh.position.x + trueVelocityX,
                              mesh.position.y + velocityVector.y, 0);
    }
};

//Obstacles Generator
//-------------------------------------

GameEngine.prototype.generateObstacle = function (maxWidth, maxLength, yPos) {
    "use strict";
    var size, width, length, position, meshes, arenaWidth, rand;
    position = new THREE.Vector3();
    position.y = yPos;
    arenaWidth = this.gameState.arena.size.width;
    rand = Math.random() * arenaWidth;
    position.x = rand - arenaWidth / 2;

    
    width = Math.random() * maxWidth + 0.1;
    length = this.obstacleLength;
    size = new Size(width, length);
    meshes = this.createMesh(position, size);
    return [meshes, new Size(width, length)];
};

GameEngine.prototype.createObstacle = function () {
    "use strict";
    var arenaSize, result;
    arenaSize = this.gameState.arena.size;
    if (this.lastObstacleGenerated === null) {
        this.lastObstacleGenerated = -1;
    }
    
    result = this.generateObstacle(3 * (arenaSize.width / 4), arenaSize.length / 8,
                              (arenaSize.length / 2) +  arenaSize.length / 6);
    this.obstacles[this.lastObstacleGenerated + 1] = result[0];
    this.gameState.obstacles[this.lastObstacleGenerated + 1] =
        new Obstacle(result[0][1].position, result[1]);
    this.gameState.popId = this.lastObstacleGenerated + 1;
    this.lastObstacleGenerated += 1;
    this.nextObstaclePositionY = (arenaSize.length / 2) -
        Math.random() * (arenaSize.length / 6);
};

GameEngine.prototype.moveObstacles = function () {
    "use strict";
    var obstacleGroup;
    for (obstacleGroup in this.obstacles) {
        this.moveMesh(this.obstacles[obstacleGroup], this.obstaclesVelocity);
        this.gameState.obstacles[obstacleGroup].position.add(this.obstaclesVelocity);
        if (this.obstacles[obstacleGroup][1].position.y <
                -(7 * (this.gameState.arena.size.length / 12.0))) {
            delete this.obstacles[obstacleGroup];
            delete this.gameState.obstacles[obstacleGroup];
            this.gameState.vanishId = obstacleGroup;
        }
    }
};

GameEngine.prototype.computeObstacles = function () {
    "use strict";
    var mesh;
    if (this.lastObstacleGenerated === null ||
            this.obstacles[this.lastObstacleGenerated][1].position.y <
            this.nextObstaclePositionY) {
        this.createObstacle();
    }
    this.moveObstacles();
};