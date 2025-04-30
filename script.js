// ✅ Tone.js を使用した Code Organism 3.1：色彩×音楽×進化×共感覚 × 群れメロディー対応（鑑賞モードなし・4色制）
// <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js"></script> をHTMLに追加

const rows = 30;
const cols = 50;
let isRunning = false;
let intervalId;
let stepCount = 0;

const gridElement = document.getElementById("grid");
const bpmBase = 80;
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

const modeScales = {
  ionian: ["C4", "D4", "E4", "F4", "G4", "A4", "B4"],
  dorian: ["C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"],
  phrygian: ["C4", "Db4", "Eb4", "F4", "G4", "Ab4", "Bb4"],
  lydian: ["C4", "D4", "E4", "F#4", "G4", "A4", "B4"],
  mixolyd: ["C4", "D4", "E4", "F4", "G4", "A4", "Bb4"],
  aeolian: ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4"],
  locrian: ["C4", "Db4", "Eb4", "F4", "Gb4", "Ab4", "Bb4"],
};
let currentScale = modeScales.ionian;

const baseColors = ["red", "blue", "green", "yellow"];

function createGrid() {
  gridElement.innerHTML = "";
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.dataset.age = 0;
    cell.dataset.clan = Math.floor(Math.random() * 4); // 4色対応
    if (Math.random() < 0.3) {
      cell.classList.add("alive");
      cell.dataset.age = 1;
    }
    cell.addEventListener("click", () => {
      cell.classList.toggle("alive");
      cell.dataset.age = cell.classList.contains("alive") ? 1 : 0;
    });
    gridElement.appendChild(cell);
  }
}

function getNextState(cells) {
  const current = cells.map((cell) => cell.classList.contains("alive"));
  const next = [...current];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      const alive = current[idx];
      let count = 0;
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          if (y === 0 && x === 0) continue;
          const ni = i + y,
            nj = j + x;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
            if (current[ni * cols + nj]) count++;
          }
        }
      }
      next[idx] =
        (alive && (count === 2 || count === 3)) || (!alive && count === 3);
    }
  }
  return next;
}

function getModeFromDistribution(current) {
  const band = Array(rows).fill(0);
  for (let i = 0; i < rows; i++) {
    const line = current.slice(i * cols, (i + 1) * cols);
    band[i] = line.filter((v) => v).length;
  }
  const avg = band.reduce((a, b) => a + b, 0) / rows;
  if (band[0] > avg * 1.5) return "lydian";
  if (band[rows - 1] > avg * 1.5) return "phrygian";
  if (band[Math.floor(rows / 2)] > avg * 1.5) return "dorian";
  return stepCount % 2 === 0 ? "ionian" : "aeolian";
}

function clanColor(clan, age) {
  const base = baseColors[clan % baseColors.length];
  const lightness = Math.min(90, 40 + age * 5);
  const saturation = Math.max(30, 100 - age * 5);
  return `color-mix(in srgb, ${base} ${saturation}%, white)`;
}

function updateCellColor(cell, age, clan) {
  cell.style.backgroundColor = clanColor(clan, age);
}

function playClanMelody(aliveCells) {
  const melodies = {};
  for (const cell of aliveCells) {
    const clan = cell.dataset.clan;
    const row = Math.floor(cell.dataset.index / cols);
    const note = currentScale[row % currentScale.length];
    if (!melodies[clan]) melodies[clan] = [];
    melodies[clan].push(note);
  }
  for (const clan in melodies) {
    const notes = [...new Set(melodies[clan])].slice(0, 5);
    const maxAge = Math.max(
      ...aliveCells
        .filter((c) => c.dataset.clan === clan)
        .map((c) => parseInt(c.dataset.age))
    );
    const duration = maxAge >= 6 ? "2n" : maxAge >= 3 ? "4n" : "8n";
    synth.triggerAttackRelease(notes, duration);
  }
}

function updateBPM(cells) {
  const aliveCount = cells.filter((c) => c.classList.contains("alive")).length;
  const ratio = aliveCount / cells.length;
  return Math.max(40, Math.min(180, bpmBase + Math.floor((ratio - 0.5) * 100)));
}

function step() {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const current = cells.map((cell) => cell.classList.contains("alive"));
  const next = getNextState(cells);

  const justBorn = [];
  next.forEach((alive, i) => {
    const cell = cells[i];
    const wasAlive = cell.classList.contains("alive");
    const age = parseInt(cell.dataset.age || "0");
    const clan = cell.dataset.clan;
    if (alive) {
      const newAge = wasAlive ? age + 1 : 1;
      cell.classList.add("alive");
      cell.dataset.age = newAge;
      updateCellColor(cell, newAge, clan);
      if (!wasAlive) justBorn.push(cell);
    } else {
      cell.classList.remove("alive");
      cell.style.backgroundColor = "white";
      cell.dataset.age = 0;
    }
  });

  currentScale = modeScales[getModeFromDistribution(current)];
  if (justBorn.length > 0) playClanMelody(justBorn);
  stepCount++;

  const bpm = updateBPM(cells);
  clearInterval(intervalId);
  intervalId = setInterval(step, Math.round(60000 / bpm));
}

document.getElementById("startBtn").addEventListener("click", () => {
  if (!isRunning) {
    intervalId = setInterval(step, 800);
    isRunning = true;
  }
});

document.getElementById("stopBtn").addEventListener("click", () => {
  clearInterval(intervalId);
  isRunning = false;
});

document.getElementById("resetBtn").addEventListener("click", () => {
  clearInterval(intervalId);
  isRunning = false;
  stepCount = 0;
  createGrid();
});

document.getElementById("soundBtn").addEventListener("click", async () => {
  await Tone.start();
  alert("音が有効になりました！");
});

createGrid();
