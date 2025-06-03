// Global variables for the sketch
let capture; // Stores the video capture object
let prevFrame; // Stores the previous frame for motion comparison
let eyeballs; // Image for the eyeballs
let eyes; // Image for the static eye frame
let eyesback; // Image for the background of the eyes

// Configuration variables
let stepSize = 8; // How many pixels to skip when checking for motion (smaller = more precise, more computation)
let smoothX = 0; // Smoothed X position for the eyeballs
let smoothY = 0; // Smoothed Y position for the eyeballs
let smoothing = 0.05; // Amount of smoothing applied to the eyeball movement (0-1, higher = smoother, less jitter)
let calmDownSmoothing = 0.01; // Slower smoothing for returning to center when no motion
let calmDownThreshold = 60; // Number of frames after which calm down logic activates (e.g., 60 frames = 1 second at 60fps)

// Variables for scanning behavior
let scanAmplitude = 15; // Maximum distance the eyes will scan from the center
let scanSpeed = 0.005; // Speed of the scanning motion (smaller = slower)

// Image scale factors - these will be calculated dynamically in setup and windowResized
let eyeballsScale;
let eyesScale;
let eyesbackScale;

let motionDetected = false; // Flag to indicate if motion is currently detected
let noMotionTimer = 0; // Timer to track how long no significant motion has been detected
let maxRadius = 70; // Maximum movement radius for the eyeballs from the center

// Blob detection specific variables
let motionGrid; // 2D array to mark detected motion points for blob analysis
let gridWidth; // Width of the motion grid
let gridHeight; // Height of the motion grid

/**
 * Preloads all necessary image assets before the sketch starts.
 * This ensures images are available when `setup()` and `draw()` are called.
 */
function preload() {
  eyeballs = loadImage('eyeballs.png');
  eyes = loadImage('eyes.png');
  eyesback = loadImage('eyesback.png');
}

/**
 * Sets up the canvas and initializes video capture.
 * This function runs once when the sketch starts.
 */
function setup() {
  // Create a canvas that fills the entire browser window
  createCanvas(windowWidth, windowHeight);

  // Initialize video capture from the default camera
  capture = createCapture(VIDEO);
  // Set the resolution of the video capture to match the canvas size
  capture.size(width, height);
  // Hide the default video element, as we'll draw it ourselves
  capture.hide();

  // Create an empty image to store the previous frame's pixels
  prevFrame = createImage(capture.width, capture.height);

  // Initialize smoothed positions to the center of the canvas
  smoothX = width / 2;
  smoothY = height / 2;
  // Set image drawing mode to center, so images are drawn from their center point
  imageMode(CENTER);

  // Initialize motion grid dimensions based on capture size and stepSize
  gridWidth = floor(capture.width / stepSize);
  gridHeight = floor(capture.height / stepSize);
  motionGrid = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));

  // Calculate initial scales for the images to cover the entire canvas
  // We use max() to ensure the image is large enough to cover the canvas,
  // potentially cropping if aspect ratios don't match.
  eyeballsScale = max(width / eyeballs.width, height / eyeballs.height);
  eyesScale = max(width / eyes.width, height / eyes.height);
  eyesbackScale = max(width / eyesback.width, height / eyesback.height);
}

/**
 * The main drawing loop of the sketch.
 * This function runs repeatedly, typically 60 times per second.
 */
