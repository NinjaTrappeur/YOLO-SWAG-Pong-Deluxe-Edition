/*
 * This composant handles the display of the game.
 * It needs a GameState computed by a GameEngine
 * The rendering is pretty basic and will be used
 * mainly for testing.
 */

/*global THREE, Position, Size, extendClass, number, string, GameState, Ball, Bat,
Obstacle, THREEx, Detector, document, window, dat, toTorusCoordinates, console,
toTorusMatrixTransformation, toTorusMeshSize, toCylinderMatrixTransformation*/

/*jslint plusplus: true */


var Renderer = function () {
    "use strict";
    this.renderers = [];
};

Renderer.prototype.setActiveRenderer = function (name) {
    "use strict";
    var i, found;
    found = false;
    this.activeRendererString = name;
    for (i = 0; i < this.renderers.length; i++) {
        if (this.renderers[i].name === name) {
            this.activeRenderer = this.renderers[i];
        }
        found = true;
    }
    if (!found) {
        throw "Game renderer " + name + " undefined.";
    }
};

//class AbstractRendererMeshes
//===================================

/* This class is abstract. You can't use it
 * alone, you need to derivate it and rewrite the
 * init method.
 */

var AbstractRenderer = function (gameState, renderer) {
    "use strict";
    
    if (gameState instanceof GameState) {
        this.gameState = gameState;
    } else {
        throw ("Parameter needs to be a GameState object.");
    }
    this.renderer = renderer;
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 100);
    this.winResize   = new THREEx.WindowResize(this.renderer, this.camera);
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.bats = [];
    this.balls = [];
    this.name = "AbstractRenderer";
};

AbstractRenderer.prototype.render = function () {
    "use strict";
    this.renderer.render(this.scene, this.camera);
};

AbstractRenderer.prototype.init = function () {
    "use strict";
    throw ("Please do not use AbstractRenderer without derivating it and rewriting the init method.");
};


// class SimpleRenderer: extends AbstractRenderer
//========================================

var SimpleRenderer = function (gameState, renderer) {
    "use strict";
    AbstractRenderer.call(this, gameState, renderer);
    this.name = "SimpleRenderer";
};

extendClass(SimpleRenderer, AbstractRenderer);

SimpleRenderer.prototype.init = function () {
    "use strict";
    var geometry, material, mesh, bat, ball, i, j;
    
    this.camera.lookAt(new THREE.Vector3(0, 0, 1));
    this.camera.position.set(0, -1.7, 0.8);
    this.camera.rotation.set(Math.PI / 2.5, 0, 0);
    
    this.obstacle = {};
    
    //Creating arena
    geometry = new THREE.PlaneGeometry(this.gameState.arena.size.width,
                                       this.gameState.arena.size.length);
    material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    this.createBat();
};

SimpleRenderer.prototype.createBat = function () {
    "use strict";
    var i, geometry, material, mesh, bat;
    bat = this.gameState.bat;
    geometry = new THREE.CubeGeometry(bat.size.width, bat.size.length, bat.size.length);
    material = new THREE.MeshBasicMaterial();
    mesh = new THREE.Mesh(geometry, material);
    mesh.position = bat.position;
    this.batMesh = mesh;
    this.scene.add(mesh);
};

SimpleRenderer.prototype.updateMeshes = function () {
    "use strict";
    var obstacleId;
    this.batMesh.position = this.gameState.bat.position;
    for (obstacleId in this.obstacle) {
        this.obstacle[obstacleId].position =
            this.gameState.obstacles[obstacleId].position;
    }
};

SimpleRenderer.prototype.handleObstacles = function () {
    "use strict";
    var material, geometry, mesh, obstacle;
    if (this.gameState.popId !== null) {
        obstacle = this.gameState.obstacles[this.gameState.popId];
        material = new THREE.MeshBasicMaterial({color : 0x0000FF});
        geometry = new THREE.CubeGeometry(obstacle.size.width, obstacle.size.length, 0.1);
        mesh = new THREE.Mesh(geometry, material);
        this.obstacle[this.gameState.popId] = mesh;
        this.scene.add(mesh);
        this.gameState.popId = null;
    }
    
    if (this.gameState.vanishId !== null) {
        this.scene.remove(this.obstacle[this.gameState.vanishId]);
        delete this.obstacle[this.gameState.vanishId];
        this.gameState.vanishId = null;
    }
};

SimpleRenderer.prototype.render = function () {
    "use strict";
    this.handleObstacles();
    this.updateMeshes();
    this.renderer.render(this.scene, this.camera);
};



// class TorusRenderer: extends AbstractRenderer
//========================================
var TorusRenderer = function (gameState, renderer) {
    "use strict";
    AbstractRenderer.call(this, gameState, renderer);
    this.radius = 2;
    this.tubeRadius = 0.8;
    this.meshHeigth = 0.1;
    this.name = "TorusRenderer";

};

extendClass(TorusRenderer, AbstractRenderer);

