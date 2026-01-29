// ----- Simple love quiz engine -----
const screens = ["intro", "q1", "q2", "q3", "q4", "q5", "q6", "final"];
let currentIndex = 0;

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const card = document.getElementById("card");

const wrongModal = document.getElementById("wrongModal");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const confettiBtn = document.getElementById("confettiBtn");
const popSound = document.getElementById("popSound");

function showScreen(name){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.querySelector(`.screen[data-screen="${name}"]`);
  if(el) el.classList.add("active");

  currentIndex = screens.indexOf(name);
  updateProgress();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateProgress(){
  // Count intro as step 1 visually? We'll show total 7 (q1..final) but include intro for vibe.
  const step = Math.max(1, currentIndex + 1);
  const total = screens.length;
  const pct = ((currentIndex) / (total - 1)) * 100;

  progressFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  progressText.textContent = `${step} / ${total}`;
}

function nextScreen(){
  const next = screens[Math.min(screens.length - 1, currentIndex + 1)];
  showScreen(next);
}

function openWrong(){
  wrongModal.classList.add("show");
  wrongModal.setAttribute("aria-hidden", "false");
  // little shake for drama
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 420);
}

function closeWrong(){
  wrongModal.classList.remove("show");
  wrongModal.setAttribute("aria-hidden", "true");
}

// Attach option listeners
document.querySelectorAll(".opt").forEach(btn => {
  btn.addEventListener("click", () => {
    const ans = btn.getAttribute("data-answer");
    try { popSound.currentTime = 0; popSound.play(); } catch(e){}

    if(ans === "correct"){
      btn.classList.add("correct");
      // Tiny delay so user sees feedback
      setTimeout(() => nextScreen(), 420);
    } else {
      btn.classList.add("wrong");
      openWrong();
      setTimeout(() => btn.classList.remove("wrong"), 650);
    }
  });
});

tryAgainBtn.addEventListener("click", closeWrong);
wrongModal.addEventListener("click", (e) => {
  if(e.target === wrongModal) closeWrong();
});

startBtn?.addEventListener("click", () => showScreen("q1"));
restartBtn?.addEventListener("click", () => {
  // reset button states
  document.querySelectorAll(".opt").forEach(b => b.classList.remove("correct","wrong"));
  showScreen("intro");
});

// Confetti effect on final page
confettiBtn?.addEventListener("click", () => {
  burstConfetti(140);
  burstConfetti(140);
});

// Start at intro
showScreen("intro");

// ----- Floating Hearts Canvas -----
const canvas = document.getElementById("hearts");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
let scaled = false;
function safeResize(){
  // prevent repeated scaling
  ctx.setTransform(1,0,0,1,0,0);
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
window.addEventListener("resize", safeResize);
safeResize();

const hearts = [];
const HEARTS_COUNT = 28;

function rand(min,max){ return Math.random()*(max-min)+min; }

function spawnHeart(){
  const size = rand(10, 22);
  hearts.push({
    x: rand(0, window.innerWidth),
    y: window.innerHeight + rand(20, 200),
    vy: rand(0.35, 1.1),
    vx: rand(-0.25, 0.25),
    size,
    rot: rand(-0.8, 0.8),
    vr: rand(-0.006, 0.006),
    alpha: rand(0.35, 0.75),
  });
}

for(let i=0;i<HEARTS_COUNT;i++) spawnHeart();

function drawHeart(x,y,s,rot,a){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.globalAlpha = a;

  ctx.beginPath();
  // Simple heart path
  const t = s;
  ctx.moveTo(0, t/4);
  ctx.bezierCurveTo(0, -t/2, -t, -t/2, -t, t/6);
  ctx.bezierCurveTo(-t, t, 0, t*1.15, 0, t*1.45);
  ctx.bezierCurveTo(0, t*1.15, t, t, t, t/6);
  ctx.bezierCurveTo(t, -t/2, 0, -t/2, 0, t/4);

  const grad = ctx.createLinearGradient(-t, -t, t, t);
  grad.addColorStop(0, "rgba(255,79,216,0.95)");
  grad.addColorStop(1, "rgba(110,243,255,0.85)");
  ctx.fillStyle = grad;
  ctx.shadowColor = "rgba(255,79,216,0.35)";
  ctx.shadowBlur = 18;
  ctx.fill();

  ctx.restore();
}

function animateHearts(){
  ctx.clearRect(0,0,window.innerWidth, window.innerHeight);

  for(const h of hearts){
    h.x += h.vx;
    h.y -= h.vy;
    h.rot += h.vr;

    drawHeart(h.x, h.y, h.size, h.rot, h.alpha);

    if(h.y < -80){
      h.y = window.innerHeight + rand(60, 220);
      h.x = rand(0, window.innerWidth);
      h.vy = rand(0.35, 1.1);
    }
  }

  requestAnimationFrame(animateHearts);
}
animateHearts();

// ----- Confetti (simple + light) -----
const confettiPieces = [];

function burstConfetti(count=120){
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 3;

  for(let i=0;i<count;i++){
    confettiPieces.push({
      x: centerX + rand(-30, 30),
      y: centerY + rand(-10, 10),
      vx: rand(-4.2, 4.2),
      vy: rand(-6.8, -2.4),
      g: rand(0.08, 0.14),
      w: rand(6, 10),
      h: rand(10, 16),
      r: rand(0, Math.PI),
      vr: rand(-0.2, 0.2),
      life: rand(70, 120)
    });
  }
}

function drawConfetti(){
  if(confettiPieces.length === 0) return;

  // draw on top of everything using the same hearts canvas
  for(let i=confettiPieces.length - 1; i>=0; i--){
    const p = confettiPieces[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.r += p.vr;
    p.life -= 1;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.globalAlpha = Math.min(1, p.life / 60);

    const g = ctx.createLinearGradient(-p.w, -p.h, p.w, p.h);
    g.addColorStop(0, "rgba(255,79,216,0.95)");
    g.addColorStop(1, "rgba(110,243,255,0.9)");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(255,255,255,0.15)";
    ctx.shadowBlur = 10;
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);

    ctx.restore();

    if(p.life <= 0 || p.y > window.innerHeight + 80){
      confettiPieces.splice(i, 1);
    }
  }
  requestAnimationFrame(drawConfetti);
}
drawConfetti();
