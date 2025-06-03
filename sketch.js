let infoImage; // The base info image (INFO1.png)
let infoImageHover; // The hover info image (INFO2.png)
let addImage; // The base add image (add.png)
let addImageHover; // The hover add image (add-eyes.png)
let googlyEyeball; // The moving googly eyeball image
let googlyEye; // The static googly eye image
let maggieButton; // The Maggie button image
let OJButton; // The OJ button image
let trumpButton; // The Trump button image


let numImages = 250; // Number of googly eye pairs
let maxDistance = 20; // Maximum movement distance for the eyeball
let imageScale = 0.3; // Smaller scale for the googly eyes
let maggieScale = 0.19; // Scale for the Maggie image
let OJScale = 0.19; // Scale for the OJ image
let trumpScale = 0.19; // Scale for the Trump button
let infoImageScale = 0.2; // Scale for the info image (adjust as needed)
let addImageScale = 0.2; // NEW: Scale for the add image (adjust as needed)
let infoHoverScaleFactor = 3; // NEW: Factor to make info2.png bigger when hovered (e.g., 1.2 for 20% bigger)
let addHoverScaleFactor = 3; // NEW: Factor to make add-eyes.png bigger when hovered


// Define spacing between buttons
let buttonSpacing = 200; // Adjust this value to increase or decrease spacing

let eyes = []; // Array to store the data for each eye pair
let isMouseOverOJ = false;
let isMouseOverTrump = false;
let isMouseOverMaggie = false;
let isMouseOverInfo = false; // State to track if mouse is over infoImage
let isMouseOverAdd = false; // NEW: State to track if mouse is over addImage
let scaleFactor = 0.1; // The amount the image should scale when hovered

// Global variables for info image static position
let infoX, infoY;
// NEW: Global variables for add image static position
let addX, addY;

function preload() {
  // Load all necessary images
  infoImage = loadImage('INFO1.png');
  infoImageHover = loadImage('info2.png'); // Load the hover image
  addImage = loadImage('add.png'); // NEW: Load the base add image
  addImageHover = loadImage('add-eyes.png'); // NEW: Load the hover add image
  googlyEyeball = loadImage('googly-eyeball.png');
  googlyEye = loadImage('googly-eye.png');
  maggieButton = loadImage('maggie-button2.png'); // Load Maggie button image
  OJButton = loadImage('OJ-button2.png'); // Load OJ button image
  trumpButton = loadImage('trump-button2.png'); // Load Trump button image
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER); // All images will be drawn with their center at the given coordinates
  background(255); // Set initial background to white

  // Initialize positions for all googly eyes
  for (let i = 0; i < numImages; i++) {
    let x = random(width);
    let y = random(height);
    eyes.push({
      staticX: x,
      staticY: y,
      moveX: 0,
      moveY: 0
    });
  }

  // Set static position for infoImage (INFO1.png)
  // Its center will be at (350, 550)
  infoX = 350;
  infoY = 550;

  // NEW: Set static position for addImage (add.png)
  // You can adjust these coordinates as needed
  addX = 1300; // Example position, adjust as desired
  addY = 300; // Example position, adjust as desired

  // Change cursor to a pointer when it's over interactive elements
  cursor(HAND);
}