TorusRenderer.prototype.init = function () {
    "use strict";
    var geometry, material, mesh;
    
    //Creating meshes tables
    
    this.batsMeshes = [];
    this.ballsMeshes = [];
    this.obstaclesMeshes = [];
    this.addBatsToScene();
    this.addBallsToScene();
    this.addObstaclesToScene();
    this.camera.position.z = 5;
    
    
    //Creating arena
    geometry = new THREE.TorusGeometry(this.radius, this.tubeRadius, 100, 100);
    material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
};

TorusRenderer.prototype.render = function () {
    "use strict";
    this.renderer.render(this.scene, this.camera);
    this.updateMeshesPosition();
    this.updateCamera();
};

TorusRenderer.prototype.addBallsToScene = function () {
    "use strict";
    var i, mesh, ball, meshSize;
    for (i = 0; i < this.gameState.balls.length; i++) {
        ball = this.gameState.balls[i];
        meshSize = toTorusMeshSize(ball.size, this.gameState.arena.size,
                                  this.tubeRadius, this.radius);
        mesh = new THREE.Mesh(new THREE.CubeGeometry(meshSize.width,
                                                     meshSize.length,
                                                     this.meshHeigth),
                              new THREE.MeshBasicMaterial({color : 0x00ff00}));
        this.ballsMeshes.push(mesh);
        this.scene.add(mesh);
    }
};

TorusRenderer.prototype.addBatsToScene = function () {
    "use strict";
    var i, bat, mesh, meshSize;
    if (this.batsMeshes.length > 0) {
        for (i = 0; i < this.batsMeshes.length; i++) {
            this.scene.remove(this.batsMeshes[i]);
        }
    }
    this.batsMeshes = [];
    bat = this.gameState.bats[0];
    meshSize = toTorusMeshSize(bat.size,
                                 this.gameState.arena.size,
                                 this.tubeRadius, this.radius);
    mesh = new THREE.Mesh(new THREE.CubeGeometry(meshSize.width,
                                                 meshSize.length,
                                                 this.meshHeigth),
                          new THREE.MeshBasicMaterial({color: 0xffffff}));
    mesh.position = toTorusCoordinates(this.gameState.bats[0].position.x, this.gameState.bats[0].position.y,
                                       this.radius, this.tubeRadius);
    mesh.position.set(0, 0, 0);
    this.scene.add(mesh);
    this.batsMeshes.push(mesh);
};

TorusRenderer.prototype.addObstaclesToScene = function () {
    "use strict";
    var i, obstacle, mesh, meshSize;
    for (i = 0; i < this.gameState.obstacles.length; i++) {
        obstacle = this.gameState.obstacles[i];
        meshSize = toTorusMeshSize(obstacle.size,
                                     this.gameState.arena.size,
                                     this.tubeRadius, this.radius);
        mesh = new THREE.Mesh(new THREE.CubeGeometry(meshSize.width,
                                                     meshSize.length,
                                                     this.meshHeigth),
                              new THREE.MeshBasicMaterial({color : 0xff0000}));
        this.obstaclesMeshes.push(mesh);
        this.scene.add(mesh);
    }
};

TorusRenderer.prototype.updateMeshesPosition = function () {
    "use strict";
    var i, nextPoint, meshPosition, transformationMatrix;

    meshPosition = this.gameState.bats[0].position;
    transformationMatrix = toTorusMatrixTransformation(meshPosition,
                                                       this.radius, this.tubeRadius);
    this.batsMeshes[0].matrix.identity();
    this.batsMeshes[0].applyMatrix(transformationMatrix);
    for (i = 0; i < this.ballsMeshes.length; i++) {
        meshPosition = this.gameState.balls[i].position;
        this.ballsMeshes[i].matrix.identity();
        transformationMatrix = toTorusMatrixTransformation(meshPosition, this.radius,
                                                           this.tubeRadius);
        this.ballsMeshes[i].applyMatrix(transformationMatrix);
    }
    for (i = 0; i < this.obstaclesMeshes.length; i++) {
        meshPosition = this.gameState.obstacles[i].position;
        this.obstaclesMeshes[i].matrix.identity();
        transformationMatrix = toTorusMatrixTransformation(meshPosition, this.radius,
                                                           this.tubeRadius);
        this.obstaclesMeshes[i].applyMatrix(transformationMatrix);
    }
    
};

TorusRenderer.prototype.updateCamera = function () {
    "use strict";
    var batPosition;
    batPosition = this.gameState.bats[0].position;
    this.camera.position = toTorusCoordinates(batPosition.x, batPosition.y - 0.1, this.radius, this.tubeRadius + 0.4);
    this.camera.lookAt(this.batsMeshes[0].position);
};

//Class CylinderRenderer: extends AbstractRenderer
//========================================================
var CylinderRenderer = function (gameState, renderer) {
    "use strict";
    AbstractRenderer.call(this, gameState, renderer);
    this.tubeLength = 4;
    this.tubeRadius = 1;
    this.meshHeigth = 0.1;
    this.obstacle = {};
    this.cameraTweenValue = 5;
    this.name = "CylinderRenderer";
};

extendClass(CylinderRenderer, AbstractRenderer);

CylinderRenderer.prototype.init = function () {
    "use strict";
    var material;
    this.camera.fov = 10;
    this.camera.updateProjectionMatrix();
    this.camera.rotateZ(Math.PI);
    this.generateEnvironment();
};

