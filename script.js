/* =============================================
   GUESS THE NUMBER GAME — JAVASCRIPT
   Features: 4 difficulty levels, hot/cold hints,
   progress bar, history pills, scoreboard
   ============================================= */

// ---- Difficulty settings ----
const DIFFICULTIES = {
  easy:   { min: 1, max: 50,  tries: 12 },
  medium: { min: 1, max: 100, tries: 10 },
  hard:   { min: 1, max: 200, tries:  8 },
  expert: { min: 1, max: 500, tries:  7 }
};

// ---- Game state variables ----
let secret    = 0;    // The secret number to guess
let maxTries  = 0;    // Total attempts allowed for this difficulty
let triesLeft = 0;    // Remaining attempts
let guesses   = [];   // Array of numbers already guessed
let gameOver  = false;
let wins      = 0;
let losses    = 0;
let bestScore = null; // Lowest guess count win

// ---- DOM element references ----
const feedbackEl    = document.getElementById('feedback');
const hintEl        = document.getElementById('hintBox');
const guessInput    = document.getElementById('guessInput');
const guessBtn      = document.getElementById('guessBtn');
const historyEl     = document.getElementById('historyPills');
const progressBar   = document.getElementById('progressBar');
const attemptsLeftEl = document.getElementById('attemptsLeft');
const guessesMadeEl = document.getElementById('guessesMade');
const bestStatEl    = document.getElementById('bestStat');
const totalWinsEl   = document.getElementById('totalWins');
const totalLossEl   = document.getElementById('totalLoss');
const winRateEl     = document.getElementById('winRate');
const rangeLabelEl  = document.getElementById('rangeLabel');
const diffSel       = document.getElementById('diffSel');

// ---- Start a new game ----
function newGame() {
  const d   = DIFFICULTIES[diffSel.value];
  secret    = Math.floor(Math.random() * (d.max - d.min + 1)) + d.min;
  maxTries  = d.tries;
  triesLeft = d.tries;
  guesses   = [];
  gameOver  = false;

  // Reset UI
  guessInput.value    = '';
  guessInput.disabled = false;
  guessInput.min      = d.min;
  guessInput.max      = d.max;
  guessInput.placeholder = `${d.min} – ${d.max}`;
  guessBtn.disabled   = false;
  historyEl.innerHTML = '';
  hintEl.textContent  = '';

  rangeLabelEl.textContent = `I'm thinking of a number between ${d.min} and ${d.max}`;
  setFeedback('idle', 'bx-bulb', 'Enter your first guess!');
  updateStats();
}

// ---- Handle a guess submission ----
function makeGuess() {
  if (gameOver) return;

  const d   = DIFFICULTIES[diffSel.value];
  const val = parseInt(guessInput.value, 10);

  // Validate input
  if (isNaN(val) || val < d.min || val > d.max) {
    setFeedback('warn', 'bx-error-circle', `Please enter a number between ${d.min} and ${d.max}`);
    shakeInput();
    return;
  }

  // Duplicate guess check
  if (guesses.includes(val)) {
    setFeedback('warn', 'bx-repeat', `You already guessed ${val}! Try another.`);
    shakeInput();
    return;
  }

  // Record guess
  guesses.push(val);
  triesLeft--;
  guessInput.value = '';

  // --- WIN ---
  if (val === secret) {
    wins++;
    gameOver = true;
    const count = guesses.length;

    // Update best score
    if (bestScore === null || count < bestScore) {
      bestScore = count;
    }

    addPill(val, 'win');
    setFeedback('win', 'bx-party', `🎉 You got it! The number was ${secret} — solved in ${count} guess${count > 1 ? 'es' : ''}!`);
    hintEl.textContent = '';
    disableInput();

  // --- OUT OF ATTEMPTS ---
  } else if (triesLeft === 0) {
    losses++;
    gameOver = true;

    addPill(val, val > secret ? 'high' : 'low');
    setFeedback('lose', 'bx-sad', `Out of attempts! The secret number was ${secret}. Better luck next time!`);
    hintEl.textContent = '';
    disableInput();

  // --- WRONG GUESS ---
  } else {
    const tooHigh = val > secret;
    addPill(val, tooHigh ? 'high' : 'low');

    if (tooHigh) {
      setFeedback('high', 'bx-down-arrow-circle', `Too high! Try a lower number.`);
    } else {
      setFeedback('low', 'bx-up-arrow-circle', `Too low! Try a higher number.`);
    }

    // Show hot/cold proximity hint
    hintEl.textContent = getHotColdHint(val, secret);
  }

  updateStats();
}

// ---- Hot / Cold proximity hint ----
function getHotColdHint(guess, target) {
  const diff = Math.abs(guess - target);
  if (diff <= 2)  return '🔥 Scorching hot!';
  if (diff <= 5)  return '🌡️ Very warm!';
  if (diff <= 10) return '☀️ Getting warm…';
  if (diff <= 20) return '❄️ Getting cold…';
  if (diff <= 50) return '🧊 Ice cold!';
  return '🌌 Freezing!';
}

// ---- Update all stat displays ----
function updateStats() {
  attemptsLeftEl.textContent = triesLeft;
  guessesMadeEl.textContent  = guesses.length;
  bestStatEl.textContent     = bestScore !== null ? bestScore : '—';

  // Progress bar — width + color based on remaining %
  const pct = (triesLeft / maxTries) * 100;
  progressBar.style.width = pct + '%';

  if (pct > 60)      progressBar.style.background = '#639922'; // green
  else if (pct > 30) progressBar.style.background = '#BA7517'; // orange
  else               progressBar.style.background = '#A32D2D'; // red

  // Scoreboard
  const total = wins + losses;
  totalWinsEl.textContent = wins;
  totalLossEl.textContent = losses;
  winRateEl.textContent   = total > 0 ? Math.round((wins / total) * 100) + '%' : '—';
}

// ---- Set feedback box message ----
// type: 'idle' | 'high' | 'low' | 'win' | 'lose' | 'warn'
function setFeedback(type, iconClass, message) {
  feedbackEl.className = `feedback-box fb-${type}`;
  feedbackEl.innerHTML = `<i class="bx ${iconClass}"></i><span>${message}</span>`;
}

// ---- Add a guess pill to history ----
function addPill(num, type) {
  const pill = document.createElement('span');
  pill.className   = `guess-pill pill-${type}`;
  pill.textContent = num;
  historyEl.appendChild(pill);
}

// ---- Disable input after game ends ----
function disableInput() {
  guessInput.disabled = true;
  guessBtn.disabled   = true;
}

// ---- Shake animation on invalid input ----
function shakeInput() {
  guessInput.classList.remove('shake');
  void guessInput.offsetWidth; // force reflow to restart animation
  guessInput.classList.add('shake');
}

// ---- Allow pressing Enter to submit guess ----
guessInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') makeGuess();
});

// ---- Add shake animation via dynamic style ----
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-5px); }
    80%       { transform: translateX(5px); }
  }
  .shake { animation: shake 0.35s ease; }
`;
document.head.appendChild(shakeStyle);

// ---- Start the first game on page load ----
newGame();