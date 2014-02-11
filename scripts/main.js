/*global THREEx, GameState, GameEngine, SimpleRenderer, requestAnimationFrame, dat, Renderer, TorusRenderer,
  Detector, THREE, document, window*/

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
    var gameState, cameraFolder, rendererFolder, simpleRenderer, torusRenderer, threeRenderDomElement;
    gameState = new GameState();
    gameEngine = new GameEngine(gameState);
    
    if (Detector.webgl) {
        threeRenderDomElement = new THREE.WebGLRenderer({antialias: true});
    } else {
        document.getElementById('scene').textContent = "Cette application necessite un navigateur supportant webgl";
        throw ("WebGL not supported.");
    }
    threeRenderDomElement.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(threeRenderDomElement.domElement);
    
    simpleRenderer = new SimpleRenderer(gameState, threeRenderDomElement);
    torusRenderer = new TorusRenderer(gameState, threeRenderDomElement);
    renderer = new Renderer(simpleRenderer, torusRenderer);
    renderer.setActiveRenderer("SimpleRenderer");
    gui = new dat.GUI();
    
    //Dat gui configuration
    //------------------------------------------
    rendererFolder = gui.addFolder("Renderer");
    rendererFolder.add(renderer, "activeRendererString", ["SimpleRenderer", "TorusRenderer"]).onChange(
        function (value) {renderer.setActiveRenderer(value); }
    ).name("Renderer");
    cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(renderer.activeRenderer.camera.position, "x").name("Position X");
    cameraFolder.add(renderer.activeRenderer.camera.position, "y").name("Position Y");
    cameraFolder.add(renderer.activeRenderer.camera.position, "z").name("Position Z");
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "x", -Math.PI, Math.PI).name("Rotation X");
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "y", -Math.PI, Math.PI).name("Rotation Y");
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "z", -Math.PI, Math.PI).name("Rotation Z");
    
    renderer.activeRenderer.init();
    animate();
}

//Main loop
function mainLoop() {
    "use strict";
    init();
    animate();
}

