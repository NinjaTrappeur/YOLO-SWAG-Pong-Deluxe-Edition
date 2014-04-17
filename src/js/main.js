/*global THREEx, GameState, GameEngine, SimpleRenderer, requestAnimationFrame, dat, Renderer, TorusRenderer, CylinderRenderer, Detector, THREE, document, window*/

/*jslint plusplus: true */


var renderer, gameEngine, gui, threeRenderer;

function animate() {
    "use strict";
    renderer.activeRenderer.render();
    gameEngine.compute();
    requestAnimationFrame(animate);
}

function createDatGui() {
    "use strict";
    var rendererFolder, cameraFolder;
    if (gui !== undefined) {
        gui.destroy();
    }
    gui = new dat.GUI();
    rendererFolder = gui.addFolder("Renderer");
    rendererFolder.add(renderer, "activeRendererString", ["SimpleRenderer", "CylinderRenderer"]).onChange(function (value) {
        renderer.setActiveRenderer(value);
        createDatGui();
    }).name("Renderer");
    cameraFolder = gui.addFolder("Camera");
    cameraFolder.add(renderer.activeRenderer.camera.position, "x").name("Position X");
    cameraFolder.add(renderer.activeRenderer.camera.position, "y").name("Position Y");
    cameraFolder.add(renderer.activeRenderer.camera.position, "z").name("Position Z");
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "x", -Math.PI, Math.PI).name("Rotation X").step(0.01).listen();
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "y", -Math.PI, Math.PI).name("Rotation Y").step(0.01).listen();
    cameraFolder.add(renderer.activeRenderer.camera.rotation, "z", -Math.PI, Math.PI).name("Rotation Z").step(0.01).listen();
}


function init() {
    "use strict";
    THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) });
    var gameState, rendererFolder, simpleRenderer, torusRenderer, i, cylinderRenderer;
    gameState = new GameState();
    gameEngine = new GameEngine(gameState);
    
    if (Detector.webgl) {
        threeRenderer = new THREE.WebGLRenderer({antialias: true});
    } else {
        document.getElementById('scene').textContent = "Cette application necessite un navigateur supportant webgl";
        throw ("WebGL not supported.");
    }
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.autoClear = true;
    document.body.appendChild(threeRenderer.domElement);
    
    simpleRenderer = new SimpleRenderer(gameState, threeRenderer);
    //cylinderRenderer = new CylinderRenderer(gameState, threeRenderer);
    renderer = new Renderer();
    renderer.renderers.push(simpleRenderer);
    //renderer.renderers.push(cylinderRenderer);
    renderer.setActiveRenderer("SimpleRenderer");
    
    //Dat gui configuration
    //------------------------------------------
    createDatGui();
    
    for (i = 0; i < renderer.renderers.length; i++) {
        renderer.renderers[i].init();
    }
    animate();
}


//Main loop
function mainLoop() {
    "use strict";
    init();
    animate();
}

