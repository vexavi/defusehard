# ESL Defuse - Balanced Rules Edition

A two-role ESL communication / bomb-defusal game for GitHub Pages.

## What changed after classroom testing

### 1. Rule Keys reduce memorization
Four modules now use a changing rule symbol:
- ★ STAR
- ● CIRCLE
- ▲ TRIANGLE

Color Panel, Animal Numbers, Word Lookup, and Calculator no longer have one permanent answer per prompt. The Defuser must communicate the prompt **and** the rule symbol, and the Manual Reader must use the matching rule set.

### 2. Difficulty is guaranteed, not left to luck
Each level has an explicit Easy / Medium / Hard / Very Hard mix. Later levels therefore cannot accidentally generate only easy variants.

Examples:
- Directions: 3 arrows = Easy, 4 = Medium, 5 = Hard, 6 = Very Hard.
- Wires: 4 = Easy, 5 = Medium, 6 = Hard; Very Hard 6-wire puzzles can contain multiple black wires, so the reader must identify the first one.
- Calculator: addition = Easy, subtraction = Medium, multiplication = Hard, division = Very Hard.
- Word Lookup: harder rounds deliberately include tempting answers from the other rule-key mappings.

### 3. Module repetition is balanced
The game still allows repeated modules, but recently used module types receive a temporary probability penalty. Unseen module types within the level receive a bonus. This keeps repeats possible without letting one easy module dominate by chance.

## Rule-key progression
- Levels 1-2: ★ only (training)
- Levels 3-6: ★ and ●
- Levels 7-20: ★, ●, and ▲

## Finale
Level 20 now requires **10 clears in 9:00** and contains no Easy difficulty slots.

## Save behavior
Campaign progress is saved automatically in this browser after each cleared level. Closing or refreshing the page keeps the highest unlocked level. If a level is unfinished, that level restarts from the beginning next time. End Test returns to the highest unlocked level. Use Reset Saved Progress on the title screen to start over.

## Files
- `index.html`
- `style.css`
- `game.js`
- `manual.html`
- `cover-illustration.png`
- `README.md`


## v6 - Smarter Wires

Wires now uses the STAR / CIRCLE / TRIANGLE Rule Key system. Each wire count has three ordered rule sets. Players check rules from top to bottom and use the first true rule. The manual uses the simpler phrase "If not" instead of "Otherwise."

Wire generation is also difficulty-aware: later rounds favor deeper rules, and recent exact wire + symbol combinations are avoided.


## Wires v7 - One Yes/No Question

The Wires module has been simplified. After finding the wire count and rule symbol, the manual gives exactly one yes/no question. YES and NO each lead directly to a wire to cut. There are no multi-step rule chains.


## Color Panel spacing update

The Color Panel manual table now has more spacing between each rule-key answer group.
Example:
- ★ PURPLE
- ● GREEN
- ▲ BLUE

These groups are separated more clearly so they are easier to scan.


## Directions Route Number update

The Directions module no longer uses just one pattern per place.

It now uses:
- a place name
- Route 1 / Route 2 / Route 3
- arrow-only direction sequences

Difficulty scaling:
- Easy: Route 1 only
- Medium: Route 1 or Route 2
- Hard: Route 2 or Route 3
- Very Hard: Route 3

Recent place + route combinations are also temporarily deprioritized so students cannot lean on the exact same pattern repeatedly.


## Directions route label fit fix

Widened the ROUTE 1 / ROUTE 2 / ROUTE 3 label pills and their column in the Directions manual
so the route text fits cleanly in both HTML and PDF.


## Directions route-label PDF fix

Changed the ROUTE 1 / ROUTE 2 / ROUTE 3 labels from flex-based pills to fixed-size labels.
This prevents the pale-blue label background from protruding toward the first arrow in PDF rendering.
The Directions cards were also tightened slightly so the full route table fits more cleanly.


## Directions compact PDF layout

The Route labels now use fixed-size non-flex boxes, eliminating the protruding blue tail.
The route table was also compacted so all 14 places can stay together on the Directions page.


## Directions arrow readability update

The Directions manual keeps the fixed ROUTE labels, but the direction arrows are now larger,
darker, and bolder for easier classroom reading while still fitting all 14 locations on one page.


Update v13: Animal Numbers has been replaced by Symbol Numbers using 12 odd-looking symbols and the same 3-rule-key system.


Update v14: in-game Rule Key panel now shows only the large symbol (no "RULE KEY" text) for faster recognition by students.


## Update v15 - Letter Scrolls

Added a seventh module called Letter Scrolls. Five scroll wheels can move up/down through A-Z. Each scroll has a fixed CODE letter underneath. The manual has a 26-row decoder with a different mapping for Scrolls 1-5. The decoded answer always forms a real five-letter word.

Word variety: 445 five-letter target words. Easy rounds use a smaller common-word pool, medium expands the pool, and hard/very hard can use the full bank. Recent target words are avoided.


## Update v16 - Morse Code

Added Module 8: Morse Code. The bomb shows three printed Morse-code lines, each next to an answer box. Students decode the lines with the manual A-Z decoder, type all three words, and press ENTER. There is no audio. Morse unlocks from Level 8 onward. Difficulty scales through word length: Easy uses 3-letter words; Medium mixes 3- and 4-letter words; Hard uses 4- and 5-letter words; Very Hard uses 5- and 6-letter words.


## Update v17 - Morse readability + Letter Scroll Enter

Morse dots and dashes are now rendered as thick visual shapes in both the game and printed manual instead of relying on skinny punctuation glyphs. Letter Scrolls keeps the visible ENTER button and also supports the physical keyboard Enter key for submission.


