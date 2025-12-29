let score = 0;
let GameOn = false;
let paused = false;
let spawnInterval = null;
const activeNotes = [];
const HIT_ZONE = 150;

window.onload = () => {
  const letters = {
    W: document.querySelector(".LetterW"),
    A: document.querySelector(".LetterA"),
    S: document.querySelector(".LetterS"),
    D: document.querySelector(".LetterD"),
  };

  const notes = {
    W: document.querySelector(".W"),
    A: document.querySelector(".A"),
    S: document.querySelector(".S"),
    D: document.querySelector(".D"),
  };

  const audio = document.querySelector(".Sounds");
  const Score = document.querySelector(".Average");
  audio.volume = 0.1;

  function updateScore() {
    Score.value = `Score: ${score}`;
  }

  // Fixed showText to handle Hit/Miss correctly
  function showText(key, type) {
    const l = letters[key];
    l.textContent = type; // display "Hit" or "Miss"
    l.classList.add(type); // add class for color
    setTimeout(() => {
      l.classList.remove(type); // remove class after 300ms
      l.textContent = key; // reset to original letter
    }, 300);
  }

  function spawnRandomNote() {
    if (paused) return;

    const keys = ["W", "A", "S", "D"];
    const key = keys[Math.floor(Math.random() * keys.length)];

    // Only spawn if lane is empty
    if (!activeNotes.some((n) => n.key === key)) {
      const noteObj = { key, speed: 3 };
      notes[key].style.top = "-50px";
      notes[key].style.display = "flex";
      activeNotes.push(noteObj);
    }
  }

  function miss(noteObj) {
    score = Math.max(0, score - 50);
    updateScore();
    showText(noteObj.key, "Miss");

    notes[noteObj.key].style.display = "none";
    const idx = activeNotes.indexOf(noteObj);
    if (idx !== -1) activeNotes.splice(idx, 1);
  }

  function hit(noteObj) {
    score += 100;
    updateScore();
    showText(noteObj.key, "Hit");

    notes[noteObj.key].style.display = "none";
    const idx = activeNotes.indexOf(noteObj);
    if (idx !== -1) activeNotes.splice(idx, 1);
  }

  function animate() {
    if (!paused) {
      activeNotes.forEach((noteObj) => {
        const note = notes[noteObj.key];
        let currentTop = parseFloat(note.style.top) || 0;
        currentTop += noteObj.speed;
        note.style.top = currentTop + "px";

        if (note.getBoundingClientRect().top > window.innerHeight)
          miss(noteObj);
      });
    }
    requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !GameOn) {
      GameOn = true;
      audio.currentTime = 0;
      audio.play();
      spawnInterval = setInterval(spawnRandomNote, 700);
      return;
    }

    if (e.code === "Escape" && GameOn) {
      paused = !paused;
      paused ? audio.pause() : audio.play();
      return;
    }

    if (!GameOn || paused) return;

    const key = e.key.toUpperCase();
    const noteObj = activeNotes.find((n) => n.key === key);

    if (noteObj) {
      const noteRect = notes[key].getBoundingClientRect();
      const hitZoneTop = window.innerHeight - HIT_ZONE;
      const hitZoneBottom = window.innerHeight;

      if (noteRect.bottom >= hitZoneTop && noteRect.top <= hitZoneBottom) {
        hit(noteObj);
      } else {
        miss(noteObj);
      }
    } else {
      score = Math.max(0, score - 50);
      updateScore();
      showText(key, "Miss");
    }
  });

  audio.addEventListener("ended", () => {
    clearInterval(spawnInterval);
    spawnInterval = null;
  });
};
