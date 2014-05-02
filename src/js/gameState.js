/*
 * This composant handles the content of the game.
 * It needs to be computed by a game engine component and displayed
 * by a game renderer component.
 * This composant provides
 */

/*global THREE, Position, Size, extendClass, number, string */

/*jslint plusplus: true */

//GameObject class
//=====================================

var GameObject = function (position, size) {
    "use strict";
    if (position instanceof THREE.Vector3 && size instanceof Size) {
        this.position = position;
        this.size = size;
        this.name = "Object";
        this.state = "None";
    } else {
        throw ("You need to specify position and size parameter to create a GameObject element.");
    }
};


//MovingGameObject class: extends GameObject
//========================================

var MovingGameObject = function (position, size) {
    "use strict";
    GameObject.call(this, position, size);
    this.name = "MovingGameObject";
    this.velocity = new THREE.Vector3(0, 0, 0);
};

extendClass(MovingGameObject, GameObject);

//Arena class: extends GameObject
//======================================

var Arena = function (size) {
    "use strict";
    var pos = new THREE.Vector3(0, 0, 0);
    GameObject.call(this, pos, size);
    this.name = "Arena";
};

extendClass(Arena, GameObject);


//Obstacle class: extends MovingGameObject
//====================================
var Obstacle = function (position, size, id) {
    "use strict";
    MovingGameObject.call(this, position, size);
    this.name = "Obstacle";
    this.id = id;
};


//Bat class: extends MovingGameObject
//====================================

var Bat = function (position, size) {
    "use strict";
    MovingGameObject.call(this, position, size);
    this.name = "Bat";
    this.velocityMax = 0.01;
};

extendClass(Bat, MovingGameObject);


//Ball class: extends MovingGameObject
//====================================

var Ball = function (position, size) {
    "use strict";
    var material, geometry, mesh;
    MovingGameObject.call(this, position, size);
    this.name = "Ball";
    geometry = new THREE.CubeGeometry(this.size.width,
                                      this.size.length, this.size.width);
    material = new THREE.MeshBasicMaterial({color : 0xffffff});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = this.position.x;
    mesh.position.y = this.position.y;
    mesh.position.z = this.position.z;
    this.mesh = mesh;
};

extendClass(Ball, MovingGameObject);

Ball.prototype.updateMesh = function () {
    "use strict";
    this.mesh.position.x = this.position.x;
    this.mesh.position.y = this.position.y;
};




//Player class
//=======================================

var Player = function (id, name) {
    "use strict";
    if (id instanceof number && name instanceof string) {
        this.id = id;
        this.name = name;
    } else {
        throw "You need to specify an ID number and a name to create a Player.";
    }
};



//Game: main class of this component.
//========================================

var GameState = function () {
    "use strict";
    this.arena = new Arena(new Size(1, 2));
    this.bat = null;
    this.obstacles = {};
    this.gameState = "init";
    //Obstacle vanished
    this.vanishId = null;
    //Obstacle popped
    this.popId = null;
    this.cameraPosition = "arena";
    this.startTime = 0;
    this.level = 1;
};
