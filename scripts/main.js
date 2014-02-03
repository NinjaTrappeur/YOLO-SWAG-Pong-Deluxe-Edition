/*global THREEx, GameState, GameEngine, SimpleRenderer, requestAnimationFrame */

var renderer, gameEngine;

function animate() {
    "use strict";
    renderer.render();
    gameEngine.compute();
    requestAnimationFrame(animate);
}

function init() {
    "use strict";
    THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });
    
    var gameState = new GameState();
    gameEngine = new GameEngine(gameState);
    
    renderer = new SimpleRenderer(gameState);
    renderer.init();
    animate();
}

//Main loop
function mainLoop() {
    "use strict";
    init();
    animate();
}

