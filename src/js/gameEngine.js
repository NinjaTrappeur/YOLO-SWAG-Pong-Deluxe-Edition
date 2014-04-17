/*
 * This composant compute the game state.
 * It needs a GameState to compute it.
 */

/*global THREE, Position, Size, extendClass, number, string, GameState, Ball, Bat,
Obstacle, THREEx, console*/

/*jslint plusplus: true */

var GameEngine = function (gameState) {
    "use strict";
    if (gameState instanceof GameState) {
        this.gameState = gameState;
        this.batStep = 0.001;
        this.keyboard = new THREEx.KeyboardState();
        this.initGame();
    } else { throw ("The game engine needs a GameState in parameter."); }
};

GameEngine.prototype.initGame = function () {
    "use strict";
    this.gameState.bat = new Bat(new THREE.Vector3(0, 0, 0), new Size(0.1, 0.1));
    this.bat = this.createMesh(this.gameState.bat.position, this.gameState.bat.size);
};

GameEngine.prototype.computeKeyboard = function () {
    "use strict";
    if (this.keyboard.pressed("right")) {
        this.moveMesh(this.bat, new THREE.Vector3(0.01, 0, 0));
        this.gameState.bat.position = this.bat[1];
    } else if (this.keyboard.pressed("left")) {
        this.moveMesh(this.bat, new THREE.Vector3(-0.01, 0, 0));
        this.gameState.bat.position = this.bat[1];
    } else if (this.keyboard.pressed("s")) {
        this.running = true;
    } else if (this.keyboard.pressed("p")) {
        this.running = false;
    }
};

GameEngine.prototype.compute = function () {
    "use strict";
    this.computeKeyboard();
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
    this.gameState.dummyMeshes = [];
    for (i = 0; i < 3; i++) {
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = position.x + size.width / 2 +
            ((-2 * this.gameState.arena.size.width / 2) +
             (2 * this.gameState.arena.size.width / 2 * i));
        mesh.position.y = position.y;
        mesh.position.z = 0;
        meshTab.push(mesh);
        this.gameState.dummyMeshes.push(mesh);
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