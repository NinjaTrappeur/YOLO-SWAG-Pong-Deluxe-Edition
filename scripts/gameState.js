/*
 * This composant handles the content of the game.
 * It needs to be computed by a game engine component and displayed
 * by a game renderer component.
 * This composant provides
 */

//GameObject class
//=====================================

var GameObject = function(position, size){
  "use strict";
  if(position instanceof Position && size instanceof Size)
    {
      this.position = position;
      this.size = size;
      this.name = "Object";
      this.state = "None";
    }
  else
    throw("You need to specify position and size parameter to create\
           a GameObject element.");
}



//Arena class: extends GameObject
//======================================

var Arena = function(size){
  "use strict";
  GameObject.call(this,new Position(0,0,0), size);
  this.name = "Arena";
  this.walls = new Array();
  var border = 0.05;

  var geometry,material,mesh;
  material = new THREE.MeshNormalMaterial();
  geometry = new THREE.CubeGeometry(size.width+border,border,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(0,-size.length/2,0);
  this.walls.push(mesh);

  geometry = new THREE.CubeGeometry(size.width+border,border,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(0,size.length/2,0);
  this.walls.push(mesh);

  geometry = new THREE.CubeGeometry(border,size.length,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(size.width/2,0,0);
  this.walls.push(mesh);

  geometry = new THREE.CubeGeometry(border,size.length,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(-size.width/2,0,0);
  this.walls.push(mesh);

}

extendClass(Arena, GameObject);


//Bat class: extends GameObject
//====================================

var Bat = function(position, size, id){
  "use strict";
  if(typeof id=="number"){
    GameObject.call(this,position , size);
    this.id = id;
    this.name = "Bat";
  }
  else
    throw "You need to specify a bat id to create a Bat object";
}

extendClass(Bat, GameObject);

//Ball class: extends GameObject
//====================================

var Ball = function(position, size){
  "use strict";
  GameObject.call(this, position, size);
  this.name = "Ball";
}

extendClass(Ball, GameObject);


//Player class
//=======================================

var Player = function(id, name){
  "use strict";
  if(id instanceof number && name instanceof string)
    {
      this.id = id;
      this.name = name;
    }
  else
    throw "You need to specify an ID number and a name\
          to create a Player.";
}



//Game: main class of this component.
//========================================

var GameState = function(){
  "use strict";
  this.bats = new Array();
  this.balls = new Array();
  this.arena = new Arena(new Size(1,2));
  this.localPlayerId=0;
  this.players = new Array();
  this.gameState = "Init";
}

GameState.prototype.addBall = function(ball){
  "use strict";
  if(ball instanceof Ball)
    this.balls.push(ball);
  else
    throw "Wrong paramater type, parameter needs to be a Ball.";
}

GameState.prototype.addBat = function(bat){
  "use strict";
  if(bat instanceof Bat)
    this.bats.push(bat);
  else
    throw "Wrong paramater type, parameter needs to be a Bat.";
}

GameState.prototype.addPlayer = function(player){
  "use strict";
  if(player instanceof Player)
    this.players.push(player);
  else
    throw("Parameter needs to be a Player.");
}
