import GameManager from './managers/gameManager.js';
import UIController from './ui/uiController.js';
import HorseUI from './ui/horseUI.js';
import RaceUI from './ui/raceUI.js';
import MarketUI from './ui/marketUI.js';
import BreedingUI from './ui/breedingUI.js';
import TrainingUI from './ui/trainingUI.js';
import audioManager from './utils/audioManager.js';
import eventSystem, { GameEvents } from './utils/eventSystem.js';
import assetLoader from './utils/assetLoader.js';

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
        // Game state events
        eventSystem.on(GameEvents.GAME_STARTED, () => {
            audioManager.playMusic('background');
        });
        
        // Horse events
        eventSystem.on(GameEvents.HORSE_ACQUIRED, () => {
            audioManager.playSfx('horseNeigh');
        });
        eventSystem.on(GameEvents.HORSE_LEVELED_UP, () => {
            audioManager.playSfx('levelUp');
        });
        
        // Race events
        eventSystem.on(GameEvents.RACE_STARTED, () => {
            audioManager.playMusic('race');
            audioManager.playSfx('raceStart');
        });
        eventSystem.on(GameEvents.RACE_FINISHED, () => {
            audioManager.playMusic('background');
            audioManager.playSfx('raceFinish');
        });
        
        // Market events
        eventSystem.on(GameEvents.HORSE_PURCHASED, () => {
            audioManager.playSfx('coins');
        });
        
        // Achievement events
        eventSystem.on(GameEvents.ACHIEVEMENT_UNLOCKED, () => {
            audioManager.playSfx('achievement');
        });
        
        // UI events
        eventSystem.on(GameEvents.SCREEN_CHANGED, (screen) => {
            audioManager.playSfx('click');
        });
        
        // Add click sound to all buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('button:not([disabled])')) {
                audioManager.playSfx('click');
            }
        });
        
        // Add hover sound to all buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button:not([disabled])')) {
                audioManager.playSfx('hover');
            }
        });
    }

    checkSavedGame() {
        if (this.gameManager.hasSavedGame()) {
            document.getElementById('loadGameBtn').disabled = false;
        }
    }

    updateUI() {
        // Update player info
        this.uiController.updatePlayerInfo();
        
        // Update horse list if visible
        if (document.getElementById('horseList').offsetParent !== null) {
            this.horseUI.updateHorseList();
        }
        
        // Update race schedule if visible
        if (document.getElementById('raceSchedule').offsetParent !== null) {
            this.raceUI.showRaceSchedule();
        }
        
        // Update market if visible
        if (document.getElementById('marketListings').offsetParent !== null) {
            this.marketUI.refreshMarket();
        }
        
        // Update breeding center if visible
        if (document.getElementById('breedingCenter').offsetParent !== null) {
            this.breedingUI.updateAvailableHorses();
        }
        
        // Update training center if visible
        if (document.getElementById('trainingCenter').offsetParent !== null) {
            this.trainingUI.updateAvailableHorses();
        }
    }
}

// Initialize game when DOM is loaded and assets are ready
document.addEventListener('DOMContentLoaded', async () => {
    await assetLoader.loadAllAssets();
    window.game = new HorseTycoon();
});

export default HorseTycoon; 