function draw() {
  // Set the background to white
  background(255);

  // Load pixels from the current video frame and the previous frame
  capture.loadPixels();
  prevFrame.loadPixels();

  // Reset motion grid for the current frame
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      motionGrid[y][x] = 0;
    }
  }

  let totalMotionPoints = 0; // Keep track of total motion points for overall sensitivity

  // Step 1: Detect motion and populate the motionGrid
  for (let y = 0; y < capture.height; y += stepSize) {
    for (let x = 0; x < capture.width; x += stepSize) {
      let index = (x + y * capture.width) * 4; // * 4 for RGBA

      let r1 = capture.pixels[index];
      let g1 = capture.pixels[index + 1];
      let b1 = capture.pixels[index + 2];

      let r2 = prevFrame.pixels[index];
      let g2 = prevFrame.pixels[index + 1];
      let b2 = prevFrame.pixels[index + 2];

      // Increased threshold for motion detection to reduce noise
      let d = dist(r1, g1, b1, r2, g2, b2);

      if (d > 45) { // If difference is above threshold, mark as motion
        let gridX = floor(x / stepSize);
        let gridY = floor(y / stepSize);
        if (gridX < gridWidth && gridY < gridHeight) {
          motionGrid[gridY][gridX] = 1; // Mark as motion
          totalMotionPoints++;
        }
      }
    }
  }

  let blobs = []; // Array to store detected blobs
  let visited = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(false)); // To keep track of visited grid cells

  // Step 2: Find blobs using a flood-fill like approach (BFS)
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (motionGrid[y][x] === 1 && !visited[y][x]) {
        // Found an unvisited motion point, start a new blob search
        let currentBlob = {
          xSum: 0,
          ySum: 0,
          count: 0
        };
        let queue = [{
          x: x,
          y: y
        }];
        visited[y][x] = true;

        while (queue.length > 0) {
          let point = queue.shift(); // Get the next point from the queue

          // Convert grid coordinates back to pixel coordinates for sum
          currentBlob.xSum += (point.x * stepSize) + (stepSize / 2);
          currentBlob.ySum += (point.y * stepSize) + (stepSize / 2);
          currentBlob.count++;

          // Check neighbors (8 directions)
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              let nx = point.x + dx;
              let ny = point.y + dy;

              // Ensure neighbor is within bounds and is a motion point and not visited
              if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight &&
                motionGrid[ny][nx] === 1 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push({
                  x: nx,
                  y: ny
                });
              }
            }
          }
        }
        // If a blob was found, add it to the list
        if (currentBlob.count > 0) {
          blobs.push(currentBlob);
        }
      }
    }
  }

  let targetX = width / 2; // Default target is center
  let targetY = height / 2; // Default target is center

  // Step 3: Select the largest blob as the target
  if (blobs.length > 0) {
    // Sort blobs by size (count of motion points) in descending order
    blobs.sort((a, b) => b.count - a.count);
    let largestBlob = blobs[0];

    // Calculate the centroid of the largest blob
    targetX = largestBlob.xSum / largestBlob.count;
    targetY = largestBlob.ySum / largestBlob.count;

    // Reflect the X motion to match the projection
    targetX = width - targetX;

    // Apply radius constraint
    let distance = dist(targetX, targetY, width / 2, height / 2);
    if (distance > maxRadius) {
      let angle = atan2(targetY - height / 2, targetX - width / 2);
      targetX = width / 2 + cos(angle) * maxRadius;
      targetY = height / 2 + sin(angle) * maxRadius;
    }

    // Check if the largest blob is significant enough to be considered motion
    if (largestBlob.count * stepSize * stepSize > 1000) { // Blob area approximation
      smoothX = smoothX + (targetX - smoothX) * smoothing;
      smoothY = smoothY + (targetY - smoothY) * smoothing;
      motionDetected = true;
      noMotionTimer = 0;
    } else {
      motionDetected = false;
      noMotionTimer++;
    }
  } else {
    // No significant blobs detected
    motionDetected = false;
    noMotionTimer++;
  }

  // Calm down logic: if no motion for a while, slowly scan the space
  if (!motionDetected && noMotionTimer > calmDownThreshold) {
    let targetScanX = width / 2 + sin(frameCount * scanSpeed) * scanAmplitude;
    let targetScanY = height / 2 + cos(frameCount * scanSpeed * 0.7) * scanAmplitude;
    smoothX = smoothX + (targetScanX - smoothX) * calmDownSmoothing;
    smoothY = smoothY + (targetScanY - smoothY) * calmDownSmoothing;
  } else if (motionDetected && noMotionTimer === 0) {
    // If motion was just detected, ensure we don't jump directly but smooth towards the target
    // This is already handled by the smoothing above, but this branch ensures no conflicting calm-down
    // logic is applied immediately after motion detection.
  }

  // Display the images
  image(eyesback, width / 2, height / 2, eyesback.width * eyesbackScale, eyesback.height * eyesbackScale);
  image(eyeballs, smoothX, smoothY, eyeballs.width * eyeballsScale, eyeballs.height * eyeballsScale);
  image(eyes, width / 2, height / 2, eyes.width * eyesScale, eyes.height * eyesScale);

  // Copy the current frame to prevFrame for the next iteration's motion comparison
  prevFrame.copy(capture, 0, 0, capture.width, capture.height, 0, 0, capture.width, capture.height);
}

/**
 * This function is called automatically whenever the browser window is resized.
 * It ensures the canvas and video capture adjust to the new window dimensions.
 */
function windowResized() {
  // Resize the canvas to the new window dimensions
  resizeCanvas(windowWidth, windowHeight);
  // Resize the video capture to match the new canvas dimensions
  capture.size(width, height);

  // Recalculate scales for the images to cover the entire canvas on resize
  eyeballsScale = max(width / eyeballs.width, height / eyeballs.height);
  eyesScale = max(width / eyes.width, height / eyes.height);
  eyesbackScale = max(width / eyesback.width, height / eyesback.height);

  // Re-initialize motion grid dimensions based on new capture size and stepSize
  gridWidth = floor(capture.width / stepSize);
  gridHeight = floor(capture.height / stepSize);
  motionGrid = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));

  // Reset smoothed positions to the center of the new canvas size
  smoothX = width / 2;
  smoothY = height / 2;
}