function draw() {
  background(255); // Clear the background each frame

  // Draw all the googly eyes
  for (let i = 0; i < eyes.length; i++) {
    let eye = eyes[i];
    // Draw the static outer part of the googly eye
    image(googlyEye, eye.staticX, eye.staticY, googlyEye.width * imageScale, googlyEye.height * imageScale);

    // Calculate distance and direction from mouse to the eye
    let dx = mouseX - eye.staticX;
    let dy = mouseY - eye.staticY;
    let distance = sqrt(dx * dx + dy * dy); // Euclidean distance

    let moveX = dx;
    let moveY = dy;

    // Limit the eyeball movement to maxDistance
    if (distance > maxDistance) {
      let angle = atan2(dy, dx); // Angle from eye to mouse
      moveX = cos(angle) * maxDistance; // Constrain X movement
      moveY = sin(angle) * maxDistance; // Constrain Y movement
    }
    eye.moveX = moveX;
    eye.moveY = moveY;

    // Draw the moving eyeball part
    image(googlyEyeball, eye.staticX + eye.moveX, eye.staticY + eye.moveY, googlyEyeball.width * imageScale, googlyEyeball.height * imageScale);
  }

  // --- Button Drawing and Hover Logic ---

  // Calculate properties (position and size) for Maggie button
  let maggieWidth = maggieButton.width * maggieScale;
  let maggieHeight = maggieButton.height * maggieScale;
  let maggieX = width / 2;
  let maggieY = height / 2 + buttonSpacing;

  let maggieLeft = maggieX - maggieWidth / 2;
  let maggieRight = maggieX + maggieWidth / 2;
  let maggieTop = maggieY - maggieHeight / 2;
  let maggieBottom = maggieY + maggieHeight / 2;

  // Calculate properties for OJ button
  let ojButtonWidth = OJButton.width * OJScale;
  let ojButtonHeight = OJButton.height * OJScale;
  let ojButtonX = width / 2;
  let ojButtonY = height / 2; // OJ button remains centered vertically

  let ojButtonLeft = ojButtonX - ojButtonWidth / 2;
  let ojButtonRight = ojButtonX + ojButtonWidth / 2;
  let ojButtonTop = ojButtonY - ojButtonHeight / 2;
  let ojButtonBottom = ojButtonY + ojButtonHeight / 2;

  // Calculate properties for Trump button
  let trumpWidth = trumpButton.width * trumpScale;
  let trumpHeight = trumpButton.height * trumpScale;
  let trumpX = width / 2;
  let trumpY = height / 2 - buttonSpacing;

  let trumpLeft = trumpX - trumpWidth / 2;
  let trumpRight = trumpX + trumpWidth / 2;
  let trumpTop = trumpY - trumpHeight / 2;
  let trumpBottom = trumpY + trumpHeight / 2;

  // Reset all button hover states
  isMouseOverOJ = false;
  isMouseOverTrump = false;
  isMouseOverMaggie = false;

  // Check for mouse hover over each button
  if (mouseX > ojButtonLeft && mouseX < ojButtonRight && mouseY > ojButtonTop && mouseY < ojButtonBottom) {
    isMouseOverOJ = true;
  }
  if (mouseX > trumpLeft && mouseX < trumpRight && mouseY > trumpTop && mouseY < trumpBottom) {
    isMouseOverTrump = true;
  }
  if (mouseX > maggieLeft && mouseX < maggieRight && mouseY > maggieTop && mouseY < maggieBottom) {
    isMouseOverMaggie = true;
  }

  // Determine current scale for buttons based on hover state
  let currentMaggieScale = maggieScale;
  let currentOJScale = OJScale;
  let currentTrumpScale = trumpScale;

  if (isMouseOverMaggie) {
    currentMaggieScale += scaleFactor;
  }
  if (isMouseOverOJ) {
    currentOJScale += scaleFactor;
  }
  if (isMouseOverTrump) {
    currentTrumpScale += scaleFactor;
  }

  // Draw buttons with their determined scales
  image(maggieButton, maggieX, maggieY, maggieButton.width * currentMaggieScale, maggieButton.height * currentMaggieScale);
  image(OJButton, ojButtonX, ojButtonY, OJButton.width * currentOJScale, OJButton.height * currentOJScale);
  image(trumpButton, trumpX, trumpY, trumpButton.width * currentTrumpScale, trumpButton.height * currentTrumpScale);

  // Check for click on Trump button
  if (mouseIsPressed && mouseX > trumpLeft && mouseX < trumpRight && mouseY > trumpTop && mouseY < trumpBottom) {
    // Open link in a new tab
    window.open('https://editor.p5js.org/katzu/full/OpuITk5qy');
  }

  // Add click detection for OJ button
  if (mouseIsPressed && mouseX > ojButtonLeft && mouseX < ojButtonRight && mouseY > ojButtonTop && mouseY < ojButtonBottom) {
    // Open link in a new tab
    window.open('https://editor.p5js.org/katzu/full/Kde_Jdh67', '_blank');
  }

  // --- Click detection for Maggie button ---
  if (mouseIsPressed && mouseX > maggieLeft && mouseX < maggieRight && mouseY > maggieTop && mouseY < maggieBottom) {
    // Open the p5.js editor full-screen link in a new tab
    window.open('https://editor.p5js.org/katzu/full/TNDR3arfe', '_blank');
  }


  // --- INFO IMAGE HOVER LOGIC ---
  // Calculate the actual dimensions and position of infoImage (INFO1.png)
  let infoWidth = infoImage.width * infoImageScale;
  let infoHeight = infoImage.height * infoImageScale;
  let infoLeft = infoX - infoWidth / 2;
  let infoRight = infoX + infoWidth / 2;
  let infoTop = infoY - infoHeight / 2;
  let infoBottom = infoY + infoHeight / 2;

  // Reset info hover state
  isMouseOverInfo = false;

  // Check if mouse is over infoImage (INFO1.png)
  if (mouseX > infoLeft && mouseX < infoRight && mouseY > infoTop && mouseY < infoBottom) {
    isMouseOverInfo = true;
  }

  // Draw infoImage (INFO1.png)
  image(infoImage, infoX, infoY, infoWidth, infoHeight);

  // Draw infoImageHover (INFO2.png) ONLY if mouse is over infoImage
  if (isMouseOverInfo) {
    // Apply the new scale factor to make info2.png bigger
    let hoveredInfoWidth = infoWidth * infoHoverScaleFactor;
    let hoveredInfoHeight = infoHeight * infoHoverScaleFactor;
    image(infoImageHover, infoX, infoY, hoveredInfoWidth, hoveredInfoHeight);
  }

  // --- NEW: ADD IMAGE HOVER LOGIC (mirroring info image logic) ---
  // Calculate the actual dimensions and position of addImage (add.png)
  let addWidth = addImage.width * addImageScale;
  let addHeight = addImage.height * addImageScale;
  let addLeft = addX - addWidth / 2;
  let addRight = addX + addWidth / 2;
  let addTop = addY - addHeight / 2;
  let addBottom = addY + addHeight / 2;

  // Reset add hover state
  isMouseOverAdd = false;

  // Check if mouse is over addImage (add.png)
  if (mouseX > addLeft && mouseX < addRight && mouseY > addTop && mouseY < addBottom) {
    isMouseOverAdd = true;
  }

  // Draw addImage (add.png)
  image(addImage, addX, addY, addWidth, addHeight);

  // Draw addImageHover (add-eyes.png) ONLY if mouse is over addImage
  if (isMouseOverAdd) {
    // Apply the new scale factor to make add-eyes.png bigger
    let hoveredAddWidth = addWidth * addHoverScaleFactor;
    let hoveredAddHeight = addHeight * addHoverScaleFactor;
    image(addImageHover, addX, addY, hoveredAddWidth, hoveredAddHeight);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // The info image and add image positions (infoX, infoY, addX, addY) are static.
  // If you wanted them to be responsive (e.g., always in a certain corner),
  // you would adjust their X and Y based on width/height here.
}