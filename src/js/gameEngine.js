/*
 * This composant compute the game state.
 * It needs a GameState to compute it.
 */

/*global THREE, Position, Size, extendClass, number, string, GameState, Ball, Bat,
Obstacle, THREEx*/

/*jslint plusplus: true */

var GameEngine = function (gameState) {
    "use strict";
    if (gameState instanceof GameState) {
        this.gameState = gameState;
        
        gameState.addBall(new Ball(new Position(0, 0, 0.04), new Size(0.08, 0.08)));
        gameState.balls[0].velocity.set(-0.002, -0.002, 0);
        gameState.addBat(new Bat(new Position(-0.2, -0.8, 0.04), new Size(0.4, 0.08),
                                 0, gameState.arena.size.width / 2));
        gameState.addBat(new Bat(new Position(-this.gameState.arena.size.width / 2, 0, 0.04),
                                 new Size(this.gameState.arena.size.width, 0.08),
                                 0, gameState.arena.size.width));
        gameState.addBat(new Bat(new Position(-this.gameState.arena.size.width / 2, this.gameState.bats[0].position.y - 0.1, 0.04),
                                 new Size(this.gameState.arena.size.width, 0.08),
                                 0, gameState.arena.size.width));
        gameState.bats[0].velocity.set(0, 0.001, 0);
        gameState.bats[1].velocity.set(0, 0.001, 0);
        gameState.bats[2].velocity = gameState.bats[0].velocity;
        gameState.addObstacle(new Obstacle(new Position(-0.2, 0.2, 0.04),
                                           new Size(0.08, 0.08)));
        gameState.addObstacle(new Obstacle(new Position(0.3, 0.4, 0.04),
                                           new Size(0.08, 0.08)));
        gameState.addObstacle(new Obstacle(new Position(0.5, -0.6, 0.04),
                                           new Size(0.1, 0.08)));
        gameState.addObstacle(new Obstacle(new Position(-0.3, -0.9, 0.04),
                                           new Size(0.25, 0.08)));
        gameState.addObstacle(new Obstacle(new Position(0, -0.2, 0.04),
                                           new Size(0.25, 0.08)));
        
        
        
        this.batStep = 0.001;
        this.keyboard = new THREEx.KeyboardState();
        this.rayCaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0),
                                             new THREE.Vector3(0, 0, 0),
                                             0,
                                             0.1);
        this.batInvincibleTime = 0;
        this.running = false;
        this.gameOver = false;
    } else { throw ("The game engine needs a GameState in parameter."); }
};

GameEngine.prototype.computeKeyboard = function () {
    "use strict";
    var bat = this.gameState.bats[0];
    if (this.keyboard.pressed("right")) {
        bat.moveRight(this.batStep);
    } else if (this.keyboard.pressed("left")) {
        bat.moveLeft(this.batStep);
    } else if (this.keyboard.pressed("s")) {
        this.running = true;
    } else if (this.keyboard.pressed("p")) {
        this.running = false;
    }
};

GameEngine.prototype.computeBalls = function () {
    "use strict";
    var ball, i;
    for (i = 0; i < this.gameState.balls.length; ++i) {
        ball = this.gameState.balls[i];
        if (ball.position.x + ball.velocity.x > this.gameState.arena.size.width / 2) {
            ball.position.x -= this.gameState.arena.size.width;
        } else if (ball.position.x + ball.velocity.x < -this.gameState.arena.size.width / 2) {
            ball.position.x += this.gameState.arena.size.width;
        }
        ball.position.x += ball.velocity.x;
        
        if (ball.position.y + ball.velocity.y > this.gameState.arena.size.length / 2) {
            ball.position.y -= this.gameState.arena.size.length;
        } else if (ball.position.y + ball.velocity.y < -this.gameState.arena.size.length / 2) {
            ball.position.y += this.gameState.arena.size.length;
        }
        ball.position.y += ball.velocity.y;
        ball.updateMesh();
    }
};

GameEngine.prototype.computeBat = function () {
    "use strict";
    var i, bat;
    
    bat = this.gameState.bats[0];
    if (bat.position.x + bat.size.width + bat.velocity.x  < -bat.clearance) {
        bat.position.x += 2 * bat.clearance;
    } else if (bat.position.x  + bat.velocity.x  > bat.clearance) {
        bat.position.x -= 2 * bat.clearance;
    }
    if (Math.abs(bat.velocity.x) > this.batStep / 2.9) {
        bat.position.x += bat.velocity.x;
    }
    if (bat.velocity.x > this.batStep / 3.1) {
        bat.velocity.x -= this.batStep / 3;
    } else if (bat.velocity.x < this.batStep / 3.1) {
        bat.velocity.x += this.batStep / 3;
    } else {
        bat.velocity.x = 0;
    }
    for (i = 0; i < this.gameState.bats.length; i++) {
        bat = this.gameState.bats[i];
        if (bat.position.y + bat.velocity.y > this.gameState.arena.size.length / 2) {
            bat.position.y -= this.gameState.arena.size.length;
        } else if (bat.position.y + bat.velocity.y < -this.gameState.arena.size.length / 2) {
            bat.position.y += this.gameState.arena.size.length;
        }
        this.gameState.bats[i].position.y += bat.velocity.y;
        bat.updateMeshPosition();
    }
};

