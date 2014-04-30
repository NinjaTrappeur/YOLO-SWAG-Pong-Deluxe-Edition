/*
 * This composant handles the display of the game.
 * It needs a GameState computed by a GameEngine
 * The rendering is pretty basic and will be used
 * mainly for testing.
 */

/*global THREE, Position, Size, extendClass, number, string, GameState, Ball, Bat,
Obstacle, THREEx, Detector, document, window, dat, toTorusCoordinates, console,
toTorusMatrixTransformation, toTorusMeshSize, toCylinderMatrixTransformation, TimelineLite, TweenMax, cleanThreeScene*/

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
            this.renderers[i].addAllObstacles();
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
    cleanThreeScene(this.scene);
    
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
    this.addAllObstacles();
};

SimpleRenderer.prototype.reset = function () {
    "use strict";
    var obstacleId;
    for (obstacleId in this.obstacle) {
        this.scene.remove(this.obstacle[obstacleId]);
        delete this.obstacle[obstacleId];
    }
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
    }
    
    if (this.gameState.vanishId !== null) {
        this.scene.remove(this.obstacle[this.gameState.vanishId]);
        delete this.obstacle[this.gameState.vanishId];
    }
};

SimpleRenderer.prototype.addAllObstacles = function () {
    "use strict";
    var obstacleID, obstacle, material, geometry, mesh;
    for (obstacleID in this.gameState.obstacles) {
        obstacle = this.gameState.obstacles[obstacleID];
        material = new THREE.MeshBasicMaterial({color : 0x0000FF});
        geometry = new THREE.CubeGeometry(obstacle.size.width, obstacle.size.length, 0.1);
        mesh = new THREE.Mesh(geometry, material);
        this.obstacle[obstacleID] = mesh;
        this.scene.add(mesh);
    }
};

SimpleRenderer.prototype.render = function () {
    "use strict";
    if (this.gameState.gameState === "starting") {
        this.reset();
        this.gameState.gameState = "running";
    } else if (this.gameState.gameState === "ending") {
        this.gameState.gameState = "waiting";
    }
    this.handleObstacles();
    this.updateMeshes();
    this.renderer.render(this.scene, this.camera);
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
    cleanThreeScene(this.scene);
    this.camera.fov = 10;
    this.camera.updateProjectionMatrix();
    this.camera.rotateZ(Math.PI);
    this.angle = 0;
    this.generateEnvironment();
    this.addAllObstacles();
};

CylinderRenderer.prototype.reset = function () {
    "use strict";
    var obstacleId;
    for (obstacleId in this.obstacle) {
        this.scene.remove(this.obstacle[obstacleId]);
        delete this.obstacle[obstacleId];
    }
    
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
    this.floorMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 4),
                                    new THREE.MeshNormalMaterial());
    this.floorMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 4),
                                     new THREE.MeshNormalMaterial());
    this.floorMesh1.position.x = 1;
    this.floorMesh2.position.x = -1;
    this.floorMesh1.position.y = 2.1;
    this.floorMesh2.position.y = 2.1;
    this.floorMesh1.rotateX(-Math.PI / 2);
    this.floorMesh2.rotateX(-Math.PI / 2);
    this.scene.add(this.floorMesh1);
    this.scene.add(this.floorMesh2);
};

CylinderRenderer.prototype.render = function () {
    "use strict";
    this.handleCamera();
    if (this.gameState.gameState === "running") {
        this.tubeTexture.offset.y -= 0.03;
        this.handleObstacles();
    } else if (this.gameState.gameState === "starting") {
        this.gameState.gameState = "waiting start";
        this.transitionToGameIn();
    } else if (this.gameState.gameState === "ending") {
        this.gameState.gameState = "waiting end";
        this.transitionToGameOut();
    }
    this.updateMeshesPosition();
    this.renderer.render(this.scene, this.camera);
};

//Camera and animation stuff
//==================================================

