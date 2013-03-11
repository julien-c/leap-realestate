// Global vars 
var controller = new Leap.Controller({enableGestures:true});
var app = document.getElementById('app');
var wrapper = document.getElementById('wrapper');
var grid = document.getElementById('grid');
var tiles = document.getElementsByClassName('tile');
var productDetails = document.getElementsByClassName('product-detail');
var appW = app.offsetWidth;
var appH = app.offsetHeight;
var gridW = grid.offsetWidth;
var rows = Math.sqrt(tiles.length);
var tileW = gridW/rows;
var cursorActive = false;
var fingerPos = {};
var gestures = {};
var startDir = {};
var gridX = 0;
var gridY = 0;
var moving = false;
var maxSwipe = (rows-1)/2;
var curTile = (maxSwipe)+'-'+(maxSwipe);
var detailView = false;
var fullScreenMode = false;
var inversedScroll = false;
var productDetail = null;
var iframe = null;

document.getElementById('overlay').addEventListener('click', function() {
  var el = document.documentElement,
      rfs = el.webkitRequestFullScreen;
      rfs.call(el);
});

function setupTiles() {
  var col = -1;
  var row = 0;
  for(var i=0; i<tiles.length; i++) {
    col++
    if (col >= rows) {
      row++;
      col = 0;
    }
    tiles[i].id = col+'-'+row;
    //tiles[i].style.backgroundColor='#'+Math.floor(Math.random()*16777215).toString(16);
  }
}

function logGesture(direction) {
  // var gestureLog = document.getElementById('gesture-log');
  // gestureLog.innerHTML = direction;
  // gestureLog.classList.add('active');
  // setTimeout(function() {
  //   gestureLog.innerHTML = '';
  //   gestureLog.classList.remove('active');
  // },1000);
}

function highlightTile() {
  document.getElementById(curTile).classList.add('activeTile');
}

function moveSection(speed,gridX,gridY) {
  moving = true;
  document.getElementById(curTile).classList.remove('activeTile');
  grid.style.webkitTransition = '-webkit-transform '+1100/speed+'s ease';
  grid.style.webkitTransform = 'translateX('+gridX+'px) translateY('+gridY+'px)';
  grid.addEventListener('webkitTransitionEnd', function(event) { 
    event.stopPropagation();
    moving = false;
    highlightTile();
  }, false );
}

