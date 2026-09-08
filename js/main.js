// js/main.js
import { Game } from './game.js';
import { DialogueSystem } from './dialogue.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);
const dialogue = new DialogueSystem(game);

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;

  // Cast fireball power
  if (e.code === 'KeyF' && !dialogue.active) {
    game.castFireball();
  }

  // Interaction / Advance Dialogue
  if (e.code === 'KeyE' || e.code === 'Space') {
    if (dialogue.active) {
      dialogue.advance();
    } else if (game.nearbyInteractable) {
      dialogue.start(game.nearbyInteractable.id);
    }
  }

  // Failsafe: Emergency escape closes stuck dialogue & unpauses game
  if (e.code === 'Escape' && dialogue.active) {
    dialogue.close();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function loop() {
  game.update(keys);
  game.render();

  // Update HUD prompt position and visibility
  const prompt = document.getElementById('interaction-prompt');
  if (prompt) {
    if (game.nearbyInteractable && !dialogue.active) {
      prompt.classList.remove('hidden');
    } else {
      prompt.classList.add('hidden');
    }
  }

  requestAnimationFrame(loop);
}

loop();