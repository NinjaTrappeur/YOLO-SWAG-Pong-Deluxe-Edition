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
        this.batStep = 0.015;
        this.keyboard = new THREEx.KeyboardState();
        this.initGame();
    } else { throw ("The game engine needs a GameState in parameter."); }
};

GameEngine.prototype.initGame = function () {
    "use strict";
    var storage;
    this.obstacles = {};
    //yMin is the position where the obstacles disapear.
    this.ymin = -this.gameState.arena.length / 2 - 0.4;
    //When we need to generate a new obstacle.
    this.nextObstaclePositionY = 0;
    this.obstacleLength = 0.05;
    this.obstaclesVelocity = new THREE.Vector3(0, -0.005, 0);
    this.lastObstacleGenerated = null;
    this.helpDisplayed = false;
    this.helpTimeOut = -1;
    this.gameState.bat = new Bat(new THREE.Vector3(0, -0.8, 0), new Size(0.1, 0.02));
    this.bat = this.createMesh(this.gameState.bat.position, this.gameState.bat.size);
    storage = localStorage.getItem('bestTime');
    if(storage === null) {
        localStorage.setItem('bestTime', JSON.stringify(0));
        storage = 0;
    } else {
        storage = JSON.parse(storage);   
    }
    document.getElementById("bestTimeMessage").textContent = "Best time: " + Math.floor(storage / 1000) + ":" + (Math.floor(storage/10) % 100);
};

GameEngine.prototype.computeKeyboard = function () {
    "use strict";
    if (this.keyboard.pressed("right")) {
        this.moveMesh(this.bat, new THREE.Vector3(this.batStep, 0, 0));
        this.gameState.bat.position = this.bat[1].position;
    } else if (this.keyboard.pressed("left")) {
        this.moveMesh(this.bat, new THREE.Vector3(-this.batStep, 0, 0));
        this.gameState.bat.position = this.bat[1].position;
    } else if (this.keyboard.pressed("space") && this.gameState.gameState === "waiting") {
        this.initGame();
        this.gameState.gameState = "starting";
    } else if(this.keyboard.pressed("h") && this.helpTimeOut < 0) {
        this.helpTimeOut = 10;
        if(!this.helpDisplayed) {
            this.helpDisplayed = true;
            document.getElementById("helpMessage").style.visibility = "visible";
        }
        else {
            this.helpDisplayed = false;
            document.getElementById("helpMessage").style.visibility = "hidden";
        }
        
    } else if (this.keyboard.pressed("numpad 0") || this.keyboard.pressed("0")) {
        this.gameState.cameraPosition = "arena";
    } else if (this.keyboard.pressed("numpad 1") || this.keyboard.pressed("1")) {
        this.gameState.cameraPosition = "bat";
    }
    if(this.helpTimeOut >= 0) { this.helpTimeOut--;}
};

GameEngine.prototype.compute = function () {
    "use strict";
    var time;
    this.computeKeyboard();
    if (this.gameState.gameState === "rendererReady") {
        this.gameState.startTime = new Date().getTime();
        this.gameState.level = 1;
        document.getElementById("levelMessage").textContent = "Level 1";
        new TweenMax.to(document.getElementById("levelMessage"), 0.5, {css:{left: 0}});
        new TweenMax.to(document.getElementById("timeMessage"), 0.5, {css:{right: 0}});

        this.gameState.gameState = "running";
    }
    if (this.gameState.gameState === "running") {
        this.computeObstacles();
        if (!godMode.enabled) {
            this.computeCollisions();
        }
        this.computeTime();
    }
    if (this.gameState.gameState === "ending") {
        time = this.gameState.gameTime;
        if(time > JSON.parse(localStorage.getItem('bestTime')) && !godMode.enabled) {
            localStorage.setItem('bestTime', JSON.stringify(time));
            document.getElementById("bestTimeMessage").textContent = "Best time: " + Math.floor(time / 1000) + ":" + (Math.floor(time/10) % 100);
        }
    }
};

GameEngine.prototype.computeCollisions = function () {
    "use strict";
    this.computeBatCollisions();
};

//Time and level Handling
//==============================================

GameEngine.prototype.computeTime = function () {
    "use strict";
    var currentTime, time;
    currentTime = new Date().getTime();
    time = currentTime - this.gameState.startTime;
    this.gameState.gameTime = time;
    document.getElementById("timeMessage").textContent = Math.floor(time / 1000) + ":" + (Math.floor(time/10) % 100);
    if (this.gameState.level === 1 && this.gameState.gameTime > 20000) {
        this.gameState.level = 2;
        this.obstaclesVelocity = new THREE.Vector3(0, -0.008, 0);
        document.getElementById("levelMessage").textContent = "Level 2";
    } else if (this.gameState.level === 2 && this.gameState.gameTime > 40000) {
        this.gameState.level = 3;
        this.obstaclesVelocity = new THREE.Vector3(0, -0.01, 0);
        document.getElementById("levelMessage").textContent = "Level 3";
    } else if (this.gameState.level === 3 && this.gameState.gameTime > 60000) {
        this.gameState.level = 4;
        this.obstaclesVelocity = new THREE.Vector3(0, -0.014, 0);
        document.getElementById("levelMessage").textContent = "Level 4";
    }
};


