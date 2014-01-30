var renderer, gameEngine;

function init(){
  "use strict";
  THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });

  var gameState = new GameState();
  gameEngine = new GameEngine(gameState);

  renderer = new SimpleRenderer(gameState);
  renderer.init();
	animate();
}

function animate(){
  renderer.render();
  gameEngine.compute();
  requestAnimationFrame( animate );

}


//Main loop
function mainLoop(){
  "use strict";
  init();
  animate();
}

