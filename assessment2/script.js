const stageWidth = 716;
const stageHeight = 537;
let currentFormationName = "man to man (default)";
const arrows = [];
const ghosts = [];
const moveHistory = [];
let currentActionMode = "move";

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
        const start = player.startPos;
        const end = { x: player.x(), y: player.y() };
        const color = i < 5 ? "red" : "blue";

        if (currentActionMode === "dribble") {
          const ballPos = ball.position();
          let closestIndex = -1;
          let minDist = Infinity;

          for (let j = 0; j < 5; j++) {
            const redPlayer = playerNodes[j];
            const dx = redPlayer.x() - ballPos.x;
            const dy = redPlayer.y() - ballPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              closestIndex = j;
            }
          }

          if (i !== closestIndex) {
            player.position(start); // Reset position if not closest
            layer.draw();
            return; // Skip the rest
          }

          // Calculate offset and move ball along with player
          const offsetX = end.x - start.x;
          const offsetY = end.y - start.y;
          const oldBallPos = { x: ball.x(), y: ball.y() };
          ball.position({ x: ball.x() + offsetX, y: ball.y() + offsetY });

          // Draw zigzag arrow (dribble)
          const arrow = drawZigzagArrow(start, end, color);

          // Add ghosts for both player and ball
          const playerGhost = player.clone({
            draggable: false,
            opacity: 0.5,
            listening: false,
          });
          const ballGhost = ball.clone({
            draggable: false,
            opacity: 0.5,
            listening: false,
          });

          layer.add(playerGhost);
          layer.add(ballGhost);
          ghosts.push(playerGhost);
          ghosts.push(ballGhost);
          layer.moveToBottom(playerGhost);
          layer.moveToBottom(ballGhost);

          // Save move history for undo
          moveHistory.push({
            node: player,
            from: start,
            to: end,
            ghost: playerGhost,
            arrow: arrow,
          });

          moveHistory.push({
            node: ball,
            from: oldBallPos,
            to: ball.position(),
            ghost: ballGhost,
            arrow: null,
          });

          layer.draw();
        } else {
          // Normal move and screen modes
          let visual;
          if (currentActionMode === "screen") {
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

          layer.draw();
        }
      });

      player.startPos = { x: player.x(), y: player.y() };

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
    const start = ball.startPos;
    const end = { x: ball.x(), y: ball.y() };
    const arrow = drawArrow(start, end, "black", 18);
    moveHistory.push({
      node: ball,
      from: start,
      to: end,
      ghost: ghosts[ghosts.length - 1],
      arrow: arrow,
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

function drawZigzagArrow(from, to, color, segmentLength = 20, amplitude = 10) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const radius = 32;
  const startX = from.x + radius * Math.cos(angle) + radius;
  const startY = from.y + radius * Math.sin(angle) + radius;
  const endX = to.x - radius * Math.cos(angle) + radius;
  const endY = to.y - radius * Math.sin(angle) + radius;

  const dx2 = endX - startX;
  const dy2 = endY - startY;
  const totalLength = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const numSegments = Math.floor(totalLength / segmentLength);
  const points = [];

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const x = startX + t * dx2;
    const y = startY + t * dy2;
    const offset = (i % 2 === 0 ? -1 : 1) * amplitude;
    const perpX = x + offset * Math.cos(angle + Math.PI / 2);
    const perpY = y + offset * Math.sin(angle + Math.PI / 2);
    points.push(perpX, perpY);
  }

  const line = new Konva.Line({
    points: points,
    stroke: color,
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round",
  });

  layer.add(line);
  arrows.push(line);
  layer.draw();
  return line;
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

document.getElementById("moveButton").addEventListener("click", () => {
  currentActionMode = "move";
});

document.getElementById("screenButton").addEventListener("click", () => {
  currentActionMode = "screen";
});

document.getElementById("dribbleButton").addEventListener("click", () => {
  currentActionMode = "dribble";
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
