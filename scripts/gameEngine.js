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
        gameState.bats[0].velocity.set(0.001, 0.001, 0);
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
        
        
        
        this.step = 0.01;
        this.keyboard = new THREEx.KeyboardState();
        this.rayCaster = new THREE.Raycaster(new THREE.Vector3(0, 0, 0),
                                             new THREE.Vector3(0, 0, 0),
                                             0,
                                             0.1);
        this.running = false;
    } else { throw ("The game engine needs a GameState in parameter."); }
};

GameEngine.prototype.computeKeyboard = function () {
    "use strict";
    var bat = this.gameState.bats[0];
    if (this.keyboard.pressed("right")) {
        bat.moveRight(this.step);
    } else if (this.keyboard.pressed("left")) {
        bat.moveLeft(this.step);
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
    var bat = this.gameState.bats[0];
    if (bat.position.y + bat.velocity.y > this.gameState.arena.size.length / 2) {
        bat.position.y -= this.gameState.arena.size.length;
    }
    bat.position.y += bat.velocity.y;
    bat.updateMeshPosition();
};

GameEngine.prototype.compute = function () {
    "use strict";
    this.computeKeyboard();
    if (this.running) {
        this.computeCollisions();
        this.computeBalls();
        this.computeBat();
    }
};

GameEngine.prototype.computeCollisions = function () {
    "use strict";
    this.computeBallsCollisions();
};

GameEngine.prototype.computeBallsCollisions = function () {
    "use strict";
    //filling objects to test
    var objects, j, i, k, ball, ballPos, raysOrigin, size, intersects;
    objects = [];
    raysOrigin = [];
    for (j = 0; j < this.gameState.bats[0].mesh.length; ++j) {
        objects.push(this.gameState.bats[0].mesh[j]);
    }
    for (j = 0; j < this.gameState.obstacles.length; ++j) {
        objects.push(this.gameState.obstacles[j].mesh);
    }
    
    //testing objects
    for (i = 0; i < this.gameState.balls.length; ++i) {
        ball = this.gameState.balls[i];
        size = ball.size;
        ballPos = new THREE.Vector3(ball.position.x,
                                        ball.position.y,
                                        ball.position.z);
        raysOrigin.push(new THREE.Vector3(ballPos.x + size.width / 2,
                                          ballPos.y + size.length / 2,
                                          ballPos.z));
        raysOrigin.push(new THREE.Vector3(ballPos.x + size.width / 2,
                                          ballPos.y - size.length / 2,
                                          ballPos.z));
        raysOrigin.push(new THREE.Vector3(ballPos.x - size.width / 2,
                                          ballPos.y - size.length / 2,
                                          ballPos.z));
        raysOrigin.push(new THREE.Vector3(ballPos.x - size.width / 2,
                                          ballPos.y + size.length / 2,
                                          ballPos.z));
        for (j = 0; j < objects.length; j++) {
            for (k = 0; k < raysOrigin.length; k++) {
                this.rayCaster.set(raysOrigin[k], ball.velocity);
                intersects = this.rayCaster.intersectObjects(objects);
                if (intersects.length > 0 && intersects[0].distance < size.width / 2) {
                    this.handleBallCollision(intersects);
                }
            }
        }
    }
};

GameEngine.prototype.handleBallCollision = function (objects) {
    "use strict";
    var normal, velocity;
    normal = objects[0].face.normal;
    this.gameState.balls[0].velocity.reflect(normal);
    this.gameState.balls[0].velocity.negate();
};