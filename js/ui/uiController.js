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
        // Main Menu
        document.getElementById('newGameBtn').addEventListener('click', () => this.showScreen('playerSetup'));
        document.getElementById('loadGameBtn').addEventListener('click', () => this.gameManager.loadGame());
        
        // Player Setup
        document.getElementById('startGameBtn').addEventListener('click', () => this.handleGameStart());
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', () => this.selectDifficulty(option.dataset.difficulty));
        });

        // Game UI Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleNavigation(btn.dataset.screen));
        });

        // Modal Controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.closest('.modal')));
        });

        // Horse Actions
        document.getElementById('horseList').addEventListener('click', (e) => {
            if (e.target.classList.contains('horse-card')) {
                this.showHorseDetails(e.target.dataset.horseId);
            }
        });
    }

    setupAudioControls() {
        const musicBtn = document.getElementById('toggleMusic');
        const sfxBtn = document.getElementById('toggleSfx');
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');

        // Music toggle
        musicBtn.addEventListener('click', () => {
            this.audioManager.toggleMusic();
            musicBtn.classList.toggle('muted', this.audioManager.isMusicMuted);
        });

        // SFX toggle
        sfxBtn.addEventListener('click', () => {
            this.audioManager.toggleSfx();
            sfxBtn.classList.toggle('muted', this.audioManager.isSfxMuted);
        });

        // Music volume
        musicSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.audioManager.setMusicVolume(volume);
        });

        // SFX volume
        sfxSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            this.audioManager.setSfxVolume(volume);
        });

        // Set initial states
        musicBtn.classList.toggle('muted', this.audioManager.isMusicMuted);
        sfxBtn.classList.toggle('muted', this.audioManager.isSfxMuted);
        musicSlider.value = this.audioManager.musicVolume * 100;
        sfxSlider.value = this.audioManager.sfxVolume * 100;
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