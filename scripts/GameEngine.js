/*
 * This composant handles the core of the game.
 * This composant provides
 */

//GameObject class
//=====================================

var GameObject = function(position, size){
  if(!(position instanceof Position) || !(size instanceof Size))
    throw("You need to specify position and size parameter to create\
           a GameObject element.");
  else{
    this.position = position;
    this.size = size;
    this.name = "Object";
    this.state = "None";
  }
}

GameObject.prototype.getPosition = function(){
  return this.position;
}

GameObject.prototype.getSize = function(){
  return this.size;
}

GameObject.prototype.getName = function(){
  return this.name;
}

GameObject.prototype.getState = function(){
  return this.state;
}

GameObject.prototype.setState = function(state){
  this.state = state;
}


//Arena class: extends GameObject
//======================================

var Arena = function(size){
  GameObject.call(this,new Position(0,0,0), size);
  this.goalSize = size.getWidth()/3;
}

extendClass(Arena, GameObject);

Arena.prototype.getGoalSize = function(){
  return this.goalSize;
}


//Bat class: extends GameObject
//====================================

var Bat = function(position, size, id){
  if(id == null)
    throw "You need to specify a bat id to create a Bat object";
  else{
    GameObject.call(this,position , size);
    this.id = id;
  }
}

extendClass(Bat, GameObject);


//Ball class: extends GameObject
//====================================

var Ball = function(position, size){
  GameObject.call(this, position, size);
}

extendClass(Ball, GameObject);


//CollisionDetection function
//========================================

var CollisionDetection = function(object1, object2){

}

//Player class
//=======================================

var Player = function(id, name){
  if(!(id instanceof number))
    throw "You need to specify a ID number to create a Player.";
  if(!(name instanceof string))
    throw "You need to specify a name to create a Player.";
  this.id = id;
  this.name = name;
}

Player.prototype.getName = function(){return this.name;};
Player.prototype.getId = function(){return this.id;};


//Game: main class of this component.
//========================================

var Game = function(){
  this.bats = new Array();
  this.balls = new Array();
  this.arena = new Arena(500,500);
  this.playerLife = 3;
  this.otherPlayersLife = new Array();
  this.gameState = "Init";
}

Game.prototype.addBall = function(ball){
  if(ball instanceof Ball)
    this.balls.push(ball);
  else
    throw "Wrong paramater type, parameter needs to be a Ball.";
}

Game.prototype.addBat = function(bat){
  if(bat instanceof Bat)
    this.bats.push(bat);
  else
    throw "Wrong paramater type, parameter needs to be a Bat.";
}

Game.prototype.getBats = function(){return this.bats;}

Game.prototype.getBalls = function(){return this.balls;}