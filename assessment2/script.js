const stageWidth = 716;
const stageHeight = 537;
let currentFormationName = "man to man (default)";
const arrows = [];
const ghosts = [];
const moveHistory = [];
let allowMovePlayer = true;
let allowMoveBall = true;
let allowScreen = false;
let allowDribble = false;

const stage = new Konva.Stage({
  container: "container",
  width: stageWidth,
  height: stageHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const playerNodes = [];
let ball;

const courtImage = new Image();
courtImage.src = "images/court.jpg";

const defaultPositions = [
  { x: 450, y: 380 }, // PG
  { x: 180, y: 350 }, // SG
  { x: 20, y: 50 }, // SF
  { x: 630, y: 50 }, // PF
  { x: 380, y: 130 }, // C
  { x: 400, y: 300 }, // PG (def)
  { x: 200, y: 250 }, // SG (def)
  { x: 100, y: 70 }, // SF (def)
  { x: 550, y: 70 }, // PF (def)
  { x: 320, y: 80 }, // C (def)
];

const playerImages = [
  "PG1.png",
  "SG1.png",
  "SF1.png",
  "PF1.png",
  "C1.png",
  "PG2.png",
  "SG2.png",
  "SF2.png",
  "PF2.png",
  "C2.png",
];

courtImage.onload = () => {
  const court = new Konva.Image({
    image: courtImage,
    x: 0,
    y: 0,
    width: stageWidth,
    height: stageHeight,
  });
  layer.add(court);
  loadPlayers();
  loadBall();
};

function loadPlayers() {
  const playerSize = 64;
  for (let i = 0; i < playerImages.length; i++) {
    const img = new Image();
    img.src = `images/${playerImages[i]}`;
    img.onload = () => {
      const player = new Konva.Image({
        image: img,
        x: defaultPositions[i].x,
        y: defaultPositions[i].y,
        width: playerSize,
        height: playerSize,
        draggable: true,
      });

      player.on("dragstart", () => {
        player.startPos = { x: player.x(), y: player.y() };

        const ghost = player.clone({
          draggable: false,
          opacity: 0.5,
          listening: false,
        });

        layer.add(ghost);
        ghosts.push(ghost);
        layer.moveToBottom(ghost);
        layer.draw();
      });

      player.on("dragend", () => {
        if (!allowMovePlayer && !allowScreen) return;

        const start = player.startPos;
        const end = { x: player.x(), y: player.y() };
        const color = i < 5 ? "red" : "blue";

        let visual;
        if (allowScreen) {
          visual = drawScreen(start, end, color);
        } else {
          visual = drawArrow(start, end, color, 32);
        }

        moveHistory.push({
          node: player,
          from: start,
          to: end,
          ghost: ghosts[ghosts.length - 1],
          arrow: visual,
        });
      });

      playerNodes[i] = player;
      layer.add(player);
      layer.draw();
    };
  }
}

const ballImg = new Image();
ballImg.src = "images/ball.png";
ballImg.onload = () => {
  ball = new Konva.Image({
    image: ballImg,
    x: 450,
    y: 350,
    width: 36,
    height: 36,
    draggable: true,
  });

  ball.on("dragstart", () => {
    ball.startPos = { x: ball.x(), y: ball.y() };

    const ghost = ball.clone({
      draggable: false,
      opacity: 0.5,
      listening: false,
    });

    layer.add(ghost);
    ghosts.push(ghost);
    layer.moveToBottom(ghost);
    layer.draw();
  });
  ball.on("dragend", () => {
    if (!allowMoveBall && !allowDribble) return;

    const start = ball.startPos;
    const end = { x: ball.x(), y: ball.y() };

    let visual;
    if (allowDribble) {
      visual = drawDribble(start, end, "black", 18);
    } else {
      visual = drawArrow(start, end, "black", 18);
    }

    moveHistory.push({
      node: ball,
      from: start,
      to: end,
      ghost: ghosts[ghosts.length - 1],
      arrow: visual,
    });
  });

  layer.add(ball);
  layer.draw();
};

function applyCombinedFormation() {
  const formation = document.getElementById("combinedFormation").value;
  currentFormationName = formation;

  // Reset the entire layout before applying new formation
  resetToCurrentFormation(); // Call the reset function

  const config = formations[formation];
  if (!config) return;

  // Apply the new formation positions
  for (let i = 0; i < 5; i++) {
    if (playerNodes[i]) playerNodes[i].position(config.A[i]);
    if (playerNodes[i + 5]) playerNodes[i + 5].position(config.B[i]);
  }

  if (ball && config.ball) {
    ball.position(config.ball);
  }

  layer.draw();
}

function resetToCurrentFormation() {
  // Clear ghosts
  ghosts.forEach((ghost) => ghost.destroy());
  ghosts.length = 0;

  // Clear move history
  moveHistory.length = 0;

  const config = formations[currentFormationName];
  if (!config) return;

  for (let i = 0; i < 5; i++) {
    if (playerNodes[i]) playerNodes[i].position(config.A[i]);
    if (playerNodes[i + 5]) playerNodes[i + 5].position(config.B[i]);
  }

  if (ball && config.ball) {
    ball.position(config.ball);
  }

  // Clear arrows
  arrows.forEach((arrow) => arrow.destroy());
  arrows.length = 0;

  layer.draw();
}

function drawArrow(from, to, color, radius = 32) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  const startX = from.x + radius * Math.cos(angle) + radius;
  const startY = from.y + radius * Math.sin(angle) + radius;
  const endX = to.x - radius * Math.cos(angle) + radius;
  const endY = to.y - radius * Math.sin(angle) + radius;

  const arrow = new Konva.Arrow({
    points: [startX, startY, endX, endY],
    pointerLength: 10,
    pointerWidth: 10,
    fill: color,
    stroke: color,
    strokeWidth: 3,
  });

  layer.add(arrow);
  arrows.push(arrow);
  layer.draw();
  return arrow;
}

function drawScreen(from, to, color, radius = 32) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  const startX = from.x + radius * Math.cos(angle) + radius;
  const startY = from.y + radius * Math.sin(angle) + radius;
  const endX = to.x - radius * Math.cos(angle) + radius;
  const endY = to.y - radius * Math.sin(angle) + radius;

  // Main line (same as move)
  const line = new Konva.Line({
    points: [startX, startY, endX, endY],
    stroke: color,
    strokeWidth: 3,
  });

  const capLength = 24;
  const capAngle = angle + Math.PI / 2; // Perpendicular to direction

  const capStartX = endX - (capLength / 2) * Math.cos(capAngle);
  const capStartY = endY - (capLength / 2) * Math.sin(capAngle);
  const capEndX = endX + (capLength / 2) * Math.cos(capAngle);
  const capEndY = endY + (capLength / 2) * Math.sin(capAngle);

  const cap = new Konva.Line({
    points: [capStartX, capStartY, capEndX, capEndY],
    stroke: color,
    strokeWidth: 3,
  });

  const group = new Konva.Group();
  group.add(line);
  group.add(cap);

  layer.add(group);
  arrows.push(group);
  layer.draw();
  return group;
}

