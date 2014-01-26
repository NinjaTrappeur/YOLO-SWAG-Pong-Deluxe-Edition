var renderer;

function init(){
  	THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });

  //Creation gamestate
  gameState = new GameState();
  //Filling gamestate
  gameState.addBall(new Ball(new Position(50,50,50), new Size(30,30)));
  //Creating renderer
  renderer = new SimpleRenderer(gameState);
  renderer.init();
	animate();
  }

function animate(){
	renderer.render();
	requestAnimationFrame(animate);
}


//Main loop
function mainLoop(){
  init();
  animate();
}

