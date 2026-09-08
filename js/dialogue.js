// js/dialogue.js
import { fetchNpcBanter } from './gemini.js';

export class DialogueSystem {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.currentNode = null;
    this.currentNpc = null;
    this.typewriterTimer = null;

    this.box = document.getElementById('dialogue-box');
    this.speakerEl = document.getElementById('speaker-name');
    this.textEl = document.getElementById('dialogue-text');
    this.choicesContainer = document.getElementById('choices-container');
    this.footerEl = document.getElementById('dialogue-footer');

    this.scripts = {
      // Level 1: Meadow
      toad_guard: {
        profile: "Captain Toad, royal sentinel. Anxious, loyal, squeaky voice. Guarding the outskirts.",
        start: {
          speaker: "Captain Toad",
          text: "Mario! Thank goodness! Bowser's scout vanguard tore down our fences. The whole road is swarming!",
          choices: [
            {
              label: "Any supplies you can spare?",
              action: (game) => {
                if (!game.state.flags.toadCoin) {
                  game.state.flags.toadCoin = true;
                  game.state.coins += 2;
                  return "toad_coin";
                }
                return "toad_empty";
              }
            },
            { label: "I will clear the way.", targetNode: "bye" }
          ]
        },
        toad_coin: {
          speaker: "Captain Toad",
          text: "Take these 2 star coins (★)! Grimm the merchant on the upper ledge sells health tonics!",
          choices: [{ label: "Thanks, Captain!", targetNode: "bye" }]
        },
        toad_empty: {
          speaker: "Captain Toad",
          text: "I'm tapped out of coins! Stomp the Goombas to collect the gold they stole.",
          choices: [{ label: "On it.", targetNode: "bye" }]
        },
        bye: {
          speaker: "Captain Toad",
          text: "Stomp their heads or launch fireballs [F] to raise the checkpoint banner!",
          choices: []
        }
      },

      grimm_merchant: {
        profile: "Grimm, a weary hooded traveling peddler.",
        start: {
          speaker: "Grimm (Merchant)",
          text: "Coin in your purse, traveler? The road ahead cuts through scorching sands and dark caverns.",
          choices: [
            {
              label: "Heal 1 Heart (+1 ❤ for 1 Coin)",
              action: (game) => {
                if (game.state.coins >= 1 && game.player.hp < game.player.maxHp) {
                  game.state.coins -= 1;
                  game.player.hp++;
                  game.updateHud();
                  return "heal_ok";
                }
                if (game.player.hp >= game.player.maxHp) return "heal_full";
                return "heal_poor";
              }
            },
            { label: "Step away.", targetNode: "bye" }
          ]
        },
        heal_ok: {
          speaker: "Grimm",
          text: "Down the hatch. That tonic will patch up bruises and burns in seconds.",
          choices: [{ label: "Return", targetNode: "start" }]
        },
        heal_full: {
          speaker: "Grimm",
          text: "You are already bursting with vitality. Save your silver.",
          choices: [{ label: "Return", targetNode: "start" }]
        },
        heal_poor: {
          speaker: "Grimm",
          text: "You lack the coin. Go smash some Goomba heads first.",
          choices: [{ label: "Return", targetNode: "start" }]
        },
        bye: {
          speaker: "Grimm",
          text: "Safe footing, red hat. Watch out for deep pits.",
          choices: []
        }
      },

      // Level 2: Cavern
      mole_miner: {
        profile: "Spike the Mole Miner. Grumpy, pragmatic subterranean worker.",
        start: {
          speaker: "Spike the Miner",
          text: "Clack, clack! Watch your noggin! These cobalt caves are full of brittle ceilings and deep drop-offs.",
          choices: [
            { label: "How do I traverse the chasm?", targetNode: "tip" },
            { label: "Carry on digging.", targetNode: "bye" }
          ]
        },
        tip: {
          speaker: "Spike the Miner",
          text: "Hold down [Shift] while taking a running leap! Don't let your heels drag or you'll take a bath in the abyss.",
          choices: [{ label: "Got it.", targetNode: "bye" }]
        },
        bye: {
          speaker: "Spike the Miner",
          text: "Mind the stalactites, pal.",
          choices: []
        }
      },

      // Level 3: Desert
      desert_nomad: {
        profile: "Oasis Wanderer clad in amber desert scarves.",
        start: {
          speaker: "Desert Nomad",
          text: "The dry wind carries tremors from the north. Bowser's siege engines are rolling toward the mountain.",
          choices: [
            {
              label: "Rest at the Oasis (+1 ❤)",
              action: (game) => {
                if (!game.state.flags.oasisRested) {
                  game.state.flags.oasisRested = true;
                  game.player.hp = Math.min(game.player.maxHp, game.player.hp + 1);
                  game.updateHud();
                  return "oasis_done";
                }
                return "oasis_dry";
              }
            },
            { label: "I will stop them.", targetNode: "bye" }
          ]
        },
        oasis_done: {
          speaker: "Desert Nomad",
          text: "Drink from the spring. The cool water restores your endurance (+1 ❤).",
          choices: [{ label: "Thank you.", targetNode: "bye" }]
        },
        oasis_dry: {
          speaker: "Desert Nomad",
          text: "The spring needs time to refill. Conserve your energy under this baking sun.",
          choices: [{ label: "Understood.", targetNode: "bye" }]
        },
        bye: {
          speaker: "Desert Nomad",
          text: "Climb through the cloud peaks above to bypass the canyon maze.",
          choices: []
        }
      },

      // Level 4: Cloud Haven
      cloud_cherub: {
        profile: "Fluffy Cloud Spirit residing above the highest tree canopies.",
        start: {
          speaker: "Nimbus Sprite",
          text: "Wheee! You jumped all the way up here, little plumber? The thin air makes you float like dandelion fluff!",
          choices: [
            {
              label: "Grant me a blessing of flight",
              action: (game) => {
                game.player.jumpStrength = -13.0; // Higher jumps on this level
                return "float_bless";
              }
            },
            { label: "Just catching my breath.", targetNode: "bye" }
          ]
        },
        float_bless: {
          speaker: "Nimbus Sprite",
          text: "Puff! Your boots feel lighter than feathers! Leap across the cumulus banks with ease!",
          choices: [{ label: "Awesome!", targetNode: "bye" }]
        },
        bye: {
          speaker: "Nimbus Sprite",
          text: "The smoke ahead smells like molten rock... stay alert!",
          choices: []
        }
      },

      // Level 5: Volcano Keep
      peach_echo: {
        profile: "Princess Peach trapped inside the final sanctum.",
        start: {
          speaker: "Princess Peach",
          text: "Mario! You breached the fortress gates! Beware Kamek's sorcery and the lava canals!",
          choices: [
            {
              label: "I am ready for anything, Princess!",
              action: (game) => {
                game.player.hp = game.player.maxHp;
                game.updateHud();
                return "buff";
              }
            }
          ]
        },
        buff: {
          speaker: "Princess Peach",
          text: "I channel the final Royal Star energy to mend all your hearts! Take down the flag and break the seal!",
          choices: [{ label: "HERE WE GO!", targetNode: "bye" }]
        },
        bye: {
          speaker: "Princess Peach",
          text: "Hurry, Mario! Clear the guards and claim the fortress banner!",
          choices: []
        }
      }
    };
  }

  start(npcId) {
    if (!npcId) return;
    this.active = true;
    this.currentNpc = npcId;
    this.game.paused = true;
    this.box.classList.remove('hidden');

    const script = this.scripts[npcId];
    if (this.game.state.exhaustedNpcs[npcId]) {
      this.triggerDynamicBanter(npcId);
    } else if (script && script.start) {
      this.displayNode(script.start);
    } else {
      this.displayNode({
        speaker: "Mysterious Whisper",
        text: "The breeze hums softly through the area...",
        choices: []
      });
    }
  }

  displayNode(node) {
    if (!node) {
      this.close();
      return;
    }
    this.currentNode = node;
    this.speakerEl.textContent = node.speaker || "Unknown";
    this.choicesContainer.innerHTML = '';
    this.footerEl.classList.add('hidden');

    const textToPrint = node.text || "...";
    this.typewrite(textToPrint, () => {
      if (node.choices && node.choices.length > 0) {
        this.renderChoices(node.choices);
      } else {
        this.footerEl.classList.remove('hidden');
        if (this.currentNpc) {
          this.game.state.exhaustedNpcs[this.currentNpc] = true;
        }
      }
    });
  }

  typewrite(text, onComplete) {
    clearInterval(this.typewriterTimer);
    this.textEl.textContent = '';
    let i = 0;

    if (!text || text.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    this.typewriterTimer = setInterval(() => {
      this.textEl.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(this.typewriterTimer);
        if (onComplete) onComplete();
      }
    }, 14);
  }

  renderChoices(choices) {
    this.choicesContainer.innerHTML = '';
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => {
        let nextKey = choice.targetNode;
        if (choice.action) {
          nextKey = choice.action(this.game);
        }

        if (nextKey && this.scripts[this.currentNpc] && this.scripts[this.currentNpc][nextKey]) {
          this.displayNode(this.scripts[this.currentNpc][nextKey]);
        } else {
          this.close();
        }
      });
      this.choicesContainer.appendChild(btn);
    });
  }

  async triggerDynamicBanter(npcId) {
    const npc = this.scripts[npcId];
    this.speakerEl.textContent = npc ? npc.start.speaker : "Character";
    this.choicesContainer.innerHTML = '';
    this.footerEl.classList.add('hidden');
    this.textEl.textContent = '...speaking...';

    const playerContext = `Mario is on Level ${this.game.currentLevel}. HP: ${this.game.player.hp}/${this.game.player.maxHp}. Coins: ${this.game.state.coins}.`;
    const reply = await fetchNpcBanter(npc ? npc.profile : "Resident of the land", playerContext);

    this.typewrite(reply, () => {
      this.footerEl.classList.remove('hidden');
    });
  }

  advance() {
    if (!this.active) return;
    if (this.currentNode && (!this.currentNode.choices || this.currentNode.choices.length === 0)) {
      this.close();
    }
  }

  close() {
    clearInterval(this.typewriterTimer);
    this.active = false;
    this.currentNode = null;
    this.currentNpc = null;
    this.box.classList.add('hidden');
    this.game.paused = false;
  }
}