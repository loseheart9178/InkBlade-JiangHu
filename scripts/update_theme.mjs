import fs from 'fs';
let css = fs.readFileSync('src/styles/theme.css', 'utf-8');

// 1. Update transition-screen to be darker/moody
css = css.replace(
  /\.transition-screen::before \{\n  position: fixed;\n  inset: 0;\n  z-index: -1;\n  content: "";\n  background:\n    url\("\/assets\/generated\/ui\/art-gate-a\/xuan-paper-main-panel\.png"\) center \/ cover no-repeat;\n  opacity: 0\.92;\n  pointer-events: none;\n\}/g,
  `.transition-screen::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  content: "";
  background:
    radial-gradient(circle at 75% 50%, rgba(17, 17, 17, 0.4) 0%, rgba(17, 17, 17, 0.85) 100%),
    url("/assets/generated/ui/art-gate-a/xuan-paper-main-panel.png") center / cover no-repeat;
  opacity: 1;
  pointer-events: none;
  mix-blend-mode: multiply;
}`
);

// Add a dark overlay below the paper for more depth
css = css.replace(
  /\.transition-screen \{\n  overflow-y: auto;\n  padding: 40px 60px 80px;\n  background:\n    radial-gradient\(circle at center, rgba\(44, 41, 36, 0\.05\), transparent 80%\),\n    #efe2c3;\n\}/g,
  `.transition-screen {
  overflow-y: auto;
  padding: 40px 60px 80px;
  background:
    radial-gradient(circle at center, rgba(17, 17, 17, 0.2), rgba(17, 17, 17, 0.95)),
    #2c2924;
}`
);

// 2. Make transition-header text pop more against darker background
css = css.replace(
  /\.transition-header h3 \{\n  position: relative;\n  display: inline-block;\n  margin: 0;\n  padding: 8px 48px;\n  border: none;\n  color: #5f1d18;\n  font-family: serif;\n  font-size: 42px;\n  font-weight: 800;\n  letter-spacing: 12px;\n  text-shadow: 0 2px 4px rgba\(0, 0, 0, 0\.1\);\n\}/g,
  `.transition-header h3 {
  position: relative;
  display: inline-block;
  margin: 0;
  padding: 12px 64px;
  border: none;
  color: #f6ecd5;
  font-family: serif;
  font-size: 48px;
  font-weight: 800;
  letter-spacing: 16px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.9), 0 0 24px rgba(183, 53, 42, 0.6);
}`
);

// 3. Make the recap "scroll" background elegant instead of boxy
css = css.replace(
  /\.transition-hero,\n\.transition-spoils,\n\.transition-choice-section \{\n  position: relative;\n  display: grid;\n  width: 100%;\n  gap: 16px;\n  overflow: visible;\n  padding: 24px 32px;\n  border: none;\n  border-radius: 4px;\n  background:\n    linear-gradient\(165deg, rgba\(255, 252, 239, 0\.98\), rgba\(231, 215, 184, 0\.94\)\),\n    var\(--paper-grain\);\n  box-shadow:\n    0 24px 64px rgba\(17, 17, 17, 0\.18\),\n    0 2px 8px rgba\(95, 29, 24, 0\.08\);\n\}/g,
  `.transition-hero,
.transition-spoils,
.transition-choice-section {
  position: relative;
  display: grid;
  width: 100%;
  gap: 20px;
  overflow: visible;
  padding: 32px 40px;
  border: none;
  border-radius: 2px;
  background:
    linear-gradient(90deg, rgba(255, 252, 239, 0.96) 0%, rgba(246, 236, 213, 0.88) 80%, rgba(231, 215, 184, 0.2) 100%),
    var(--paper-grain);
  box-shadow:
    -12px 0 32px rgba(17, 17, 17, 0.3),
    0 24px 64px rgba(17, 17, 17, 0.25);
}`
);

// Remove the thin red border from transition hero
css = css.replace(
  /\.transition-hero::before \{\n  position: absolute;\n  inset: -4px;\n  content: "";\n  border: 1px solid rgba\(183, 53, 42, 0\.18\);\n  border-radius: 6px;\n  pointer-events: none;\n\}/g,
  `.transition-hero::before {
  display: none;
}`
);

// 4. Remove boxes from internal recap items
css = css.replace(
  /\.transition-meta span,\n\.transition-cinematic-step,\n\.chapter-progress-item \{\n  display: grid;\n  min-width: 112px;\n  gap: 2px;\n  padding: 8px 10px;\n  border: 1px solid rgba\(44, 41, 36, 0\.18\);\n  border-radius: 6px;\n  background: rgba\(255, 252, 239, 0\.68\);\n\}/g,
  `.transition-meta span,
.transition-cinematic-step,
.chapter-progress-item {
  display: grid;
  min-width: 112px;
  gap: 4px;
  padding: 8px 12px;
  border: none;
  border-left: 1px solid rgba(44, 41, 36, 0.15);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}`
);

// Strip background overrides for cinematic steps and progress
css = css.replace(
  /\.transition-cinematic-rail--kit \{\n  display: flex;\n  gap: 8px;\n  padding: 6px;\n  border: 1px solid rgba\(44, 41, 36, 0\.12\);\n  border-radius: 6px;\n  background:\n    linear-gradient\(90deg, rgba\(47, 124, 110, 0\.06\), rgba\(255, 252, 239, 0\.44\), rgba\(183, 53, 42, 0\.05\)\),\n    rgba\(246, 236, 213, 0\.28\);\n\}/g,
  `.transition-cinematic-rail--kit {
  display: flex;
  gap: 0;
  padding: 12px 0;
  border: none;
  border-top: 1px solid rgba(44, 41, 36, 0.2);
  border-bottom: 1px solid rgba(44, 41, 36, 0.2);
  background: transparent;
}`
);

css = css.replace(
  /\.transition-cinematic-step \{\n  position: relative;\n  z-index: 1;\n  display: grid;\n  flex: 1;\n  min-width: 0; \/\* Allow shrinking in column \*\/\n  padding: 5px 8px;\n  border: 1px solid rgba\(44, 41, 36, 0\.14\);\n  border-radius: 5px;\n  background:\n    linear-gradient\(135deg, rgba\(255, 252, 239, 0\.88\), rgba\(239, 226, 195, 0\.76\)\),\n    rgba\(255, 252, 239, 0\.82\);\n  box-shadow: 0 4px 12px rgba\(17, 17, 17, 0\.06\);\n\}/g,
  `.transition-cinematic-step {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: none;
  border-left: 1px solid rgba(44, 41, 36, 0.15);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}`
);

css = css.replace(
  /\.transition-meta--kit span,\n\.chapter-transition-progress--kit \.chapter-progress-item \{\n  border-color: rgba\(95, 29, 24, 0\.2\);\n  background:\n    linear-gradient\(145deg, rgba\(255, 252, 239, 0\.78\), rgba\(246, 236, 213, 0\.58\)\),\n    var\(--paper-grain\);\n\}/g,
  `.transition-meta--kit span,
.chapter-transition-progress--kit .chapter-progress-item {
  border: none;
  border-left: 1px solid rgba(95, 29, 24, 0.15);
  background: transparent;
}`
);

css = css.replace(
  /\.transition-cinematic-step--complete \{\n  border-color: rgba\(47, 124, 110, 0\.38\);\n  background: rgba\(47, 124, 110, 0\.08\);\n\}/g,
  `.transition-cinematic-step--complete {
  border-color: rgba(47, 124, 110, 0.4);
  background: linear-gradient(90deg, rgba(47, 124, 110, 0.08), transparent);
}`
);

css = css.replace(
  /\.transition-cinematic-step--current \{\n  border-color: rgba\(183, 53, 42, 0\.42\);\n  background: rgba\(183, 53, 42, 0\.06\);\n\}/g,
  `.transition-cinematic-step--current {
  border-color: rgba(183, 53, 42, 0.4);
  background: linear-gradient(90deg, rgba(183, 53, 42, 0.08), transparent);
}`
);

css = css.replace(
  /\.transition-cinematic-step--next \{\n  border-color: rgba\(238, 190, 91, 0\.48\);\n  background:\n    linear-gradient\(135deg, rgba\(238, 190, 91, 0\.14\), rgba\(255, 252, 239, 0\.82\)\);\n\}/g,
  `.transition-cinematic-step--next {
  border-color: rgba(238, 190, 91, 0.4);
  background: linear-gradient(90deg, rgba(238, 190, 91, 0.08), transparent);
}`
);


// 5. Jade Slips for chapter-reward-choice
css = css.replace(
  /\.chapter-reward-choice--kit \{\n  padding: 28px 32px;\n  min-height: 160px;\n  border: none;\n  border-radius: 4px;\n  background: rgba\(255, 252, 239, 0\.94\);\n  box-shadow: 0 12px 32px rgba\(17, 17, 17, 0\.1\);\n  transition: transform 200ms cubic-bezier\(0\.175, 0\.885, 0\.32, 1\.275\), box-shadow 200ms ease;\n\}/g,
  `.chapter-reward-choice--kit {
  position: relative;
  padding: 32px 36px;
  min-height: 180px;
  border: 1px solid rgba(238, 190, 91, 0.28);
  border-radius: 2px;
  background: 
    linear-gradient(145deg, rgba(20, 30, 28, 0.96) 0%, rgba(38, 50, 46, 0.92) 100%);
  box-shadow: 
    0 16px 40px rgba(17, 17, 17, 0.6),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  color: #f6ecd5;
  transition: transform 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 300ms ease, border-color 300ms ease;
  overflow: hidden;
}`
);

css = css.replace(
  /\.chapter-reward-choice--kit::after \{\n  position: absolute;\n  inset: 0;\n  z-index: -1;\n  content: "";\n  background: url\("\/assets\/generated\/ui\/art-gate-a\/decision-card-bg\.png"\) center \/ cover no-repeat;\n  opacity: 0\.08;\n  filter: grayscale\(1\);\n  transition: opacity 200ms ease, filter 200ms ease;\n\}/g,
  `.chapter-reward-choice--kit::after {
  position: absolute;
  inset: 0;
  z-index: 0;
  content: "";
  background: url("/assets/generated/ui/art-gate-a/decision-card-bg.png") center / cover no-repeat;
  opacity: 0.35;
  filter: grayscale(0.2) sepia(0.3) hue-rotate(110deg);
  mix-blend-mode: overlay;
  transition: opacity 300ms ease, filter 300ms ease, transform 300ms ease;
}`
);

css = css.replace(
  /\.chapter-reward-choice--kit:hover \{\n  transform: translateY\(-8px\);\n  box-shadow: 0 24px 52px rgba\(17, 17, 17, 0\.16\);\n\}/g,
  `.chapter-reward-choice--kit:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 32px 64px rgba(17, 17, 17, 0.8),
    0 0 32px rgba(47, 124, 110, 0.5),
    inset 0 0 0 1px rgba(238, 190, 91, 0.5);
  border-color: rgba(238, 190, 91, 0.8);
}`
);

css = css.replace(
  /\.chapter-reward-choice--kit:hover::after \{\n  opacity: 0\.16;\n  filter: grayscale\(0\);\n\}/g,
  `.chapter-reward-choice--kit:hover::after {
  opacity: 0.6;
  filter: grayscale(0) sepia(0.1) hue-rotate(110deg);
  transform: scale(1.05);
}`
);

// We need to inject new styles for the inner elements of the reward card
// since it changes from dark-text-on-light to light-text-on-dark.
if (!css.includes('.chapter-reward-choice--kit h4')) {
  css += `\n
/* --- Jade Slip Typography Overrides --- */
.chapter-reward-choice--kit > * {
  position: relative;
  z-index: 1;
}

.chapter-reward-choice--kit strong {
  display: block;
  color: #eebe5b;
  font-family: serif;
  font-size: 24px;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(238, 190, 91, 0.3);
}

.chapter-reward-choice--kit span,
.chapter-reward-choice--kit p,
.chapter-reward-choice--kit .game-message {
  color: rgba(246, 236, 213, 0.85);
  font-size: 15px;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
`;
}

fs.writeFileSync('src/styles/theme.css', css);
console.log("CSS updated!");
