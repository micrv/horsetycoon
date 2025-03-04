class UIController {
    constructor(gameManager) {
        if (!gameManager) {
            throw new Error('GameManager is required for UIController');
        }
        
        this.gameManager = gameManager;
        this.currentScreen = 'loading';
        this.screens = {};
        this.modals = {};
        this.ready = false;
        this.initializationPromise = null;
        
        // Initialize audio manager with better error handling
        try {
            this.initializeAudioManager();
        } catch (error) {
            console.error('Error initializing audio manager:', error);
        }
        
        // Initialize UI when document is ready
        this.initializationPromise = new Promise((resolve, reject) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.initialize().then(resolve).catch(reject);
                });
            } else {
                this.initialize().then(resolve).catch(reject);
            }
        });
    }

    async initialize() {
        try {
            console.log('Initializing UI Controller...');
            
            // Ensure DOM is ready
            if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize components in sequence
            await this.initializeScreens();
            await this.initializeModals();
            await this.setupEventListeners();
            await this.setupAudioControls();
            
            // Verify critical elements exist
            this.verifyCriticalElements();
            
            this.ready = true;
            console.log('UI Controller initialized successfully');
        } catch (error) {
            console.error('Error initializing UI Controller:', error);
            this.ready = false;
            throw error;
        }
    }

    verifyCriticalElements() {
        const criticalElements = [
            'mainMenu',
            'playerSetup',
            'gameUI',
            'modal-container'
        ];

        const missing = criticalElements.filter(id => !document.getElementById(id));
        
        if (missing.length > 0) {
            throw new Error(`Critical UI elements missing: ${missing.join(', ')}`);
        }
    }

    initializeAudioManager() {
        // Try to get the audio manager from window
        this.audioManager = window.audioManager;

        // If not available, create a fallback that logs operations
        if (!this.audioManager) {
            console.warn("AudioManager not available, creating fallback");
            this.audioManager = {
                isMusicMuted: false,
                isSfxMuted: false,
                musicVolume: 0.5,
                sfxVolume: 0.5,
                toggleMusic: () => {
                    this.audioManager.isMusicMuted = !this.audioManager.isMusicMuted;
                    console.log("Music toggled:", this.audioManager.isMusicMuted ? "off" : "on");
                },
                toggleSfx: () => {
                    this.audioManager.isSfxMuted = !this.audioManager.isSfxMuted;
                    console.log("SFX toggled:", this.audioManager.isSfxMuted ? "off" : "on");
                },
                setMusicVolume: (vol) => {
                    this.audioManager.musicVolume = vol;
                    console.log("Music volume set to:", vol);
                },
                setSfxVolume: (vol) => {
                    this.audioManager.sfxVolume = vol;
                    console.log("SFX volume set to:", vol);
                },
                playMusic: (track) => console.log("Playing music track:", track),
                playSfx: (sound) => console.log("Playing sound effect:", sound)
            };
        }
    }

    async initializeScreens() {
        try {
            console.log('Initializing screens...');
            const screenIds = ['loading', 'mainMenu', 'playerSetup', 'gameUI'];
            const missingScreens = [];
            
            for (const screenId of screenIds) {
                const screen = document.getElementById(screenId);
                if (screen) {
                    this.screens[screenId] = screen;
                    // Ensure screen is hidden initially
                    screen.style.display = 'none';
                    console.log(`Screen initialized: ${screenId}`);
                } else {
                    missingScreens.push(screenId);
                }
            }
            
            if (missingScreens.length > 0) {
                throw new Error(`Required screens not found: ${missingScreens.join(', ')}`);
            }
            
            // Show loading screen initially
            if (this.screens.loading) {
                this.screens.loading.style.display = 'block';
            }
        } catch (error) {
            console.error('Error initializing screens:', error);
            throw error;
        }
    }

    async initializeModals() {
        try {
            console.log('Initializing modals...');
            const modalContainer = document.getElementById('modal-container');
            if (!modalContainer) {
                throw new Error('Modal container not found');
            }

            const modalElements = modalContainer.querySelectorAll('.modal');
            if (modalElements.length === 0) {
                throw new Error('No modal elements found in modal container');
            }

            modalElements.forEach(modal => {
                const modalId = modal.id;
                if (modalId) {
                    this.modals[modalId] = modal;
                    // Ensure modal is hidden initially
                    modal.style.display = 'none';
                    console.log(`Modal initialized: ${modalId}`);
                }
            });
        } catch (error) {
            console.error('Error initializing modals:', error);
            throw error;
        }
    }

    async setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            
            // Helper function to safely add event listeners
            const safeAddEvent = (selector, event, handler) => {
                try {
                    const element = typeof selector === 'string' ? document.getElementById(selector) : selector;
                    if (element) {
                        element.addEventListener(event, handler);
                        console.log(`Successfully added ${event} event listener to ${typeof selector === 'string' ? selector : 'element'}`);
                        return true;
                    } else {
                        console.warn(`Element not found: ${typeof selector === 'string' ? selector : 'element'}. Will retry later.`);
                        return false;
                    }
                } catch (error) {
                    console.error(`Error adding ${event} event listener:`, error);
                    return false;
                }
            };

            // Helper function to safely add event listeners to multiple elements
            const safeAddEventAll = (selector, event, handler) => {
                try {
                    const elements = document.querySelectorAll(selector);
                    if (elements && elements.length > 0) {
                        elements.forEach(element => element.addEventListener(event, handler));
                        console.log(`Successfully added ${event} event listeners to ${selector} (${elements.length} elements)`);
                        return true;
                    } else {
                        console.warn(`No elements found for: ${selector}. Will retry later.`);
                        return false;
                    }
                } catch (error) {
                    console.error(`Error adding ${event} event listeners to ${selector}:`, error);
                    return false;
                }
            };

            // Track which listeners need to be retried
            const retryQueue = [];

            // Main Menu
            if (!safeAddEvent('newGameBtn', 'click', () => this.showScreen('playerSetup'))) {
                retryQueue.push(['newGameBtn', 'click', () => this.showScreen('playerSetup')]);
            }
            
            if (!safeAddEvent('loadGameBtn', 'click', () => this.gameManager.loadGame())) {
                retryQueue.push(['loadGameBtn', 'click', () => this.gameManager.loadGame()]);
            }
            
            // Player Setup
            if (!safeAddEvent('startGameBtn', 'click', () => this.handleGameStart())) {
                retryQueue.push(['startGameBtn', 'click', () => this.handleGameStart()]);
            }
            
            if (!safeAddEventAll('.difficulty-option', 'click', (e) => {
                const option = e.currentTarget;
                this.selectDifficulty(option.dataset.difficulty);
            })) {
                retryQueue.push(['.difficulty-option', 'click', (e) => this.selectDifficulty(e.currentTarget.dataset.difficulty)]);
            }

            // Game UI Navigation
            if (!safeAddEventAll('.nav-btn', 'click', (e) => {
                const btn = e.currentTarget;
                this.handleNavigation(btn.dataset.screen);
            })) {
                retryQueue.push(['.nav-btn', 'click', (e) => this.handleNavigation(e.currentTarget.dataset.screen)]);
            }

            // Modal Controls
            if (!safeAddEventAll('.modal-close', 'click', (e) => {
                const btn = e.currentTarget;
                this.closeModal(btn.closest('.modal'));
            })) {
                retryQueue.push(['.modal-close', 'click', (e) => this.closeModal(e.currentTarget.closest('.modal'))]);
            }

            // Horse Actions
            if (!safeAddEvent('horseList', 'click', (e) => {
                if (e.target.classList.contains('horse-card')) {
                    this.showHorseDetails(e.target.dataset.horseId);
                }
            })) {
                retryQueue.push(['horseList', 'click', (e) => {
                    if (e.target.classList.contains('horse-card')) {
                        this.showHorseDetails(e.target.dataset.horseId);
                    }
                }]);
            }

            // If there are listeners to retry, set up a retry mechanism
            if (retryQueue.length > 0) {
                console.log(`Queuing ${retryQueue.length} listeners for retry`);
                let retryCount = 0;
                const maxRetries = 5;
                
                const retryInterval = setInterval(() => {
                    retryCount++;
                    console.log(`Retry attempt ${retryCount} for remaining listeners`);
                    
                    // Try to add each queued listener
                    for (let i = retryQueue.length - 1; i >= 0; i--) {
                        const [selector, event, handler] = retryQueue[i];
                        const success = selector.startsWith('.') ? 
                            safeAddEventAll(selector, event, handler) :
                            safeAddEvent(selector, event, handler);
                            
                        if (success) {
                            retryQueue.splice(i, 1);
                        }
                    }
                    
                    // If all listeners are added or we've reached max retries, stop trying
                    if (retryQueue.length === 0 || retryCount >= maxRetries) {
                        clearInterval(retryInterval);
                        if (retryQueue.length > 0) {
                            console.warn(`Failed to add ${retryQueue.length} event listeners after ${maxRetries} attempts`);
                        } else {
                            console.log('All event listeners successfully added');
                        }
                    }
                }, 1000); // Retry every second
            }
            
            console.log('Event listeners setup complete');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            throw error;
        }
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
            if (!this.ready) {
                throw new Error('UI Controller not ready. Cannot show screen.');
            }

            const screen = this.screens[screenId];
            if (!screen) {
                throw new Error(`Screen not found: ${screenId}`);
            }

            // Hide all screens first
            Object.values(this.screens).forEach(s => {
                if (s && s.style) s.style.display = 'none';
            });
            
            screen.style.display = 'block';
            this.currentScreen = screenId;
            console.log(`Showing screen: ${screenId}`);
            
            // Trigger any screen-specific initialization
            this.handleScreenChange(screenId);
        } catch (error) {
            console.error(`Error showing screen ${screenId}:`, error);
            this.showError(`Failed to show screen: ${screenId}`);
        }
    }

    handleScreenChange(screenId) {
        try {
            switch (screenId) {
                case 'gameUI':
                    // Update player info when showing game UI
                    this.updatePlayerInfo();
                    break;
                case 'playerSetup':
                    // Clear any previous input values
                    const inputs = document.querySelectorAll('#playerSetup input');
                    inputs.forEach(input => input.value = '');
                    break;
                // Add more cases as needed
            }
        } catch (error) {
            console.error('Error handling screen change:', error);
        }
    }

    showModal(modalId) {
        try {
            if (!this.ready) {
                console.warn('UI Controller not ready. Cannot show modal.');
                return;
            }

            if (this.modals[modalId]) {
                this.modals[modalId].style.display = 'flex';
                console.log(`Showing modal: ${modalId}`);
            } else {
                console.warn(`Modal not found: ${modalId}. Available modals: ${Object.keys(this.modals).join(', ')}`);
                // Try to find the modal by ID directly as fallback
                const modalElement = document.getElementById(modalId);
                if (modalElement) {
                    modalElement.style.display = 'flex';
                    // Add it to our modals object for future use
                    this.modals[modalId] = modalElement;
                    console.log(`Found and showing modal: ${modalId}`);
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
            if (!this.ready) {
                console.warn('UI Controller not ready. Cannot update player info.');
                return;
            }

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

            updateElement('money-display', `$${player.funds.toLocaleString()}`);
            updateElement('stable-level', player.stableLevel);
            updateElement('horse-count', `${player.horses.length}/${player.maxHorses}`);
        } catch (error) {
            console.error('Error updating player info:', error);
        }
    }

    showError(message) {
        console.error(message);
        try {
            // Try to show error in UI
            const errorModal = document.getElementById('errorModal');
            if (errorModal) {
                const errorMessage = errorModal.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = message;
                }
                this.showModal('errorModal');
            }
        } catch (error) {
            // Fallback to alert if UI error display fails
            alert(message);
        }
    }

    showSuccess(message) {
        console.log(message);
        try {
            // Try to show success message in UI
            const successToast = document.getElementById('successToast');
            if (successToast) {
                const messageElement = successToast.querySelector('.message');
                if (messageElement) {
                    messageElement.textContent = message;
                    successToast.style.display = 'block';
                    setTimeout(() => {
                        successToast.style.display = 'none';
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error showing success message:', error);
        }
    }
}

export default UIController; 