const stageWidth = 716;
const stageHeight = 537;

const stage = new Konva.Stage({
  container: "container",
  width: stageWidth,
  height: stageHeight,
});

const layer = new Konva.Layer();
stage.add(layer);

const courtImage = new Image();
courtImage.src = "images/court.jpg";

courtImage.onload = () => {
  const court = new Konva.Image({
    image: courtImage,
    x: 0,
    y: 0,
    width: 716,
    height: 537,
  });
  layer.add(court);
  loadPlayers();
};

const playerImages = [
  "PG1.png", // Point Guard
  "SG1.png", // Shooting Guard
  "SF1.png", // Small Forward
  "PF1.png", // Power Forward
  "C1.png", // Center
  "PG2.png", // Defensive PG
  "SG2.png", // Defensive SG
  "SF2.png", // Defensive SF
  "PF2.png", // Defensive PF
  "C2.png", // Defensive C
];

// Positions for each player (you can adjust these)
const positions = [
  { x: 450, y: 380 }, // PG
  { x: 180, y: 350 }, // SG
  { x: 20, y: 50 }, // SF
  { x: 630, y: 50 }, // PF
  { x: 400, y: 150 }, // C
  { x: 400, y: 300 }, // PG (def)
  { x: 200, y: 250 }, // SG (def)
  { x: 120, y: 100 }, // SF (def)
  { x: 520, y: 100 }, // PF (def)
  { x: 320, y: 80 }, // C (def)
];

function loadPlayers() {
  const playerSize = 64;
  for (let i = 0; i < playerImages.length; i++) {
    const img = new Image();
    img.src = `images/${playerImages[i]}`;
    img.onload = () => {
      const player = new Konva.Image({
        image: img,
        x: positions[i].x,
        y: positions[i].y,
        width: playerSize,
        height: playerSize,
        draggable: true,
      });
      layer.add(player);
      layer.draw();
    };
  }
}

const ballImg = new Image();
ballImg.src = "images/ball.png";

ballImg.onload = () => {
  const ball = new Konva.Image({
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
