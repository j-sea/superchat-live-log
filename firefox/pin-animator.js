// © Copyright 2022-Present by Jonathan Chan. All rights reserved.

function createPinAnimator(canvas, canvasContainer) {
  const tunnelWidth = 0.2;
  const animationTime = 400;
  const pinHeights = {
    'donation': 0.9,
    'member': 0.9,
    'red': 0.8,
    'magenta': 0.7,
    'orange': 0.6,
    'yellow': 0.5,
    'green': 0.4,
    'lightblue': 0.3,
    'darkblue': 0.2,
  };
  const pinColorCodes = {
    'invisible': {
      'r': 128,
      'g': 128,
      'b': 128,
      'a': 1,
    },
    'expired': {
      'r': 128,
      'g': 128,
      'b': 128,
      'a': 1,
    },
    'donation': {
      'r': 96,
      'g': 96,
      'b': 96,
      'a': 1,
    },
    'member': {
      'r': 10,
      'g': 128,
      'b': 67,
      'a': 1,
    },
    'red': {
      'r': 208,
      'g': 0,
      'b': 0,
      'a': 1,
    },
    'magenta': {
      'r': 194,
      'g': 24,
      'b': 91,
      'a': 1,
    },
    'orange': {
      'r': 230,
      'g': 81,
      'b': 0,
      'a': 1,
    },
    'yellow': {
      'r': 255,
      'g': 179,
      'b': 0,
      'a': 1,
    },
    'green': {
      'r': 0,
      'g': 191,
      'b': 165,
      'a': 1,
    },
    'lightblue': {
      'r': 0,
      'g': 184,
      'b': 212,
      'a': 1,
    },
    'darkblue': {
      'r': 21,
      'g': 101,
      'b': 192,
      'a': 1,
    },
  };
  const pins = [];
  const expirationCallbacks = new Set();
  const hoverCallbacks = new Set();
  const leaveCallbacks = new Set();
  const clickCallbacks = new Set();

  let currentPinIndex = 0;
  let lastAnimationX = -1;
  let targetXPos = 0;
  let lastLeftTunnelWidth = 0;
  let lastRightTunnelWidth = 0;
  let lastColorR = 128;
  let lastColorG = 128;
  let lastColorB = 128;
  let lastColorA = 1;
  let previousTimeStamp;
  // let timeElapsed = 0;
  let poppedPins = 0;
  let paused = false;
  let hoveringPin = -1;
  let previouslyHoveringPin = -1;

  let canvasRect = null;
  let localMouseX = -1;
  let localMouseY = -1;
  let highlightedPinIndex = -1;

  // const canvas = document.getElementById('canvas');
  // canvas.height = window.innerHeight * 0.3;
  // canvas.width = window.innerWidth * 0.3;
  canvas.height = canvasContainer.clientHeight;
  canvas.width = canvasContainer.clientWidth;
  setTimeout(updateCanvasRect, 0);
  canvas.style.position = 'absolute';
  canvas.addEventListener('mousemove', function(event){
    if (canvasRect !== null) {
      localMouseX = event.clientX - canvasRect.left - 1;
      localMouseY = event.clientY - canvasRect.top;
    }
  });
  canvas.addEventListener('mouseleave', function(event){
    if (canvasRect !== null) {
      localMouseX = localMouseY = -1;
    }
  });
  canvas.addEventListener('click', function(event){
    if (canvasRect !== null) {
      if (hoveringPin !== -1) {
        clickCallbacks.forEach(function(callback){
          callback(hoveringPin);
        });
      }
    }
  });

  const triangleIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  triangleIcon.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  triangleIcon.setAttribute('xmls:svg', "http://www.w3.org/2000/svg");
  triangleIcon.setAttribute('viewBox', '0 0 531.74 460.5');
  triangleIcon.setAttribute('style', 'position:absolute;line-height:0.001px;margin:0;padding:0;vertical-align:middle;width:2.75%;fill:transparent;');
  const trianglePolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  trianglePolygon.setAttribute('points', '0.866,1 265.87,460 530.874,1');
  triangleIcon.append(trianglePolygon);
  canvasContainer.prepend(triangleIcon);

  const context = canvas.getContext('2d');

  function step(timestamp) {
    if (typeof previousTimeStamp === 'undefined') {
      previousTimeStamp = timestamp;
    }

    if (previousTimeStamp !== timestamp) {
      redraw(timestamp - previousTimeStamp);
    }

    previousTimeStamp = timestamp
    window.requestAnimationFrame(step);
  }

  function redraw(dt) {
    if (paused) {
      dt = 0;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    triangleIcon.style.marginLeft = `${canvas.width * 0.5 - triangleIcon.clientWidth * 0.5}px`;
    triangleIcon.style.marginTop = '-0.5px';
    context.lineWidth = canvas.width * 0.007;
    context.lineCap = 'round';
    // timeElapsed = Math.min(animationTime, timeElapsed + dt);

    if (pins.length !== 0) {
      // let animationX = startXPos + (targetXPos - startXPos) * (timeElapsed / animationTime); // linear
      if (currentPinIndex < poppedPins) {
        currentPinIndex = poppedPins;
        targetXPos = context.lineWidth * 2.25 * currentPinIndex;
      }
      let animationX = lerp(lastAnimationX, targetXPos, 0.2);
      if (poppedPins !== 0
          && animationX === lastAnimationX) {
        pins.splice(0, poppedPins);
        currentPinIndex = Math.max(currentPinIndex - poppedPins, 0);
        poppedPins = 0;
        animationX = targetXPos = context.lineWidth * 2.25 * currentPinIndex;
        // timeElapsed = 0;
      }
      lastAnimationX = animationX;
      const colorR = lerp(lastColorR, pinColorCodes[pins[currentPinIndex].color].r, 0.2);
      lastColorR = colorR;
      const colorG = lerp(lastColorG, pinColorCodes[pins[currentPinIndex].color].g, 0.2);
      lastColorG = colorG;
      const colorB = lerp(lastColorB, pinColorCodes[pins[currentPinIndex].color].b, 0.2);
      lastColorB = colorB;
      const colorA = lerp(lastColorA, pinColorCodes[pins[currentPinIndex].color].a, 0.2);
      lastColorA = colorA;
      triangleIcon.style.fill = `rgba(${colorR}, ${colorG}, ${colorB}, ${colorA})`;

      hoveringPin = -1;
      for (let i = 0, iEnd = pins.length; i < iEnd; i++) {
        const pin = pins[i];
        if (pin.color !== 'invisible') {
          const maxProcessTime = pin.destructionSeconds * 1000;
          if (pin.processedTime < maxProcessTime) {
            pin.processedTime = Math.min(pin.processedTime + dt, maxProcessTime);

            if (pin.processedTime === maxProcessTime) {
              pin.color = 'expired';
              expirationCallbacks.forEach(function(callback){
                callback(i - poppedPins);
              });
            }
          }
          if ((currentPinIndex < 32 || i >= currentPinIndex - 32)
              && (iEnd - 1 - currentPinIndex < 32 || i < currentPinIndex + 32 + 1))
          {
            const xPos = canvas.width * 0.5 + context.lineWidth * 2.25 * i - animationX;
            const yPos = 1 - Math.min(1, pin.processedTime / maxProcessTime);
            if (i === highlightedPinIndex) {
              context.lineWidth = canvas.width * 0.014;
              context.strokeStyle = `rgba(128, 128, 128, 0.8)`;
              context.beginPath();
              context.moveTo(xPos, 0);
              context.lineTo(xPos, canvas.height);
              context.stroke();
            }
            if (localMouseX !== -1 && Math.abs(xPos - localMouseX - context.lineWidth * 0.5) < canvas.width / 64 / 2.25) {
              context.lineWidth = canvas.width * 0.014;
              context.strokeStyle = `rgba(128, 128, 128, 0.8)`;
              context.beginPath();
              context.moveTo(xPos, canvas.height - (canvas.height * yPos));
              context.lineTo(xPos, canvas.height);
              context.stroke();
              hoveringPin = i;
            }
            context.lineWidth = canvas.width * 0.007;
            context.strokeStyle = `rgba(${pinColorCodes[pin.color].r}, ${pinColorCodes[pin.color].g}, ${pinColorCodes[pin.color].b}, ${pinColorCodes[pin.color].a})`;
            context.beginPath();
            context.moveTo(xPos, canvas.height - (canvas.height * yPos));
            context.lineTo(xPos, canvas.height);
            context.stroke();
          }
        }
      }

      if (hoveringPin !== -1) {
        canvasContainer.style.cursor = 'pointer';
        if (previouslyHoveringPin !== hoveringPin) {
          if (previouslyHoveringPin !== -1) {
            leaveCallbacks.forEach(function(callback){
              callback(previouslyHoveringPin);
            });
          }
          hoverCallbacks.forEach(function(callback){
            callback(hoveringPin);
          });
          previouslyHoveringPin = hoveringPin;
        }
      }
      else {
        canvasContainer.style.cursor = 'default';
        if (previouslyHoveringPin !== -1) {
          leaveCallbacks.forEach(function(callback){
            callback(previouslyHoveringPin);
          });
          previouslyHoveringPin = -1;
        }
      }

      let leftTunnelWidth = 0;
      if (currentPinIndex >= 32) {
        leftTunnelWidth = lerp(lastLeftTunnelWidth, tunnelWidth, 0.05);
      }
      else {
        leftTunnelWidth = lerp(lastLeftTunnelWidth, 0, 0.2);
      }
      lastLeftTunnelWidth = leftTunnelWidth;
      const leftGradient = context.createLinearGradient(0, 0, canvas.width, 0);
      leftGradient.addColorStop(0, "rgba(128, 128, 128, 0.7)");
      leftGradient.addColorStop(leftTunnelWidth, "rgba(128, 128, 128, 0)");
      context.fillStyle = leftGradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      let rightTunnelWidth = 0;
      if (pins.length - 1 - currentPinIndex >= 32) {
        rightTunnelWidth = lerp(lastRightTunnelWidth, tunnelWidth, 0.05);
      }
      else {
        rightTunnelWidth = lerp(lastRightTunnelWidth, 0, 0.2);
      }
      lastRightTunnelWidth = rightTunnelWidth;
      const rightGradient = context.createLinearGradient(0, 0, canvas.width, 0);
      rightGradient.addColorStop(1 - rightTunnelWidth, "rgba(128, 128, 128, 0)");
      rightGradient.addColorStop(1, "rgba(128, 128, 128, 0.7)");
      context.fillStyle = rightGradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function createPin(color, spawnTimestamp, destructionSeconds, processedTime = 0) {
    return {
      color,
      spawnTimestamp,
      destructionSeconds,
      processedTime,
    };
  }

  function lerp(start, end, percentage){
    return (1 - percentage) * start + percentage * end
  }

  function updateCanvasRect() {
    canvasRect = canvas.getBoundingClientRect();
  }

  return {
    initialize: function() {
      window.requestAnimationFrame(step);
      window.addEventListener('resize', function(){
        canvas.height = canvasContainer.clientHeight;
        canvas.width = canvasContainer.clientWidth;
        setTimeout(updateCanvasRect, 0);
        redraw(0);
        targetXPos = context.lineWidth * 2.25 * currentPinIndex;
      });
    },
    pushPin: function(color, spawnTimestamp, destructionSeconds, processedTime = 0) {
      pins.push(createPin(color, spawnTimestamp, destructionSeconds, processedTime));
    },
    popPins: function(amount) {
      for (let i = poppedPins, iSize = poppedPins + amount; i < iSize; i++) {
        const pin = pins[i];
        pin.color = 'invisible';
      }
      poppedPins += amount;
    },
    addPinExpirationListener: function(callback){
      expirationCallbacks.add(callback);
    },
    removePinExpirationListener: function(callback){
      expirationCallbacks.delete(callback);
    },
    clearPinExpirationListeners: function(){
      expirationCallbacks.clear();
    },
    addPinHoverListener: function(callback){
      hoverCallbacks.add(callback);
    },
    removePinHoverListener: function(callback){
      hoverCallbacks.delete(callback);
    },
    clearPinHoverListeners: function(){
      hoverCallbacks.clear();
    },
    addPinClickListener: function(callback){
      clickCallbacks.add(callback);
    },
    removePinClickListener: function(callback){
      clickCallbacks.delete(callback);
    },
    clearPinClickListeners: function(){
      clickCallbacks.clear();
    },
    addPinLeaveListener: function(callback){
      leaveCallbacks.add(callback);
    },
    removePinLeaveListener: function(callback){
      leaveCallbacks.delete(callback);
    },
    clearPinLeaveListeners: function(){
      leaveCallbacks.clear();
    },
    highlightIndex: function(pinIndex){
      highlightedPinIndex = pinIndex;
    },
    clearHighlight: function(){
      highlightedPinIndex = -1;
    },
    getHighlightedIndex: function(){
      return highlightedPinIndex;
    },
    movePointerBackward: function(){
      if (lastAnimationX === -1 && currentPinIndex >= 0) {
        lastAnimationX = context.lineWidth * 2.25 * currentPinIndex;
      }
      currentPinIndex = Math.max(0, currentPinIndex - 1);
      targetXPos = context.lineWidth * 2.25 * currentPinIndex;
      // timeElapsed = 0;
    },
    setCurrentIndex: function(newIndex) {
      if (lastAnimationX === -1 && currentPinIndex >= 0) {
        lastAnimationX = context.lineWidth * 2.25 * currentPinIndex;
      }
      currentPinIndex = Math.max(0, newIndex);
      targetXPos = context.lineWidth * 2.25 * currentPinIndex;
      // timeElapsed = 0;
    },
    movePointerForward: function(){
      if (lastAnimationX === -1 && currentPinIndex >= 0) {
        lastAnimationX = context.lineWidth * 2.25 * currentPinIndex;
      }
      currentPinIndex = Math.max(0, Math.min(pins.length - 1, currentPinIndex + 1));
      targetXPos = context.lineWidth * 2.25 * currentPinIndex;
      // timeElapsed = 0;
    },
    pause: function(){
      paused = true;
    },
    unpause: function(){
      paused = false;
    },
  };
}

// export default createPinAnimator;

// const pinAnimator = createPinAnimator(
//   document.getElementById('canvas'),
//   document.getElementById('canvas-container'),
// );
// pinAnimator.initialize();
// pinAnimator.pushPin('member', Date.now(), 60);
// pinAnimator.pushPin('red', Date.now(), 50);
// pinAnimator.pushPin('magenta', Date.now(), 40);
// pinAnimator.pushPin('orange', Date.now(), 30);
// pinAnimator.pushPin('yellow', Date.now(), 20);
// pinAnimator.pushPin('green', Date.now(), 15);
// pinAnimator.pushPin('lightblue', Date.now(), 10);
// pinAnimator.pushPin('darkblue', Date.now(), 5);