CylinderRenderer.prototype.generateEnvironment = function () {
    "use strict";
    var material;
    this.tubeTexture = THREE.ImageUtils.loadTexture("img/grid.jpg");
    this.tubeTexture.wrapS = THREE.RepeatWrapping;
    this.tubeTexture.wrapT = THREE.RepeatWrapping;
    this.tubeTexture.repeat.set(40, 40);
    material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, map: this.tubeTexture});
    material.side = THREE.DoubleSide;
    this.cylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(this.tubeRadius,
                                                              this.tubeRadius,
                                                              this.tubeLength,
                                                              50,
                                                              4,
                                                              true
                                                             ),
                                       material);
    this.scene.add(this.cylinderMesh);
    this.batMesh = this.createBat();
    this.scene.add(this.batMesh);
    this.floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 5),
                                    new THREE.MeshNormalMaterial());
    this.floorMesh.position.y = 1.5;
    this.floorMesh.rotateX(-Math.PI / 2);
    this.scene.add(this.floorMesh);
    this.angle = 0;
};

CylinderRenderer.prototype.render = function () {
    "use strict";
    this.handleCamera();
    if (this.gameState.gameState === "running") {
        this.tubeTexture.offset.y -= 0.03;
        this.handleObstacles();
    } else if (this.gameState.gameState === "starting") {
        this.gameState.gameState = "waiting start";
        this.transitionToGameIn(true);
    } else if (this.gameState.gameState === "waiting start") {
        this.gameState.timeBeforeStart -= 1;
        if (this.gameState.timeBeforeStart < 0) {
            this.camera.fov = 200;
            this.camera.updateProjectionMatrix();
        }
    }
    this.updateMeshesPosition();
    this.renderer.render(this.scene, this.camera);
};

CylinderRenderer.prototype.transitionToGameIn = function (startingTween) {
    "use strict";
    if (startingTween) {
    this.cameraTween = TweenMax.to(this.camera.position, 2, {x : 0, y : 1.1, z : 0});
    } else {
        this.gameState.gameState = "running";
    }
};

CylinderRenderer.prototype.handleCamera = function () {
    "use strict";
    var ray;
    if (this.gameState.gameState === "waiting") {
        ray = 20;
        if (this.angle < 0) {
            this.angle = 2 * Math.PI;
        }
        this.camera.position.x = ray * Math.cos(this.angle);
        this.camera.position.z = ray * Math.sin(this.angle);
        this.camera.position.y = 10;
        this.camera.lookAt(new THREE.Vector3(0, 2, 0));
        this.angle -= 0.005;
    }
    if (this.gameState.gameState === "running") {
        this.camera.position.y = 1.1;
        this.camera.position.x = 0;
        this.camera.position.z = 0;
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
};

CylinderRenderer.prototype.createTorusGeometry = function (width, length, cylinderRadius) {
    "use strict";
    var angle, torusRadius;
    torusRadius = cylinderRadius - length / 2;
    angle = width * 2 * Math.PI;
    return (new THREE.TorusGeometry(torusRadius, length, 4, 200, angle));
};

CylinderRenderer.prototype.createBat = function () {
    "use strict";
    var mesh, geometry, batSize;
    batSize = this.gameState.bat.size;
    geometry = this.createTorusGeometry(batSize.width, batSize.length, this.tubeRadius);
    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xFFFFFF}));
    return mesh;
};

CylinderRenderer.prototype.updateMeshesPosition = function () {
    "use strict";
    var transformationMatrix, position, obstacleId;
    //Updating bat.
    position = this.gameState.bat.position;
    transformationMatrix =
        toCylinderMatrixTransformation(new THREE.Vector3(position.x, position.y, 0),
                                       this.tubeRadius, this.tubeLength);
    this.batMesh.matrix.identity();
    this.batMesh.applyMatrix(transformationMatrix);
    for (obstacleId in this.obstacle) {
        position = this.gameState.obstacles[obstacleId].position;
        transformationMatrix = toCylinderMatrixTransformation(position, this.tubeRadius, this.tubeLength);
        this.obstacle[obstacleId].matrix.identity();
        this.obstacle[obstacleId].applyMatrix(transformationMatrix);
    }
};

CylinderRenderer.prototype.handleObstacles = function () {
    "use strict";
    var material, geometry, mesh, obstacle;
    if (this.gameState.popId !== null) {
        obstacle = this.gameState.obstacles[this.gameState.popId];
        material = new THREE.MeshBasicMaterial({color : 0xFF0000});
        geometry = this.createTorusGeometry(obstacle.size.width,
                                            obstacle.size.length,
                                            this.tubeRadius);
        mesh = new THREE.Mesh(geometry, material);
        this.obstacle[this.gameState.popId] = mesh;
        this.scene.add(mesh);
        this.gameState.popId = null;
    }
    
    if (this.gameState.vanishId !== null) {
        this.scene.remove(this.obstacle[this.gameState.vanishId]);
        delete this.obstacle[this.gameState.vanishId];
        this.gameState.vanishId = null;
    }
};