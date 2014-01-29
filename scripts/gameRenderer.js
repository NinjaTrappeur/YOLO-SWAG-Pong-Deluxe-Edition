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

  var container = document.getElementById("scene");
  container.appendChild(this.renderer.domElement);

  if(gameState instanceof GameState)
    this.gameState = gameState;
  else
    throw("Parameter needs to be a GameState object.");

  this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10 );


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
  this.camera.position.set(0,-1.7,0.8);
  this.camera.rotation.set(Math.PI/3,0,0);


  //Creating arena
  var border = 0.05;
  geometry = new THREE.PlaneGeometry(this.gameState.arena.size.width,this.gameState.arena.size.length);
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh(geometry, material);
  this.arena = mesh;
  this.scene.add(mesh);

  geometry = new THREE.CubeGeometry(this.gameState.arena.size.width+border,border,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(0,-this.gameState.arena.size.length/2,0);
  this.scene.add(mesh);

  geometry = new THREE.CubeGeometry(this.gameState.arena.size.width+border,border,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(0,this.gameState.arena.size.length/2,0);
  this.scene.add(mesh);

  geometry = new THREE.CubeGeometry(border,this.gameState.arena.size.length,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(this.gameState.arena.size.width/2,0,0);
  this.scene.add(mesh);

  geometry = new THREE.CubeGeometry(border,this.gameState.arena.size.length,border);
  mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(-this.gameState.arena.size.width/2,0,0);
  this.scene.add(mesh);

  var bat;

  //Creating graphics objects.
  for(var i=0; i<this.gameState.bats.length;i++)
    {
      bat = this.gameState.bats[i];
      geometry = new THREE.PlaneGeometry(bat.size.width, bat.size.length);
      material = new THREE.MeshBasicMaterial({color : 0x00ff00});
      mesh = new THREE.Mesh(geometry,  material);
      mesh.position.x = bat.position.x;
      mesh.position.y = bat.position.y;
      mesh.position.z = bat.position.z;
      this.scene.add(mesh);
      this.bats.push(mesh);
    }

  var ball;
  for(var i=0;i<this.gameState.balls.length;i++)
    {
      ball = this.gameState.balls[i];
      geometry = new THREE.CubeGeometry(ball.size.width, ball.size.length, ball.size.width);
      material = new THREE.MeshBasicMaterial({color : 0xffffff});
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = ball.position.x;
      mesh.position.y = ball.position.y;
      mesh.position.z = ball.position.z;
      this.balls.push(mesh);
      this.scene.add(mesh);
    }
}
