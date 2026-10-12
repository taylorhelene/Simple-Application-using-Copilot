const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const target = document.getElementById('target');
const startBtn = document.getElementById('start');
const messageEl = document.getElementById('message');
const gameArea = document.getElementById('game');

let score = 0;
let timeLeft = 20;
let timer = null;
let active = false;
let audioContext = null;

function playClap() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();

  const duration = 0.12;
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const volume = audioContext.createGain();
  noise.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 1500;
  volume.gain.setValueAtTime(0.35, audioContext.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  noise.connect(filter).connect(volume).connect(audioContext.destination);
  noise.start();
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function placeTarget() {
  const areaWidth = gameArea.clientWidth - 54;
  const areaHeight = gameArea.clientHeight - 54;
  const x = randomBetween(0, areaWidth);
  const y = randomBetween(0, areaHeight);
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
}

function stopGame() {
  active = false;
  clearInterval(timer);
  messageEl.textContent = `Game over! Final score: ${score}`;
  startBtn.textContent = 'Play Again';
}

function startGame() {
  score = 0;
  timeLeft = 20;
  scoreEl.textContent = String(score);
  timeEl.textContent = String(timeLeft);
  messageEl.textContent = 'Hit the target!';
  active = true;
  startBtn.textContent = 'Running...';
  placeTarget();

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft -= 1;
    timeEl.textContent = String(timeLeft);
    if (timeLeft <= 0) {
      stopGame();
    }
  }, 1000);
}

target.addEventListener('click', () => {
  if (!active) return;
  playClap();
  score += 1;
  scoreEl.textContent = String(score);
  placeTarget();
});

startBtn.addEventListener('click', () => {
  if (!active) {
    startGame();
  }
});
