/*
 * This composant handles the content of the game.
 * It needs to be computed by a game engine component and displayed
 * by a game renderer component.
 * This composant provides
 */

//GameObject class
//=====================================

var GameObject = function(position, size){
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
  this.name = "Arena";
}

extendClass(Arena, GameObject);

Arena.prototype.getGoalSize = function(){
  return this.goalSize;
}


//Bat class: extends GameObject
//====================================

var Bat = function(position, size, id){
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
  GameObject.call(this, position, size);
  this.name = "Ball";
}

extendClass(Ball, GameObject);


//Player class
//=======================================

var Player = function(id, name){
  if(id instanceof number && name instanceof string)
    {
      this.id = id;
      this.name = name;
    }
  else
    throw "You need to specify an ID number and a name\
          to create a Player.";
}

Player.prototype.getName = function(){return this.name;};
Player.prototype.getId = function(){return this.id;};


//Game: main class of this component.
//========================================

var GameState = function(){
  this.bats = new Array();
  this.balls = new Array();
  this.arena = new Arena(new Size(500,500));
  this.localPlayerId=0;
  this.players = new Array();
  this.gameState = "Init";
}

GameState.prototype.addBall = function(ball){
  if(ball instanceof Ball)
    this.balls.push(ball);
  else
    throw "Wrong paramater type, parameter needs to be a Ball.";
}

GameState.prototype.addBat = function(bat){
  if(bat instanceof Bat)
    this.bats.push(bat);
  else
    throw "Wrong paramater type, parameter needs to be a Bat.";
}

GameState.prototype.addPlayer = function(player){
  if(player instanceof Player)
    this.players.push(player);
  else
    throw("Parameter needs to be a Player.");
}

GameState.prototype.getBats = function(){return this.bats;}

GameState.prototype.getBalls = function(){return this.balls;}

GameState.prototype.getPlayers = function(){return this.players;}