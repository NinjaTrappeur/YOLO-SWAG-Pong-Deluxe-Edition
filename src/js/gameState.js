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



//Bat class: extends MovingGameObject
//====================================

var Bat = function (position, size) {
    "use strict";
    MovingGameObject.call(this, position, size);
    this.name = "Bat";
    this.velocityMax = 0.01;
};

extendClass(Bat, MovingGameObject);

Bat.prototype.moveLeft = function (step) {
    "use strict";
    if (Math.abs(this.velocity.x) - step > this.velocityMax) {
        this.velocity.x = -this.velocityMax;
    } else {
        this.velocity.x -= step;
    }
};

Bat.prototype.moveRight = function (step) {
    "use strict";
    if (this.velocity.x + step > this.velocityMax) {
        this.velocity.x = this.velocityMax;
    } else {
        this.velocity.x += step;
    }
};

Bat.prototype.createMeshes = function () {
    "use strict";
    var geometry, material, i, mesh;
    geometry = new THREE.CubeGeometry(this.size.width, this.size.length,
                                      this.size.length);
    material = new THREE.MeshBasicMaterial({color: 0xff0000});
    this.mesh = [];
    for (i = 0; i < 3; i++) {
        mesh = new THREE.Mesh(geometry,  material);
        mesh.position.y = this.position.y;
        mesh.position.z = this.position.z;
        this.mesh.push(mesh);
    }
    this.updateMeshPosition();
};

Bat.prototype.updateMeshPosition = function () {
    "use strict";
    var i;
    this.mesh[0].position.x = this.position.x + this.size.width / 2;
    this.mesh[1].position.x = this.position.x + this.size.width / 2 - 2 * this.clearance;
    this.mesh[2].position.x = this.position.x + this.size.width / 2 + 2 * this.clearance;
    for (i = 0; i < this.mesh.length; i++) {
        this.mesh[i].position.y = this.position.y;
    }
};


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
    this.gameState = "Init";
};
