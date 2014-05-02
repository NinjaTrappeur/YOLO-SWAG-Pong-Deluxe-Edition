/*
 * This composant handles the display of the game.
 * It needs a GameState computed by a GameEngine
 * The rendering is pretty basic and will be used
 * mainly for testing.
 */

/*global THREE, Size, extendClass, GameState, Ball, Bat,
Obstacle, THREEx, Detector, document, window, dat, console,
toCylinderMatrixTransformation, TimelineLite, TweenMax,
cleanThreeScene, treeGeometry*/

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

var AbstractRenderer = function (gameState, renderer, composer) {
    "use strict";
    
    if (gameState instanceof GameState) {
        this.gameState = gameState;
    } else {
        throw ("Parameter needs to be a GameState object.");
    }
    this.renderer = renderer;
    this.composer = composer;
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.001, 500);
    this.winResize   = new THREEx.WindowResize(this.renderer, this.camera);
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.postprocessing = false;
    this.bats = [];
    this.balls = [];
    this.name = "AbstractRenderer";
};

AbstractRenderer.prototype.initComposer = function () {
    "use strict";
    this.composer.reset();
    this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
    this.dotEffect = new THREE.ShaderPass(THREE.DotScreenShader);
    this.dotEffect.uniforms.scale.value = 4;
    this.dotEffect.enabled = this.postprocessing;
    this.composer.addPass(this.dotEffect);
    var copy = new THREE.ShaderPass(THREE.CopyShader);
    copy.renderToScreen = true;
    this.composer.addPass(copy);
};

AbstractRenderer.prototype.render = function () {
    "use strict";
    this.composer.render();
};

AbstractRenderer.prototype.init = function () {
    "use strict";
    throw ("Please do not use AbstractRenderer without derivating it and rewriting the init method.");
};


// class SimpleRenderer: extends AbstractRenderer
//========================================

var SimpleRenderer = function (gameState, renderer, composer) {
    "use strict";
    AbstractRenderer.call(this, gameState, renderer, composer);
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
        this.gameState.gameState = "rendererReady";
    } else if (this.gameState.gameState === "ending") {
        this.gameState.gameState = "waiting";
    }
    this.handleObstacles();
    this.updateMeshes();
    this.renderer.render(this.scene, this.camera);
};

//Class CylinderRenderer: extends AbstractRenderer
//========================================================
var CylinderRenderer = function (gameState, renderer, composer) {
    "use strict";
    var loader;
    AbstractRenderer.call(this, gameState, renderer, composer);
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
    var material, light;
    cleanThreeScene(this.scene);
    this.camera.fov = 10;
    this.camera.updateProjectionMatrix();
    this.camera.rotateZ(Math.PI);
    this.angle = 0;
    this.generateEnvironment(128);
    this.addAllObstacles();
    this.initComposer();
};

CylinderRenderer.prototype.setPostProcessing = function () {
    "use strict";
    this.dotEffect.enabled = this.postprocessing;
};

CylinderRenderer.prototype.reset = function () {
    "use strict";
    var obstacleId;
    for (obstacleId in this.obstacle) {
        this.scene.remove(this.obstacle[obstacleId]);
        delete this.obstacle[obstacleId];
    }
    
};

CylinderRenderer.prototype.generateEnvironment = function (length) {
    "use strict";
    var material, mesh, zpos;
    this.tubeTexture = THREE.ImageUtils.loadTexture("src/medias/images/grid.jpg");
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
    material = new THREE.MeshBasicMaterial({color: 0x315e91});
    //Moving door
    this.floorMesh1 = new THREE.Mesh(new THREE.PlaneGeometry(2, 4),
                                    material);
    this.floorMesh2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 4),
                                     material);
    this.floorMesh1.position.x = 1;
    this.floorMesh2.position.x = -1;
    this.floorMesh1.position.y = 2.2;
    this.floorMesh2.position.y = 2.2;
    this.floorMesh1.rotateX(-Math.PI / 2);
    this.floorMesh2.rotateX(-Math.PI / 2);
    this.scene.add(this.floorMesh1);
    this.scene.add(this.floorMesh2);
    this.generateStaticEnvironment(length);

};

