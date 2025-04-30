const rows = 30;
const cols = 50;
let isRunning = false;
let intervalId;
let stepCount = 0;

const gridElement = document.getElementById("grid");
const synth = new Tone.PolySynth(Tone.Synth).toDestination();

const chordSets = [
  [
    ["C4", "E4", "G4"],
    ["G3", "B3", "D4"],
    ["A3", "C4", "E4"],
    ["F3", "A3", "C4"],
  ],
  [
    ["Em3", "G3", "B3"],
    ["C4", "E4", "G4"],
    ["G3", "B3", "D4"],
    ["D4", "F#4", "A4"],
  ],
  [
    ["Dm3", "F3", "A3"],
    ["Bb3", "D4", "F4"],
    ["F3", "A3", "C4"],
    ["C4", "E4", "G4"],
  ],
];

function playChordLikeNotes(activeRows) {
  const currentSet = chordSets[Math.floor(stepCount / 16) % chordSets.length];
  const chord = currentSet[stepCount % currentSet.length];
  const notes = activeRows
    .map((r) => chord[r % chord.length])
    .filter((v, i, a) => a.indexOf(v) === i);
  synth.triggerAttackRelease(notes, "8n");
}

function createGrid() {
  gridElement.innerHTML = "";
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    // ランダム初期化（30%）
    if (Math.random() < 0.3) {
      cell.classList.add("alive");
    }

    cell.addEventListener("click", () => cell.classList.toggle("alive"));
    gridElement.appendChild(cell);
  }
}

function getNextState(current) {
  const next = [...current];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      const alive = current[idx];
      let count = 0;

      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          if (y === 0 && x === 0) continue;
          const ni = i + y;
          const nj = j + x;
          if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
            const nIdx = ni * cols + nj;
            if (current[nIdx]) count++;
          }
        }
      }

      next[idx] =
        (alive && (count === 2 || count === 3)) || (!alive && count === 3);
    }
  }
  return next;
}


function step() {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const current = cells.map((cell) => cell.classList.contains("alive"));
  const next = getNextState(current);

  const newAliveRows = [];

  next.forEach((alive, i) => {
    const cell = cells[i];
    const wasAlive = cell.classList.contains("alive");
    const becameAlive = !wasAlive && alive;

    if (becameAlive) {
      const row = Math.floor(i / cols);
      newAliveRows.push(row);
    }

    cell.classList.toggle("alive", alive);
  });

  if (newAliveRows.length > 0) {
    playChordLikeNotes(newAliveRows);
  }

  stepCount++;
}

document.getElementById("startBtn").addEventListener("click", () => {
  if (!isRunning) {
    intervalId = setInterval(step, 800); // ⏱ テンポ調整
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