function drawDribble(from, to, color = "black", radius = 18) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  const startX = from.x + radius * Math.cos(angle) + radius;
  const startY = from.y + radius * Math.sin(angle) + radius;
  const endX = to.x - radius * Math.cos(angle) + radius;
  const endY = to.y - radius * Math.sin(angle) + radius;

  // Main line (same as move)
  const line = new Konva.Line({
    points: [startX, startY, endX, endY],
    stroke: color,
    strokeWidth: 3,
  });

  const squareSize = 12;
  const square = new Konva.Rect({
    width: squareSize,
    height: squareSize,
    fill: color,
    offsetX: squareSize / 2,
    offsetY: squareSize / 2,
    x: endX,
    y: endY,
    rotation: (angle * 180) / Math.PI,
  });

  const group = new Konva.Group();
  group.add(line);
  group.add(square);

  layer.add(group);
  arrows.push(group);
  layer.draw();
  return group;
}

function undoLastAction() {
  const lastMove = moveHistory.pop();
  if (!lastMove) return;

  const { node, from, ghost, arrow } = lastMove;

  node.position(from);

  if (ghost) {
    const ghostIndex = ghosts.indexOf(ghost);
    if (ghostIndex > -1) ghosts.splice(ghostIndex, 1);
    ghost.destroy();
  }

  if (arrow) {
    const arrowIndex = arrows.indexOf(arrow);
    if (arrowIndex > -1) arrows.splice(arrowIndex, 1);
    arrow.destroy();
  }

  layer.draw();
}

