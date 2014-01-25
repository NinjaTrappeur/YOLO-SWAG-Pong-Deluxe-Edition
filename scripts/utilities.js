//Position class
//=============================

var Position = function(x,y,z){
  if(x ==null || y==null || z==null)
    throw("You need to specify x,y and z coordinates\
          to create a Position object.");
  else{
    this.x = x;
    this.y = y;
    this.z = z;
  }
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
  if(width ==null || length==null)
    throw("You need to specify width and length values\
          to create a Size object.");
  else{
    this.width = width;
    this.length = length;
  }
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
