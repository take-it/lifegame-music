const rows = 30;
const cols = 50;
let isRunning = false;
let intervalId;
const gridElement = document.getElementById("grid");

function createGrid() {
  gridElement.innerHTML = "";
  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    // ランダムに初期化（30%の確率で alive）
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
          const ni = i + y,
                nj = j + x;
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
  const current = cells.map(cell => cell.classList.contains("alive"));
  const next = getNextState(current);

  next.forEach((alive, i) => {
    cells[i].classList.toggle("alive", alive);
  });
}

document.getElementById("startBtn").addEventListener("click", () => {
  if (!isRunning) {
    intervalId = setInterval(step, 200);
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
  createGrid();
});

createGrid();
function playNote(row) {
  const notes = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
  ];
  const synth = new Tone.Synth().toDestination();
  const note = notes[row % notes.length];
  synth.triggerAttackRelease(note, "8n");
}
function step() {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const current = cells.map((cell) => cell.classList.contains("alive"));
  const next = getNextState(current);

  next.forEach((alive, i) => {
    const cell = cells[i];
    const wasAlive = cell.classList.contains("alive");
    const becameAlive = !wasAlive && alive;

    // 行番号を計算
    const row = Math.floor(i / cols);

    // 新たに生きたセルが出たら音を鳴らす
    if (becameAlive) {
      playNote(row);
    }

    cell.classList.toggle("alive", alive);
  });
}
document.getElementById("soundBtn").addEventListener("click", async () => {
  await Tone.start();
  alert("音が有効になりました！");
});
const synth = new Tone.Synth().toDestination();

function playNote(row) {
  const notes = [
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
    "D5",
    "E5",
    "F5",
    "G5",
    "A5",
    "B5",
    "C6",
  ];
  const note = notes[row % notes.length];
  synth.triggerAttackRelease(note, "8n");
}
