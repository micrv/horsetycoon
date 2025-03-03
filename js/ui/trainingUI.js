class TrainingUI {
    constructor(gameManager, uiController) {
        this.gameManager = gameManager;
        this.uiController = uiController;
        this.selectedHorse = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('trainingTab').addEventListener('click', () => this.showTrainingCenter());
        document.getElementById('confirmTrainingBtn').addEventListener('click', () => this.confirmTraining());
        document.getElementById('cancelTrainingBtn').addEventListener('click', () => this.resetTrainingSelection());
        
        // Training history tab
        document.getElementById('trainingHistoryTab').addEventListener('click', () => this.showTrainingHistory());
    }

    showTrainingCenter() {
        this.resetTrainingSelection();
        this.updateAvailableHorses();
        this.updateTrainingStats();
    }

    updateAvailableHorses() {
        const container = document.getElementById('trainableHorses');
        container.innerHTML = '';
        
        const horses = this.gameManager.getTrainableHorses();
        
        horses.forEach(horse => {
            const card = this.createTrainingHorseCard(horse);
            container.appendChild(card);
        });
        
        if (horses.length === 0) {
            container.innerHTML = `
                <div class="no-horses-message">
                    No horses available for training at this time.
                    Horses need to have sufficient energy to train.
                </div>
            `;
        }
    }

    createTrainingHorseCard(horse) {
        const card = document.createElement('div');
        card.className = 'training-horse-card';
        card.dataset.horseId = horse.id;
        
        const energyPercent = (horse.energy / horse.maxEnergy) * 100;
        const trainingProgress = this.calculateTrainingProgress(horse);
        
        card.innerHTML = `
            <div class="training-card-header">
                <h3>${horse.name}</h3>
                <span class="level">Level ${horse.level}</span>
            </div>
            <div class="training-card-stats">
                <div class="stat-group">
                    <div>Rating ${horse.overallRating}</div>
                    <div>${horse.breed}</div>
                </div>
                <div class="energy-bar">
                    <label>Energy</label>
                    <div class="bar">
                        <div class="fill" style="width: ${energyPercent}%"></div>
                    </div>
                    <span>${Math.round(energyPercent)}%</span>
                </div>
            </div>
            <div class="training-progress">
                <div class="progress-bar">
                    <div class="fill" style="width: ${trainingProgress}%"></div>
                </div>
                <span>Progress to Next Level: ${trainingProgress}%</span>
            </div>
            <button class="select-training-btn" ${this.canTrain(horse) ? '' : 'disabled'}>
                Select for Training
            </button>
        `;
        
        if (this.canTrain(horse)) {
            card.querySelector('.select-training-btn').addEventListener('click', () => this.selectHorseForTraining(horse));
        }
        
        return card;
    }

    calculateTrainingProgress(horse) {
        return Math.round(horse.experience / horse.experienceToNextLevel * 100);
    }

    canTrain(horse) {
        return this.gameManager.canTrain(horse.id);
    }

    selectHorseForTraining(horse) {
        this.selectedHorse = horse;
        this.updateSelectionUI();
        this.showTrainingOptions();
    }

    showTrainingOptions() {
        const optionsContainer = document.getElementById('trainingOptions');
        optionsContainer.innerHTML = '';
        
        const options = this.getTrainingOptions();
        
        options.forEach(option => {
            const optionElement = this.createTrainingOptionElement(option);
            optionsContainer.appendChild(optionElement);
        });
        
        document.getElementById('trainingConfirmation').style.display = 'block';
    }

    getTrainingOptions() {
        return [
            {
                id: 'speed',
                name: 'Speed Training',
                description: 'Improve horse\'s speed and acceleration',
                energyCost: 30,
                duration: 2,
                stats: {
                    speed: '+2-4',
                    acceleration: '+1-3'
                }
            },
            {
                id: 'stamina',
                name: 'Stamina Training',
                description: 'Build endurance and stamina',
                energyCost: 25,
                duration: 3,
                stats: {
                    stamina: '+3-5'
                }
            },
            {
                id: 'jumping',
                name: 'Jump Training',
                description: 'Improve jumping ability',
                energyCost: 35,
                duration: 2,
                stats: {
                    jumping: '+2-4',
                    acceleration: '+1-2'
                }
            },
            {
                id: 'technique',
                name: 'Technique Training',
                description: 'Refine racing technique and handling',
                energyCost: 20,
                duration: 1,
                stats: {
                    speed: '+1-2',
                    acceleration: '+1-2',
                    stamina: '+1-2'
                }
            }
        ];
    }

    createTrainingOptionElement(option) {
        const element = document.createElement('div');
        element.className = 'training-option';
        element.dataset.optionId = option.id;
        
        const canAffordEnergy = this.selectedHorse.energy >= option.energyCost;
        
        element.innerHTML = `
            <div class="option-header">
                <h4>${option.name}</h4>
                <span class="energy-cost ${canAffordEnergy ? '' : 'insufficient'}">
                    ${option.energyCost} Energy
                </span>
            </div>
            <div class="option-description">${option.description}</div>
            <div class="option-details">
                <div class="duration">Duration: ${option.duration} hours</div>
                <div class="potential-gains">
                    ${this.formatStatGains(option.stats)}
                </div>
            </div>
            <button class="select-option-btn" ${canAffordEnergy ? '' : 'disabled'}>
                Select
            </button>
        `;
        
        if (canAffordEnergy) {
            element.querySelector('.select-option-btn').addEventListener('click', () => {
                this.selectTrainingOption(option);
            });
        }
        
        return element;
    }

    formatStatGains(stats) {
        return Object.entries(stats)
            .map(([stat, gain]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${gain}`)
            .join(' • ');
    }

    selectTrainingOption(option) {
        const options = document.querySelectorAll('.training-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        const selectedOption = document.querySelector(`[data-option-id="${option.id}"]`);
        selectedOption.classList.add('selected');
        
        this.selectedOption = option;
        this.updateConfirmationPanel();
    }

    updateConfirmationPanel() {
        const panel = document.getElementById('trainingConfirmationPanel');
        
        panel.innerHTML = `
            <h3>Confirm Training</h3>
            <div class="confirmation-details">
                <div class="horse-info">
                    <h4>${this.selectedHorse.name}</h4>
                    <div>Current Energy: ${this.selectedHorse.energy}/${this.selectedHorse.maxEnergy}</div>
                </div>
                <div class="training-info">
                    <div>${this.selectedOption.name}</div>
                    <div>Energy Cost: ${this.selectedOption.energyCost}</div>
                    <div>Duration: ${this.selectedOption.duration} hours</div>
                </div>
                <div class="expected-gains">
                    <h4>Expected Gains</h4>
                    <div>${this.formatStatGains(this.selectedOption.stats)}</div>
                </div>
            </div>
            <div class="confirmation-buttons">
                <button id="confirmTrainingBtn">Start Training</button>
                <button id="cancelTrainingBtn">Cancel</button>
            </div>
        `;
    }

    async confirmTraining() {
        if (!this.selectedHorse || !this.selectedOption) return;
        
        const confirmed = await this.uiController.showConfirmation(
            'Confirm Training',
            `Start ${this.selectedOption.name} for ${this.selectedHorse.name}? This will use ${this.selectedOption.energyCost} energy.`
        );
        
        if (confirmed) {
            const result = this.gameManager.startTraining(
                this.selectedHorse.id,
                this.selectedOption.id
            );
            
            if (result.success) {
                this.uiController.showSuccess(`${this.selectedHorse.name} has started training!`);
                this.resetTrainingSelection();
                this.showTrainingCenter();
            } else {
                this.uiController.showError(result.message);
            }
        }
    }

    resetTrainingSelection() {
        this.selectedHorse = null;
        this.selectedOption = null;
        this.updateSelectionUI();
        
        document.getElementById('trainingConfirmation').style.display = 'none';
    }

    updateSelectionUI() {
        const cards = document.querySelectorAll('.training-horse-card');
        cards.forEach(card => {
            card.classList.remove('selected');
            if (this.selectedHorse && card.dataset.horseId === this.selectedHorse.id) {
                card.classList.add('selected');
            }
        });
    }

    showTrainingHistory() {
        const container = document.getElementById('trainingHistory');
        container.innerHTML = '';
        
        const history = this.gameManager.getTrainingHistory();
        history.forEach(record => {
            const historyCard = this.createTrainingHistoryCard(record);
            container.appendChild(historyCard);
        });
    }

    createTrainingHistoryCard(record) {
        const card = document.createElement('div');
        card.className = 'training-history-card';
        
        const date = new Date(record.date).toLocaleDateString();
        const gains = this.formatTrainingGains(record.gains);
        
        card.innerHTML = `
            <div class="history-header">
                <span class="training-date">${date}</span>
                <span class="training-type">${record.trainingType}</span>
            </div>
            <div class="history-details">
                <div class="horse-name">${record.horseName}</div>
                <div class="training-duration">${record.duration} hours</div>
            </div>
            <div class="training-results">
                <h4>Improvements</h4>
                <div class="stat-changes">${gains}</div>
            </div>
        `;
        
        return card;
    }

    formatTrainingGains(gains) {
        return Object.entries(gains)
            .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${value}`)
            .join(' • ');
    }

    updateTrainingStats() {
        const stats = document.getElementById('trainingStats');
        const trainingStats = this.gameManager.getTrainingStats();
        
        stats.innerHTML = `
            <div>Total Training Sessions: ${trainingStats.total}</div>
            <div>Time Spent Training: ${trainingStats.totalHours} hours</div>
            <div>Most Trained Skill: ${trainingStats.mostTrainedSkill}</div>
            <div>Average Improvement: ${trainingStats.averageImprovement.toFixed(1)} points</div>
        `;
    }
}

export default TrainingUI; 