Update v18: Strike feedback now flashes the whole bomb screen red. Strike 1 flashes once, and Strike 2 flashes red three times.


## Update v19 - Memory

Added the final module, Memory. It has 3 stages on Easy, 4 on Medium, and 5 on Hard/Very Hard. Stage 1 shows a number from 1-4, four numbered buttons in a randomized order, and a randomized display-number-to-button-number mapping for later stages. The player presses the matching visible number on Stage 1. After Stage 1, the button labels and mapping disappear while button positions stay fixed. Stages 2-5 show only changing display numbers; the player must use the memorized mapping and button positions. A new Memory module instance randomizes the layout and mapping again. Memory enters the campaign pool from Level 9 onward.


## Update v20 - Memory Rules

Memory now uses fixed universal stage rules printed in the manual instead of showing a randomized mapping on the bomb. Stage 1 uses the same number shown on screen. Stages 2-5 each use their own screen-number-to-button-number mapping. Button positions are randomized for each new Memory module, labels disappear after Stage 1, and positions remain fixed through the rest of that module.


Update v21: Memory manual rules are written as short sentences instead of a four-column rule chart. Game logic is unchanged.


Update v22: Levels 2-9 now guarantee the newly introduced module at least once. The guaranteed module uses the easiest difficulty available in that level, and the other module slots are still filled randomly from that level pool.


## Update v23 - Late-game timing

Adjusted the final campaign levels so slower communication-heavy modules do not make success overly dependent on RNG. Module counts and difficulty mixes are unchanged. Level 17 is now 6:15, Level 18 is 7:15, Level 19 is 7:30, and Level 20 is 9:00.


Update v24: Every level now begins with a 3-second countdown overlay so both players have time to get ready before the timer starts.

## Update v25 - Single-letter Morse

Morse Code now shows exactly one Morse character per line. There are still three lines, but each answer box accepts one letter only. Difficulty is based on Morse-code length: Easy uses short 1–2 mark codes, Medium uses 2–3 marks, Hard favors 3–4 marks, and Very Hard uses 4-mark codes.


## Update v26 - Morse line scaling

Morse difficulty now scales by the number of single-letter Morse lines: Easy = 1 line, Medium = 2 lines, Hard = 3 lines, Very Hard = 4 lines. Each line still represents exactly one letter.


## Update v27 - Blank Letter Scrolls

Letter Scrolls now start with all five main scroll windows blank while the CODE letters underneath remain visible. A scroll reveals its current letter only after the Defuser presses that scroll's up or down button. ENTER stays disabled until all five scrolls have been set at least once.


## Update v28 - Hidden Teacher Test Mode

On the title screen, a hidden keyboard sequence unlocks Teacher Test Mode without any visible password box. The source stores only a hash/checksum rather than the literal sequence. Teacher Mode can launch any Level 1-20 or any individual module at Easy, Medium, Hard, or Very Hard, with optional No Timer, Ignore Strikes, and Skip Countdown settings. Teacher tests do not advance campaign progress. Refreshing the page hides Teacher Mode again.


## Update v29 - Persistent Campaign Save

Campaign progression now saves automatically in browser localStorage after each cleared level. Closing or refreshing the page restores the highest unlocked level, the last cleared level, the campaign calculator keypad, and recent anti-repeat history. Progress is checkpointed between levels only; an unfinished level restarts from its beginning. The title screen includes a Reset Saved Progress button with confirmation. Teacher Test Mode never advances or overwrites student campaign progression.


Minor manual tweak: increased spacing between the Color Panel rule-key answer groups so each shape/color option is easier to read in print.

Wires manual readability tweak: increased wire-rule text size, spacing, and header size for easier classroom reading.

Symbol Numbers manual readability tweak: increased symbol size, number-sequence pill size, and spacing for easier classroom reading.

Directions and Calculator manual readability update: larger route labels/arrows and larger calculator color indicators, equation symbols, and operation table text.


Directions text labels restored: the 14 locations on the manual are shown by their written location names again instead of pictures. Route sequences and all other manual readability improvements are unchanged.


## Update v30 - Workshop Bomb UI

Rebuilt the gameplay presentation into a chunky yellow/orange tabletop defusal unit inspired by the approved concept image. The functional timer, strikes, level, clears, status and Ready lamp now sit in dark hardware plates; the active module is mounted on a cream paper/workshop panel with screws, tape, cables, sticky-note details and chunky physical-looking controls. Game logic, campaign progression, persistent saves, Teacher Test Mode, and the manual are unchanged.


## Update v31 - Chromebook Landscape Fit

Gameplay now has a dedicated short-landscape responsive layout designed for Chromebook-class screens. At landscape heights up to 820px, the bomb uses a compact top/status area while preserving large playable controls. Module-specific compact layouts keep Color, Wires, Symbol Numbers, Directions, Word Lookup, Calculator, Letter Scrolls, Morse Code, and Memory inside the visible gameplay area without normal page scrolling. An extra-short layout activates at 680px or less to account for browser chrome and the ChromeOS shelf. Home/manual pages retain their normal layout.


## Update v33 - Wires layout fit

The Wires module now uses a fixed/flexible/fixed row layout so the physical cable and Cut button always remain fully inside the mounted module, including Chromebook landscape and extra-short landscape viewports.


## v35 - Large Strike X display
The three strike indicators are now large X marks. Active strikes glow bright red; unused strikes remain dark. The numeric strike fraction is intentionally de-emphasized.


v38: Reverted only the enlarged timer sizing to the earlier laptop/Chromebook sizes. Large X-only strike indicators and the dedicated full-console red strike-flash overlay remain enabled.
