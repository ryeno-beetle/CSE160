// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // get buttons, attatch button listeners
  const button = document.getElementById("draw_button");
  button.addEventListener("click", handleDrawEvent);
  const op_button = document.getElementById("operation_draw_button");
  op_button.addEventListener("click", handleDrawOperationEvent);

  // make canvas black
  clearCanvas();

  // initial vector
  let v = new Vector3([1, 1, 0]);
  drawVector(v, "red");
}

// get angle between v1 and v2 (degrees)
function angleBetween(v1, v2) {
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();
  let dot = Vector3.dot(v1, v2);
  let angle = Math.acos(dot/(m1*m2));
  // convert to degrees
  angle *= (180/Math.PI);
  return angle;
}

// get area of triangle formed by v1 and v2
function area(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  let area = cross.magnitude() / 2;
  return area;
}

// called on operation draw button click
function handleDrawOperationEvent() {
  // clear canvas and draw v1 and v2
  let [v1, v2] = handleDrawEvent();

  // get value of dropdown
  let operation = document.getElementById("operation_selector").value;

  if (operation === "add") {
    let v3 = v1.add(v2);
    drawVector(v3, "green");
    return;
  } else if (operation === "sub") {
    let v3 = v1.sub(v2);
    drawVector(v3, "green");
    return;
  } else if (operation === "norm") {
    let v3 = v1.normalize();
    let v4 = v2.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
    return;
  } else if (operation === "angle") {
    console.log("angle: " + angleBetween(v1, v2));
    return;
  } else if (operation === "area") {
    console.log("area of triangle: " + area(v1, v2));
    return;
  }
  // get scalar value for mul/div operations
  let scalar = document.getElementById("scalar_input").value;
  if (operation === "mul") {
    let v3 = v1.mul(scalar);
    let v4 = v2.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
    return;
  } else if (operation === "div") {
    let v3 = v1.div(scalar);
    let v4 = v2.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
    return;
  }
}

// called on draw button click
function handleDrawEvent() {
  // get values from text fields, check if they're valid numbers
  let v1x = document.getElementById("v1x").value;
  let v1y = document.getElementById("v1y").value;
  let v2x = document.getElementById("v2x").value;
  let v2y = document.getElementById("v2y").value;
  if (isNaN(v1x) || isNaN(v1y) || isNaN(v2x) || isNaN(v2y)) {
    console.log('invalid input');
    return;
  }

  // draw black rect over canvas to clear
  clearCanvas();

  // create new vectors and draw them
  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");

  // return v1 and v2 for use in handleDrawOperationEvent
  return [v1, v2];
}

// helper function, fills canvas with black rectangle
function clearCanvas() {
  const canvas = document.getElementById("example");
  const ctx = canvas.getContext("2d");
  if (ctx == null) {
    console.log('could not get context');
    return;
  }
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.height);
  ctx.closePath();
}

// draw vector in the passed in color
function drawVector(v, color) {
  const scale = 20;
  const canvas = document.getElementById("example");
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, canvas.height/2);
  // draw vector: translate by canvas center, and invert y
  ctx.lineTo(canvas.width/2 + scale * v.elements[0], canvas.height/2 - scale * v.elements[1]);
  ctx.strokeStyle = color;
  ctx.stroke();
}