CylinderRenderer.prototype.generateStaticEnvironment = function (length) {
    "use strict";
    var material, mesh, zpos, xpos;
    material = new THREE.MeshBasicMaterial({color: 0x2780e5});
    zpos = (((length - 2) / 2) + 2);
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(length, length - 2),
                                 material);
    mesh.rotateX(-Math.PI / 2);
    mesh.position.y = 2.2;
    mesh.position.z = zpos;
    this.scene.add(mesh);
    mesh = mesh.clone();
    mesh.position.z = -zpos;
    this.scene.add(mesh);
    
    xpos = ((length / 2) - 2) / 2 + 2;
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(length / 2 - 2, 4),
                          material);
    mesh.rotateX(-Math.PI / 2);
    mesh.position.y = 2.2;
    mesh.position.x = xpos;
    this.scene.add(mesh);
    mesh = mesh.clone();
    mesh.position.x = -xpos;
    this.scene.add(mesh);
    this.createTrees(256, length);
};

CylinderRenderer.prototype.createTrees = function (nbTrees, length) {
    "use strict";
    var nbTreeZone, i, zoneLength, offset;
    zoneLength = length / 3;
    offset = zoneLength / 2;
    nbTreeZone = Math.ceil(nbTrees / 8);
    this.createTreesZone(length, nbTrees);
};

CylinderRenderer.prototype.createTreesZone = function (length, nbTrees) {
    "use strict";
    var offset, i, position, material, mesh, sign;
    offset = 2;
    material = [new THREE.MeshBasicMaterial({wireframe: true}),
                new THREE.MeshBasicMaterial({color: 0x315e91})];
    for (i = 0; i < Math.ceil(nbTrees / 2); i++) {
        position = new THREE.Vector3();
        position.x = Math.random() * (length / 3) - (length / 3) / 2;
        if (Math.random() > 0.5) {
            sign = -1;
        } else {
            sign = 1;
        }
        position.z = sign * (Math.random() * (length / 4) + offset);
        position.y = 2.3;
        mesh = new THREE.SceneUtils.createMultiMaterialObject(treeGeometry, material);
        mesh.position = position;
        this.scene.add(mesh);
    }
    for (i = Math.ceil(nbTrees / 2); i < nbTrees; i++) {
        position = new THREE.Vector3();
        position.z = Math.random() * (length / 3) - (length / 3) / 2;
        if (Math.random() > 0.5) {
            sign = -1;
        } else {
            sign = 1;
        }
        position.x = sign * (Math.random() * (length / 3.) + offset);
        position.y = 2.3;
        mesh = new THREE.SceneUtils.createMultiMaterialObject(treeGeometry, material);
        mesh.position = position;
        this.scene.add(mesh);
    }
};

CylinderRenderer.prototype.render = function () {
    "use strict";
    this.handleCamera();
    if (this.gameState.gameState === "running") {
        this.handleTextureDefilement();
        this.handleObstacles();
        this.updateMeshesPosition();
    } else if (this.gameState.gameState === "starting") {
        this.gameState.gameState = "waiting start";
        this.transitionToGameIn();
    } else if (this.gameState.gameState === "ending") {
        this.gameState.gameState = "waiting end";
        this.transitionToGameOut();
    }
    if (this.postprocessing) {
        this.composer.render();
    } else {
        this.renderer.render(this.scene, this.camera);
    }
};

CylinderRenderer.prototype.handleTextureDefilement = function () {
    "use strict";
    switch (this.gameState.level) {
    case 1:
        this.tubeTexture.offset.y -= 0.05;
        break;
    case 2:
        this.tubeTexture.offset.y -= 0.08;
        break;
    case 3:
        this.tubeTexture.offset.y -= 0.1;
        break;
    case 4:
        this.tubeTexture.offset.y -= 0.14;
        break;
    }
};

