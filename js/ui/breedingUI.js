class BreedingUI {
    constructor(gameManager, uiController) {
        this.gameManager = gameManager;
        this.uiController = uiController;
        this.selectedHorse = null;
        this.selectedMate = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('breedingTab').addEventListener('click', () => this.showBreedingCenter());
        document.getElementById('confirmBreedingBtn').addEventListener('click', () => this.confirmBreeding());
        document.getElementById('cancelBreedingBtn').addEventListener('click', () => this.resetBreedingSelection());
        
        // Breeding history tab
        document.getElementById('breedingHistoryTab').addEventListener('click', () => this.showBreedingHistory());
    }

    showBreedingCenter() {
        this.resetBreedingSelection();
        this.updateAvailableHorses();
        this.updateBreedingStats();
    }

    updateAvailableHorses() {
        const container = document.getElementById('availableHorses');
        container.innerHTML = '';
        
        const horses = this.gameManager.getBreedableHorses();
        
        horses.forEach(horse => {
            const card = this.createBreedingHorseCard(horse);
            container.appendChild(card);
        });
        
        if (horses.length === 0) {
            container.innerHTML = `
                <div class="no-horses-message">
                    No horses available for breeding at this time.
                    Horses need to be mature and well-rested to breed.
                </div>
            `;
        }
    }

    createBreedingHorseCard(horse) {
        const card = document.createElement('div');
        card.className = 'breeding-horse-card';
        card.dataset.horseId = horse.id;
        
        const breedingStats = this.calculateBreedingStats(horse);
        const cooldownTime = this.getBreedingCooldown(horse);
        
        card.innerHTML = `
            <div class="breeding-card-header">
                <h3>${horse.name}</h3>
                <span class="gender-icon">${horse.gender === 'male' ? '♂' : '♀'}</span>
            </div>
            <div class="breeding-card-stats">
                <div class="stat-group">
                    <div>Level ${horse.level}</div>
                    <div>Rating ${horse.overallRating}</div>
                </div>
                <div class="stat-group">
                    <div>${horse.breed}</div>
                    <div>Age: ${horse.age} years</div>
                </div>
            </div>
            <div class="breeding-potential">
                <div>Breeding Potential: ${breedingStats.potential}%</div>
                <div>Genetic Quality: ${breedingStats.geneticQuality}%</div>
            </div>
            ${cooldownTime ? `<div class="cooldown">Ready in: ${cooldownTime}</div>` : ''}
            <button class="select-breeding-btn" ${this.canBreed(horse) ? '' : 'disabled'}>
                Select for Breeding
            </button>
        `;
        
        if (this.canBreed(horse)) {
            card.querySelector('.select-breeding-btn').addEventListener('click', () => this.selectHorseForBreeding(horse));
        }
        
        return card;
    }

    calculateBreedingStats(horse) {
        // This would be calculated based on horse's stats, genetics, and breeding history
        return {
            potential: Math.round((horse.overallRating + horse.geneticPotential) / 2),
            geneticQuality: Math.round(horse.geneticQuality)
        };
    }

    getBreedingCooldown(horse) {
        const cooldown = this.gameManager.getBreedingCooldown(horse.id);
        if (!cooldown) return null;
        
        const hours = Math.ceil(cooldown / (60 * 60 * 1000));
        return hours > 24 ? `${Math.ceil(hours / 24)}d` : `${hours}h`;
    }

    canBreed(horse) {
        return this.gameManager.canBreed(horse.id);
    }

    selectHorseForBreeding(horse) {
        if (!this.selectedHorse) {
            this.selectedHorse = horse;
            this.updateCompatibleMates();
        } else if (!this.selectedMate && this.isCompatibleMate(horse)) {
            this.selectedMate = horse;
            this.showBreedingConfirmation();
        }
        
        this.updateSelectionUI();
    }

    updateCompatibleMates() {
        const container = document.getElementById('availableHorses');
        const cards = container.querySelectorAll('.breeding-horse-card');
        
        cards.forEach(card => {
            const horseId = card.dataset.horseId;
            const horse = this.gameManager.getHorse(horseId);
            
            if (this.isCompatibleMate(horse)) {
                card.classList.add('compatible-mate');
            } else {
                card.classList.add('incompatible-mate');
            }
        });
    }

    isCompatibleMate(horse) {
        if (!this.selectedHorse) return false;
        return this.gameManager.areHorsesCompatible(this.selectedHorse.id, horse.id);
    }

    showBreedingConfirmation() {
        const confirmationPanel = document.getElementById('breedingConfirmation');
        const cost = this.calculateBreedingCost();
        const chance = this.calculateBreedingSuccess();
        
        confirmationPanel.innerHTML = `
            <h3>Confirm Breeding</h3>
            <div class="breeding-pair">
                <div class="parent">
                    <h4>${this.selectedHorse.name}</h4>
                    <div>Rating: ${this.selectedHorse.overallRating}</div>
                </div>
                <div class="breeding-plus">+</div>
                <div class="parent">
                    <h4>${this.selectedMate.name}</h4>
                    <div>Rating: ${this.selectedMate.overallRating}</div>
                </div>
            </div>
            <div class="breeding-details">
                <div>Cost: $${cost.toLocaleString()}</div>
                <div>Success Chance: ${chance}%</div>
                <div>Expected Foal Rating: ${this.calculateExpectedFoalRating()}</div>
            </div>
            <div class="breeding-buttons">
                <button id="confirmBreedingBtn">Breed (${cost.toLocaleString()})</button>
                <button id="cancelBreedingBtn">Cancel</button>
            </div>
        `;
        
        confirmationPanel.style.display = 'block';
    }

    calculateBreedingCost() {
        return this.gameManager.calculateBreedingCost(this.selectedHorse.id, this.selectedMate.id);
    }

    calculateBreedingSuccess() {
        return Math.round(this.gameManager.calculateBreedingSuccess(this.selectedHorse.id, this.selectedMate.id) * 100);
    }

    calculateExpectedFoalRating() {
        const minRating = Math.floor((this.selectedHorse.overallRating + this.selectedMate.overallRating) / 2 * 0.9);
        const maxRating = Math.ceil((this.selectedHorse.overallRating + this.selectedMate.overallRating) / 2 * 1.1);
        return `${minRating}-${maxRating}`;
    }

    async confirmBreeding() {
        const cost = this.calculateBreedingCost();
        
        const confirmed = await this.uiController.showConfirmation(
            'Confirm Breeding',
            `Are you sure you want to breed ${this.selectedHorse.name} with ${this.selectedMate.name} for $${cost.toLocaleString()}?`
        );
        
        if (confirmed) {
            const result = this.gameManager.breedHorses(this.selectedHorse.id, this.selectedMate.id);
            
            if (result.success) {
                this.uiController.showSuccess('Breeding successful! The foal will be born soon.');
                this.resetBreedingSelection();
                this.showBreedingCenter();
            } else {
                this.uiController.showError(result.message);
            }
        }
    }

    resetBreedingSelection() {
        this.selectedHorse = null;
        this.selectedMate = null;
        this.updateSelectionUI();
        
        const confirmationPanel = document.getElementById('breedingConfirmation');
        confirmationPanel.style.display = 'none';
    }

    updateSelectionUI() {
        const cards = document.querySelectorAll('.breeding-horse-card');
        cards.forEach(card => {
            card.classList.remove('selected', 'compatible-mate', 'incompatible-mate');
            
            if (this.selectedHorse && card.dataset.horseId === this.selectedHorse.id) {
                card.classList.add('selected');
            }
            if (this.selectedMate && card.dataset.horseId === this.selectedMate.id) {
                card.classList.add('selected');
            }
        });
    }

    showBreedingHistory() {
        const container = document.getElementById('breedingHistory');
        container.innerHTML = '';
        
        const history = this.gameManager.getBreedingHistory();
        history.forEach(record => {
            const historyCard = this.createBreedingHistoryCard(record);
            container.appendChild(historyCard);
        });
    }

    createBreedingHistoryCard(record) {
        const card = document.createElement('div');
        card.className = 'breeding-history-card';
        
        const date = new Date(record.date).toLocaleDateString();
        
        card.innerHTML = `
            <div class="history-header">
                <span class="breeding-date">${date}</span>
                <span class="breeding-result ${record.success ? 'success' : 'failure'}">
                    ${record.success ? 'Success' : 'Failed'}
                </span>
            </div>
            <div class="breeding-parents">
                <div class="parent">
                    <div>${record.sire.name}</div>
                    <div>Rating: ${record.sire.rating}</div>
                </div>
                <div class="breeding-plus">+</div>
                <div class="parent">
                    <div>${record.dam.name}</div>
                    <div>Rating: ${record.dam.rating}</div>
                </div>
            </div>
            ${record.success ? `
                <div class="foal-details">
                    <h4>${record.foal.name}</h4>
                    <div>Rating: ${record.foal.rating}</div>
                    <div>Breed: ${record.foal.breed}</div>
                </div>
            ` : ''}
        `;
        
        return card;
    }

    updateBreedingStats() {
        const stats = document.getElementById('breedingStats');
        const breedingStats = this.gameManager.getBreedingStats();
        
        stats.innerHTML = `
            <div>Total Breedings: ${breedingStats.total}</div>
            <div>Successful: ${breedingStats.successful}</div>
            <div>Failed: ${breedingStats.failed}</div>
            <div>Success Rate: ${Math.round(breedingStats.successRate * 100)}%</div>
            <div>Average Foal Rating: ${breedingStats.avgFoalRating}</div>
        `;
    }
}

export default BreedingUI; 