//Collision Handling
//==========================================
GameEngine.prototype.computeBatCollisions = function () {
    "use strict";
    var i, j, mesh, origins, objects, obstacleGroupId, obstacleGroup, intersects,
        obstacleWidth, batWidth, velocity, posObstacle, posBat;
    velocity = new THREE.Vector3();
    velocity.copy(this.obstaclesVelocity);
    velocity.negate();
    objects = [];
    for (obstacleGroupId in this.obstacles) {
        obstacleGroup = this.obstacles[obstacleGroupId];
        posObstacle = obstacleGroup.position.y;
        posBat = this.bat[0].position.y;
        //On regarde si le groupe d'obstacles est susceptible d'entrer en collision avec la raquette.
        //On utilise la position en y du groupe (qui est le mm pour tous les membres du groupe). 
        
        obstacleWidth = this.gameState.obstacles[obstacleGroupId].size.width / 2;
        batWidth = this.gameState.bat.size.width / 2;
        if ((posObstacle - this.gameState.obstacles[obstacleGroupId].size.length / 2) < (posBat + this.gameState.bat.size.length / 2)
                && posObstacle > (posBat - this.gameState.bat.size.length / 2)) {
            //On vérifie s'il y a collision ou pas à l'aide des coordonées en x.
            posObstacle = obstacleGroup.position.x;
            for (j = 0; j < this.bat.length; j++) {
                posBat = this.bat[j].position.x;
                if (Math.abs(posBat - posObstacle) < (obstacleWidth + batWidth)) {
                    this.gameState.gameState = "ending";
                }
            }
        }
    }
};

//Meshes handling
//-------------------

GameEngine.prototype.createMesh = function (position, size) {
    "use strict";
    var i, geometry, material, mesh, meshTab, arenaWidth;
    arenaWidth = this.gameState.arena.size.width;
    geometry = new THREE.CubeGeometry(size.width, size.length, size.length);
    material = new THREE.MeshBasicMaterial();
    meshTab = [];
    for (i = 0; i < 3; i++) {
        mesh = new THREE.Mesh(geometry, material);
        switch (i) {
        case 0:
            mesh.position.x = position.x - arenaWidth;
            break;
        case 1:
            mesh.position.x = position.x;
            break;
        case 2:
            mesh.position.x = position.x + arenaWidth;
            break;
        }
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

GameEngine.prototype.generateObstacle = function (maxWidth, yPos) {
    "use strict";
    var size, width, length, position, mesh, arenaWidth, rand;
    position = new THREE.Vector3();
    position.y = yPos;
    arenaWidth = this.gameState.arena.size.width;
    rand = Math.random() * arenaWidth;
    position.x = rand - arenaWidth / 2;

    
    width = Math.random() * maxWidth + 0.1;
    length = this.obstacleLength;
    mesh = new THREE.Mesh(new THREE.CubeGeometry(width, length, length), new THREE.MeshBasicMaterial());
    mesh.position = position;
    return [mesh, new Size(width, length)];
};

GameEngine.prototype.createObstacle = function () {
    "use strict";
    var arenaSize, result;
    arenaSize = this.gameState.arena.size;
    if (this.lastObstacleGenerated === null) {
        this.lastObstacleGenerated = -1;
    }
    switch (this.gameState.level) {
    case 1:
        result = this.generateObstacle(arenaSize.width / 2,
                              (arenaSize.length / 2) +  arenaSize.length / 6);
        this.nextObstaclePositionY = (arenaSize.length / 2) -
                    Math.random() * (arenaSize.length / 6);
        break;
    case 2:
        result = this.generateObstacle(arenaSize.width / 2,
                              (arenaSize.length / 2) +  arenaSize.length / 6);
        this.nextObstaclePositionY = (arenaSize.length / 2) -
                    Math.random() * (arenaSize.length / 7);
        break;
    case 3:
        result = this.generateObstacle(arenaSize.width / 2,
                              (arenaSize.length / 2) +  arenaSize.length / 6);
        this.nextObstaclePositionY = (arenaSize.length / 2) -
                    Math.random() * (arenaSize.length / 7.5);
        break;
    case 4:
        result = this.generateObstacle(2 * (arenaSize.width / 3),
                              (arenaSize.length / 2) +  arenaSize.length / 6);
        this.nextObstaclePositionY = (arenaSize.length / 2) -
                    Math.random() * (arenaSize.length / 8);
        break;
    }
    this.obstacles[this.lastObstacleGenerated + 1] = result[0];
    this.gameState.obstacles[this.lastObstacleGenerated + 1] =
        new Obstacle(result[0].position, result[1]);
    this.gameState.popId = this.lastObstacleGenerated + 1;
    this.lastObstacleGenerated += 1;

};

GameEngine.prototype.moveObstacles = function () {
    "use strict";
    var obstacleGroup;
    for (obstacleGroup in this.obstacles) {
        this.obstacles[obstacleGroup].add(this.obstaclesVelocity);
        this.gameState.obstacles[obstacleGroup].position.add(this.obstaclesVelocity);
        if (this.obstacles[obstacleGroup].position.y <
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
    this.gameState.popId = null;
    this.gameState.vanishId = null;
    if (this.lastObstacleGenerated === null ||
            this.obstacles[this.lastObstacleGenerated].position.y <
            this.nextObstaclePositionY) {
        this.createObstacle();
    }
    this.moveObstacles();
};