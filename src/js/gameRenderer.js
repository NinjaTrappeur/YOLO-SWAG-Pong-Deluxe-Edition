/*
 * This composant handles the display of the game.
 * It needs a GameState computed by a GameEngine
 * The rendering is pretty basic and will be used
 * mainly for testing.
 */

/*global THREE, Position, Size, extendClass, number, string, GameState, Ball, Bat,
Obstacle, THREEx, Detector, document, window, dat*/

/*jslint plusplus: true */


var Renderer = function (simpleRenderer, torusRenderer) {
    "use strict";
    this.renderers = [simpleRenderer, torusRenderer];
    this.activeRendererString = "SimpleRenderer";
};

Renderer.prototype.setActiveRenderer = function (name) {
    "use strict";
    this.activeRendererString = name;
    if (this.activeRendererString === "SimpleRenderer") {
        this.activeRenderer = this.renderers[0];
    } else {
        this.activeRenderer = this.renderers[1];
    }
};

//class AbstractRenderer
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
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.winResize   = new THREEx.WindowResize(this.renderer, this.camera);
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.bats = [];
    this.balls = [];
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
};

extendClass(SimpleRenderer, AbstractRenderer);

SimpleRenderer.prototype.init = function () {
    "use strict";
    var geometry, material, mesh, bat, ball, i, j;
    
    this.camera.lookAt(new THREE.Vector3(0, 0, 1));
    this.camera.position.set(0, -1.7, 0.2);
    this.camera.rotation.set(Math.PI / 2.5, 0, 0);
    
    
    //Creating arena
    geometry = new THREE.PlaneGeometry(this.gameState.arena.size.width,
                                       this.gameState.arena.size.length);
    material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    
    //Creating graphics objects.
    this.addBatsToScene();
    
    for (i = 0; i < this.gameState.balls.length; i++) {
        ball = this.gameState.balls[i];
        this.scene.add(ball.mesh);
    }
    
    this.addObstacles();
    
};

SimpleRenderer.prototype.addBatsToScene = function () {
    "use strict";
    var i, j, bat;
    if (this.bats.length > 0) {
        for (j = 0; j < this.bats.length; j++) {
            this.scene.remove(this.bats[j]);
        }
    }
    this.bats = [];
    for (i = 0; i < this.gameState.bats.length; i++) {
        bat = this.gameState.bats[i];
        for (j = 0; j < bat.mesh.length; j++) {
            this.scene.add(bat.mesh[j]);
            this.bats.push(bat.mesh[j]);
        }
    }
};

SimpleRenderer.prototype.render = function () {
    "use strict";
    this.renderer.render(this.scene, this.camera);
    if (this.gameState.meshesChanged) {
        this.addBatsToScene();
        this.gameState.meshesChanged = false;
    }
    this.camera.position.y = this.gameState.bats[0].position.y - 0.3;
    this.camera.position.x = this.gameState.bats[0].position.x + this.gameState.bats[0].size.width / 2;
};

SimpleRenderer.prototype.addObstacles = function () {
    "use strict";
    var obstacle, i;
    for (i = 0; i < this.gameState.obstacles.length; i++) {
        obstacle = this.gameState.obstacles[i];
        this.scene.add(obstacle.mesh);
    }
};


// class TorusRenderer: extends AbstractRenderer
//========================================
var TorusRenderer = function (gameState, renderer) {
    "use strict";
    AbstractRenderer.call(this, gameState, renderer);
    this.radius = 2;
    this.tubeRadius = 0.8;
};

extendClass(TorusRenderer, AbstractRenderer);

TorusRenderer.prototype.init = function () {
    "use strict";
    var geometry, material, mesh, bat, ball, i, j;
    
    
    //adjusting camera
    this.camera.lookAt(new THREE.Vector3(0, 0, 1));
    this.camera.position.set(0, -4, 0);
    this.camera.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    
    
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
};