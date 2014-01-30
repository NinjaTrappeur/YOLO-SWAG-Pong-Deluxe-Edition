var renderer;

function createArena(){
  //Creation gamestate
  gameState = new GameState();
  //Filling gamestate
  gameState.addBall(new Ball(new Position(0,0,0.1), new Size(0.08,0.08)));
  gameState.addBat(new Bat(new Position(0,-0.8,0), new Size(0.5,0.08), 0));
  gameState.addObstacle(new Obstacle(new Position(-0.2,0.2,0.1), new Size(0.08,0.08)));
  //Creating renderer
  return gameState
}


function init(){
  "use strict";
  THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });

  var gameState = createArena();

  renderer = new SimpleRenderer(gameState);
  renderer.init();
	animate();
}

function animate(){
  renderer.render();
  requestAnimationFrame( animate );

}


//Main loop
function mainLoop(){
  "use strict";
  init();
  animate();
}

