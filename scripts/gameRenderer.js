//class AbstractRenderer
//===================================

/* This class is abstract. You can't use it
 * alone, you need to derivate it and rewrite the
 * init method.
 */

var AbstractRenderer = function(gameState){
  if ( Detector.webgl )
    this.renderer = new THREE.WebGLRenderer( );
	else{
	  document.getElementById('scene').textContent="Cette \
    application necessite un navigateur supportant webgl";
    throw("WebGL not supported.");
  }

  if(gameState instanceof GameState)
    this.gameState = gameState;
  else
    throw("Parameter needs to be a GameState object.");

  this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000 );
  this.camera.position.x = 250;
  this.camera.position.y = 250;
  this.camera.position.z = 10;
  this.camera.lookAt(0,-1,0);

  this.scene = new THREE.Scene();
  this.scene.camera = this.camera;
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

  geometry = new THREE.PlaneGeometry(this.gameState.arena.getSize().getWidth(),
                                     this.gameState.arena.getSize().getLength());
  material = new THREE.MeshBasicMaterial({color : 0xff0000});
  mesh = new THREE.Mesh(geometry, material);
  this.arena = mesh;
  this.scene.add(mesh);

  var bat;
  for(var i=0; i<this.gameState.bats.length;i++)
    {
      bat = this.gameState.bats[i];
      geometry = new THREE.PlaneGeometry(bat.getSize().getWidth(), bat.getSize().geLenght());
      material = new THREE.MeshBasicMaterial({color : 0x00ff00});
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = bat.getPosition().x;
      mesh.position.y = bat.getPosition().y;
      mesh.position.z = bat.getPosition().z;
      this.scene.add(mesh);
      this.bats.push(mesh);
    }

  var ball;
  for(var i=0;i<this.gameState.balls.lenght;i++)
    {
      ball = this.gameState.balls[i];
      geometry = new THREE.PlaneGeometry(ball.getSize().getWidth(), ball.getSize().geLenght());
      material = new THREE.MeshBasicMaterial({color : 0xffffff});
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = ball.getPosition().x;
      mesh.position.y = ball.getPosition().y;
      mesh.position.z = ball.getPosition().z;
      this.balls.push(mesh);
      this.scene.add(mesh);
    }
}