const DECK = {
  mild: [
    "What was the first activity you used AI for?",
    "What is your relationship to AI? How do you use it?",
    "What is the most exciting AI application you have observed lately?",
    "How has AI impacted your schoolwork and study skills? Is this a positive and/or negative shift?",
    "To what extent do you understand what AI is? What do you understand its capabilities and limitations to be?",
    "Do you ever mistake AI-generated content for real videos? If not, do you have any tips on how to spot the difference?",
    "When you're using generative AI in school, are there concerns you have beyond the disciplinary consequences of being caught?",
    "When you're stuck on something, what do you typically turn to first: someone else, AI, or something else? Has that changed as AI becomes more accessible?",
    "What kinds of tasks do you think should be AI-free?",
    "How much do you trust the information that comes from AI models? How do you decide what information to verify?",
    "Does your school require a responsible AI usage in your syllabus/homework assignments?",
    "What AI tools do you use for school? For your daily life? How has that impacted you?",
    "Do you think the AI tools you use “understand” you? In what ways?",
    "Has AI ever fallen flat on brainstorming/creative tasks? In what ways?",
    "How do you think your peers, parents, and friends use AI differently than you?"
  ],
  medium: [
    "Which industries do you think AI will change the most in the next 10 years?",
    "How do you think AI will affect your career path?",
    "How should schools adapt to accommodate AI use in the classroom?",
    "How should students go about using AI ethically in school? How should educators promote ethical AI use?",
    "Should all AI-generated or AI-modified content be labeled or clearly identified? Why or why not?",
    "Should you be able to opt out of AI generated content in your feed?",
    "How can AI features make social media better for youth mental health?",
    "How should artists/writers/musicians use AI into their creative process while maintaining originality?",
    "What are some non-tech solutions to the harms of AI, social media or tech?",
    "What are some analog solutions to the harms that AI, social media, and tech can have?",
    "Does AI alter the way people do creative work? How so?",
    "How does the way you use AI differ from the way your parents/trusted adults use AI?",
    "What do you wish your parents knew about how you use AI? Are there common misconceptions?",
    "Does AI harm or further your learning?",
    "Do you think the promises that AI will bring will outweigh the costs to our mental health, creative process, and more? Why or why not?",
    "What topics might you be more skeptical vs trusting of AI’s outputs? ex: sports, health, news, etc"
  ],
  spicy: [
    "How does AI-generated art change the ways that originality, authenticity, and artistic value are defined?",
    "Many companies use the data that users put into their platforms as material to train their models. Should users be able to opt-out?",
    "Should employers be able to use AI for interviews, resume review, etc when hiring?",
    "Should AI ever replace teachers, therapists, or friends? Where do you draw the line?",
    "How would you feel if you found out your teacher was using AI to grade your essays and give you feedback?",
    "How do “perfect” AI filters (like the ones that add muscle or change facial structure) affect your body image compared to traditional photo editing?",
    "Should social media platforms restrict “AI Slop” (low-effort, AI-generated content that clutters feeds) to protect human creativity?",
    "In what cases should chatbots be used for mental health support?",
    "What safeguards should be implemented in chatbots to protect young users from mental health risks, including self-harm?",
    "Should minors have access to general purpose chatbots? Why or why not?",
    "Who is responsible when AI gives someone bad advice that leads to real harm?",
    "If you could design a feature on AI to support wellbeing, what would it be?",
    "AI can hallucinate, or make up false information. How do we shift the culture to double-checking AI’s work instead of trusting what AI says?",
    "What makes AI so alluring? What are some positives/negatives?",
    "AI is trained on historical data and can thus inherit historical bias. Have you seen any of this bias, and how can we bridge this gap?"
  ]
};

const LABELS = { mild: "Mild", medium: "Medium", spicy: "Spicy" };

let pool = buildPool("all");
let currentCard = null;
let lastIndex = -1;
let sessionHistory = [];

function buildPool(diff) {
  const diffs = diff === "all" ? ["mild", "medium", "spicy"] : [diff];
  const items = [];
  diffs.forEach(d => DECK[d].forEach((q, i) => items.push({ diff: d, text: q, num: i + 1 })));
  return items;
}

