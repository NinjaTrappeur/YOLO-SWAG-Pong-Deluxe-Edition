var camera, scene, renderer;

function init(){
	//Creating renderer
	if ( Detector.webgl )
	       renderer = new THREE.WebGLRenderer( );
	else
	       document.getElementById('scene').textContent="Cette application necessite un terminal supportant webgl";
	renderer.setSize(window.innerWidth, window.innerHeight);
	//adding extern lirairies

	//creating camera
  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.y = 0;
	camera.position.z = 0;

	scene = new THREE.Scene();
	scene.camera = camera;

	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'f'.charCodeAt(0) })

	scene.fog = new THREE.FogExp2(0x000000,0.08);
	animate();
  }


function animate(){
	renderer.render(scene,camera);
	requestAnimationFrame(animate);
}


//Main loop
function mainLoop(){
  init();
  animate();
}