controller.loop(function(frame) {
  // Pointables
  if (detailView) {
    for(var i = 0; i < 1; i++) {
      var finger = frame.pointables[i];
      if (typeof(finger) != 'undefined') {
        fingerPos.x = finger.tipPosition[0];
        fingerPos.y = finger.tipPosition[1];
        fingerPos.z = finger.tipPosition[2];
      }
    }
  }
  // Gestures
  if (typeof(frame.gestures) != 'undefined') {
    for (var gestureId = 0, gestureCount = frame.gestures.length; gestureId != gestureCount; gestureId++) {
      var gesture = frame.gestures[gestureId];
      var type = gesture.type;
      var state = gesture.state;
      var speed = gesture.speed;
      // Swipe
      if (typeof(gesture.direction) != 'undefined') {
        if (type === 'swipe') {
          if (!detailView && state === 'start') {
            startDir.x = gesture.direction[0];
            startDir.y = gesture.direction[1];
            var dir = {};
            dir.x = startDir.x;
            dir.y = startDir.y;
            if (startDir.x < 0) { startDir.x = startDir.x*-1 }
            if (startDir.y < 0) { startDir.y = startDir.y*-1 }
            if (!inversedScroll) {
              if (startDir.x > startDir.y && dir.x > 0) {
                // swipe right
                logGesture('→');
                if (gridX/tileW > -maxSwipe) { 
                  gridX -= tileW;
                  moveSection(speed,gridX,gridY);
                }
              } else if (startDir.x > startDir.y && dir.x < 0) {
                // swipe left
                logGesture('←');
                if (gridX/tileW < maxSwipe ) { 
                  gridX += tileW; 
                  moveSection(speed,gridX,gridY);
                }
              } else if (startDir.y > startDir.x && dir.y < 0) {
                // swipe down
                logGesture('↓');
                if (gridY/tileW > -maxSwipe) { 
                  gridY -= tileW;
                  moveSection(speed,gridX,gridY);
                }
              } else if (startDir.y > startDir.x && dir.y > 0) {
                // swipe up
                logGesture('↑');
                if (gridY/tileW < maxSwipe) { 
                  gridY += tileW;
                  moveSection(speed,gridX,gridY);
                }
              }
            } else {
              if (startDir.x > startDir.y && dir.x > 0) {
                // swipe right
                logGesture('→');
                if (gridX/tileW < maxSwipe ) { 
                  gridX += tileW; 
                  moveSection(speed,gridX,gridY);
                }
              } else if (startDir.x > startDir.y && dir.x < 0) {
                // swipe left
                logGesture('←');
                if (gridX/tileW > -maxSwipe) { 
                  gridX -= tileW;
                  moveSection(speed,gridX,gridY);
                }
              } else if (startDir.y > startDir.x && dir.y < 0) {
                // swipe down
                logGesture('↓');
                if (gridY/tileW < maxSwipe) { 
                  gridY += tileW;
                  moveSection(speed,gridX,gridY);
                }
              } else if (startDir.y > startDir.x && dir.y > 0) {
                // swipe up
                logGesture('↑');
                if (gridY/tileW > -maxSwipe) { 
                  gridY -= tileW;
                  moveSection(speed,gridX,gridY);
                }
              }
            }
            curTile = (-(gridX/tileW)+maxSwipe)+'-'+(-(gridY/tileW)+maxSwipe);
          }
          if (detailView && state === 'start') {
            startDir.x = gesture.direction[0];
            startDir.y = gesture.direction[1];
            var dir = {};
            dir.x = startDir.x;
            dir.y = startDir.y;
            if (startDir.y < 0) { startDir.y = startDir.y*-1 }
            if (startDir.y > startDir.x && dir.y > 0) {
              // swipe up
              if (!fullScreenMode) {
                var iframe = productDetail.getElementsByTagName('iframe');
                for(var i=0; i<iframe.length; i++) {
                  iframe[i].src = '';
                }
                var selectedTile = document.getElementById(curTile);
                setTimeout(function() { 
                  selectedTile.classList.remove('selectedTile');
                  selectedTile.classList.add('closedTile');
                  productDetail.classList.remove('detailActive');
                }, 800 );
                setTimeout(function() { 
                  selectedTile.classList.remove('closedTile');
                  detailView = false;
                }, 1800 );
              }
              if (fullScreenMode) {
                fullScreenMode = false;
                app.classList.remove('full-screen');
                var iframe = productDetail.getElementsByTagName('iframe');
                for(var i=0; i<iframe.length; i++) {
                  iframe[i].contentWindow.location.reload();
                }
              }
            }
            // if (startDir.y > startDir.x && dir.y < 0 && !fullScreenMode) {
            //   // swipe down
            //   fullScreenMode = true;
            //   app.classList.add('full-screen');
            //   var iframe = productDetail.getElementsByTagName('iframe');
            //   for(var i=0; i<iframe.length; i++) {
            //     iframe[i].contentWindow.location.reload();
            //   }
            // }
          }
        }
      }
      // Tap
      if (type === 'screenTap') {
        if (!detailView && !moving && state === 'stop') {
          detailView = true;
          var selectedTile = document.getElementById(curTile);
          var selectedProduct = selectedTile.getAttribute('data-product');
          selectedTile.classList.add('selectedTile');
          setTimeout(function() { 
            productDetail = document.getElementById(selectedProduct);
            productDetail.classList.add('detailActive');
            var iframe = productDetail.getElementsByTagName('iframe');
            for(var i=0; i<iframe.length; i++) {
              iframe[i].src = selectedProduct+'.html';
            }
          }, 1000 );
        }
      }
    }
  }
});

setupTiles();
highlightTile();