function buildPoolFromLevels(levels) {
  const items = [];
  levels.forEach(d => DECK[d].forEach((q, i) => items.push({ diff: d, text: q, num: i + 1 })));
  return items;
}

function pickCard() {
  if (pool.length === 0) return null;
  let idx;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (pool.length > 1 && idx === lastIndex);
  lastIndex = idx;
  return pool[idx];
}

const cardEl = document.getElementById("card");
const cardContentEl = document.getElementById("cardContent");
const catTag = document.getElementById("catTag");
const questionEl = document.getElementById("question");
const numEl = document.getElementById("cardNum");
const drawBtn = document.getElementById("drawBtn");
const playProgressEl = document.getElementById("playProgress");

let isAnimating = false;
const SLIDE_MS = 320;

function renderCard(card) {
  catTag.textContent = LABELS[card.diff];
  catTag.className = "cat-tag " + card.diff;
  questionEl.textContent = card.text;
  numEl.textContent = `${LABELS[card.diff]} #${card.num}`;
}

function slideToCard(card) {
  isAnimating = true;
  cardContentEl.classList.add("slide-out");
  setTimeout(() => {
    renderCard(card);
    cardContentEl.classList.remove("slide-out");
    cardContentEl.classList.add("slide-in-prep");
    void cardContentEl.offsetWidth; // force reflow so the next class removal animates
    cardContentEl.classList.remove("slide-in-prep");
    isAnimating = false;
  }, SLIDE_MS);
}

function drawCard() {
  if (isAnimating) return;
  const card = pickCard();
  if (!card) return;
  currentCard = card;
  sessionHistory.push(card);

  if (cardEl.classList.contains("flipped")) {
    slideToCard(card);
  } else {
    renderCard(card);
    requestAnimationFrame(() => cardEl.classList.add("flipped"));
  }
  drawBtn.textContent = "Draw Next Card";
  playProgressEl.textContent = `Card ${sessionHistory.length} of ${pool.length} in this round`;
}

cardEl.addEventListener("click", () => {
  cardEl.classList.toggle("flipped");
});

drawBtn.addEventListener("click", drawCard);

// Game setup — pick levels (multi-select), then shuffle & start
const LEVELS = ["mild", "medium", "spicy"];
let selectedLevels = new Set(LEVELS);

const allLevelChip = document.querySelector('.level-chip[data-diff="all"]');
const singleLevelChips = document.querySelectorAll('.level-chip:not([data-diff="all"])');
const setupHintEl = document.getElementById("setupHint");
const startBtn = document.getElementById("startBtn");
const endGameBtn = document.getElementById("endGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

function syncLevelChipUI() {
  singleLevelChips.forEach(chip => {
    chip.classList.toggle("active", selectedLevels.has(chip.dataset.diff));
  });
  allLevelChip.classList.toggle("active", selectedLevels.size === LEVELS.length);

  const count = buildPoolFromLevels([...selectedLevels]).length;
  if (selectedLevels.size === 0) {
    setupHintEl.textContent = "Select at least one level to play.";
  } else if (selectedLevels.size === LEVELS.length) {
    setupHintEl.textContent = `Playing with all ${count} cards.`;
  } else {
    const removed = LEVELS.filter(l => !selectedLevels.has(l)).map(l => LABELS[l]).join(" + ");
    setupHintEl.textContent = `Removed ${removed} — playing with ${count} cards.`;
  }
  startBtn.disabled = selectedLevels.size === 0;
}

allLevelChip.addEventListener("click", () => {
  selectedLevels = new Set(LEVELS);
  syncLevelChipUI();
});

singleLevelChips.forEach(chip => {
  chip.addEventListener("click", () => {
    const level = chip.dataset.diff;
    if (selectedLevels.has(level)) {
      selectedLevels.delete(level);
    } else {
      selectedLevels.add(level);
    }
    syncLevelChipUI();
  });
});

syncLevelChipUI();

function showGameView(id) {
  document.querySelectorAll(".game-view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

startBtn.addEventListener("click", () => {
  if (selectedLevels.size === 0) return;
  pool = buildPoolFromLevels([...selectedLevels]);
  lastIndex = -1;
  sessionHistory = [];
  cardEl.classList.remove("flipped");
  drawBtn.textContent = "Shuffle";
  showGameView("gamePlay");
  drawCard();
});

function renderSummary() {
  const list = document.getElementById("summaryList");
  list.innerHTML = "";
  const countEl = document.getElementById("summaryCount");

  if (sessionHistory.length === 0) {
    countEl.textContent = "You didn't draw any cards this round.";
    return;
  }
  countEl.textContent = `You talked through ${sessionHistory.length} card${sessionHistory.length === 1 ? "" : "s"}:`;

  sessionHistory.forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "summary-item";
    div.innerHTML = `
      <span class="summary-num">${i + 1}</span>
      <div class="summary-body">
        <span class="cat-tag ${card.diff}">${LABELS[card.diff]}</span>
        <p>${card.text}</p>
      </div>
    `;
    list.appendChild(div);
  });
}

endGameBtn.addEventListener("click", () => {
  renderSummary();
  showGameView("gameSummary");
});

playAgainBtn.addEventListener("click", () => {
  showGameView("gameSetup");
});

// Mode tabs
document.querySelectorAll(".mode-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".mode-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.panel).classList.add("active");
  });
});

