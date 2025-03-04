class UIController {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentScreen = 'loading';
        this.screens = {};
        this.modals = {};
        
        // Safely get audio manager, or create a fallback
        this.audioManager = window.audioManager;
        if (!this.audioManager) {
            console.warn("AudioManager not available, creating fallback");
            // Create a fallback audio manager to prevent errors
            this.audioManager = {
                isMusicMuted: false,
                isSfxMuted: false,
                musicVolume: 0.5,
                sfxVolume: 0.5,
                toggleMusic: () => console.log("Music toggle (fallback)"),
                toggleSfx: () => console.log("SFX toggle (fallback)"),
                setMusicVolume: (vol) => console.log("Set music volume (fallback):", vol),
                setSfxVolume: (vol) => console.log("Set SFX volume (fallback):", vol),
                playMusic: () => {},
                playSfx: () => {}
            };
        }
        
        this.initializeScreens();
        this.initializeModals();
        this.setupEventListeners();
        this.setupAudioControls();
    }

    initializeScreens() {
        // Get all screen elements
        ['loading', 'mainMenu', 'playerSetup', 'gameUI'].forEach(screenId => {
            this.screens[screenId] = document.getElementById(screenId);
        });
    }

    initializeModals() {
        // Get all modal elements
        ['horseDetail', 'market', 'race', 'breeding', 'training', 'stable'].forEach(modalId => {
            this.modals[modalId] = document.getElementById(`${modalId}Modal`);
        });
    }

    setupEventListeners() {
        // Helper function to safely add event listeners
        const safeAddEvent = (selector, event, handler) => {
            const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element not found: ${typeof selector === 'string' ? selector : 'element'}. Unable to add ${event} event listener.`);
            }
        };

        // Helper function to safely add event listeners to multiple elements
        const safeAddEventAll = (selector, event, handler) => {
            const elements = document.querySelectorAll(selector);
            if (elements && elements.length > 0) {
                elements.forEach(element => element.addEventListener(event, handler));
            } else {
                console.warn(`No elements found for: ${selector}. Unable to add ${event} event listeners.`);
            }
        };

        // Main Menu
        safeAddEvent('newGameBtn', 'click', () => this.showScreen('playerSetup'));
        safeAddEvent('loadGameBtn', 'click', () => this.gameManager.loadGame());
        
        // Player Setup
        safeAddEvent('startGameBtn', 'click', () => this.handleGameStart());
        
        safeAddEventAll('.difficulty-option', 'click', (e) => {
            const option = e.currentTarget;
            this.selectDifficulty(option.dataset.difficulty);
        });

        // Game UI Navigation
        safeAddEventAll('.nav-btn', 'click', (e) => {
            const btn = e.currentTarget;
            this.handleNavigation(btn.dataset.screen);
        });

        // Modal Controls
        safeAddEventAll('.modal-close', 'click', (e) => {
            const btn = e.currentTarget;
            this.closeModal(btn.closest('.modal'));
        });

        // Horse Actions
        safeAddEvent('horseList', 'click', (e) => {
            if (e.target.classList.contains('horse-card')) {
                this.showHorseDetails(e.target.dataset.horseId);
            }
        });
    }

    setupAudioControls() {
        // Don't proceed if audioManager doesn't exist
        if (!this.audioManager) {
            console.warn("Cannot setup audio controls: audioManager is undefined");
            return;
        }

        // Helper function to safely add event listeners
        const safeAddEvent = (selector, event, handler) => {
            const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
            if (element) {
                element.addEventListener(event, handler);
                return element;
            } else {
                console.warn(`Element not found: ${typeof selector === 'string' ? selector : 'element'}. Unable to add ${event} event listener.`);
                return null;
            }
        };

        // Music toggle
        const musicBtn = safeAddEvent('toggleMusic', 'click', () => {
            this.audioManager.toggleMusic();
            if (musicBtn) {
                // Ensure we have both the button and the property before using
                const isMuted = typeof this.audioManager.isMusicMuted !== 'undefined' ? 
                                this.audioManager.isMusicMuted : false;
                musicBtn.classList.toggle('muted', isMuted);
            }
        });

        // SFX toggle
        const sfxBtn = safeAddEvent('toggleSfx', 'click', () => {
            this.audioManager.toggleSfx();
            if (sfxBtn) {
                // Ensure we have both the button and the property before using
                const isMuted = typeof this.audioManager.isSfxMuted !== 'undefined' ? 
                                this.audioManager.isSfxMuted : false;
                sfxBtn.classList.toggle('muted', isMuted);
            }
        });

        // Music volume
        const musicSlider = safeAddEvent('musicVolume', 'input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.audioManager.setMusicVolume(volume);
        });

        // SFX volume
        const sfxSlider = safeAddEvent('sfxVolume', 'input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.audioManager.setSfxVolume(volume);
        });

        // Set initial states - only if elements exist and properties are defined
        if (musicBtn && typeof this.audioManager.isMusicMuted !== 'undefined') {
            musicBtn.classList.toggle('muted', this.audioManager.isMusicMuted);
        }
        if (sfxBtn && typeof this.audioManager.isSfxMuted !== 'undefined') {
            sfxBtn.classList.toggle('muted', this.audioManager.isSfxMuted);
        }
        if (musicSlider && typeof this.audioManager.musicVolume !== 'undefined') {
            musicSlider.value = this.audioManager.musicVolume * 100;
        }
        if (sfxSlider && typeof this.audioManager.sfxVolume !== 'undefined') {
            sfxSlider.value = this.audioManager.sfxVolume * 100;
        }
    }

    showScreen(screenId) {
        // Only try to show screen if it exists
        if (this.screens[screenId]) {
            // Hide all screens first
            Object.values(this.screens).forEach(screen => {
                if (screen) screen.style.display = 'none';
            });
            
            this.screens[screenId].style.display = 'block';
            this.currentScreen = screenId;
        } else {
            console.warn(`Screen not found: ${screenId}`);
        }
    }

    showModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].style.display = 'flex';
        } else {
            console.warn(`Modal not found: ${modalId}. Available modals: ${Object.keys(this.modals).join(', ')}`);
            // Try to find the modal by ID directly as fallback
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.style.display = 'flex';
                // Add it to our modals object for future use
                this.modals[modalId] = modalElement;
            } else {
                console.error(`Could not find modal with ID: ${modalId}`);
            }
        }
    }

    closeModal(modal) {
        if (modal && typeof modal.style !== 'undefined') {
            modal.style.display = 'none';
        } else {
            console.warn("Cannot close modal: modal is undefined or missing style property");
        }
    }

    handleGameStart() {
        const playerName = document.getElementById('playerName').value;
        const stableName = document.getElementById('stableName').value;
        if (!playerName || !stableName) {
            this.showError('Please fill in all fields');
            return;
        }
        this.gameManager.startNewGame(playerName, stableName);
        this.showScreen('gameUI');
    }

    selectDifficulty(difficulty) {
        document.querySelectorAll('.difficulty-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
        this.gameManager.setDifficulty(difficulty);
    }

    handleNavigation(screen) {
        this.showModal(`${screen}Modal`);
    }

    showHorseDetails(horseId) {
        const horse = this.gameManager.getHorse(horseId);
        this.updateHorseDetailModal(horse);
        this.showModal('horseDetail');
    }

    updateHorseDetailModal(horse) {
        const modal = this.modals.horseDetail;
        modal.querySelector('.horse-name').textContent = horse.name;
        modal.querySelector('.horse-stats').innerHTML = `
            <div>Speed: ${horse.speed}</div>
            <div>Stamina: ${horse.stamina}</div>
            <div>Acceleration: ${horse.acceleration}</div>
            <div>Jumping: ${horse.jumping}</div>
            <div>Temperament: ${horse.temperament}</div>
        `;
        // Update other horse details...
    }

    updatePlayerInfo() {
        const player = this.gameManager.player;
        document.getElementById('playerFunds').textContent = `$${player.funds.toLocaleString()}`;
        document.getElementById('stableLevel').textContent = `Stable Level: ${player.stableLevel}`;
        document.getElementById('horseCount').textContent = `Horses: ${player.horses.length}/${player.maxHorses}`;
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }

    showSuccess(message) {
        // Implement success notification
        console.log(message);
    }
}

export default UIController; 