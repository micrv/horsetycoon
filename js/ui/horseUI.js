class HorseUI {
    constructor(gameManager, uiController) {
        this.gameManager = gameManager;
        this.uiController = uiController;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Horse Detail Modal Actions
        document.getElementById('trainHorseBtn').addEventListener('click', () => this.showTrainingOptions());
        document.getElementById('sellHorseBtn').addEventListener('click', () => this.initiateSale());
        document.getElementById('breedHorseBtn').addEventListener('click', () => this.initiateBreeding());
        document.getElementById('restHorseBtn').addEventListener('click', () => this.restHorse());
        
        // Training Modal
        document.getElementById('confirmTrainingBtn').addEventListener('click', () => this.executeTraining());
        
        // Sale Modal
        document.getElementById('confirmSaleBtn').addEventListener('click', () => this.executeSale());
    }

    updateHorseList() {
        const horseList = document.getElementById('horseList');
        horseList.innerHTML = '';
        
        this.gameManager.player.horses.forEach(horse => {
            const card = this.createHorseCard(horse);
            horseList.appendChild(card);
        });
    }

    createHorseCard(horse) {
        const card = document.createElement('div');
        card.className = 'horse-card';
        card.dataset.horseId = horse.id;
        
        const energyPercent = (horse.energy / horse.maxEnergy) * 100;
        const healthPercent = (horse.health / horse.maxHealth) * 100;
        
        card.innerHTML = `
            <h3>${horse.name}</h3>
            <div class="horse-card-stats">
                <div class="stat">Level ${horse.level}</div>
                <div class="stat">Rating ${horse.overallRating}</div>
            </div>
            <div class="horse-card-bars">
                <div class="energy-bar">
                    <div class="bar-fill" style="width: ${energyPercent}%"></div>
                </div>
                <div class="health-bar">
                    <div class="bar-fill" style="width: ${healthPercent}%"></div>
                </div>
            </div>
            <div class="horse-card-status">
                ${this.getStatusIndicators(horse)}
            </div>
        `;
        
        return card;
    }

    getStatusIndicators(horse) {
        const indicators = [];
        
        if (horse.isResting) indicators.push('🌙');
        if (horse.isTraining) indicators.push('💪');
        if (horse.isRacing) indicators.push('🏃');
        if (horse.forSale) indicators.push('💰');
        if (horse.health < horse.maxHealth * 0.5) indicators.push('🏥');
        if (horse.energy < horse.maxEnergy * 0.2) indicators.push('😴');
        
        return indicators.join(' ');
    }

    showTrainingOptions() {
        const horse = this.getCurrentHorse();
        const trainingModal = document.getElementById('trainingModal');
        
        // Update training options based on horse's current stats and energy
        const options = document.querySelectorAll('.training-option');
        options.forEach(option => {
            const cost = parseInt(option.dataset.energyCost);
            option.disabled = horse.energy < cost;
        });
        
        this.uiController.showModal('training');
    }

    executeTraining() {
        const horse = this.getCurrentHorse();
        const selectedOption = document.querySelector('.training-option:checked');
        
        if (!selectedOption) {
            this.uiController.showError('Please select a training option');
            return;
        }
        
        const type = selectedOption.value;
        const result = this.gameManager.trainHorse(horse.id, type);
        
        if (result.success) {
            this.uiController.showSuccess(`${horse.name} completed ${type} training!`);
            this.updateHorseList();
            this.uiController.closeModal(document.getElementById('trainingModal'));
        } else {
            this.uiController.showError(result.message);
        }
    }

    initiateSale() {
        const horse = this.getCurrentHorse();
        const saleModal = document.getElementById('saleModal');
        const suggestedPrice = horse.calculateMarketValue();
        
        document.getElementById('salePrice').value = suggestedPrice;
        document.getElementById('suggestedPrice').textContent = `Suggested: $${suggestedPrice.toLocaleString()}`;
        
        this.uiController.showModal('sale');
    }

    executeSale() {
        const horse = this.getCurrentHorse();
        const price = parseInt(document.getElementById('salePrice').value);
        
        if (isNaN(price) || price <= 0) {
            this.uiController.showError('Please enter a valid price');
            return;
        }
        
        const result = this.gameManager.listHorseForSale(horse.id, price);
        
        if (result.success) {
            this.uiController.showSuccess(`${horse.name} has been listed for sale`);
            this.updateHorseList();
            this.uiController.closeModal(document.getElementById('saleModal'));
        } else {
            this.uiController.showError(result.message);
        }
    }

    initiateBreeding() {
        const horse = this.getCurrentHorse();
        if (!this.gameManager.canBreed(horse.id)) {
            this.uiController.showError('This horse cannot breed at this time');
            return;
        }
        
        const compatibleMates = this.gameManager.getCompatibleMates(horse.id);
        this.populateBreedingOptions(compatibleMates);
        this.uiController.showModal('breeding');
    }

    populateBreedingOptions(mates) {
        const optionsContainer = document.getElementById('breedingOptions');
        optionsContainer.innerHTML = '';
        
        mates.forEach(mate => {
            const option = document.createElement('div');
            option.className = 'breeding-option';
            option.dataset.mateId = mate.id;
            option.innerHTML = `
                <h4>${mate.name}</h4>
                <div class="mate-stats">
                    <div>Rating: ${mate.overallRating}</div>
                    <div>Breed: ${mate.breed}</div>
                </div>
                <button class="select-mate-btn">Select</button>
            `;
            optionsContainer.appendChild(option);
        });
    }

    restHorse() {
        const horse = this.getCurrentHorse();
        const result = this.gameManager.restHorse(horse.id);
        
        if (result.success) {
            this.uiController.showSuccess(`${horse.name} is now resting`);
            this.updateHorseList();
            this.uiController.closeModal(document.getElementById('horseDetailModal'));
        } else {
            this.uiController.showError(result.message);
        }
    }

    getCurrentHorse() {
        const horseId = document.querySelector('#horseDetailModal').dataset.horseId;
        return this.gameManager.getHorse(horseId);
    }
}

export default HorseUI; 