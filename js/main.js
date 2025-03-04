import { default as GameManager } from './managers/gameManager.js';
import { default as UIController } from './ui/uiController.js';
import { default as HorseUI } from './ui/horseUI.js';
import { default as RaceUI } from './ui/raceUI.js';
import { default as MarketUI } from './ui/marketUI.js';
import { default as BreedingUI } from './ui/breedingUI.js';
import { default as TrainingUI } from './ui/trainingUI.js';
import { default as audioManager } from './utils/audioManager.js';
import eventSystem, { GameEvents } from './utils/eventSystem.js';
import { default as assetLoader } from './utils/assetLoader.js';

class HorseTycoon {
    constructor() {
        this.gameManager = new GameManager();
        this.uiController = new UIController(this.gameManager);
        
        // Initialize UI components
        this.horseUI = new HorseUI(this.gameManager, this.uiController);
        this.raceUI = new RaceUI(this.gameManager, this.uiController);
        this.marketUI = new MarketUI(this.gameManager, this.uiController);
        this.breedingUI = new BreedingUI(this.gameManager, this.uiController);
        this.trainingUI = new TrainingUI(this.gameManager, this.uiController);
        
        // Setup game loop and autosave
        this.setupGameLoop();
        this.setupAutosave();
        
        // Setup audio event listeners
        this.setupAudioEvents();
        
        // Check for saved game
        this.checkSavedGame();
        
        // Start menu music
        audioManager.playMusic('menu');
    }

    setupGameLoop() {
        // Update game state every second
        setInterval(() => {
            this.gameManager.update();
            this.updateUI();
        }, 1000);
    }

    setupAutosave() {
        // Autosave every 5 minutes
        setInterval(() => {
            this.gameManager.saveGame();
            this.uiController.showSuccess('Game autosaved');
            audioManager.playSfx('success');
        }, 5 * 60 * 1000);
        
        // Save before closing
        window.addEventListener('beforeunload', () => {
            this.gameManager.saveGame();
        });
    }

    setupAudioEvents() {
        // Safely add event listener with better error handling
        const safeAddEvent = (target, event, handler) => {
            try {
                if (target) {
                    target.addEventListener(event, handler);
                    console.log(`Successfully added ${event} event listener`);
                } else {
                    console.warn(`Target is null or undefined. Cannot add ${event} event listener.`);
                }
            } catch (error) {
                console.error(`Error adding ${event} event listener:`, error);
            }
        };
        
        // Safely add event listeners to game events
        const safeAddGameEvent = (event, handler) => {
            try {
                if (eventSystem && typeof eventSystem.on === 'function') {
                    eventSystem.on(event, handler);
                } else {
                    console.warn(`Event system not ready. Cannot add ${event} event listener.`);
                }
            } catch (error) {
                console.error(`Error adding game event listener for ${event}:`, error);
            }
        };
        
        // Game state events
        safeAddGameEvent(GameEvents.GAME_STARTED, () => {
            audioManager.playMusic('background');
        });
        
        // Horse events
        safeAddGameEvent(GameEvents.HORSE_ACQUIRED, () => {
            audioManager.playSfx('horseNeigh');
        });
        safeAddGameEvent(GameEvents.HORSE_LEVELED_UP, () => {
            audioManager.playSfx('levelUp');
        });
        
        // Race events
        safeAddGameEvent(GameEvents.RACE_STARTED, () => {
            audioManager.playMusic('race');
            audioManager.playSfx('raceStart');
        });
        safeAddGameEvent(GameEvents.RACE_FINISHED, () => {
            audioManager.playMusic('background');
            audioManager.playSfx('raceFinish');
        });
        
        // Market events
        safeAddGameEvent(GameEvents.HORSE_PURCHASED, () => {
            audioManager.playSfx('coins');
        });
        
        // Achievement events
        safeAddGameEvent(GameEvents.ACHIEVEMENT_UNLOCKED, () => {
            audioManager.playSfx('achievement');
        });
        
        // UI events
        safeAddGameEvent(GameEvents.SCREEN_CHANGED, (screen) => {
            audioManager.playSfx('click');
        });
        
        // Try multiple approaches to add event listeners to document
        try {
            // Add click sound to all buttons
            if (typeof document !== 'undefined') {
                safeAddEvent(document, 'click', (e) => {
                    if (e.target && e.target.matches && e.target.matches('button:not([disabled])')) {
                        audioManager.playSfx('click');
                    }
                });
                
                // Add hover sound to all buttons
                safeAddEvent(document, 'mouseover', (e) => {
                    if (e.target && e.target.matches && e.target.matches('button:not([disabled])')) {
                        audioManager.playSfx('hover');
                    }
                });
            } else {
                console.warn('Document is not defined. UI event listeners could not be added.');
            }
        } catch (error) {
            console.error('Error setting up UI event listeners:', error);
        }
    }

    checkSavedGame() {
        try {
            if (this.gameManager.hasSavedGame()) {
                const loadGameBtn = document.getElementById('loadGameBtn');
                if (loadGameBtn) {
                    loadGameBtn.disabled = false;
                }
            }
        } catch (error) {
            console.warn('Error checking saved game:', error);
        }
    }

    updateUI() {
        try {
            // Update player info if UI controller exists
            if (this.uiController && typeof this.uiController.updatePlayerInfo === 'function') {
                this.uiController.updatePlayerInfo();
            }
            
            // Helper function to safely check if element is visible
            const isElementVisible = (id) => {
                const element = document.getElementById(id);
                return element && element.offsetParent !== null;
            };
            
            // Update horse list if visible
            if (isElementVisible('horseList') && this.horseUI) {
                this.horseUI.updateHorseList();
            }
            
            // Update race schedule if visible
            if (isElementVisible('raceSchedule') && this.raceUI) {
                this.raceUI.showRaceSchedule();
            }
            
            // Update market if visible
            if (isElementVisible('marketListings') && this.marketUI) {
                this.marketUI.refreshMarket();
            }
            
            // Update breeding center if visible
            if (isElementVisible('breedingCenter') && this.breedingUI) {
                this.breedingUI.updateAvailableHorses();
            }
            
            // Update training center if visible
            if (isElementVisible('trainingCenter') && this.trainingUI) {
                this.trainingUI.updateAvailableHorses();
            }
        } catch (error) {
            console.warn('Error updating UI:', error);
        }
    }
}

// Initialize game when DOM is loaded and assets are ready
document.addEventListener('DOMContentLoaded', async () => {
    await assetLoader.loadAllAssets();
    window.game = new HorseTycoon();
});

export default HorseTycoon; 