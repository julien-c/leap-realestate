function init3D(path) {

  var controller = new Leap.Controller({enableGestures:true});
  var container = document.getElementById('scene');
  var containerW = container.offsetWidth;
  var containerH = container.offsetHeight;
  var cursorActive = true;
  var fingerPos = {};
  var cursorX = 0,
      cursorY = 0,
      cursorZ = 0;

  function map(value, inputMin, inputMax, outputMin, outputMax){
    outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);  
    if (outVal >  outputMax) { outVal = outputMax; }
    if (outVal <  outputMin) { outVal = outputMin; }
    return outVal;
  }

  controller.loop(function(frame) {
    // Pointables
    if (cursorActive) {
      
      for(var i = 0; i < 1; i++) {
        var finger = frame.pointables[i];
        if (typeof(finger) != 'undefined') {
          fingerPos.x = finger.tipPosition[0];
          fingerPos.y = finger.tipPosition[1];
          fingerPos.z = finger.tipPosition[2];
          cursorX = (fingerPos.x);
          cursorY = (fingerPos.y);
          cursorZ = (fingerPos.z);
        }
      }
    }
    renderModel();
  });

  var camera, scene, renderer, objects;
  var particleLight, pointLight;
  var dae, skin;
  var loader = new THREE.ColladaLoader();

  loadModel();

  function loadModel() {
    loader.options.convertUpAxis = true;
    loader.load( path, function ( collada ) {
      dae = collada.scene;
      skin = collada.skins[0];
      dae.scale.x = dae.scale.y = dae.scale.z = 0.3;
      dae.updateMatrix();
      init();
    });
  }

  function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, containerW / containerH, 1, 2000 );
    // Add the COLLADA
    scene.add( dae );
    // Lights
    particleLight = new THREE.Mesh( new THREE.SphereGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
    scene.add( new THREE.AmbientLight( 0xcccccc ) );
    var originVector = new THREE.Vector3(0,0,0);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, .5 );
    directionalLight.position.x =  -100;
    directionalLight.position.y =  500;
    directionalLight.position.z =  0;
    directionalLight.position.normalize();
    directionalLight.lookAt(originVector);
    scene.add( directionalLight );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( containerW, containerH );
    container.appendChild( renderer.domElement );
  }

  function renderModel() {
    var cameraRadius = 400;
    var rotateY, rotateX, curY;
    curY = map(cursorY, -300, 300, 0, 179);
    rotateX = cursorX;
    rotateY = -curY+100;
    camera.position.x = dae.position.x + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.cos(rotateX * Math.PI/180);
    camera.position.y = dae.position.z + cameraRadius * Math.cos(rotateY * Math.PI/180);
    camera.position.z = dae.position.y + cameraRadius * Math.sin(rotateY * Math.PI/180) * Math.sin(rotateX * Math.PI/180);
    dae.scale.x = dae.scale.y = dae.scale.z = -(cursorZ/500)+0.5;
    camera.lookAt( dae.position );
    renderer.render( scene, camera );
    //console.log('X = '+camera.position.x+' ; Y = '+camera.position.y+' Z = '+camera.position.z);
  }

}