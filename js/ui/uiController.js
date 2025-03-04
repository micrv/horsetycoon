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
        try {
            // Get all screen elements
            ['loading', 'mainMenu', 'playerSetup', 'gameUI'].forEach(screenId => {
                const screen = document.getElementById(screenId);
                if (screen) {
                    this.screens[screenId] = screen;
                } else {
                    console.warn(`Screen element not found: ${screenId}`);
                }
            });
        } catch (error) {
            console.error('Error initializing screens:', error);
        }
    }

    initializeModals() {
        try {
            // Get all modal elements
            ['horseDetail', 'market', 'race', 'breeding', 'training', 'stable'].forEach(modalId => {
                const modal = document.getElementById(`${modalId}Modal`);
                if (modal) {
                    this.modals[modalId] = modal;
                } else {
                    console.warn(`Modal element not found: ${modalId}Modal`);
                }
            });
        } catch (error) {
            console.error('Error initializing modals:', error);
        }
    }

    setupEventListeners() {
        // Helper function to safely add event listeners
        const safeAddEvent = (selector, event, handler) => {
            try {
                const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
                if (element) {
                    element.addEventListener(event, handler);
                    console.log(`Successfully added ${event} event listener to ${typeof selector === 'string' ? selector : 'element'}`);
                } else {
                    console.warn(`Element not found: ${typeof selector === 'string' ? selector : 'element'}. Unable to add ${event} event listener.`);
                }
            } catch (error) {
                console.error(`Error adding ${event} event listener:`, error);
            }
        };

        // Helper function to safely add event listeners to multiple elements
        const safeAddEventAll = (selector, event, handler) => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements && elements.length > 0) {
                    elements.forEach(element => element.addEventListener(event, handler));
                    console.log(`Successfully added ${event} event listeners to ${selector}`);
                } else {
                    console.warn(`No elements found for: ${selector}. Unable to add ${event} event listeners.`);
                }
            } catch (error) {
                console.error(`Error adding ${event} event listeners to ${selector}:`, error);
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
            try {
                const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
                if (element) {
                    element.addEventListener(event, handler);
                    return element;
                } else {
                    console.warn(`Element not found: ${typeof selector === 'string' ? selector : 'element'}. Unable to add ${event} event listener.`);
                    return null;
                }
            } catch (error) {
                console.error(`Error adding ${event} event listener:`, error);
                return null;
            }
        };

        // Music toggle
        const musicBtn = safeAddEvent('toggleMusic', 'click', () => {
            this.audioManager.toggleMusic();
            if (musicBtn) {
                musicBtn.classList.toggle('muted', this.audioManager.isMusicMuted);
            }
        });

        // SFX toggle
        const sfxBtn = safeAddEvent('toggleSfx', 'click', () => {
            this.audioManager.toggleSfx();
            if (sfxBtn) {
                sfxBtn.classList.toggle('muted', this.audioManager.isSfxMuted);
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

        // Set initial states
        if (musicBtn) {
            musicBtn.classList.toggle('muted', this.audioManager.isMusicMuted);
        }
        if (sfxBtn) {
            sfxBtn.classList.toggle('muted', this.audioManager.isSfxMuted);
        }
        if (musicSlider) {
            musicSlider.value = this.audioManager.musicVolume * 100;
        }
        if (sfxSlider) {
            sfxSlider.value = this.audioManager.sfxVolume * 100;
        }
    }

    showScreen(screenId) {
        try {
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
        } catch (error) {
            console.error(`Error showing screen ${screenId}:`, error);
        }
    }

    showModal(modalId) {
        try {
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
        } catch (error) {
            console.error(`Error showing modal ${modalId}:`, error);
        }
    }

    closeModal(modal) {
        try {
            if (modal && typeof modal.style !== 'undefined') {
                modal.style.display = 'none';
            } else {
                console.warn("Cannot close modal: modal is undefined or missing style property");
            }
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }

    handleGameStart() {
        try {
            const playerNameInput = document.getElementById('playerName');
            const stableNameInput = document.getElementById('stableName');
            
            if (!playerNameInput || !stableNameInput) {
                console.warn('Player name or stable name input not found');
                return;
            }

            const playerName = playerNameInput.value;
            const stableName = stableNameInput.value;
            
            if (!playerName || !stableName) {
                this.showError('Please fill in all fields');
                return;
            }
            
            this.gameManager.startNewGame({
                name: playerName,
                stableName: stableName
            });
            this.showScreen('gameUI');
        } catch (error) {
            console.error('Error handling game start:', error);
        }
    }

    selectDifficulty(difficulty) {
        try {
            const options = document.querySelectorAll('.difficulty-option');
            if (options.length > 0) {
                options.forEach(opt => opt.classList.remove('selected'));
                const selectedOption = document.querySelector(`[data-difficulty="${difficulty}"]`);
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                    this.gameManager.setDifficulty(difficulty);
                }
            }
        } catch (error) {
            console.error('Error selecting difficulty:', error);
        }
    }

    handleNavigation(screen) {
        try {
            this.showModal(`${screen}Modal`);
        } catch (error) {
            console.error('Error handling navigation:', error);
        }
    }

    showHorseDetails(horseId) {
        try {
            const horse = this.gameManager.getHorse(horseId);
            if (horse) {
                this.updateHorseDetailModal(horse);
                this.showModal('horseDetail');
            }
        } catch (error) {
            console.error('Error showing horse details:', error);
        }
    }

    updateHorseDetailModal(horse) {
        try {
            const modal = this.modals.horseDetail;
            if (!modal) {
                console.warn('Horse detail modal not found');
                return;
            }

            const nameElement = modal.querySelector('.horse-name');
            const statsElement = modal.querySelector('.horse-stats');
            
            if (nameElement) {
                nameElement.textContent = horse.name;
            }
            
            if (statsElement) {
                statsElement.innerHTML = `
                    <div>Speed: ${horse.speed}</div>
                    <div>Stamina: ${horse.stamina}</div>
                    <div>Acceleration: ${horse.acceleration}</div>
                    <div>Jumping: ${horse.jumping}</div>
                    <div>Temperament: ${horse.temperament}</div>
                `;
            }
        } catch (error) {
            console.error('Error updating horse detail modal:', error);
        }
    }

    updatePlayerInfo() {
        try {
            const player = this.gameManager.player;
            if (!player) {
                console.warn('Player not initialized');
                return;
            }

            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            };

            updateElement('playerFunds', `$${player.funds.toLocaleString()}`);
            updateElement('stableLevel', `Stable Level: ${player.stableLevel}`);
            updateElement('horseCount', `Horses: ${player.horses.length}/${player.maxHorses}`);
        } catch (error) {
            console.error('Error updating player info:', error);
        }
    }

    showError(message) {
        console.error(message);
        // Implement error notification UI if needed
    }

    showSuccess(message) {
        console.log(message);
        // Implement success notification UI if needed
    }
}

export default UIController; 