GameEngine.prototype.compute = function () {
    "use strict";
    this.computeKeyboard();
    if (this.gameState.bats[0].size.width < 0.1) {
        this.gameOver = true;
    }
    if (this.running && !this.gameOver) {
        this.computeCollisions();
        this.computeBalls();
        this.computeBat();
    }
};

GameEngine.prototype.computeCollisions = function () {
    "use strict";
    this.computeBallsCollisions();
    if (this.batInvincibleTime === 0) {
        this.computeBatsCollisions();
    } else {
        this.batInvincibleTime -= 1;
    }
};


GameEngine.prototype.createBoxRayOrigin = function (position, size, nbRays) {
    "use strict";
    var i, j, origins, center, lengths, nbLength;
    origins = [];
    center = new THREE.Vector3(position.x, position.y, position.z);
    origins.push(center);
    lengths = [-size.length / 2, size.length / 2];
    for (i = 0; i < lengths.length; i++) {
        nbLength = lengths[i];
        for (j = 0; j < nbRays; j++) {
            origins.push(new THREE.Vector3(j * size.width / nbRays +
                                           (position.x - size.width / 2),
                                           position.y + nbLength,
                                           position.z));
        }
    }
    return origins;
};

GameEngine.prototype.computeBallsCollisions = function () {
    "use strict";
    //filling objects to test
    var objects, j, i, k, ball, ballPos, raysOrigin, size, intersects;
    objects = [];
    raysOrigin = [];
    
    for (j = 0; j < this.gameState.obstacles.length; ++j) {
        objects.push(this.gameState.obstacles[j].mesh);
    }
    
    for (i = 0; i < this.gameState.bats.length; i++) {
        for (j = 0; j < this.gameState.bats[i].mesh.length; j++) {
            objects.push(this.gameState.bats[i].mesh[j]);
        }
    }
    
    //testing objects
    for (i = 0; i < this.gameState.balls.length; ++i) {
        ball = this.gameState.balls[i];
        size = ball.size;
        ballPos = new THREE.Vector3(ball.position.x,
                                    ball.position.y,
                                    ball.position.z);
        raysOrigin = this.createBoxRayOrigin(ball.position, ball.size, 2);
        for (k = 0; k < raysOrigin.length; k++) {
            this.rayCaster.set(raysOrigin[k], ball.velocity);
            intersects = this.rayCaster.intersectObjects(objects);
            if (intersects.length > 0 &&
                    intersects[0].distance < (size.width / 4)) {
                this.handleBallCollision(intersects);
            }
            
        }
    }
};


GameEngine.prototype.computeBatsCollisions = function () {
    "use strict";
    var i, j, k, objects, boundingBox, raysOrigin, bat, intersects,
        size, velocity, ball, epsilon;
    objects = [];
    velocity = this.gameState.bats[0].velocity;
    bat = this.gameState.bats[0];
    ball = this.gameState.balls[0];
    epsilon = 0.001;
    
    
    for (j = 0; j < this.gameState.obstacles.length; ++j) {
        objects.push(this.gameState.obstacles[j].mesh);
    }
    
    for (i = 0; i < this.gameState.bats[0].mesh.length; i++) {
        bat = this.gameState.bats[0].mesh[i];
        size = new Size(bat.geometry.width, bat.geometry.height);
        raysOrigin = this.createBoxRayOrigin(bat.position, size, 8);
        for (k = 0; k < raysOrigin.length; k++) {
            this.rayCaster.set(raysOrigin[k], velocity);
            intersects = this.rayCaster.intersectObjects(objects);
            if (intersects.length > 0 &&
                    intersects[0].distance < (this.gameState.bats[0].size.length / 4) &&
                    this.batInvincibleTime === 0) {
                this.gameState.bats[0].size.width -= 0.1;
                this.gameState.bats[0].createMeshes();
                this.gameState.meshesChanged = true;
                this.batInvincibleTime = 60;
            }
        }
    }
    
};


GameEngine.prototype.handleBallCollision = function (objects) {
    "use strict";
    if (objects[0].object === this.gameState.bats[2].mesh[0]) {
        if (this.gameState.bats[0].velocity.y > 0) {
            this.gameState.bats[2].position.y = this.gameState.bats[0].position.y + 0.1;
        } else {
            this.gameState.bats[2].position.y = this.gameState.bats[0].position.y - 0.1;
        }
        this.gameState.bats[0].velocity.y *= -1;
        this.gameState.bats[1].velocity.y *= -1;
        this.gameState.bats[0].size.width -= 0.01;
        this.gameState.bats[0].createMeshes();
        this.gameState.meshesChanged = true;
        this.batInvincibleTime = 60;
    } else {
        var normal, velocity;
        normal = objects[0].face.normal;
        this.gameState.balls[0].velocity.reflect(normal);
        this.gameState.balls[0].velocity.negate();
    }
};