//Position class
//=============================

var Position = function(x,y,z){
  if(typeof x == "number" && typeof y=="number" && typeof z == "number")
  {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  else
   throw("You need to specify x,y and z numbers\
          to create a Position object.");
}

Position.prototype.getX = function(){
  return this.x;
}

Position.prototype.getY = function(){
  return this.y;
}

Position.prototype.getZ = function(){
  return this.z
}

Position.prototype.setX = function(x){
  this.x=x;
}

Position.prototype.setY = function(y){
  this.y=y;
}

Position.prototype.setZ = function(z){
  this.z=z;
}




//Size class
//===================================

var Size = function(width, length){
  if(typeof width == "number" && typeof length == "number"){
    this.width = width;
    this.length = length;
  }
  else
    throw("You need to specify width and length values\
    to create a Size object: width = " + width + " lenght = " + length);
}

Size.prototype.getWidth = function(){
  return this.width;
}

Size.prototype.getLength = function(){
  return this.length;
}

Size.prototype.setWidth = function(width){
  this.width = width;
}

Size.prototype.setLength = function(length){
  this.length = length;
}


//Utility for Inheritance
//=========================================

var extendClass = function(child, parent) {
  var Surrogate = function() {};
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();
};
500 instanceof Number;