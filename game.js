(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
  const screens = {
    home: document.getElementById("home"),
    game: document.getElementById("game"),
    result: document.getElementById("result"),
  };

  const startBtn = document.getElementById("startGame");
  const playAgainBtn = document.getElementById("playAgain");
  const abortBtn = document.getElementById("abortGame");
  const timerEl = document.getElementById("timer");
  const strikeCountEl = document.getElementById("strikeCount");
  const moduleProgressEl = document.getElementById("moduleProgress");
  const moduleTitleEl = document.getElementById("moduleTitle");
  const bombModuleEl = document.getElementById("bombModule");
  const feedbackEl = document.getElementById("feedback");
  const progressFill = document.getElementById("progressFill");
  const strikeLights = [
    document.getElementById("strikeLight1"),
    document.getElementById("strikeLight2"),
    document.getElementById("strikeLight3"),
  ];
  const bombStatusEl = document.getElementById("bombStatus");
  const moduleLampEl = document.getElementById("moduleLamp");
  const serialNumberEl = document.getElementById("serialNumber");
  const levelLabelEl = document.getElementById("levelLabel");
  const campaignHomeTitleEl = document.getElementById("campaignHomeTitle");
  const homeLevelLabelEl = document.getElementById("homeLevelLabel");
  const homeLevelDetailsEl = document.getElementById("homeLevelDetails");
  const campaignProgressNoteEl = document.getElementById("campaignProgressNote");
  const explosionOverlayEl = document.getElementById("explosionOverlay");
  const bombConsoleEl = document.querySelector(".bomb-console");

  let state = null;
  let campaign = null;
  let resultAction = "start";
  let timerId = null;

  const colorWordList = [
    "APPLE", "OCEAN", "GRASS", "BANANA", "GRAPE", "SUN",
    "SNOW", "LEMON", "TREE", "NIGHT", "ROSE", "CLOUD"
  ];
  const colorList = ["red", "blue", "green", "yellow", "purple"];


  const animalRuleMaps = {
    star: {
      HORN_CIRCLE: [2, 4, 1, 7], EMPTY_HORN_CIRCLE: [5, 1, 8, 3], ONE_HORN_CIRCLE: [7, 3, 2, 9], LEG_CIRCLE: [3, 8, 6, 1],
      TAIL_TRIANGLE: [8, 2, 5, 4], DOT_TRIANGLE: [4, 6, 9, 2], OPEN_BOX: [1, 9, 3, 7], BOX_TAIL: [6, 5, 2, 8],
      SPIKY_U: [9, 7, 4, 1], DOT_U: [2, 9, 6, 5], MOON_LINE: [5, 8, 1, 4], MOON_DOT: [7, 1, 3, 6],
    },
    circle: {
      HORN_CIRCLE: [6, 7, 3, 8], EMPTY_HORN_CIRCLE: [6, 7, 1, 4], ONE_HORN_CIRCLE: [5, 7, 3, 8], LEG_CIRCLE: [5, 3, 2, 8],
      TAIL_TRIANGLE: [9, 8, 1, 3], DOT_TRIANGLE: [3, 9, 6, 4], OPEN_BOX: [4, 9, 6, 8], BOX_TAIL: [7, 6, 8, 2],
      SPIKY_U: [6, 2, 8, 5], DOT_U: [1, 4, 6, 8], MOON_LINE: [6, 3, 2, 5], MOON_DOT: [2, 7, 4, 5],
    },
    triangle: {
      HORN_CIRCLE: [1, 6, 5, 9], EMPTY_HORN_CIRCLE: [5, 1, 3, 8], ONE_HORN_CIRCLE: [6, 3, 4, 5], LEG_CIRCLE: [3, 4, 1, 6],
      TAIL_TRIANGLE: [9, 4, 7, 5], DOT_TRIANGLE: [9, 5, 4, 6], OPEN_BOX: [1, 3, 5, 7], BOX_TAIL: [9, 3, 7, 2],
      SPIKY_U: [2, 7, 4, 9], DOT_U: [7, 9, 3, 5], MOON_LINE: [2, 8, 5, 3], MOON_DOT: [4, 8, 6, 1],
    },
  };

  const symbolCatalog = {
    HORN_CIRCLE: { desc: "circle with two short lines on top and a dot inside" },
    EMPTY_HORN_CIRCLE: { desc: "circle with two short lines on top and no dot" },
    ONE_HORN_CIRCLE: { desc: "circle with one short line on top and a dot inside" },
    LEG_CIRCLE: { desc: "circle with two short lines at the bottom and a dot inside" },
    TAIL_TRIANGLE: { desc: "triangle with a curved tail at the bottom" },
    DOT_TRIANGLE: { desc: "triangle with one short line on top and two dots inside" },
    OPEN_BOX: { desc: "open square with a gap on the right and two dots inside" },
    BOX_TAIL: { desc: "square with one dot inside and a curved tail at the bottom" },
    SPIKY_U: { desc: "u shape with three short lines on top" },
    DOT_U: { desc: "u shape with one dot inside and short arms on both sides" },
    MOON_LINE: { desc: "crescent shape with a line through the middle" },
    MOON_DOT: { desc: "crescent shape with two dots on the right side" },
  };

  function getSymbolSvg(symbolId) {
    const common = 'stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    const circle = `<circle cx="50" cy="50" r="30" ${common}/>`;
    const box = `<rect x="22" y="22" width="56" height="56" ${common}/>`;
    const dot = '<circle cx="50" cy="50" r="5.6" fill="currentColor" stroke="none"/>';

    switch (symbolId) {
      case "HORN_CIRCLE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true">${circle}<line x1="38" y1="23" x2="31" y2="8" ${common}/><line x1="62" y1="23" x2="69" y2="8" ${common}/>${dot}</svg>`;
      case "EMPTY_HORN_CIRCLE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true">${circle}<line x1="38" y1="23" x2="31" y2="8" ${common}/><line x1="62" y1="23" x2="69" y2="8" ${common}/></svg>`;
      case "ONE_HORN_CIRCLE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true">${circle}<line x1="50" y1="20" x2="50" y2="5" ${common}/>${dot}</svg>`;
      case "LEG_CIRCLE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="42" r="28" ${common}/><line x1="39" y1="67" x2="31" y2="82" ${common}/><line x1="61" y1="67" x2="69" y2="82" ${common}/>${dot}</svg>`;
      case "TAIL_TRIANGLE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,12 20,66 80,66" ${common}/><path d="M50 66 C50 77 58 79 58 88 C58 95 53 98 49 98" ${common}/></svg>`;
      case "DOT_TRIANGLE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,17 18,72 82,72" ${common}/><line x1="50" y1="17" x2="50" y2="3" ${common}/><circle cx="40" cy="55" r="4.8" fill="currentColor" stroke="none"/><circle cx="60" cy="55" r="4.8" fill="currentColor" stroke="none"/></svg>`;
      case "OPEN_BOX":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M22 22 H78 V42" ${common}/><path d="M22 22 V78 H78 V58" ${common}/><circle cx="40" cy="50" r="4.8" fill="currentColor" stroke="none"/><circle cx="60" cy="50" r="4.8" fill="currentColor" stroke="none"/></svg>`;
      case "BOX_TAIL":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true">${box}${dot}<path d="M50 78 C50 88 58 90 58 98 C58 104 53 107 48 108" ${common}/></svg>`;
      case "SPIKY_U":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M25 28 V65 C25 78 35 86 50 86 C65 86 75 78 75 65 V28" ${common}/><line x1="35" y1="18" x2="30" y2="6" ${common}/><line x1="50" y1="16" x2="50" y2="2" ${common}/><line x1="65" y1="18" x2="70" y2="6" ${common}/></svg>`;
      case "DOT_U":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M30 22 V60 C30 76 39 86 50 86 C61 86 70 76 70 60 V22" ${common}/><line x1="30" y1="50" x2="15" y2="50" ${common}/><line x1="70" y1="50" x2="85" y2="50" ${common}/>${dot}</svg>`;
      case "MOON_LINE":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M66 14 C46 18 32 34 32 50 C32 66 46 82 66 86" ${common}/><path d="M62 14 C47 22 40 35 40 50 C40 65 47 78 62 86" ${common}/><line x1="20" y1="50" x2="80" y2="50" ${common}/></svg>`;
      case "MOON_DOT":
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true"><path d="M66 14 C46 18 32 34 32 50 C32 66 46 82 66 86" ${common}/><path d="M62 14 C47 22 40 35 40 50 C40 65 47 78 62 86" ${common}/><circle cx="74" cy="40" r="4.8" fill="currentColor" stroke="none"/><circle cx="74" cy="60" r="4.8" fill="currentColor" stroke="none"/></svg>`;
      default:
        return `<svg class="symbol-svg" viewBox="0 0 100 100" aria-hidden="true">${circle}</svg>`;
    }
  }

  function createSymbolGraphic(symbolId, className = "symbol-display") {
    const wrap = document.createElement("div");
    wrap.className = className;
    wrap.setAttribute("aria-label", symbolCatalog[symbolId]?.desc || symbolId);
    wrap.innerHTML = getSymbolSvg(symbolId);
    return wrap;
  }

  const directionRoutes = {
    SCHOOL: {
      1: ["up", "right", "up"],
      2: ["left", "up", "right", "down"],
      3: ["down", "right", "up", "left", "right"],
    },
    PARK: {
      1: ["left", "up", "left"],
      2: ["right", "down", "right", "up"],
      3: ["up", "left", "down", "right", "up"],
    },
    LIBRARY: {
      1: ["down", "right", "right", "up"],
      2: ["up", "left", "up", "right", "down"],
      3: ["right", "down", "left", "up", "right", "down"],
    },
    STATION: {
      1: ["right", "down", "left", "up"],
      2: ["left", "up", "right", "down", "left"],
      3: ["up", "right", "down", "left", "up", "right"],
    },
    HOSPITAL: {
      1: ["up", "left", "down", "right"],
      2: ["up", "up", "left", "down", "right"],
      3: ["right", "up", "left", "down", "right", "up"],
    },
    SUPERMARKET: {
      1: ["right", "up", "left", "up"],
      2: ["right", "right", "up", "left", "up"],
      3: ["down", "right", "up", "left", "up", "right"],
    },
    RESTAURANT: {
      1: ["down", "left", "up", "right"],
      2: ["down", "left", "up", "right", "down"],
      3: ["down", "left", "up", "right", "down", "left"],
    },
    POST_OFFICE: {
      1: ["left", "down", "right", "up"],
      2: ["up", "left", "down", "right", "up"],
      3: ["left", "down", "right", "up", "left", "up"],
    },
    MUSEUM: {
      1: ["up", "left", "down", "right"],
      2: ["up", "left", "down", "right", "up"],
      3: ["up", "left", "down", "right", "up", "left"],
    },
    AIRPORT: {
      1: ["right", "up", "right"],
      2: ["right", "up", "right", "down", "left"],
      3: ["up", "right", "down", "left", "up", "right"],
    },
    HOTEL: {
      1: ["down", "down", "right"],
      2: ["left", "down", "down", "right"],
      3: ["up", "left", "down", "down", "right"],
    },
    BANK: {
      1: ["left", "up", "right", "down"],
      2: ["left", "up", "right", "right", "down"],
      3: ["down", "left", "up", "right", "right", "down"],
    },
    ZOO: {
      1: ["up", "right", "down", "left"],
      2: ["up", "right", "down", "left", "up"],
      3: ["up", "right", "down", "left", "up", "right"],
    },
    CITY_HALL: {
      1: ["right", "left", "up"],
      2: ["right", "left", "up", "down"],
      3: ["right", "left", "up", "down", "right"],
    },
  };

  const routeLabels = {
    1: "ROUTE 1",
    2: "ROUTE 2",
    3: "ROUTE 3",
  };

  const wordBank = [
    "APPLE", "DOG", "SCHOOL", "RED",
    "TENNIS", "BOOK", "CAR", "RAIN",
    "PIZZA", "CAT", "PARK", "BLUE",
    "SOCCER", "PENCIL", "TRAIN", "SUN"
  ];

  const wordRuleMaps = {
    star: {
      APPLE: "DOG", DOG: "SCHOOL", SCHOOL: "RED", RED: "TENNIS",
      TENNIS: "BOOK", BOOK: "CAR", CAR: "RAIN", RAIN: "PIZZA",
      PIZZA: "CAT", CAT: "PARK", PARK: "BLUE", BLUE: "SOCCER",
      SOCCER: "PENCIL", PENCIL: "TRAIN", TRAIN: "SUN", SUN: "APPLE",
    },
    circle: {
      APPLE: "SOCCER", DOG: "APPLE", SCHOOL: "PIZZA", RED: "SCHOOL",
      TENNIS: "CAT", BOOK: "RAIN", CAR: "TRAIN", RAIN: "TENNIS",
      PIZZA: "CAR", CAT: "PENCIL", PARK: "SUN", BLUE: "BOOK",
      SOCCER: "DOG", PENCIL: "BLUE", TRAIN: "PARK", SUN: "RED",
    },
    triangle: {
      APPLE: "BOOK", DOG: "TENNIS", SCHOOL: "PARK", RED: "SUN",
      TENNIS: "BLUE", BOOK: "PENCIL", CAR: "APPLE", RAIN: "RED",
      PIZZA: "TRAIN", CAT: "SOCCER", PARK: "CAT", BLUE: "RAIN",
      SOCCER: "CAR", PENCIL: "SCHOOL", TRAIN: "DOG", SUN: "PIZZA",
    },
  };


  const ruleKeys = {
    star: { symbol: "★", label: "STAR" },
    circle: { symbol: "●", label: "CIRCLE" },
    triangle: { symbol: "▲", label: "TRIANGLE" },
  };

  const calculatorOperations = {
    add: { symbol: "+", label: "ADD" },
    subtract: { symbol: "−", label: "SUBTRACT" },
    multiply: { symbol: "×", label: "MULTIPLY" },
    divide: { symbol: "÷", label: "DIVIDE" },
  };

  const calculatorRuleMaps = {
    star: { red: "add", blue: "subtract", green: "multiply", yellow: "divide" },
    circle: { red: "divide", blue: "multiply", green: "add", yellow: "subtract" },
    triangle: { red: "subtract", blue: "add", green: "divide", yellow: "multiply" },
  };


  const wirePalette = ["red", "blue", "green", "yellow", "black"];

  function wireIndices(wires, color) {
    return wires.map((wire, index) => wire === color ? index : -1).filter(index => index >= 0);
  }

  function evaluateWireRules(wires, ruleKey) {
    const count = wires.length;
    const reds = wireIndices(wires, "red");
    const yellows = wireIndices(wires, "yellow");
    const blacks = wireIndices(wires, "black");
    const first = wires[0];
    const last = wires[wires.length - 1];

    // Every wire-count + rule-key combination has ONE yes/no question.
    // YES and NO each lead directly to one wire to cut.
    if (count === 4 && ruleKey === "star") {
      const yes = reds.length >= 2;
      return { correctIndex: yes ? reds[1] : 2, answer: yes ? "yes" : "no" };
    }
    if (count === 4 && ruleKey === "circle") {
      const yes = first === "blue";
      return { correctIndex: yes ? 3 : 1, answer: yes ? "yes" : "no" };
    }
    if (count === 4 && ruleKey === "triangle") {
      const yes = yellows.length >= 2;
      return { correctIndex: yes ? yellows[0] : 3, answer: yes ? "yes" : "no" };
    }

    if (count === 5 && ruleKey === "star") {
      const yes = first === last;
      return { correctIndex: yes ? 2 : 1, answer: yes ? "yes" : "no" };
    }
    if (count === 5 && ruleKey === "circle") {
      const yes = blacks.length === 1;
      return { correctIndex: yes ? blacks[0] : 3, answer: yes ? "yes" : "no" };
    }
    if (count === 5 && ruleKey === "triangle") {
      const yes = last === "blue";
      return { correctIndex: yes ? 1 : 0, answer: yes ? "yes" : "no" };
    }

    if (count === 6 && ruleKey === "star") {
      const yes = reds.length === 1;
      return { correctIndex: yes ? reds[0] : 4, answer: yes ? "yes" : "no" };
    }
    if (count === 6 && ruleKey === "circle") {
      const yes = blacks.length >= 2;
      return { correctIndex: yes ? blacks[1] : 3, answer: yes ? "yes" : "no" };
    }
    if (count === 6 && ruleKey === "triangle") {
      const yes = first === "yellow";
      return { correctIndex: yes ? 5 : 2, answer: yes ? "yes" : "no" };
    }

    return { correctIndex: 0, answer: "no" };
  }

  function wireCountForDifficulty(difficulty) {
    if (difficulty === "easy") return 4;
    if (difficulty === "medium") return Math.random() < 0.65 ? 5 : 4;
    if (difficulty === "hard") return Math.random() < 0.65 ? 6 : 5;
    return 6;
  }

  function wireAnswerForDifficulty() {
    // Balance YES and NO outcomes so one side does not dominate by luck.
    return Math.random() < 0.5 ? "yes" : "no";
  }

  function makeWirePuzzle(difficulty, levelNumber) {
    const count = wireCountForDifficulty(difficulty);
    const ruleKey = choice(unlockedRuleKeys(levelNumber));
    const targetAnswer = wireAnswerForDifficulty(difficulty);
    const recent = campaign?.recentWireSignatures || [];
    let best = null;

    for (let attempt = 0; attempt < 700; attempt++) {
      const wires = Array.from({ length: count }, () => choice(wirePalette));
      if (new Set(wires).size < 3) continue;

      const result = evaluateWireRules(wires, ruleKey);
      const signature = `${ruleKey}|${wires.join(",")}`;
      const candidate = { wires, ruleKey, signature, ...result };

      if (!best || result.answer === targetAnswer) best = candidate;
      if (result.answer === targetAnswer && !recent.includes(signature)) {
        best = candidate;
        break;
      }
    }

    if (!best) {
      const wires = Array.from({ length: count }, () => choice(wirePalette));
      best = { wires, ruleKey, signature: `${ruleKey}|${wires.join(",")}`, ...evaluateWireRules(wires, ruleKey) };
    }

    if (campaign) {
      campaign.recentWireSignatures = campaign.recentWireSignatures || [];
      campaign.recentWireSignatures.push(best.signature);
      if (campaign.recentWireSignatures.length > 8) campaign.recentWireSignatures.shift();
    }

    return best;
  }


  function makeDirectionPuzzle(difficulty) {
    const routePool =
      difficulty === "easy" ? [1] :
      difficulty === "medium" ? [1, 2] :
      difficulty === "hard" ? [2, 3] :
      [3];

    const lengthOkay = (steps) => {
      if (difficulty === "easy") return steps.length <= 4;
      if (difficulty === "medium") return steps.length >= 4 && steps.length <= 5;
      if (difficulty === "hard") return steps.length >= 5;
      return steps.length >= 5;
    };

    const candidates = [];
    Object.entries(directionRoutes).forEach(([place, routes]) => {
      routePool.forEach((route) => {
        const steps = routes[route];
        if (steps && lengthOkay(steps)) {
          candidates.push({
            place,
            route,
            steps,
            signature: `${place}|${route}`,
          });
        }
      });
    });

    const fallback = [];
    Object.entries(directionRoutes).forEach(([place, routes]) => {
      routePool.forEach((route) => {
        const steps = routes[route];
        if (steps) {
          fallback.push({
            place,
            route,
            steps,
            signature: `${place}|${route}`,
          });
        }
      });
    });

    const pool = candidates.length ? candidates : fallback;
    const recent = campaign?.recentDirectionSignatures || [];
    const filtered = pool.filter((item) => !recent.includes(item.signature));
    const picked = choice(filtered.length ? filtered : pool);

    if (campaign) {
      campaign.recentDirectionSignatures = campaign.recentDirectionSignatures || [];
      campaign.recentDirectionSignatures.push(picked.signature);
      if (campaign.recentDirectionSignatures.length > 8) {
        campaign.recentDirectionSignatures.shift();
      }
    }

    return picked;
  }

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, n);
  }


  const LEVELS = [
    { level: 1,  clears: 1,  seconds: 180, pool: ["color"], mix: ["easy"] },
    { level: 2,  clears: 1,  seconds: 150, pool: ["color", "animals"], mix: ["easy"] },
    { level: 3,  clears: 2,  seconds: 240, pool: ["color", "animals", "directions"], mix: ["easy", "medium"] },
    { level: 4,  clears: 2,  seconds: 220, pool: ["color", "animals", "directions", "wires"], mix: ["easy", "medium"] },
    { level: 5,  clears: 2,  seconds: 200, pool: ["color", "animals", "directions", "wires", "category"], mix: ["medium", "medium"] },
    { level: 6,  clears: 3,  seconds: 300, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["easy", "medium", "medium"] },
    { level: 7,  clears: 3,  seconds: 270, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["easy", "medium", "hard"] },
    { level: 8,  clears: 3,  seconds: 240, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "medium", "hard"] },
    { level: 9,  clears: 4,  seconds: 330, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["easy", "medium", "medium", "hard"] },
    { level: 10, clears: 4,  seconds: 300, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "medium", "hard", "hard"] },
    { level: 11, clears: 4,  seconds: 270, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard"] },
    { level: 12, clears: 5,  seconds: 390, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["easy", "medium", "medium", "hard", "hard"] },
    { level: 13, clears: 5,  seconds: 360, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "medium", "hard", "hard", "hard"] },
    { level: 14, clears: 5,  seconds: 330, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard", "veryHard"] },
    { level: 15, clears: 6,  seconds: 420, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "medium", "hard", "hard", "hard", "veryHard"] },
    { level: 16, clears: 6,  seconds: 390, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard", "veryHard", "veryHard"] },
    { level: 17, clears: 6,  seconds: 360, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard", "veryHard", "veryHard"] },
    { level: 18, clears: 7,  seconds: 420, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard", "hard", "veryHard", "veryHard"] },
    { level: 19, clears: 7,  seconds: 390, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard", "veryHard", "veryHard", "veryHard"] },
    { level: 20, clears: 10, seconds: 300, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["medium", "hard", "hard", "hard", "hard", "hard", "veryHard", "veryHard", "veryHard", "veryHard"] },
  ];

  const colorRuleMaps = {
    star: {
      APPLE: "purple", OCEAN: "yellow", GRASS: "blue", BANANA: "red",
      GRAPE: "green", SUN: "blue", SNOW: "red", LEMON: "purple",
      TREE: "yellow", NIGHT: "green", ROSE: "blue", CLOUD: "purple",
    },
    circle: {
      APPLE: "green", OCEAN: "red", GRASS: "purple", BANANA: "blue",
      GRAPE: "yellow", SUN: "red", SNOW: "green", LEMON: "blue",
      TREE: "purple", NIGHT: "yellow", ROSE: "green", CLOUD: "red",
    },
    triangle: {
      APPLE: "blue", OCEAN: "purple", GRASS: "yellow", BANANA: "green",
      GRAPE: "red", SUN: "purple", SNOW: "yellow", LEMON: "green",
      TREE: "red", NIGHT: "blue", ROSE: "yellow", CLOUD: "green",
    },
  };

  const fixedRules = {
    colorMaps: colorRuleMaps,
    animalMaps: animalRuleMaps,
    wordMaps: wordRuleMaps,
    calculatorMaps: calculatorRuleMaps,
  };

  function numberToWords(number) {
    const ones = [
      "ZERO", "ONE", "TWO", "THREE", "FOUR",
      "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
      "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN",
      "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"
    ];

    const tens = [
      "", "", "TWENTY", "THIRTY", "FORTY",
      "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
    ];

    const n = Math.max(0, Math.floor(Number(number)));

    if (n < 20) return ones[n];

    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
    }

    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      return rest === 0
        ? `${ones[hundred]} HUNDRED`
        : `${ones[hundred]} HUNDRED ${numberToWords(rest)}`;
    }

    return String(n);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function unlockedRuleKeys(levelNumber) {
    if (levelNumber <= 2) return ["star"];
    if (levelNumber <= 6) return ["star", "circle"];
    return ["star", "circle", "triangle"];
  }

  function lookupKeyForDifficulty(difficulty) {
    if (difficulty === "easy") return "star";
    if (difficulty === "medium") return "circle";
    return "triangle";
  }

  function chooseDifferent(items, previous) {
    const options = items.filter(item => item !== previous);
    return choice(options.length ? options : items);
  }

  function operationForDifficulty(difficulty) {
    if (difficulty === "easy") return "add";
    if (difficulty === "medium") return "subtract";
    if (difficulty === "hard") return "multiply";
    return "divide";
  }

  function lightForOperation(ruleKey, operation) {
    const entries = Object.entries(calculatorRuleMaps[ruleKey]);
    const match = entries.find(([, op]) => op === operation);
    return match ? match[0] : "red";
  }

  function makeCalculatorRound(difficulty, previousLight = null, previousKey = null, levelNumber = 6, previousFirst = null, previousSecond = null) {
    const operation = operationForDifficulty(difficulty);
    const keys = unlockedRuleKeys(levelNumber);
    let possibleKeys = keys.filter(key => lightForOperation(key, operation) !== previousLight);
    if (!possibleKeys.length) possibleKeys = keys;
    const ruleKey = chooseDifferent(possibleKeys, previousKey);
    const light = lightForOperation(ruleKey, operation);

    let first;
    let second;
    let answer;
    let guard = 0;

    do {
      if (operation === "add") {
        first = randomInt(10, 99);
        second = randomInt(10, 99);
        answer = first + second;
      }

      if (operation === "subtract") {
        first = randomInt(20, 99);
        second = randomInt(10, first);
        answer = first - second;
      }

      if (operation === "multiply") {
        first = randomInt(2, 25);
        second = randomInt(2, 25);
        answer = first * second;
      }

      if (operation === "divide") {
        second = randomInt(2, 12);
        const quotient = randomInt(2, 12);
        first = second * quotient;
        answer = quotient;
      }
      guard += 1;
    } while (first === previousFirst && second === previousSecond && guard < 30);

    return { operation, first, second, answer, light, ruleKey };
  }

  function refreshCalculatorRound(module) {
    const next = makeCalculatorRound(
      module.difficulty,
      module.light,
      module.ruleKey,
      module.levelNumber,
      module.first,
      module.second
    );
    module.operation = next.operation;
    module.first = next.first;
    module.second = next.second;
    module.answer = next.answer;
    module.light = next.light;
    module.ruleKey = next.ruleKey;
    module.entered = "";
  }

  function formatTime(seconds) {
    const s = Math.max(0, seconds);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }


  function makeSerial() {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const a = letters[Math.floor(Math.random() * letters.length)];
    const b = letters[Math.floor(Math.random() * letters.length)];
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return `${a}${b}-${num}`;
  }


  function pluralizeModules(count) {
    return `${count} module${count === 1 ? "" : "s"}`;
  }

  function updateCampaignHome() {
    const resumeLevel = campaign ? campaign.highestUnlockedLevel : 1;
    const config = LEVELS[resumeLevel - 1] || LEVELS[0];
    const lastCleared = campaign ? campaign.lastClearedLevel : 0;

    if (campaignHomeTitleEl) {
      campaignHomeTitleEl.textContent =
        resumeLevel === 1 && lastCleared === 0
          ? "💣 Start at Level 1"
          : `💣 Continue at Level ${resumeLevel}`;
    }

    if (homeLevelLabelEl) {
      homeLevelLabelEl.textContent = `LEVEL ${resumeLevel}`;
    }

    if (homeLevelDetailsEl) {
      homeLevelDetailsEl.textContent =
        `${pluralizeModules(config.clears)} · ${formatTime(config.seconds)}`;
    }

    if (startBtn) {
      startBtn.textContent =
        resumeLevel === 1 && lastCleared === 0
          ? "Start Level 1"
          : `Resume Level ${resumeLevel}`;
    }

    if (campaignProgressNoteEl) {
      if (lastCleared > 0) {
        campaignProgressNoteEl.textContent =
          `Session progress: Level ${lastCleared} cleared. Refreshing the page resets to Level 1.`;
      } else {
        campaignProgressNoteEl.textContent =
          "No progress is saved. Refreshing the page starts again from Level 1.";
      }
    }
  }

  function showHome() {
    updateCampaignHome();
    showScreen("home");
  }

  function playExplosion(onDone) {
    if (!explosionOverlayEl) {
      onDone();
      return;
    }

    if (bombConsoleEl) {
      bombConsoleEl.classList.remove("exploding");
      void bombConsoleEl.offsetWidth;
      bombConsoleEl.classList.add("exploding");
    }

    explosionOverlayEl.classList.remove("active");
    void explosionOverlayEl.offsetWidth;
    explosionOverlayEl.classList.add("active");
    explosionOverlayEl.setAttribute("aria-hidden", "false");

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const delay = reducedMotion ? 650 : 1250;

    window.setTimeout(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
      explosionOverlayEl.classList.remove("active");
      explosionOverlayEl.setAttribute("aria-hidden", "true");
      if (bombConsoleEl) bombConsoleEl.classList.remove("exploding");
      onDone();
    }, delay);
  }

  function assertCampaignDOM() {
    const required = [
      ["startGame", startBtn],
      ["game", screens.game],
      ["result", screens.result],
      ["timer", timerEl],
      ["moduleProgress", moduleProgressEl],
      ["bombModule", bombModuleEl],
      ["levelLabel", levelLabelEl],
      ["campaignHomeTitle", campaignHomeTitleEl],
      ["homeLevelLabel", homeLevelLabelEl],
      ["homeLevelDetails", homeLevelDetailsEl],
      ["campaignProgressNote", campaignProgressNoteEl],
      ["explosionOverlay", explosionOverlayEl],
    ];

    const missing = required.filter(([, node]) => !node).map(([name]) => name);
    if (missing.length) {
      throw new Error(`Campaign UI mismatch. Missing: ${missing.join(", ")}`);
    }
  }

  function startCampaign() {
    campaign = {
      currentLevel: 1,
      highestUnlockedLevel: 1,
      lastClearedLevel: 0,
      calculatorKeypad: shuffle([0,1,2,3,4,5,6,7,8,9]),
      recentModuleTypes: [],
      recentWireSignatures: [],
    };
    startLevel(1);
  }

  function weightedChoice(items, getWeight) {
    const weights = items.map(item => Math.max(0.01, getWeight(item)));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  function chooseBalancedModuleType(pool, seenCounts) {
    const recent = campaign.recentModuleTypes || [];
    return weightedChoice(pool, type => {
      const seen = seenCounts[type] || 0;
      let weight = 1 / (1 + seen * 0.8);
      if (seen === 0) weight *= 1.45;
      if (recent.at(-1) === type) weight *= 0.18;
      else if (recent.at(-2) === type) weight *= 0.5;
      else if (recent.at(-3) === type) weight *= 0.75;
      return weight;
    });
  }

  function buildLevelModules(config) {
    const difficulties = shuffle([...config.mix]);
    const seenCounts = {};

    return difficulties.map(difficulty => {
      const type = chooseBalancedModuleType(config.pool, seenCounts);
      seenCounts[type] = (seenCounts[type] || 0) + 1;

      campaign.recentModuleTypes.push(type);
      if (campaign.recentModuleTypes.length > 4) campaign.recentModuleTypes.shift();

      return makeModule(
        type,
        fixedRules,
        campaign.calculatorKeypad,
        difficulty,
        config.level
      );
    });
  }

  function startLevel(levelNumber) {
    clearInterval(timerId);

    const config = LEVELS[levelNumber - 1];
    if (!config) return;

    campaign.currentLevel = levelNumber;
    campaign.highestUnlockedLevel = Math.max(
      campaign.highestUnlockedLevel || 1,
      levelNumber
    );

    state = {
      levelNumber,
      levelConfig: config,
      totalTime: config.seconds,
      timeLeft: config.seconds,
      strikes: 0,
      maxStrikes: 3,
      moduleIndex: 0,
      rules: fixedRules,
      calculatorKeypad: campaign.calculatorKeypad,
      modules: buildLevelModules(config),
      ended: false,
      serial: makeSerial(),
    };

    showScreen("game");
    updateHeader();
    renderCurrentModule();

    timerId = setInterval(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
      if (!state || state.ended) return;
      state.timeLeft -= 1;
      timerEl.textContent = formatTime(state.timeLeft);
      timerEl.classList.toggle("timer-critical", state.timeLeft <= 30);

      if (state.timeLeft <= 0) {
        failLevel("Time ran out.");
      }
    }, 1000);
  }

  function makeWordChoices(displayWord, correctWord, ruleKey, difficulty) {
    const alternateTargets = Object.keys(ruleKeys)
      .filter(key => key !== ruleKey)
      .map(key => wordRuleMaps[key][displayWord])
      .filter((word, index, arr) => word !== correctWord && arr.indexOf(word) === index);

    const distractors = [];
    const addUnique = word => {
      if (word !== correctWord && !distractors.includes(word)) distractors.push(word);
    };

    if (difficulty === "medium" && alternateTargets.length) {
      addUnique(choice(alternateTargets));
    }

    if (difficulty === "hard" || difficulty === "veryHard") {
      alternateTargets.forEach(addUnique);
    }

    if (difficulty === "veryHard") {
      addUnique(displayWord);
    }

    const candidates = shuffle(wordBank.filter(word => word !== correctWord));
    for (const word of candidates) {
      if (distractors.length >= 5) break;
      addUnique(word);
    }

    return shuffle([correctWord, ...distractors.slice(0, 5)]);
  }

  function makeModule(type, rules, calculatorKeypad, difficulty = "easy", levelNumber = 1) {
    if (type === "color") {
      const word = choice(colorWordList);
      const ruleKey = lookupKeyForDifficulty(difficulty);
      const correct = rules.colorMaps[ruleKey][word];
      const buttons = shuffle(colorList);
      return { type, difficulty, ruleKey, word, correct, buttons, solved: false };
    }

    if (type === "wires") {
      const puzzle = makeWirePuzzle(difficulty, levelNumber);
      return {
        type,
        difficulty,
        ruleKey: puzzle.ruleKey,
        wires: puzzle.wires,
        correctIndex: puzzle.correctIndex,
        wireRuleAnswer: puzzle.answer,
        solved: false,
        cut: [],
      };
    }

    if (type === "animals") {
      const animal = choice(Object.keys(animalRuleMaps.star));
      const ruleKey = lookupKeyForDifficulty(difficulty);
      return {
        type, difficulty, ruleKey, animal,
        correct: rules.animalMaps[ruleKey][animal],
        entered: [], solved: false
      };
    }

    if (type === "directions") {
      const routePuzzle = makeDirectionPuzzle(difficulty);
      return {
        type,
        difficulty,
        place: routePuzzle.place,
        route: routePuzzle.route,
        correct: routePuzzle.steps,
        entered: [],
        solved: false
      };
    }

    if (type === "calculator") {
      const round = makeCalculatorRound(difficulty, null, null, levelNumber);
      return {
        type, difficulty, levelNumber,
        operation: round.operation,
        first: round.first,
        second: round.second,
        answer: round.answer,
        light: round.light,
        ruleKey: round.ruleKey,
        keypad: [...calculatorKeypad],
        entered: "",
        correctRounds: 0,
        roundsToClear: 2,
        solved: false,
      };
    }

    const displayWord = choice(wordBank);
    const availableKeys = unlockedRuleKeys(levelNumber);
    const ruleKey = choice(availableKeys);
    const correctWord = rules.wordMaps[ruleKey][displayWord];
    return {
      type: "category",
      difficulty,
      levelNumber,
      ruleKey,
      displayWord,
      correctWord,
      words: makeWordChoices(displayWord, correctWord, ruleKey, difficulty),
      correctRounds: 0,
      roundsToClear: 3,
      solved: false,
    };
  }

  function updateHeader() {
    if (!state) return;
    timerEl.textContent = formatTime(state.timeLeft);
    strikeCountEl.textContent = state.strikes;
    moduleProgressEl.textContent = `${state.moduleIndex + 1}/${state.modules.length}`;
    if (levelLabelEl) levelLabelEl.textContent = `${state.levelNumber} / ${LEVELS.length}`;
    progressFill.style.width = `${(state.moduleIndex / state.modules.length) * 100}%`;

    strikeLights.forEach((light, index) => {
      if (!light) return;
      light.classList.toggle("on", index < state.strikes);
    });

    if (serialNumberEl) serialNumberEl.textContent = state.serial || "ESL-0000";
    if (bombStatusEl && !state.ended) bombStatusEl.textContent = "ARMED";
    if (moduleLampEl) moduleLampEl.classList.toggle("on", !state.ended);
    timerEl.classList.toggle("timer-critical", state.timeLeft <= 30 && !state.ended);
  }

  function setFeedback(text, kind = "") {
    feedbackEl.textContent = text;
    feedbackEl.className = `feedback ${kind}`.trim();
  }

  function strike(message) {
    if (!state || state.ended) return;
    state.strikes += 1;
    updateHeader();
    setFeedback(`Strike! ${message}`, "bad");
    bombModuleEl.classList.remove("shake");
    void bombModuleEl.offsetWidth;
    bombModuleEl.classList.add("shake");

    if (state.strikes >= state.maxStrikes) {
      setTimeout(() => failLevel("Three strikes."), 450);
    }
  }

  function solveModule() {
    const module = state.modules[state.moduleIndex];
    module.solved = true;
    setFeedback("Correct! Module cleared.", "good");
    progressFill.style.width = `${((state.moduleIndex + 1) / state.modules.length) * 100}%`;

    setTimeout(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
      if (!state || state.ended) return;
      if (state.moduleIndex >= state.modules.length - 1) {
        completeLevel();
      } else {
        state.moduleIndex += 1;
        updateHeader();
        renderCurrentModule();
      }
    }, 650);
  }

  function renderCurrentModule() {
    const module = state.modules[state.moduleIndex];
    updateHeader();
    setFeedback("Describe what you see. Do not look at the manual.");
    bombModuleEl.innerHTML = "";

    const names = {
      color: "Color Panel",
      wires: "Wires",
      animals: "Symbol Numbers",
      directions: "Directions",
      category: "Word Lookup",
      calculator: "Calculator",
    };
    moduleTitleEl.textContent = names[module.type];

    if (module.type === "color") renderColor(module);
    if (module.type === "wires") renderWires(module);
    if (module.type === "animals") renderAnimals(module);
    if (module.type === "directions") renderDirections(module);
    if (module.type === "category") renderCategory(module);
    if (module.type === "calculator") renderCalculator(module);
  }

  function addInstruction(text) {
    const p = document.createElement("p");
    p.className = "module-instruction";
    p.textContent = text;
    bombModuleEl.appendChild(p);
  }

  function addDisplay(text) {
    const div = document.createElement("div");
    div.className = "display";
    div.textContent = text;
    bombModuleEl.appendChild(div);
  }

  function addRuleKey(ruleKey) {
    const info = ruleKeys[ruleKey];
    if (!info) return;
    const wrap = document.createElement("div");
    wrap.className = "rule-key-game";
    const label = document.createElement("span");
    label.className = "rule-key-label";
    label.textContent = "RULE KEY";
    const symbol = document.createElement("strong");
    symbol.className = "rule-key-symbol";
    symbol.textContent = info.symbol;
    wrap.append(label, symbol);
    bombModuleEl.appendChild(wrap);
  }

  function renderColor(module) {
    addInstruction("Tell your partner the word and the rule symbol.");
    addRuleKey(module.ruleKey);
    addDisplay(module.word);

    const grid = document.createElement("div");
    grid.className = "button-grid";
    module.buttons.forEach(color => {
      const btn = document.createElement("button");
      btn.className = `game-button ${color}`;
      btn.type = "button";
      btn.textContent = color.toUpperCase();
      btn.addEventListener("click", () => {
        if (color === module.correct) solveModule();
        else strike("That color is wrong.");
      });
      grid.appendChild(btn);
    });
    bombModuleEl.appendChild(grid);
  }

  function renderWires(module) {
    addInstruction("Tell your partner the rule symbol, how many wires there are, and their colors from top to bottom.");
    addRuleKey(module.ruleKey);

    const wrap = document.createElement("div");
    wrap.className = "wires";

    module.wires.forEach((color, index) => {
      const row = document.createElement("div");
      row.className = "wire";

      const label = document.createElement("strong");
      label.textContent = `${index + 1}. ${color.toUpperCase()}`;

      const line = document.createElement("div");
      line.className = "wire-line";
      line.style.background = wireColor(color);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = module.cut.includes(index) ? "CUT" : "Cut";
      btn.disabled = module.cut.includes(index);

      btn.addEventListener("click", () => {
        if (module.cut.includes(index)) return;
        module.cut.push(index);
        btn.disabled = true;
        btn.textContent = "CUT";
        line.style.opacity = ".25";

        if (index === module.correctIndex) solveModule();
        else strike("Wrong wire.");
      });

      row.append(label, line, btn);
      wrap.appendChild(row);
    });

    bombModuleEl.appendChild(wrap);
  }

  function wireColor(color) {
    const map = {
      red: "#c7434d",
      blue: "#3576c2",
      green: "#3b8a63",
      yellow: "#b8951c",
      black: "#090a0b",
      purple: "#7958aa",
    };
    return map[color] || "#777";
  }

  function renderAnimals(module) {
    addInstruction("Tell your partner the strange symbol and the rule symbol. Press the four numbers in order.");
    addRuleKey(module.ruleKey);

    const symbolDisplay = createSymbolGraphic(module.animal, "animal symbol-display");
    bombModuleEl.appendChild(symbolDisplay);

    const symbolHint = document.createElement("div");
    symbolHint.className = "symbol-hint";
    symbolHint.textContent = "Describe the object in English. Talk about circles, dots, lines, tops, bottoms, or tails.";
    bombModuleEl.appendChild(symbolHint);

    const grid = document.createElement("div");
    grid.className = "number-grid";

    const readout = document.createElement("div");
    readout.className = "sequence-readout";

    [1,2,3,4,5,6,7,8,9].forEach(num => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = num;
      btn.addEventListener("click", () => {
        const expected = module.correct[module.entered.length];

        if (num === expected) {
          module.entered.push(num);
          readout.textContent = module.entered.join("  ");

          if (module.entered.length === module.correct.length) {
            solveModule();
          }
        } else {
          module.entered = [];
          readout.textContent = "";
          strike("Wrong number. Start the four-number sequence again.");
        }
      });
      grid.appendChild(btn);
    });

    bombModuleEl.append(grid, readout);
  }

  function renderDirections(module) {
    addInstruction("Tell your partner the place and the route number. Press all arrows in the order they give you.");
    addDisplay(module.place.replaceAll("_", " "));
    addDisplay(routeLabels[module.route] || `ROUTE ${module.route}`);

    const grid = document.createElement("div");
    grid.className = "arrow-grid";

    const arrows = { up: "↑", left: "←", down: "↓", right: "→" };
    Object.entries(arrows).forEach(([dir, symbol]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.dir = dir;
      btn.textContent = symbol;
      btn.setAttribute("aria-label", dir);
      btn.addEventListener("click", () => {
        const expected = module.correct[module.entered.length];
        if (dir === expected) {
          module.entered.push(dir);
          readout.textContent = module.entered.map(d => arrows[d]).join("  ");
          if (module.entered.length === module.correct.length) solveModule();
        } else {
          module.entered = [];
          readout.textContent = "";
          strike("Wrong direction. Start the route again.");
        }
      });
      grid.appendChild(btn);
    });

    const readout = document.createElement("div");
    readout.className = "sequence-readout";

    bombModuleEl.append(grid, readout);
  }

  function refreshWordLookupRound(module) {
    let nextDisplay = choice(wordBank);
    let guard = 0;
    while (nextDisplay === module.displayWord && guard < 20) {
      nextDisplay = choice(wordBank);
      guard += 1;
    }

    const keys = unlockedRuleKeys(module.levelNumber);
    const nextKey = chooseDifferent(keys, module.ruleKey);

    module.displayWord = nextDisplay;
    module.ruleKey = nextKey;
    module.correctWord = state.rules.wordMaps[nextKey][nextDisplay];
    module.words = makeWordChoices(
      nextDisplay,
      module.correctWord,
      nextKey,
      module.difficulty
    );
  }

  function renderCategory(module) {
    bombModuleEl.innerHTML = "";

    addInstruction(
      `Tell your partner the display word, rule symbol, and six choices. Correct answers: ${module.correctRounds}/${module.roundsToClear}`
    );
    addRuleKey(module.ruleKey);
    addDisplay(module.displayWord);

    const progress = document.createElement("div");
    progress.className = "sequence-readout";
    progress.textContent = `Correct: ${module.correctRounds} / ${module.roundsToClear}`;
    bombModuleEl.appendChild(progress);

    const grid = document.createElement("div");
    grid.className = "word-grid six-choices";

    module.words.forEach(word => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = word;

      btn.addEventListener("click", () => {
        if (!state || state.ended || module.solved) return;

        if (word === module.correctWord) {
          module.correctRounds += 1;

          if (module.correctRounds >= module.roundsToClear) {
            solveModule();
            return;
          }

          setFeedback(
            `Correct! ${module.correctRounds}/${module.roundsToClear}. New word.`,
            "good"
          );

          refreshWordLookupRound(module);
          setTimeout(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
            if (!state || state.ended || module.solved) return;
            renderCategory(module);
          }, 350);
        } else {
          strike("Wrong word. New word.");

          if (!state || state.ended || module.solved) return;

          refreshWordLookupRound(module);
          setTimeout(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
            if (!state || state.ended || module.solved) return;
            renderCategory(module);
          }, 350);
        }
      });

      grid.appendChild(btn);
    });

    bombModuleEl.appendChild(grid);
  }

  function renderCalculator(module) {
    bombModuleEl.innerHTML = "";

    addInstruction(
      `Describe both numbers, the light color, and the rule symbol. Correct answers: ${module.correctRounds}/${module.roundsToClear}`
    );
    addRuleKey(module.ruleKey);

    const calc = document.createElement("div");
    calc.className = "calculator-module";

    const equation = document.createElement("div");
    equation.className = "calculator-equation";

    const first = document.createElement("div");
    first.className = "calculator-number calculator-number-words";
    first.textContent = numberToWords(module.first);

    const lightBox = document.createElement("div");
    lightBox.className = "calculator-light-box";

    const lightLabel = document.createElement("span");
    lightLabel.textContent = "OPERATION";

    const light = document.createElement("div");
    light.className = `calculator-light ${module.light}`;
    light.setAttribute("aria-label", `${module.light} operation light`);

    lightBox.append(lightLabel, light);

    const second = document.createElement("div");
    second.className = "calculator-number calculator-number-words";
    second.textContent = numberToWords(module.second);

    equation.append(first, lightBox, second);

    const progress = document.createElement("div");
    progress.className = "calculator-progress";
    progress.textContent = `Correct: ${module.correctRounds} / ${module.roundsToClear}`;

    const answerDisplay = document.createElement("div");
    answerDisplay.className = "calculator-answer";
    answerDisplay.textContent = module.entered || "—";

    const pad = document.createElement("div");
    pad.className = "calculator-keypad";

    const updateAnswerDisplay = () => {
      answerDisplay.textContent = module.entered || "—";
    };

    module.keypad.forEach(num => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calculator-key";
      btn.textContent = num;

      btn.addEventListener("click", () => {
        if (!state || state.ended || module.solved) return;
        if (module.entered.length >= 5) return;
        module.entered += String(num);
        updateAnswerDisplay();
      });

      pad.appendChild(btn);
    });

    const controls = document.createElement("div");
    controls.className = "calculator-controls";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "secondary calculator-control";
    back.textContent = "⌫";
    back.setAttribute("aria-label", "Backspace");
    back.addEventListener("click", () => {
      module.entered = module.entered.slice(0, -1);
      updateAnswerDisplay();
    });

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "secondary calculator-control";
    clear.textContent = "CLEAR";
    clear.addEventListener("click", () => {
      module.entered = "";
      updateAnswerDisplay();
    });

    const enter = document.createElement("button");
    enter.type = "button";
    enter.className = "primary calculator-enter";
    enter.textContent = "ENTER";

    enter.addEventListener("click", () => {
      if (!state || state.ended || module.solved) return;
      if (module.entered === "") {
        setFeedback("Enter an answer first.", "bad");
        return;
      }

      const submitted = Number(module.entered);

      if (submitted === module.answer) {
        module.correctRounds += 1;

        if (module.correctRounds >= module.roundsToClear) {
          solveModule();
          return;
        }

        setFeedback(
          `Correct! ${module.correctRounds}/${module.roundsToClear}. New calculation.`,
          "good"
        );

        refreshCalculatorRound(module);

        setTimeout(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
          if (!state || state.ended || module.solved) return;
          renderCalculator(module);
        }, 350);
      } else {
        strike("Wrong calculation. New calculation.");

        if (!state || state.ended || module.solved) return;

        refreshCalculatorRound(module);

        setTimeout(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
          if (!state || state.ended || module.solved) return;
          renderCalculator(module);
        }, 350);
      }
    });

    controls.append(back, clear, enter);
    calc.append(equation, progress, answerDisplay, pad, controls);
    bombModuleEl.appendChild(calc);
  }

  function completeLevel() {
    if (!state || state.ended) return;

    state.ended = true;
    clearInterval(timerId);

    if (bombStatusEl) bombStatusEl.textContent = "SAFE";
    if (moduleLampEl) moduleLampEl.classList.remove("on");

    const finalLevel = state.levelNumber >= LEVELS.length;

    campaign.lastClearedLevel = Math.max(
      campaign.lastClearedLevel || 0,
      state.levelNumber
    );

    if (!finalLevel) {
      campaign.highestUnlockedLevel = Math.max(
        campaign.highestUnlockedLevel || 1,
        state.levelNumber + 1
      );
    }

    document.getElementById("resultIcon").textContent = finalLevel ? "🏆" : "✅";
    document.getElementById("resultTitle").textContent =
      finalLevel ? "Campaign Complete!" : `Level ${state.levelNumber} Cleared!`;

    document.getElementById("resultText").textContent = finalLevel
      ? `You cleared all ${LEVELS.length} levels. Final level finished with ${formatTime(state.timeLeft)} left.`
      : `You cleared ${state.modules.length} module${state.modules.length === 1 ? "" : "s"} with ${state.strikes} strike${state.strikes === 1 ? "" : "s"} and ${formatTime(state.timeLeft)} left.`;

    playAgainBtn.textContent = finalLevel
      ? "Play Again from Level 1"
      : `Start Level ${state.levelNumber + 1}`;

    resultAction = finalLevel ? "restart" : "next";
    showScreen("result");
  }

  function failLevel(reason) {
    if (!state || state.ended) return;

    state.ended = true;
    clearInterval(timerId);

    if (bombStatusEl) bombStatusEl.textContent = "FAILED";
    if (moduleLampEl) moduleLampEl.classList.remove("on");

    const failedLevel = state.levelNumber;

    playExplosion(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
      document.getElementById("resultIcon").textContent = "💥";
      document.getElementById("resultTitle").textContent = `Level ${failedLevel} Failed`;
      document.getElementById("resultText").textContent =
        `${reason} You must clear Level ${failedLevel} before advancing.`;

      playAgainBtn.textContent = `Retry Level ${failedLevel}`;
      resultAction = "retry";
      showScreen("result");
    });
  }

  assertCampaignDOM();
  updateCampaignHome();

  startBtn.addEventListener("click", () => {
    if (!campaign) {
      startCampaign();
      return;
    }

    startLevel(campaign.highestUnlockedLevel || 1);
  });

  playAgainBtn.addEventListener("click", () => {
    if (resultAction === "next") {
      startLevel(campaign.currentLevel + 1);
      return;
    }

    if (resultAction === "retry") {
      startLevel(campaign.currentLevel);
      return;
    }

    startCampaign();
  });

  abortBtn.addEventListener("click", () => {
    clearInterval(timerId);

    if (state) {
      state.ended = true;
    }

    state = null;
    resultAction = "start";
    playAgainBtn.textContent = "Play Again";

    // Keep campaign in memory for this browser session.
    // Refreshing the page still resets everything to Level 1.
    showHome();
  });




})();