//Camera and animation stuff
//==================================================

CylinderRenderer.prototype.transitionToGameIn = function () {
    "use strict";
    var tween, timeLineIn;
    timeLineIn = new TimelineLite({onComplete: function () {
        this.gameState.gameState = "rendererReady";
        this.scene.fog = new THREE.Fog(0x000000, 1, 2);
    },
                                   onCompleteScope: this});
    //Camera movement
    tween = TweenMax.to(this.camera.position, 1, {x : 0, y : 4, z : 0,
                                         onUpdate : function () { this.camera.lookAt(new THREE.Vector3(0, 1.1, 0)); },
                                         onUpdateScope: this});
    timeLineIn.add(tween, 0);
    
    //Best score out
    
    tween = new TweenMax.to(document.getElementById("bestTimeMessage"), 0.5, {css:{left: -500 }});
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
    ray = 80;
    timeLineOut = new TimelineLite({onComplete: function () {
        this.camera.updateProjectionMatrix();
        new TweenMax.to(document.getElementById("bestTimeMessage"), 0.5, {css:{left: 0 }});
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
    tween = TweenMax.to(this.camera.position, 1, {x : ray * Math.cos(this.angle), y : 20, z : ray * Math.sin(this.angle),
                                         onUpdate : function () { this.camera.lookAt(new THREE.Vector3(0, 2, 0)); },
                                         onUpdateScope: this});
    timeLineOut.add(tween, 1);
    
    //Floor opening
    tween = TweenMax.to(this.floorMesh1.position, 1, {x : 1});
    timeLineOut.add(tween, 1);
    tween = TweenMax.to(this.floorMesh2.position, 1, {x : -1});
    timeLineOut.add(tween, 1);
    
    tween = new TweenMax.to(document.getElementById("levelMessage"), 0.5, {css:{left: -200 }});
    timeLineOut.add(tween, 1.5);
    tween = new TweenMax.to(document.getElementById("timeMessage"), 0.5, {css:{right: -200 }});
    timeLineOut.add(tween, 1.5);

    timeLineOut.play();
};

//Camera stuff
//===============================
CylinderRenderer.prototype.handleCamera = function () {
    "use strict";
    var ray;
    if (this.gameState.gameState === "waiting") {
        ray = 80;
        if (this.angle < 0) {
            this.angle = 2 * Math.PI;
        }
        this.camera.position.x = ray * Math.cos(this.angle);
        this.camera.position.z = ray * Math.sin(this.angle);
        this.camera.position.y = 20;
        this.camera.lookAt(new THREE.Vector3(0, 2, 0));
        this.angle -= 0.005;
    }
    if (this.gameState.gameState === "running") {
        if (this.camera.fov !== 200) {
            this.camera.fov = 200;
            this.camera.updateProjectionMatrix();
        }
        if (this.gameState.cameraPosition === "arena") {
            this.camera.position.y = 1.1;
            this.camera.position.x = 0;
            this.camera.position.z = 0;
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        } else if (this.gameState.cameraPosition === "bat") {
            this.camera.lookAt(new THREE.Vector3(0, 0, 0));
            this.moveCameraAroundCylinder(this.gameState.bat.position);
        }
    }
};

CylinderRenderer.prototype.moveCameraAroundCylinder = function (position) {
    "use strict";
    var angle, cameraPos, batAngle;
    batAngle = this.gameState.bat.size.width * 2 * Math.PI;
    cameraPos = this.camera.position;
    angle = 2 * Math.PI * this.gameState.bat.position.x + batAngle / 2 + Math.PI / 4;
    cameraPos.y = this.batMesh.position.y - 0.1;
    cameraPos.x = (this.tubeRadius - 0.5) * Math.sin(angle);
    cameraPos.z = (this.tubeRadius - 0.5) * Math.cos(angle);
    this.camera.lookAt(new THREE.Vector3(cameraPos.x, cameraPos.y - 0.1, cameraPos.z));
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