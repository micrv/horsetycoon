class UIController {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentScreen = 'loading';
        this.screens = {};
        this.modals = {};
        this.audioManager = window.audioManager;
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
            musicBtn?.classList.toggle('muted', this.audioManager.isMusicMuted);
        });

        // SFX toggle
        const sfxBtn = safeAddEvent('toggleSfx', 'click', () => {
            this.audioManager.toggleSfx();
            sfxBtn?.classList.toggle('muted', this.audioManager.isSfxMuted);
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

        // Set initial states - only if elements exist
        if (musicBtn) musicBtn.classList.toggle('muted', this.audioManager.isMusicMuted);
        if (sfxBtn) sfxBtn.classList.toggle('muted', this.audioManager.isSfxMuted);
        if (musicSlider) musicSlider.value = this.audioManager.musicVolume * 100;
        if (sfxSlider) sfxSlider.value = this.audioManager.sfxVolume * 100;
    }

    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => screen.style.display = 'none');
        this.screens[screenId].style.display = 'block';
        this.currentScreen = screenId;
    }

    showModal(modalId) {
        this.modals[modalId].style.display = 'flex';
    }

    closeModal(modal) {
        modal.style.display = 'none';
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