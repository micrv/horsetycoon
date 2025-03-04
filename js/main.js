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
        this.initialized = false;
        this.initializeGame();
    }

    async initializeGame() {
        try {
            console.log('Starting game initialization...');
            
            // First, ensure document is ready
            if (document.readyState !== 'complete') {
                await new Promise(resolve => {
                    window.addEventListener('load', resolve);
                });
            }
            
            // Initialize managers first
            await this.initializeManagers();
            
            // Initialize UI components after managers
            await this.initializeUI();
            
            // Setup game systems only after UI is ready
            await this.setupGameSystems();
            
            this.initialized = true;
            console.log('Game fully initialized');
            
            // Initial UI update
            this.updateUI();
        } catch (error) {
            console.error('Error during game initialization:', error);
            // Try to show error to user if UI is available
            if (this.uiController?.showError) {
                this.uiController.showError('Failed to initialize game. Please refresh the page.');
            }
        }
    }

    async initializeManagers() {
        try {
            console.log('Initializing game managers...');
            this.gameManager = new GameManager();
            await this.gameManager.initGame();
            console.log('Game managers initialized');
        } catch (error) {
            console.error('Error initializing game managers:', error);
            throw error; // Propagate error up
        }
    }

    async initializeUI() {
        try {
            console.log('Initializing UI components...');
            // Initialize UI controller first
            this.uiController = new UIController(this.gameManager);
            
            // Wait for UI controller to be ready with timeout
            let attempts = 0;
            const maxAttempts = 20; // 10 seconds total
            while (!this.uiController.ready && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            }
            
            if (!this.uiController.ready) {
                throw new Error('UI Controller failed to initialize within timeout');
            }
            
            console.log('UI Controller ready');
            
            // Initialize other UI components
            this.horseUI = new HorseUI(this.gameManager, this.uiController);
            this.raceUI = new RaceUI(this.gameManager, this.uiController);
            this.marketUI = new MarketUI(this.gameManager, this.uiController);
            this.breedingUI = new BreedingUI(this.gameManager, this.uiController);
            this.trainingUI = new TrainingUI(this.gameManager, this.uiController);
            
            console.log('UI components initialized');
        } catch (error) {
            console.error('Error initializing UI components:', error);
            throw error;
        }
    }

    async setupGameSystems() {
        try {
            console.log('Setting up game systems...');
            // Setup game loop and autosave
            this.setupGameLoop();
            this.setupAutosave();
            
            // Setup audio event listeners
            await this.setupAudioEvents();
            
            // Check for saved game
            await this.checkSavedGame();
            
            console.log('Game systems setup complete');
        } catch (error) {
            console.error('Error setting up game systems:', error);
            throw error; // Propagate error up
        }
    }

    setupGameLoop() {
        try {
            // Update game state every second
            setInterval(() => {
                if (this.gameManager) {
                    this.gameManager.update();
                    this.updateUI();
                }
            }, 1000);
        } catch (error) {
            console.error('Error setting up game loop:', error);
        }
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
            // Only update UI if game is fully initialized
            if (!this.initialized || !this.gameManager || !this.gameManager.player) {
                return;
            }

            // Update player info if UI controller exists and is ready
            if (this.uiController?.updatePlayerInfo) {
                this.uiController.updatePlayerInfo();
            }
            
            // Helper function to safely check if element is visible
            const isElementVisible = (id) => {
                const element = document.getElementById(id);
                return element && element.offsetParent !== null;
            };
            
            // Update UI components only if they exist and are visible
            if (this.horseUI?.updateHorseList && isElementVisible('horses-container')) {
                this.horseUI.updateHorseList();
            }
            
            if (this.raceUI?.showRaceSchedule && isElementVisible('races-container')) {
                this.raceUI.showRaceSchedule();
            }
            
            if (this.marketUI?.refreshMarket && isElementVisible('market-listings')) {
                this.marketUI.refreshMarket();
            }
            
            if (this.breedingUI?.updateAvailableHorses && isElementVisible('breeding-selection')) {
                this.breedingUI.updateAvailableHorses();
            }
            
            if (this.trainingUI?.updateAvailableHorses && isElementVisible('training-options')) {
                this.trainingUI.updateAvailableHorses();
            }
        } catch (error) {
            console.warn('Error updating UI:', error);
        }
    }
}

// Initialize game when DOM is loaded and assets are ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Loading game assets...');
        await assetLoader.loadAllAssets();
        console.log('Assets loaded, initializing game...');
        window.game = new HorseTycoon();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

export default HorseTycoon; 