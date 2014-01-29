//class AbstractRenderer
//===================================

/* This class is abstract. You can't use it
 * alone, you need to derivate it and rewrite the
 * init method.
 */

var AbstractRenderer = function(gameState){
  if ( Detector.webgl )
    this.renderer = new THREE.WebGLRenderer({antialias:true} );
	else{
	  document.getElementById('scene').textContent="Cette \
    application necessite un navigateur supportant webgl";
    throw("WebGL not supported.");
  }

  container = document.getElementById("scene");
  container.appendChild(this.renderer.domElement);

  if(gameState instanceof GameState)
    this.gameState = gameState;
  else
    throw("Parameter needs to be a GameState object.");

  this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000 );

  this.scene = new THREE.Scene();
  this.scene.add(this.camera);
  THREEx.WindowResize(this.renderer, this.camera);
  this.bats = new Array();
  this.balls = new Array();
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
  var geometry;
  var material;
  var mesh;

  geometry = new THREE.PlaneGeometry(500,500);
  material = new THREE.MeshBasicMaterial({color : 0xff0000});
  mesh = new THREE.Mesh(geometry, material);
  mesh.doubleSided = true;
  this.arena = mesh;
  this.scene.add(mesh);
  var bat;
  for(var i=0; i<this.gameState.bats.length;i++)
    {
      bat = this.gameState.bats[i];
      geometry = new THREE.PlaneGeometry(bat.size.width, bat.size.length);
      material = new THREE.MeshBasicMaterial({color : 0x00ff00});
      mesh = new THREE.Mesh(geometry, material);
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
      geometry = new THREE.PlaneGeometry(ball.size.width, ball.size.width);
      material = new THREE.MeshBasicMaterial({color : 0xffffff});
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = ball.position.x;
      mesh.position.y = ball.position.y;
      mesh.position.z = ball.position.z;
      this.balls.push(mesh);
      this.scene.add(mesh);
      this.camera.position.set(75,250,3);
      this.camera.lookAt(this.arena.position);
    }
}