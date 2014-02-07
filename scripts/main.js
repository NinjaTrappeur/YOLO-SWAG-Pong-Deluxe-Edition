/*global THREEx, GameState, GameEngine, SimpleRenderer, requestAnimationFrame, dat, Renderer */

var renderer, gameEngine, gui;



function animate() {
    "use strict";
    renderer.activeRenderer.render();
    gameEngine.compute();
    requestAnimationFrame(animate);
}

function init() {
    "use strict";
    THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });
    var gameState, cameraFolder, rendererFolder, simpleRenderer, torusRenderer;
    gameState = new GameState();
    gameEngine = new GameEngine(gameState);
    
    simpleRenderer = new SimpleRenderer(gameState);
    renderer = new Renderer(simpleRenderer, torusRenderer);
    renderer.set("SimpleRenderer");
    renderer.activeRenderer.init();
    gui = new dat.GUI();
    
    //Dat gui configuration
    //------------------------------------------
    cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(renderer.activeRenderer.camera.position, "x");
    cameraFolder.add(renderer.activeRenderer.camera.position, "y");
    cameraFolder.add(renderer.activeRenderer.camera.position, "z");
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "x", -Math.PI, Math.PI);
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "y", -Math.PI, Math.PI);
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "z", -Math.PI, Math.PI);
    rendererFolder = gui.addFolder("Renderer");
    rendererFolder.add(renderer, "set", ["SimpleRenderer", "TorusRenderer"]);
    animate();
}

//Main loop
function mainLoop() {
    "use strict";
    init();
    animate();
}

