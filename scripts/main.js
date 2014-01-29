var renderer;


function init(){
  "use strict";
  THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });

  var gameState;
  //Creation gamestate
  gameState = new GameState();
  //Filling gamestate
  gameState.addBall(new Ball(new Position(0,0,0.1), new Size(0.08,0.08)));
  //Creating renderer
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

