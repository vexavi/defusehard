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
Level 20 now requires **10 clears in 5:00** and contains no Easy difficulty slots.

## Session behavior
Progress lasts only while the page stays open. End Test returns to the highest unlocked level. Refreshing the page resets the campaign to Level 1.

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