function resetModes() {
  allowMovePlayer = false;
  allowMoveBall = false;
  allowScreen = false;
  allowDribble = false;
}

document.getElementById("movePlayerButton").addEventListener("click", () => {
  resetModes();
  allowMovePlayer = true;
  allowDribble = true;
  allowMoveBall = true;
});

document.getElementById("moveBallButton").addEventListener("click", () => {
  resetModes();
  allowMoveBall = true;
  allowMovePlayer = true;
  allowScreen = true;
});

document.getElementById("screenButton").addEventListener("click", () => {
  resetModes();
  allowDribble = true;
  allowScreen = true;
  allowMoveBall = true;
});

document.getElementById("dribbleButton").addEventListener("click", () => {
  resetModes();
  allowDribble = true;
  allowMovePlayer = true;
  allowScreen = true;
});
const formations = {
  "man to man (default)": {
    A: defaultPositions.slice(0, 5),
    B: defaultPositions.slice(5),
    ball: { x: 450, y: 350 },
  },
  "zone defense 2-3": {
    A: [
      { x: 450, y: 380 },
      { x: 180, y: 350 },
      { x: 20, y: 120 },
      { x: 630, y: 120 },
      { x: 300, y: 150 },
    ],
    B: [
      { x: 420, y: 280 },
      { x: 230, y: 280 },
      { x: 140, y: 90 },
      { x: 500, y: 90 },
      { x: 300, y: 90 },
    ],
    ball: { x: 450, y: 350 },
  },
  "zone defense 3-2": {
    A: [
      { x: 330, y: 380 },
      { x: 90, y: 230 },
      { x: 570, y: 230 },
      { x: 540, y: 100 },
      { x: 130, y: 100 },
    ],
    B: [
      { x: 330, y: 280 },
      { x: 180, y: 240 },
      { x: 470, y: 240 },
      { x: 430, y: 90 },
      { x: 220, y: 90 },
    ],
    ball: { x: 340, y: 350 },
  },
  "zone defense 1-3-1": {
    A: [
      { x: 330, y: 410 },
      { x: 90, y: 230 },
      { x: 570, y: 230 },
      { x: 480, y: 100 },
      { x: 170, y: 100 },
    ],
    B: [
      { x: 330, y: 290 },
      { x: 200, y: 190 },
      { x: 460, y: 190 },
      { x: 330, y: 170 },
      { x: 330, y: 60 },
    ],
    ball: { x: 340, y: 380 },
  },
  "zone defense 2-1-2": {
    A: [
      { x: 450, y: 380 },
      { x: 180, y: 380 },
      { x: 140, y: 110 },
      { x: 510, y: 110 },
      { x: 330, y: 110 },
    ],
    B: [
      { x: 420, y: 280 },
      { x: 230, y: 280 },
      { x: 220, y: 90 },
      { x: 430, y: 90 },
      { x: 330, y: 190 },
    ],
    ball: { x: 450, y: 350 },
  },
  "zone defense 1-2-2": {
    A: [
      { x: 330, y: 410 },
      { x: 510, y: 230 },
      { x: 140, y: 230 },
      { x: 510, y: 110 },
      { x: 140, y: 110 },
    ],
    B: [
      { x: 330, y: 290 },
      { x: 430, y: 210 },
      { x: 220, y: 210 },
      { x: 430, y: 90 },
      { x: 220, y: 90 },
    ],
    ball: { x: 340, y: 380 },
  },
};