CylinderRenderer.prototype.transitionToGameIn = function () {
    "use strict";
    var tween, timeLineIn;
    timeLineIn = new TimelineLite({onComplete: function () {
        this.gameState.gameState = "running";
        this.scene.fog = new THREE.Fog(0x000000, 0, 1);
    },
                                   onCompleteScope: this});
    //Camera movement
    tween = TweenMax.to(this.camera.position, 1, {x : 0, y : 4, z : 0,
                                         onUpdate : function () { this.camera.lookAt(new THREE.Vector3(0, 1.1, 0)); },
                                         onUpdateScope: this});
    timeLineIn.add(tween, 0);
    
    //Floor opening
    tween = TweenMax.to(this.floorMesh1.position, 1, {x : 2});
    timeLineIn.add(tween, 0);
    tween = TweenMax.to(this.floorMesh2.position, 1, {x : -2});
    timeLineIn.add(tween, 0);
    
    //Then we set up final fov and position
    tween = TweenMax.to(this.camera.position, 1, {y : 1.1, onUpdate : function () { this.camera.lookAt(new THREE.Vector3(0, 0, 0)); },
                                         onUpdateScope: this});
    timeLineIn.add(tween, 1);
    tween = TweenMax.to(this.camera, 1, {fov : 200, onUpdate: function () {this.camera.updateProjectionMatrix(); }, onUpdateScope: this});
    timeLineIn.add(tween, 1);
    timeLineIn.play();
};

CylinderRenderer.prototype.transitionToGameOut = function () {
    "use strict";
    var tween, timeLineOut, ray;
    ray = 20;
    timeLineOut = new TimelineLite({onComplete: function () {
        this.camera.updateProjectionMatrix();
        this.gameState.gameState = "waiting";
        this.scene.fog = new THREE.Fog(0x000000, 0, 1);
        this.reset();
    },
                                   onCompleteScope: this});
    
    tween = TweenMax.to(this.camera.position, 1, {y : 4, onUpdate : function () { this.camera.lookAt(new THREE.Vector3(0, 0, 0)); },
                                         onUpdateScope: this});
    timeLineOut.add(tween, 0);
    tween = TweenMax.to(this.camera, 1, {fov : 10, onUpdate: function () {this.camera.updateProjectionMatrix(); }, onUpdateScope: this});
    timeLineOut.add(tween, 0);
    //Camera movement
    tween = TweenMax.to(this.camera.position, 1, {x : ray * Math.cos(this.angle), y : 10, z : ray * Math.sin(this.angle),
                                         onUpdate : function () { this.camera.lookAt(new THREE.Vector3(0, 2, 0)); },
                                         onUpdateScope: this});
    timeLineOut.add(tween, 1);
    
    //Floor opening
    tween = TweenMax.to(this.floorMesh1.position, 1, {x : 1});
    timeLineOut.add(tween, 1);
    tween = TweenMax.to(this.floorMesh2.position, 1, {x : -1});
    timeLineOut.add(tween, 1);
    

    timeLineOut.play();
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

//Meshes stuff
//==================================================================
CylinderRenderer.prototype.createTorusGeometry = function (width, length, cylinderRadius) {
    "use strict";
    var angle, torusRadius;
    torusRadius = cylinderRadius - length / 2 - 0.1;
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
                                       this.tubeRadius, this.tubeLength, this.gameState.bat.size.width);
    this.batMesh.matrix.identity();
    this.batMesh.applyMatrix(transformationMatrix);
    for (obstacleId in this.obstacle) {
        position = this.gameState.obstacles[obstacleId].position;
        transformationMatrix = toCylinderMatrixTransformation(new THREE.Vector3(position.x, position.y, 0),
                                                              this.tubeRadius, this.tubeLength,
                                                              this.gameState.obstacles[obstacleId].size.width);
        this.obstacle[obstacleId].matrix.identity();
        this.obstacle[obstacleId].applyMatrix(transformationMatrix);
    }
};

//Obstacles stuff
//===========================================

CylinderRenderer.prototype.addAllObstacles = function () {
    "use strict";
    var obstacleID, obstacle, material, geometry, mesh;
    for (obstacleID in this.gameState.obstacles) {
        obstacle = this.gameState.obstacles[obstacleID];
        material = new THREE.MeshBasicMaterial({color : 0xFF0000});
        geometry = this.createTorusGeometry(obstacle.size.width,
                                            obstacle.size.length,
                                            this.tubeRadius);
        mesh = new THREE.Mesh(geometry, material);
        this.obstacle[obstacleID] = mesh;
        this.scene.add(mesh);
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
    }
    
    if (this.gameState.vanishId !== null) {
        this.scene.remove(this.obstacle[this.gameState.vanishId]);
        delete this.obstacle[this.gameState.vanishId];
    }
};