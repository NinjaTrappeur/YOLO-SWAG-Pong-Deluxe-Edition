/*
 * This composant handles the display of the game.
 * It needs a GameState computed by a GameEngine
 * The rendering is pretty basic and will be used
 * mainly for testing.
 */


//class AbstractRenderer
//===================================

/* This class is abstract. You can't use it
 * alone, you need to derivate it and rewrite the
 * init method.
 */

var AbstractRenderer = function(gameState){
  "use strict";
  if ( Detector.webgl )
    this.renderer = new THREE.WebGLRenderer({antialias:true} );
	else{
	  document.getElementById('scene').textContent="Cette \
    application necessite un navigateur supportant webgl";
    throw("WebGL not supported.");
  }
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( this.renderer.domElement );

  if(gameState instanceof GameState)
    this.gameState = gameState;
  else
    throw("Parameter needs to be a GameState object.");

  this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10 );
  this.winResize   = new THREEx.WindowResize(this.renderer, this.camera)


  this.scene = new THREE.Scene();
  this.scene.add(this.camera);
  this.bats = new Array();
  this.balls = new Array();
  this.gui = new dat.GUI();

  //Dat gui configuration
  //------------------------------------------
  var cameraFolder = this.gui.addFolder("camera");
  cameraFolder.add(this.camera.position,"x");
  cameraFolder.add(this.camera.position,"y");
  cameraFolder.add(this.camera.position,"z");
  cameraFolder.add(this.camera.rotation, "x", -Math.PI, Math.PI);
  cameraFolder.add(this.camera.rotation, "y", -Math.PI, Math.PI);
  cameraFolder.add(this.camera.rotation, "z", -Math.PI, Math.PI);
}

AbstractRenderer.prototype.render = function(){
  this.renderer.render(this.scene, this.camera);
}

AbstractRenderer.prototype.init = function(){
  throw("Please do not use AbstractRenderer without derivating it\
         and rewriting the init method.");
}


// class 2DRenderer: extends AbstractRenderer
//========================================

var SimpleRenderer = function(gameState){
  AbstractRenderer.call(this, gameState);
}

extendClass(SimpleRenderer, AbstractRenderer);

SimpleRenderer.prototype.init = function(){
  "use strict";
  var geometry;
  var material;
  var mesh;

  this.camera.lookAt(new THREE.Vector3(0,0,1));
  this.camera.position.set(0,-1.7,0.2);
  this.camera.rotation.set(Math.PI/2.5,0,0);


  //Creating arena
  geometry = new THREE.PlaneGeometry(this.gameState.arena.size.width,
                                     this.gameState.arena.size.length);
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh(geometry, material);
  this.scene.add(mesh);

  var bat;

  //Creating graphics objects.
  for(var i=0; i<this.gameState.bats.length;i++)
    {
      bat = this.gameState.bats[i];
      for(var j=0;j<bat.mesh.length;++j)
        this.scene.add(bat.mesh[j]);
    }

  var ball;
  for(var i=0;i<this.gameState.balls.length;i++)
    {
      ball = this.gameState.balls[i];
      this.scene.add(ball.mesh);
    }
  var obstacle;
    for(var i=0;i<this.gameState.obstacles.length;i++)
    {
      obstacle = this.gameState.obstacles[i];
      this.scene.add(obstacle.mesh);
    }

}

SimpleRenderer.prototype.render = function(){
    this.renderer.render(this.scene, this.camera);
    this.camera.position.y = this.gameState.bats[0].position.y-0.3;
    this.camera.position.x = this.gameState.bats[0].position.x+0.2;
}
