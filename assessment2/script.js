const stageWidth = 716;
const stageHeight = 537;

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

// Default positions (starting positions of the players)
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
  layer.add(ball);
  layer.draw();
};

// Formation switcher
function applyCombinedFormation() {
  const formation = document.getElementById("combinedFormation").value;

  const formations = {
    "man to man (default)": {
      A: defaultPositions.slice(0, 5),
      B: defaultPositions.slice(5),
      ball: { x: 450, y: 350 },
    },
    "zone defense 2-3": {
      A: [
        { x: 450, y: 380 }, //PG
        { x: 180, y: 350 }, //SG
        { x: 20, y: 120 }, //SF
        { x: 630, y: 120 }, //PF
        { x: 300, y: 150 }, //C
      ],
      B: [
        { x: 420, y: 280 }, //PG(def)
        { x: 230, y: 280 }, //SG(def)
        { x: 140, y: 90 }, //SF(def)
        { x: 500, y: 90 }, //PF(def)
        { x: 300, y: 90 }, //C(def)
      ],
      ball: { x: 450, y: 350 },
    },
    "zone defense 3-2": {
      A: [
        { x: 330, y: 380 }, //PG
        { x: 90, y: 230 }, //SG
        { x: 570, y: 230 }, //SF
        { x: 540, y: 100 }, //PF
        { x: 130, y: 100 }, //C
      ],
      B: [
        { x: 330, y: 280 }, //PG(def)
        { x: 180, y: 240 }, //SG(def)
        { x: 470, y: 240 }, //SF(def)
        { x: 430, y: 90 }, //PF(def)
        { x: 220, y: 90 }, //C(def)
      ],
      ball: { x: 340, y: 350 },
    },
    "zone defense 1-3-1": {
      A: [
        { x: 330, y: 410 }, //PG
        { x: 90, y: 230 }, //SG
        { x: 570, y: 230 }, //SF
        { x: 480, y: 100 }, //PF
        { x: 170, y: 100 }, //C
      ],
      B: [
        { x: 330, y: 290 }, //PG(def)
        { x: 200, y: 190 }, //SG(def)
        { x: 460, y: 190 }, //SF(def)
        { x: 330, y: 170 }, //PF(def)
        { x: 330, y: 60 }, //C(def)
      ],
      ball: { x: 340, y: 380 },
    },
    "zone defense 2-1-2": {
      A: [
        { x: 450, y: 380 }, //PG
        { x: 180, y: 380 }, //SG
        { x: 140, y: 110 }, //SF
        { x: 510, y: 110 }, //PF
        { x: 330, y: 110 }, //C
      ],
      B: [
        { x: 420, y: 280 }, //PG(def)
        { x: 230, y: 280 }, //SG(def)
        { x: 220, y: 90 }, //SF(def)
        { x: 430, y: 90 }, //PF(def)
        { x: 330, y: 190 }, //C(def)
      ],
      ball: { x: 450, y: 350 },
    },
    "zone defense 1-2-2": {
      A: [
        { x: 330, y: 410 }, //PG
        { x: 510, y: 230 }, //SG
        { x: 140, y: 230 }, //SF
        { x: 510, y: 110 }, //PF
        { x: 140, y: 110 }, //C
      ],
      B: [
        { x: 330, y: 290 }, //PG(def)
        { x: 430, y: 210 }, //SG(def)
        { x: 220, y: 210 }, //SF(def)
        { x: 430, y: 90 }, //PF(def)
        { x: 220, y: 90 }, //C(def)
      ],
      ball: { x: 340, y: 380 },
    },
  };

  const config = formations[formation];
  if (!config) return;

  // Move players
  for (let i = 0; i < 5; i++) {
    if (playerNodes[i]) playerNodes[i].position(config.A[i]);
    if (playerNodes[i + 5]) playerNodes[i + 5].position(config.B[i]);
  }

  // Move the ball
  if (ball && config.ball) {
    ball.position(config.ball);
  }

  layer.draw();
}
