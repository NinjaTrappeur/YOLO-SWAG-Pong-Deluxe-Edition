/*
 * This composant handles the core of the game.
 * This composant provides
 */

//GameObject class
//=====================================

var GameObject = function(position, size){
  this.position = position;
  this.size = size;
  this.name = "Object";
  this.state = "None";
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
  GameObject.call(this,[new Position(0,0,0), size]);
  this.goalSize = size.getWidth()/3;
}

extendClass(Arena, GameObject);

Arena.prototype.getGoalSize = function(){
  return this.goalSize;
}


//Bat class: extends GameObject
//====================================

var Bat = function(size){
  GameObject.call(this,[new Position(0,0,0), size]);
}

extendClass(Bat, GameObject);

//CollisionDetection class
//========================================

var CollisionDetection = function(object1, object2){

}
