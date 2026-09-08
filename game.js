(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
  const screens = {
    home: document.getElementById("home"),
    game: document.getElementById("game"),
    result: document.getElementById("result"),
  };

  const startBtn = document.getElementById("startGame");
  const resetProgressBtn = document.getElementById("resetProgress");
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
  const levelCountdownOverlayEl = document.getElementById("levelCountdownOverlay");
  const levelCountdownNumberEl = document.getElementById("levelCountdownNumber");
  const bombConsoleEl = document.querySelector(".bomb-console");

  const teacherTestPanelEl = document.getElementById("teacherTestPanel");
  const teacherLevelSelectEl = document.getElementById("teacherLevelSelect");
  const teacherModuleSelectEl = document.getElementById("teacherModuleSelect");
  const teacherDifficultySelectEl = document.getElementById("teacherDifficultySelect");
  const teacherNoTimerEl = document.getElementById("teacherNoTimer");
  const teacherNoStrikesEl = document.getElementById("teacherNoStrikes");
  const teacherSkipCountdownEl = document.getElementById("teacherSkipCountdown");
  const teacherTestLevelBtn = document.getElementById("teacherTestLevel");
  const teacherTestModuleBtn = document.getElementById("teacherTestModule");
  const teacherModeCloseBtn = document.getElementById("teacherModeClose");

  let state = null;
  let campaign = null;
  let resultAction = "start";
  let timerId = null;
  let levelCountdownIntervalId = null;
  let teacherModeUnlocked = false;
  let teacherCodeBuffer = "";
  let teacherCodeResetId = null;

  const TEACHER_CODE_LENGTH = 14;
  const TEACHER_CODE_SHA256 = "f82864068cf3223898ff9a29882fa4439e3ceb7e2617242814efe8052d097b5e";
  const TEACHER_CODE_FNV1A = 3183589378;

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



  const morseCodeMap = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..",
  };

  function morseLetterPool(difficulty) {
    const letters = Object.keys(morseCodeMap);

    if (difficulty === "easy") {
      return letters.filter(letter => morseCodeMap[letter].length <= 2);
    }

    if (difficulty === "medium") {
      return letters.filter(letter => {
        const length = morseCodeMap[letter].length;
        return length >= 2 && length <= 3;
      });
    }

    if (difficulty === "hard") {
      return letters.filter(letter => morseCodeMap[letter].length >= 3);
    }

    return letters.filter(letter => morseCodeMap[letter].length === 4);
  }

  function morseLineCount(difficulty) {
    if (difficulty === "easy") return 1;
    if (difficulty === "medium") return 2;
    if (difficulty === "hard") return 3;
    return 4;
  }

  function makeMorsePuzzle(difficulty) {
    const pool = morseLetterPool(difficulty);
    const lineCount = morseLineCount(difficulty);
    const recent = campaign?.recentMorseWords || [];
    const targets = [];

    while (targets.length < lineCount) {
      let candidates = pool.filter(letter =>
        !targets.includes(letter) &&
        !recent.includes(letter)
      );

      if (!candidates.length) {
        candidates = pool.filter(letter => !targets.includes(letter));
      }

      if (!candidates.length) break;
      targets.push(choice(candidates));
    }

    if (campaign) {
      campaign.recentMorseWords = campaign.recentMorseWords || [];
      targets.forEach(letter => campaign.recentMorseWords.push(letter));
      while (campaign.recentMorseWords.length > 18) {
        campaign.recentMorseWords.shift();
      }
    }

    return {
      targets,
      codes: targets.map(letter => morseCodeMap[letter]),
      entries: Array(lineCount).fill(""),
    };
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


  const scrollAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const scrollDecoderColumns = [["W", "Q", "N", "C", "P", "T", "J", "M", "S", "K", "V", "D", "R", "B", "Z", "F", "A", "I", "X", "O", "U", "Y", "E", "L", "G", "H"], ["R", "A", "H", "J", "G", "K", "U", "O", "M", "L", "E", "T", "D", "Y", "S", "W", "Z", "V", "Q", "F", "P", "I", "C", "N", "X", "B"], ["P", "Z", "L", "A", "C", "M", "T", "Y", "V", "N", "X", "R", "W", "U", "E", "S", "Q", "K", "O", "B", "J", "I", "H", "F", "G", "D"], ["Y", "R", "S", "F", "X", "A", "Z", "V", "H", "C", "E", "Q", "J", "O", "K", "W", "M", "I", "N", "T", "L", "U", "D", "G", "P", "B"], ["B", "Q", "M", "E", "K", "P", "O", "U", "F", "J", "H", "C", "N", "V", "Y", "X", "L", "G", "Z", "A", "W", "T", "S", "D", "I", "R"]];
  const scrollWordBank = ["ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARGUE", "ARISE", "ARMED", "AVOID", "AWAKE", "AWARD", "AWARE", "BADLY", "BAKER", "BASED", "BASIC", "BEACH", "BEGAN", "BEGIN", "BEING", "BELOW", "BENCH", "BERRY", "BIRTH", "BLACK", "BLAME", "BLANK", "BLIND", "BLOCK", "BLOOD", "BOARD", "BRAIN", "BRAND", "BREAD", "BREAK", "BRICK", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "PIZZA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLERK", "CLICK", "CLIMB", "CLOCK", "CLOSE", "CLOUD", "COACH", "COAST", "COLOR", "COULD", "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CURVE", "CYCLE", "DAILY", "DANCE", "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN", "DRAFT", "DRAMA", "DRAWN", "DREAM", "DRESS", "DRINK", "DRIVE", "DROVE", "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH", "FLEET", "FLOOR", "FLOUR", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE", "GRAIN", "GRAND", "GRANT", "GRASS", "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY", "HEART", "HEAVY", "HENCE", "HONEY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JOINT", "JUDGE", "KNOWN", "LABEL", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEAST", "LEAVE", "LEGAL", "LEVEL", "LIGHT", "LIMIT", "LOCAL", "LOGIC", "LOOSE", "LOWER", "LUCKY", "LUNCH", "MAGIC", "MAJOR", "MAKER", "MARCH", "MATCH", "MAYBE", "MAYOR", "METAL", "MIGHT", "MINOR", "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE", "NORTH", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY", "PEACE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "QUEEN", "QUICK", "QUIET", "RADIO", "RAISE", "RANGE", "RAPID", "REACH", "READY", "RIGHT", "RIVER", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF", "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT", "SINCE", "SIXTH", "SIXTY", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPEAK", "SPEED", "SPEND", "SPENT", "SPLIT", "SPORT", "STAFF", "STAGE", "STAND", "START", "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STYLE", "SUGAR", "TABLE", "TAKEN", "TASTE", "TEACH", "TEETH", "THANK", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNDER", "UNION", "UNITY", "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALUE", "VIDEO", "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE", "WHITE", "WHOLE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH", "WOULD", "WRITE", "WRONG", "YOUNG", "YOUTH"];
  const scrollEasyWords = ["APPLE", "BEACH", "BLACK", "BREAD", "CHAIR", "CHILD", "CLASS", "CLEAN", "CLOUD", "COLOR", "COUNT", "DANCE", "DREAM", "DRINK", "DRIVE", "EARTH", "EIGHT", "ENJOY", "ENTER", "EVERY", "FIELD", "FIGHT", "FIRST", "FLOOR", "FRESH", "FRONT", "FRUIT", "FUNNY", "GIANT", "GIVEN", "GLASS", "GOING", "GRADE", "GRAND", "GRASS", "GREAT", "GREEN", "GROUP", "HAPPY", "HEART", "HEAVY", "HONEY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IMAGE", "LARGE", "LATER", "LAUGH", "LEARN", "LEAVE", "LIGHT", "LOCAL", "LUCKY", "LUNCH", "MAGIC", "MARCH", "MATCH", "MAYBE", "MONEY", "MONTH", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NIGHT", "NOISE", "NORTH", "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "PAINT", "PAPER", "PARTY", "PEACE", "PHONE", "PHOTO", "PIECE", "PIZZA", "PLACE", "PLANE", "PLANT", "POINT", "POWER", "PRICE", "QUICK", "QUIET", "RADIO", "READY", "RIGHT", "RIVER", "ROUND", "SHAPE", "SHARE", "SHIRT", "SHORT", "SIGHT", "SKILL", "SLEEP", "SMALL", "SMART", "SMILE", "SOLID", "SOUND", "SOUTH", "SPACE", "SPEAK", "SPEED", "SPORT", "STAND", "START", "STATE", "STICK", "STILL", "STONE", "STORE", "STORM", "STORY", "STUDY", "STYLE", "SUGAR", "TABLE", "TASTE", "TEACH", "TEETH", "THANK", "THERE", "THING", "THINK", "THREE", "TIMES", "TIRED", "TODAY", "TOUCH", "TOWER", "TRAIN", "TRUCK", "UNDER", "VIDEO", "VISIT", "VOICE", "WATCH", "WATER", "WHERE", "WHICH", "WHITE", "WHOLE", "WORLD", "WRITE", "YOUNG"];

  function scrollWordPool(difficulty) {
    if (difficulty === "easy") return scrollEasyWords;
    if (difficulty === "medium") return scrollWordBank.slice(0, 300);
    return scrollWordBank;
  }

  function codeForScrollLetter(position, targetLetter) {
    const targetIndex = scrollDecoderColumns[position].indexOf(targetLetter);
    return scrollAlphabet[targetIndex];
  }

  function makeScrollPuzzle(difficulty) {
    const pool = scrollWordPool(difficulty);
    const recent = campaign?.recentScrollWords || [];
    const available = pool.filter(word => !recent.includes(word));
    const word = choice(available.length ? available : pool);
    const codes = word.split("").map((letter, position) => codeForScrollLetter(position, letter));

    let currentLetters = Array.from({length:5}, () => choice(scrollAlphabet));
    let alreadyCorrect = currentLetters.filter((letter, i) => letter === word[i]).length;
    let guard = 0;
    while (alreadyCorrect > 1 && guard < 50) {
      currentLetters = Array.from({length:5}, () => choice(scrollAlphabet));
      alreadyCorrect = currentLetters.filter((letter, i) => letter === word[i]).length;
      guard += 1;
    }

    if (campaign) {
      campaign.recentScrollWords = campaign.recentScrollWords || [];
      campaign.recentScrollWords.push(word);
      if (campaign.recentScrollWords.length > 14) campaign.recentScrollWords.shift();
    }

    return { word, codes, currentLetters, revealed: [false, false, false, false, false] };
  }

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




  function memoryStageCount(difficulty) {
    if (difficulty === "easy") return 3;
    if (difficulty === "medium") return 4;
    return 5;
  }

  const memoryStageRules = [
    { 1: 1, 2: 2, 3: 3, 4: 4 },
    { 1: 2, 2: 1, 3: 4, 4: 3 },
    { 1: 3, 2: 4, 3: 1, 4: 2 },
    { 1: 4, 2: 3, 3: 2, 4: 1 },
    { 1: 2, 2: 3, 3: 4, 4: 1 },
  ];

  function makeMemoryPuzzle(difficulty) {
    const stages = memoryStageCount(difficulty);
    const buttonOrder = shuffle([1, 2, 3, 4]);
    const displays = [];
    for (let i = 0; i < stages; i++) {
      let value = choice([1, 2, 3, 4]);
      if (i > 0 && value === displays[i - 1]) {
        const alternatives = [1, 2, 3, 4].filter(number => number !== displays[i - 1]);
        value = choice(alternatives);
      }
      displays.push(value);
    }
    return {
      stageCount: stages,
      stageIndex: 0,
      buttonOrder,
      displays,
      labelsVisible: true,
    };
  }

  const LEVELS = [
    { level: 1,  clears: 1,  seconds: 180, pool: ["color"], mix: ["easy"] },
    { level: 2,  clears: 1,  seconds: 150, pool: ["color", "animals"], mix: ["easy"], guaranteed: "animals" },
    { level: 3,  clears: 2,  seconds: 240, pool: ["color", "animals", "directions"], mix: ["easy", "medium"], guaranteed: "directions" },
    { level: 4,  clears: 2,  seconds: 220, pool: ["color", "animals", "directions", "wires"], mix: ["easy", "medium"], guaranteed: "wires" },
    { level: 5,  clears: 2,  seconds: 200, pool: ["color", "animals", "directions", "wires", "category"], mix: ["medium", "medium"], guaranteed: "category" },
    { level: 6,  clears: 3,  seconds: 300, pool: ["color", "animals", "directions", "wires", "category", "calculator"], mix: ["easy", "medium", "medium"], guaranteed: "calculator" },
    { level: 7,  clears: 3,  seconds: 270, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder"], mix: ["easy", "medium", "hard"], guaranteed: "decoder" },
    { level: 8,  clears: 3,  seconds: 240, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse"], mix: ["medium", "medium", "hard"], guaranteed: "morse" },
    { level: 9,  clears: 4,  seconds: 330, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["easy", "medium", "medium", "hard"], guaranteed: "memory" },
    { level: 10, clears: 4,  seconds: 300, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "medium", "hard", "hard"] },
    { level: 11, clears: 4,  seconds: 270, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard"] },
    { level: 12, clears: 5,  seconds: 390, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["easy", "medium", "medium", "hard", "hard"] },
    { level: 13, clears: 5,  seconds: 360, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "medium", "hard", "hard", "hard"] },
    { level: 14, clears: 5,  seconds: 330, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard", "veryHard"] },
    { level: 15, clears: 6,  seconds: 420, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "medium", "hard", "hard", "hard", "veryHard"] },
    { level: 16, clears: 6,  seconds: 390, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard", "veryHard", "veryHard"] },
    { level: 17, clears: 6,  seconds: 375, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard", "veryHard", "veryHard"] },
    { level: 18, clears: 7,  seconds: 435, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard", "hard", "veryHard", "veryHard"] },
    { level: 19, clears: 7,  seconds: 450, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard", "veryHard", "veryHard", "veryHard"] },
    { level: 20, clears: 10, seconds: 540, pool: ["color", "animals", "directions", "wires", "category", "calculator", "decoder", "morse", "memory"], mix: ["medium", "hard", "hard", "hard", "hard", "hard", "veryHard", "veryHard", "veryHard", "veryHard"] },
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


  const CAMPAIGN_SAVE_KEY = "eslDefuseCampaignSaveV1";

  function normalizeSavedCampaign(data) {
    if (!data || typeof data !== "object") return null;

    const highestUnlockedLevel = Math.min(
      LEVELS.length,
      Math.max(1, Number(data.highestUnlockedLevel) || 1)
    );
    const lastClearedLevel = Math.min(
      LEVELS.length,
      Math.max(0, Number(data.lastClearedLevel) || 0)
    );

    const validKeypad = Array.isArray(data.calculatorKeypad) &&
      data.calculatorKeypad.length === 10 &&
      [...data.calculatorKeypad].sort((a, b) => a - b).every((value, index) => value === index);

    return {
      currentLevel: highestUnlockedLevel,
      highestUnlockedLevel,
      lastClearedLevel,
      calculatorKeypad: validKeypad ? [...data.calculatorKeypad] : shuffle([0,1,2,3,4,5,6,7,8,9]),
      recentModuleTypes: Array.isArray(data.recentModuleTypes) ? data.recentModuleTypes.slice(-4) : [],
      recentWireSignatures: Array.isArray(data.recentWireSignatures) ? data.recentWireSignatures.slice(-8) : [],
      recentScrollWords: Array.isArray(data.recentScrollWords) ? data.recentScrollWords.slice(-14) : [],
      recentMorseWords: Array.isArray(data.recentMorseWords) ? data.recentMorseWords.slice(-18) : [],
    };
  }

  function loadCampaignSave() {
    try {
      const raw = window.localStorage.getItem(CAMPAIGN_SAVE_KEY);
      if (!raw) return null;
      return normalizeSavedCampaign(JSON.parse(raw));
    } catch (error) {
      console.warn("Could not load campaign save.", error);
      return null;
    }
  }

  function saveCampaignProgress() {
    if (!campaign) return;

    const payload = {
      version: 1,
      highestUnlockedLevel: campaign.highestUnlockedLevel || 1,
      lastClearedLevel: campaign.lastClearedLevel || 0,
      calculatorKeypad: campaign.calculatorKeypad || [],
      recentModuleTypes: campaign.recentModuleTypes || [],
      recentWireSignatures: campaign.recentWireSignatures || [],
      recentScrollWords: campaign.recentScrollWords || [],
      recentMorseWords: campaign.recentMorseWords || [],
      savedAt: Date.now(),
    };

    try {
      window.localStorage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Could not save campaign progress.", error);
    }
  }

  function clearCampaignSave() {
    try {
      window.localStorage.removeItem(CAMPAIGN_SAVE_KEY);
    } catch (error) {
      console.warn("Could not clear campaign save.", error);
    }
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
          `Saved progress: Level ${lastCleared} cleared. Continue from Level ${resumeLevel} on this browser.`;
      } else {
        campaignProgressNoteEl.textContent =
          "Progress saves automatically after each cleared level on this browser.";
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

  function ensureCampaignForTeacher() {
    if (campaign) return;
    campaign = {
      currentLevel: 1,
      highestUnlockedLevel: 1,
      lastClearedLevel: 0,
      calculatorKeypad: shuffle([0,1,2,3,4,5,6,7,8,9]),
      recentModuleTypes: [],
      recentWireSignatures: [],
      recentScrollWords: [],
      recentMorseWords: [],
    };
  }

  function teacherDifficultyLabel(value) {
    const labels = { easy: "Easy", medium: "Medium", hard: "Hard", veryHard: "Very Hard" };
    return labels[value] || value;
  }

  function teacherModuleLabel(value) {
    const labels = {
      color: "Color Panel",
      animals: "Symbol Numbers",
      directions: "Directions",
      wires: "Wires",
      category: "Word Lookup",
      calculator: "Calculator",
      decoder: "Letter Scrolls",
      morse: "Morse Code",
      memory: "Memory",
    };
    return labels[value] || value;
  }

  function teacherSettings() {
    return {
      noTimer: !!teacherNoTimerEl?.checked,
      noStrikes: !!teacherNoStrikesEl?.checked,
      skipCountdown: !!teacherSkipCountdownEl?.checked,
    };
  }

  function beginTeacherState({ levelNumber, config, modules, label }) {
    clearInterval(timerId);
    clearLevelCountdown();
    ensureCampaignForTeacher();

    const settings = teacherSettings();
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
      modules,
      ended: false,
      serial: makeSerial(),
      teacherTest: true,
      teacherTestLabel: label,
      teacherNoTimer: settings.noTimer,
      teacherNoStrikes: settings.noStrikes,
    };

    showScreen("game");
    updateHeader();
    renderCurrentModule();

    const begin = () => {
      if (!state || state.ended) return;
      setFeedback("Teacher test running.");
      if (!state.teacherNoTimer) beginLevelTimer();
    };

    if (settings.skipCountdown) begin();
    else runLevelCountdown(begin);
  }

  function startTeacherLevel(levelNumber) {
    ensureCampaignForTeacher();
    const config = LEVELS[levelNumber - 1];
    if (!config) return;
    beginTeacherState({
      levelNumber,
      config,
      modules: buildLevelModules(config),
      label: `Level ${levelNumber}`,
    });
  }

  function startTeacherModule(type, difficulty, levelNumber) {
    ensureCampaignForTeacher();
    const contextConfig = LEVELS[levelNumber - 1] || LEVELS[0];
    const config = {
      level: levelNumber,
      clears: 1,
      seconds: 300,
      pool: [type],
      mix: [difficulty],
    };
    const module = makeModule(
      type,
      fixedRules,
      campaign.calculatorKeypad,
      difficulty,
      levelNumber
    );

    beginTeacherState({
      levelNumber,
      config,
      modules: [module],
      label: `${teacherModuleLabel(type)} · ${teacherDifficultyLabel(difficulty)} · Level ${contextConfig.level} rules`,
    });
  }

  function fnv1a32(value) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  async function matchesTeacherCode(value) {
    try {
      if (window.crypto?.subtle && window.TextEncoder) {
        const bytes = new TextEncoder().encode(value);
        const digest = await window.crypto.subtle.digest("SHA-256", bytes);
        const hex = Array.from(new Uint8Array(digest))
          .map(byte => byte.toString(16).padStart(2, "0"))
          .join("");
        return hex === TEACHER_CODE_SHA256;
      }
    } catch (error) {
      // Fall through to the local checksum for file:// testing.
    }
    return fnv1a32(value) === TEACHER_CODE_FNV1A;
  }

  function unlockTeacherMode() {
    teacherModeUnlocked = true;
    teacherCodeBuffer = "";
    clearTimeout(teacherCodeResetId);
    if (teacherTestPanelEl) teacherTestPanelEl.hidden = false;
    teacherTestPanelEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hideTeacherMode() {
    teacherModeUnlocked = false;
    teacherCodeBuffer = "";
    clearTimeout(teacherCodeResetId);
    if (teacherTestPanelEl) teacherTestPanelEl.hidden = true;
  }

  function startCampaign() {
    campaign = {
      currentLevel: 1,
      highestUnlockedLevel: 1,
      lastClearedLevel: 0,
      calculatorKeypad: shuffle([0,1,2,3,4,5,6,7,8,9]),
      recentModuleTypes: [],
      recentWireSignatures: [],
      recentScrollWords: [],
      recentMorseWords: [],
    };
    saveCampaignProgress();
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

  function difficultyPriority(difficulty) {
    const order = { easy: 1, medium: 2, hard: 3, veryHard: 4 };
    return order[difficulty] || 99;
  }

  function buildLevelModules(config) {
    const seenCounts = {};
    const modules = [];
    const difficulties = [...config.mix];

    if (config.guaranteed && difficulties.length) {
      const guaranteedDifficulty = [...difficulties].sort((a, b) => difficultyPriority(a) - difficultyPriority(b))[0];
      const guaranteedIndex = difficulties.indexOf(guaranteedDifficulty);
      if (guaranteedIndex !== -1) difficulties.splice(guaranteedIndex, 1);

      seenCounts[config.guaranteed] = 1;
      campaign.recentModuleTypes.push(config.guaranteed);
      if (campaign.recentModuleTypes.length > 4) campaign.recentModuleTypes.shift();

      modules.push(makeModule(
        config.guaranteed,
        fixedRules,
        campaign.calculatorKeypad,
        guaranteedDifficulty,
        config.level
      ));
    }

    shuffle(difficulties).forEach(difficulty => {
      const type = chooseBalancedModuleType(config.pool, seenCounts);
      seenCounts[type] = (seenCounts[type] || 0) + 1;

      campaign.recentModuleTypes.push(type);
      if (campaign.recentModuleTypes.length > 4) campaign.recentModuleTypes.shift();

      modules.push(makeModule(
        type,
        fixedRules,
        campaign.calculatorKeypad,
        difficulty,
        config.level
      ));
    });

    return shuffle(modules);
  }

  function clearLevelCountdown() {
    clearInterval(levelCountdownIntervalId);
    levelCountdownIntervalId = null;

    if (levelCountdownOverlayEl) {
      levelCountdownOverlayEl.classList.remove("active");
      levelCountdownOverlayEl.setAttribute("aria-hidden", "true");
    }

    if (levelCountdownNumberEl) {
      levelCountdownNumberEl.textContent = "3";
    }

    if (bombConsoleEl) {
      bombConsoleEl.classList.remove("countdown-active");
    }
  }

  function beginLevelTimer() {
    clearInterval(timerId);
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

  function runLevelCountdown(onComplete) {
    clearLevelCountdown();

    if (!levelCountdownOverlayEl || !levelCountdownNumberEl) {
      onComplete();
      return;
    }

    let count = 3;
    levelCountdownNumberEl.textContent = String(count);
    levelCountdownOverlayEl.classList.add("active");
    levelCountdownOverlayEl.setAttribute("aria-hidden", "false");
    if (bombConsoleEl) bombConsoleEl.classList.add("countdown-active");
    setFeedback("Get ready...", "");

    levelCountdownIntervalId = setInterval(() => {
      count -= 1;

      if (count > 0) {
        levelCountdownNumberEl.textContent = String(count);
        return;
      }

      clearLevelCountdown();
      onComplete();
    }, 1000);
  }

  function startLevel(levelNumber) {
    clearInterval(timerId);
    clearLevelCountdown();

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
    runLevelCountdown(() => {
      if (!state || state.ended) return;
      setFeedback("Describe what you see. Do not look at the manual.");
      beginLevelTimer();
    });
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

    if (type === "memory") {
      const puzzle = makeMemoryPuzzle(difficulty);
      return {
        type,
        difficulty,
        stageCount: puzzle.stageCount,
        stageIndex: puzzle.stageIndex,
        buttonOrder: puzzle.buttonOrder,
        mapping: puzzle.mapping,
        displays: puzzle.displays,
        labelsVisible: puzzle.labelsVisible,
        mappingVisible: puzzle.mappingVisible,
        solved: false,
      };
    }

    if (type === "morse") {
      const puzzle = makeMorsePuzzle(difficulty);
      return {
        type,
        difficulty,
        targets: puzzle.targets,
        codes: puzzle.codes,
        entries: puzzle.entries,
        solved: false,
      };
    }

    if (type === "decoder") {
      const puzzle = makeScrollPuzzle(difficulty);
      return {
        type,
        difficulty,
        targetWord: puzzle.word,
        codes: puzzle.codes,
        currentLetters: puzzle.currentLetters,
        revealed: puzzle.revealed,
        solved: false,
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
    timerEl.textContent = state.teacherNoTimer ? "∞" : formatTime(state.timeLeft);
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
    timerEl.classList.toggle("timer-critical", !state.teacherNoTimer && state.timeLeft <= 30 && !state.ended);
  }

  function setFeedback(text, kind = "") {
    feedbackEl.textContent = text;
    feedbackEl.className = `feedback ${kind}`.trim();
  }

  function triggerStrikeFlash(count) {
    if (!bombConsoleEl) return;
    bombConsoleEl.classList.remove("strike-flash-once", "strike-flash-triple");
    void bombConsoleEl.offsetWidth;

    if (count === 1) {
      bombConsoleEl.classList.add("strike-flash-once");
      setTimeout(() => bombConsoleEl.classList.remove("strike-flash-once"), 520);
      return;
    }

    if (count === 2) {
      bombConsoleEl.classList.add("strike-flash-triple");
      setTimeout(() => bombConsoleEl.classList.remove("strike-flash-triple"), 1180);
    }
  }

  function strike(message) {
    if (!state || state.ended) return;

    if (state.teacherTest && state.teacherNoStrikes) {
      setFeedback(`Teacher test: ${message}`, "bad");
      bombModuleEl.classList.remove("shake");
      void bombModuleEl.offsetWidth;
      bombModuleEl.classList.add("shake");
      return;
    }

    state.strikes += 1;
    updateHeader();
    setFeedback(`Strike! ${message}`, "bad");
    bombModuleEl.classList.remove("shake");
    void bombModuleEl.offsetWidth;
    bombModuleEl.classList.add("shake");

    if (state.strikes === 1) {
      triggerStrikeFlash(1);
    } else if (state.strikes === 2) {
      triggerStrikeFlash(2);
    }

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
    bombModuleEl.onkeydown = null;

    const names = {
      color: "Color Panel",
      wires: "Wires",
      animals: "Symbol Numbers",
      directions: "Directions",
      category: "Word Lookup",
      calculator: "Calculator",
      decoder: "Letter Scrolls",
      morse: "Morse Code",
      memory: "Memory",
    };
    moduleTitleEl.textContent = names[module.type];

    if (module.type === "color") renderColor(module);
    if (module.type === "wires") renderWires(module);
    if (module.type === "animals") renderAnimals(module);
    if (module.type === "directions") renderDirections(module);
    if (module.type === "category") renderCategory(module);
    if (module.type === "calculator") renderCalculator(module);
    if (module.type === "decoder") renderDecoder(module);
    if (module.type === "morse") renderMorse(module);
    if (module.type === "memory") renderMemory(module);
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
    wrap.className = `rule-key-game rule-key-${ruleKey}`;
    wrap.setAttribute("data-rule-key", ruleKey);
    wrap.setAttribute("aria-label", `Rule key: ${info.label}`);

    const symbol = document.createElement("strong");
    symbol.className = "rule-key-symbol";
    symbol.textContent = info.symbol;
    symbol.setAttribute("aria-label", info.label);
    symbol.title = info.label;

    wrap.appendChild(symbol);
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

  function renderMemory(module) {
    addInstruction("Tell your partner the stage and screen number. After Stage 1, remember where buttons 1–4 are because their labels disappear.");

    const shell = document.createElement("div");
    shell.className = "memory-shell";

    const stageLabel = document.createElement("div");
    stageLabel.className = "memory-stage-label";
    stageLabel.textContent = `STAGE ${module.stageIndex + 1} / ${module.stageCount}`;

    const display = document.createElement("div");
    display.className = "memory-display";
    display.textContent = module.displays[module.stageIndex];

    const buttons = document.createElement("div");
    buttons.className = "memory-buttons";

    const refreshStage = () => {
      stageLabel.textContent = `STAGE ${module.stageIndex + 1} / ${module.stageCount}`;
      display.textContent = module.displays[module.stageIndex];
      [...buttons.children].forEach(button => {
        button.textContent = module.labelsVisible ? button.dataset.number : "";
        button.classList.toggle("memory-button-hidden", !module.labelsVisible);
        button.setAttribute("aria-label", module.labelsVisible ? `Button ${button.dataset.number}` : "Hidden memory button");
      });
    };

    const handlePress = pressedNumber => {
      if (!state || state.ended || module.solved) return;
      const screenNumber = module.displays[module.stageIndex];
      const stageRules = memoryStageRules[module.stageIndex];
      const correctNumber = stageRules[screenNumber];

      if (pressedNumber !== correctNumber) {
        strike("Wrong memory button.");
        return;
      }

      if (module.stageIndex >= module.stageCount - 1) {
        solveModule();
        return;
      }

      module.stageIndex += 1;
      if (module.stageIndex === 1) module.labelsVisible = false;
      setFeedback(`Correct. Stage ${module.stageIndex + 1}.`, "good");
      refreshStage();
    };

    module.buttonOrder.forEach(number => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "memory-button";
      button.dataset.number = String(number);
      button.textContent = module.labelsVisible ? String(number) : "";
      button.setAttribute("aria-label", module.labelsVisible ? `Button ${number}` : "Hidden memory button");
      button.addEventListener("click", () => handlePress(number));
      buttons.appendChild(button);
    });

    shell.append(stageLabel, display, buttons);
    bombModuleEl.appendChild(shell);
  }

  function renderMorse(module) {
    const lineWord = module.codes.length === 1 ? "line" : "lines";
    addInstruction(`Tell your partner the ${module.codes.length} printed Morse ${lineWord}. Type one decoded letter on each line, then press ENTER.`);

    const wrap = document.createElement("div");
    wrap.className = "morse-lines";
    const inputs = [];

    module.codes.forEach((codeString, index) => {
      const row = document.createElement("div");
      row.className = "morse-row";

      const number = document.createElement("div");
      number.className = "morse-line-number";
      number.textContent = String(index + 1);

      const input = document.createElement("input");
      input.type = "text";
      input.className = "morse-answer";
      input.placeholder = "LETTER";
      input.maxLength = 1;
      input.autocomplete = "off";
      input.autocapitalize = "characters";
      input.spellcheck = false;
      input.setAttribute("aria-label", `Morse line ${index + 1} letter`);
      input.value = module.entries[index] || "";

      input.addEventListener("input", () => {
        const cleaned = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
        input.value = cleaned;
        module.entries[index] = cleaned;

        if (cleaned && inputs[index + 1]) {
          inputs[index + 1].focus();
        }
      });

      const code = document.createElement("div");
      code.className = "morse-code-strip";
      code.setAttribute("aria-label", `Morse line ${index + 1}`);

      const part = document.createElement("span");
      part.className = "morse-group";
      part.setAttribute(
        "aria-label",
        codeString.split("").map(mark => mark === "." ? "dot" : "dash").join(" ")
      );

      codeString.split("").forEach(mark => {
        const shape = document.createElement("span");
        shape.className = mark === "." ? "morse-mark morse-dot" : "morse-mark morse-dash";
        part.appendChild(shape);
      });

      code.appendChild(part);
      row.append(number, input, code);
      wrap.appendChild(row);
      inputs.push(input);
    });

    const submitMorse = () => {
      const answers = module.entries.map(value => value.toUpperCase());
      const correct = answers.every((value, index) => value === module.targets[index]);

      if (correct) {
        solveModule();
        return;
      }

      strike("One or more Morse letters are wrong.");
      module.entries = Array(module.targets.length).fill("");
      inputs.forEach(input => input.value = "");
      if (inputs[0]) inputs[0].focus();
    };

    inputs.forEach(input => {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          submitMorse();
        }
      });
    });

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "morse-enter";
    submit.textContent = "ENTER";
    submit.addEventListener("click", submitMorse);

    bombModuleEl.append(wrap, submit);
    setTimeout(() => inputs[0]?.focus(), 0);
  }

  function renderDecoder(module) {
    addInstruction("Tell your partner the five CODE letters from left to right. Use the manual to find the final letters.");

    if (!Array.isArray(module.revealed) || module.revealed.length !== 5) {
      module.revealed = [false, false, false, false, false];
    }

    const grid = document.createElement("div");
    grid.className = "letter-scroll-grid";

    let submit = null;

    const updateSubmitState = () => {
      if (!submit) return;
      const allSet = module.revealed.every(Boolean);
      submit.disabled = !allSet;
      submit.setAttribute("aria-disabled", allSet ? "false" : "true");
    };

    module.currentLetters.forEach((letter, index) => {
      const scroll = document.createElement("div");
      scroll.className = "letter-scroll";

      const number = document.createElement("div");
      number.className = "scroll-number";
      number.textContent = String(index + 1);

      const up = document.createElement("button");
      up.type = "button";
      up.className = "scroll-button scroll-up";
      up.textContent = "▲";
      up.setAttribute("aria-label", `Scroll ${index + 1} up`);

      const windowEl = document.createElement("div");
      windowEl.className = "scroll-letter-window";
      windowEl.textContent = module.revealed[index] ? letter : "";
      windowEl.classList.toggle("blank", !module.revealed[index]);

      const down = document.createElement("button");
      down.type = "button";
      down.className = "scroll-button scroll-down";
      down.textContent = "▼";
      down.setAttribute("aria-label", `Scroll ${index + 1} down`);

      const codeWrap = document.createElement("div");
      codeWrap.className = "scroll-code-wrap";
      const codeLabel = document.createElement("span");
      codeLabel.textContent = "CODE";
      const code = document.createElement("strong");
      code.textContent = module.codes[index];
      codeWrap.append(codeLabel, code);

      const move = delta => {
        const currentIndex = scrollAlphabet.indexOf(module.currentLetters[index]);
        const nextIndex = (currentIndex + delta + scrollAlphabet.length) % scrollAlphabet.length;
        module.currentLetters[index] = scrollAlphabet[nextIndex];
        module.revealed[index] = true;
        windowEl.textContent = module.currentLetters[index];
        windowEl.classList.remove("blank");
        updateSubmitState();
      };

      up.addEventListener("click", () => move(1));
      down.addEventListener("click", () => move(-1));

      scroll.append(number, up, windowEl, down, codeWrap);
      grid.appendChild(scroll);
    });

    const submitDecoder = () => {
      if (!state || state.ended || module.solved) return;
      if (!module.revealed.every(Boolean)) {
        setFeedback("Set all five scrolls before pressing ENTER.", "bad");
        return;
      }

      const enteredWord = module.currentLetters.join("");
      if (enteredWord === module.targetWord) {
        solveModule();
      } else {
        strike("The five-letter word is wrong.");
      }
    };

    submit = document.createElement("button");
    submit.type = "button";
    submit.className = "decoder-enter";
    submit.textContent = "ENTER";
    submit.setAttribute("aria-label", "Submit five-letter word");
    submit.addEventListener("click", submitDecoder);

    bombModuleEl.onkeydown = event => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitDecoder();
      }
    };

    bombModuleEl.append(grid, submit);
    updateSubmitState();
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
    clearLevelCountdown();

    if (bombStatusEl) bombStatusEl.textContent = "SAFE";
    if (moduleLampEl) moduleLampEl.classList.remove("on");

    if (state.teacherTest) {
      document.getElementById("resultIcon").textContent = "🛠";
      document.getElementById("resultTitle").textContent = "Teacher Test Complete";
      document.getElementById("resultText").textContent = `${state.teacherTestLabel} cleared successfully.`;
      playAgainBtn.textContent = "Back to Teacher Menu";
      resultAction = "teacher";
      showScreen("result");
      return;
    }

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
    } else {
      campaign.highestUnlockedLevel = LEVELS.length;
    }

    saveCampaignProgress();

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
    clearLevelCountdown();

    if (bombStatusEl) bombStatusEl.textContent = "FAILED";
    if (moduleLampEl) moduleLampEl.classList.remove("on");

    const failedLevel = state.levelNumber;

    playExplosion(() => {
  // All required DOM is now loaded before this file executes.
  // Keep this script at the end of index.html.
      document.getElementById("resultIcon").textContent = "💥";

      if (state?.teacherTest) {
        document.getElementById("resultTitle").textContent = "Teacher Test Failed";
        document.getElementById("resultText").textContent = `${state.teacherTestLabel}: ${reason}`;
        playAgainBtn.textContent = "Back to Teacher Menu";
        resultAction = "teacher";
        showScreen("result");
        return;
      }

      document.getElementById("resultTitle").textContent = `Level ${failedLevel} Failed`;
      document.getElementById("resultText").textContent =
        `${reason} You must clear Level ${failedLevel} before advancing.`;

      playAgainBtn.textContent = `Retry Level ${failedLevel}`;
      resultAction = "retry";
      showScreen("result");
    });
  }

  assertCampaignDOM();
  campaign = loadCampaignSave();
  updateCampaignHome();

  document.addEventListener("keydown", async event => {
    if (teacherModeUnlocked) return;
    if (!screens.home?.classList.contains("active")) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1) return;

    const char = event.key.toLowerCase();
    if (!/[a-z0-9]/.test(char)) {
      teacherCodeBuffer = "";
      return;
    }

    teacherCodeBuffer = (teacherCodeBuffer + char).slice(-TEACHER_CODE_LENGTH);
    clearTimeout(teacherCodeResetId);
    teacherCodeResetId = setTimeout(() => { teacherCodeBuffer = ""; }, 5000);

    if (teacherCodeBuffer.length !== TEACHER_CODE_LENGTH) return;
    const snapshot = teacherCodeBuffer;
    if (await matchesTeacherCode(snapshot)) {
      unlockTeacherMode();
    }
  });

  teacherTestLevelBtn?.addEventListener("click", () => {
    const levelNumber = Math.min(20, Math.max(1, Number(teacherLevelSelectEl?.value || 1)));
    startTeacherLevel(levelNumber);
  });

  teacherTestModuleBtn?.addEventListener("click", () => {
    const levelNumber = Math.min(20, Math.max(1, Number(teacherLevelSelectEl?.value || 1)));
    const type = teacherModuleSelectEl?.value || "color";
    const difficulty = teacherDifficultySelectEl?.value || "easy";
    startTeacherModule(type, difficulty, levelNumber);
  });

  teacherModeCloseBtn?.addEventListener("click", hideTeacherMode);

  resetProgressBtn?.addEventListener("click", () => {
    const hasProgress = campaign && (campaign.lastClearedLevel || 0) > 0;
    const message = hasProgress
      ? `Reset saved progress and return to Level 1? Level ${campaign.lastClearedLevel} is currently cleared.`
      : "Reset the campaign and start again from Level 1?";

    if (!window.confirm(message)) return;

    clearCampaignSave();
    campaign = null;
    state = null;
    resultAction = "start";
    playAgainBtn.textContent = "Play Again";
    updateCampaignHome();
  });

  startBtn.addEventListener("click", () => {
    if (!campaign) {
      startCampaign();
      return;
    }

    startLevel(campaign.highestUnlockedLevel || 1);
  });

  playAgainBtn.addEventListener("click", () => {
    if (resultAction === "teacher") {
      state = null;
      resultAction = "start";
      playAgainBtn.textContent = "Play Again";
      showHome();
      return;
    }

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
    clearLevelCountdown();

    if (state) {
      state.ended = true;
    }

    state = null;
    resultAction = "start";
    playAgainBtn.textContent = "Play Again";

    // Campaign progress is checkpointed after cleared levels.
    // Ending a test returns to the highest saved/unlocked level.
    showHome();
  });




})();
