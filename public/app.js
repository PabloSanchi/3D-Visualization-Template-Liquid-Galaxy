/* VARIABLE DEFINITION */
var socket = io({ reconnect: false });
let nScreens, screen, done = false;

let fullWidth = 1, fullHeight = 1;
let startX = 0, startY = 0;
let camera;

const views = [];
let scene, renderer;
let mouseX = 0, mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

/* END VARIABLE DEFINITION */

/**
 * @description update: on first connection, retrieve data, screen number
 *  and send essential data (to the server) like the size (screen id, screen width, screen height)
 */
socket.on("update", (screenData) => {
  if (done) return;
  document.title = screenData.id;
  screen = screenData.id;

  done = true;

  console.log("screen data: " + screenData.id);
  console.log("screen number: " + screen);

  socket.emit("windowSize", {
    id: screen,
    width: window.innerWidth,
    height: window.innerHeight,
  });
});

/**
 * @description Start visulization when the server gives the signal to do so
 *     - Retrieve: - super-resuloution (the total width of the screens)
 *                  - Calculate the portion to the screen
 *
 * @param {Object} superRes, contains {width, height, child(Object)}
 *        child (Object): {1: width, 2: width, 3: width, ..., n: width}
 */
socket.on("start", (superRes) => {
  console.log("screen" + screen + " ready");

  // super resolution width and height
  fullWidth = superRes.width;
  fullHeight = window.innerHeight;

  // calculate each screen startX
  let scRes = superRes.child;

  let keys = Object.keys(scRes);
  let arr = keys.map(Number).filter((e) => e % 2 != 0);

  startX = 0;

  if (screen % 2 != 0) {
    if (Math.max(...arr) == screen) {
      startX = 0;
    } else {
      for (let index = Math.max(...arr); index > screen; index -= 2) {
        startX += scRes[index];
      }
    }
  } else {
    for (let index = Math.max(...arr); index >= 1; index -= 2) {
      startX += scRes[index];
    }
    for (let index = 2; index < screen; index += 2) {
      startX += scRes[index];
    }
  }

  console.log("superRes: (" + fullWidth + "," + fullHeight + ")");
  console.log("StartX: " + startX + " StartY: " + startY);

  // start animation
  init();
  animate();
});

// *******************************************************************
// *******************************************************************
// *******************************************************************
// Till this point treat your code just like you are using one screen,
// forget about the cluster it is already treated
// *******************************************************************
// *******************************************************************
// *******************************************************************

/**
 * @description View - set the camera offset according to the screen dimensions and position (...5,3,1,2,4...)
 * This work for every 3d visualization in the liquid galaxy cluster (general purpose)
 * @param {Canvas} canvas
 * @param {Number} fullWidth
 * @param {Number} fullHeight
 * @param {Number} viewX
 * @param {Number} viewY
 * @param {Number} viewWidth
 * @param {Number} viewHeight
 */
function View( canvas, fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight ) {
  canvas.width = viewWidth * window.devicePixelRatio;
  canvas.height = viewHeight * window.devicePixelRatio;

  const context = canvas.getContext("2d");

  // set perspective camera (you can also check the ortographic camera)
  camera = new THREE.PerspectiveCamera(20, viewWidth / viewHeight, 1, 10000);

  // set camera offset
  camera.setViewOffset(fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight);

  // camera default position
  camera.position.z = 1000; // default camera z index pos

  this.render = function () {
    
    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
		camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

    renderer.setViewport(0, fullHeight - viewHeight, viewWidth, viewHeight);
    renderer.render(scene, camera);

    context.drawImage(renderer.domElement, 0, 0);
  };
}

/**
 * @description init -> initialize the scene and renderer
 */
function init() {

  // Do not modify the following two lines of code
  const canvas1 = document.getElementById("canvas1");
  views.push(new View(canvas1, fullWidth, fullHeight, startX, 0, canvas1.clientWidth, canvas1.clientHeight));
  
  // ********************************************************************************
  // ******************* EXAMPLE CODE -- REPLACE THE FOLLOWING WITH YOUR 3D MODELS...
  // ********************************************************************************
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );

  const light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 0, 1 ).normalize();
  scene.add( light );

  const noof_balls = 51;


  const radius = 200;

  const geometry1 = new THREE.IcosahedronGeometry( radius, 1 );

  const count = geometry1.attributes.position.count;
  geometry1.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( count * 3 ), 3 ) );

  const color = new THREE.Color();
  const positions = geometry1.attributes.position;
  const colors = geometry1.attributes.color;

  for ( let i = 0; i < count; i ++ ) {
    color.setHSL( ( positions.getY( i ) / radius + 1 ) / 2, 1.0, 0.5 );
    colors.setXYZ( i, color.r, color.g, color.b );
  }

  const material = new THREE.MeshPhongMaterial( {
    color: 0xffffff,
    flatShading: true,
    vertexColors: true,
    shininess: 0
  } );

  const wireframeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } );

  for ( let i = 0; i < noof_balls; i ++ ) { // create balls

    const mesh = new THREE.Mesh( geometry1, material );
    const wireframe = new THREE.Mesh( geometry1, wireframeMaterial );
    mesh.add( wireframe );

    mesh.position.x = - ( noof_balls - 1 ) / 2 * 400 + i * 400;
    mesh.rotation.x = i * 0.5;
    scene.add( mesh );

  }

  // ***********************************************************
  // ******************* END OF EXAMPLE CODE *******************
  // ***********************************************************

  // do not modify the following 3 lines of code
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(fullWidth, fullHeight);

  // Mouse event (OPTIONAL)
  if(screen == 1) document.addEventListener( 'mousemove', onDocumentMouseMove );
}

socket.on('updateMouseSlaves', (coords) => {
  if(screen == 1) return;

  mouseX = coords.x; 
  mouseY = coords.y;
});

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

  if(screen == 1) { // if master...
    socket.emit('updateMousePos', {
      x: mouseX,
      y: mouseY
    });
  }
}


function animate() {
  views[0].render();
  requestAnimationFrame(animate);
}