// Theater / browse view
let theaterPool = buildPool("all");
let theaterIndex = 0;

const theaterCatTag = document.getElementById("theaterCatTag");
const theaterQuestion = document.getElementById("theaterQuestion");
const theaterIndexEl = document.getElementById("theaterIndex");
const theaterPrev = document.getElementById("theaterPrev");
const theaterNext = document.getElementById("theaterNext");
const carouselEl = document.getElementById("carousel");

function buildCarousel() {
  carouselEl.innerHTML = "";
  theaterPool.forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "carousel-card " + card.diff;
    div.innerHTML = `<span class="mini-num">${LABELS[card.diff]} #${card.num}</span><span class="mini-text">${card.text}</span>`;
    div.addEventListener("click", () => setTheaterCard(i));
    carouselEl.appendChild(div);
  });
}

function setTheaterCard(index) {
  theaterIndex = index;
  const card = theaterPool[theaterIndex];
  if (!card) return;

  theaterCatTag.textContent = LABELS[card.diff];
  theaterCatTag.className = "cat-tag " + card.diff;
  theaterQuestion.textContent = card.text;
  theaterIndexEl.textContent = `Card ${theaterIndex + 1} of ${theaterPool.length}`;

  [...carouselEl.children].forEach((el, i) => {
    el.classList.toggle("active", i === theaterIndex);
  });
  const activeEl = carouselEl.children[theaterIndex];
  if (activeEl) activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

  theaterPrev.disabled = theaterIndex === 0;
  theaterNext.disabled = theaterIndex === theaterPool.length - 1;
}

theaterPrev.addEventListener("click", () => {
  if (theaterIndex > 0) setTheaterCard(theaterIndex - 1);
});

theaterNext.addEventListener("click", () => {
  if (theaterIndex < theaterPool.length - 1) setTheaterCard(theaterIndex + 1);
});

document.querySelectorAll(".t-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".t-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    theaterPool = buildPool(chip.dataset.diff);
    buildCarousel();
    setTheaterCard(0);
  });
});

document.addEventListener("keydown", (e) => {
  const browsePanel = document.getElementById("panel-browse");
  if (!browsePanel.classList.contains("active")) return;
  if (e.key === "ArrowLeft" && theaterIndex > 0) setTheaterCard(theaterIndex - 1);
  if (e.key === "ArrowRight" && theaterIndex < theaterPool.length - 1) setTheaterCard(theaterIndex + 1);
});

buildCarousel();
setTheaterCard(0);

const totalCards = DECK.mild.length + DECK.medium.length + DECK.spicy.length;
const cardTypesIntro = document.getElementById("cardTypesIntro");
if (cardTypesIntro) {
  cardTypesIntro.textContent = `We have a total of ${totalCards} questions, separated into 3 tiers: mild, medium, and spicy.`;
}
