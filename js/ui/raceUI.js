class RaceUI {
    constructor(gameManager, uiController) {
        this.gameManager = gameManager;
        this.uiController = uiController;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('raceScheduleTab').addEventListener('click', () => this.showRaceSchedule());
        document.getElementById('raceHistoryTab').addEventListener('click', () => this.showRaceHistory());
        document.getElementById('enterRaceBtn').addEventListener('click', () => this.initiateRaceEntry());
        document.getElementById('confirmRaceEntryBtn').addEventListener('click', () => this.confirmRaceEntry());
    }

    showRaceSchedule() {
        const scheduleContainer = document.getElementById('raceSchedule');
        scheduleContainer.innerHTML = '';
        
        const races = this.gameManager.getRaceSchedule();
        races.forEach(race => {
            const raceCard = this.createRaceCard(race);
            scheduleContainer.appendChild(raceCard);
        });
    }

    createRaceCard(race) {
        const card = document.createElement('div');
        card.className = 'race-card';
        card.dataset.raceId = race.id;
        
        const timeUntilRace = this.calculateTimeUntilRace(race.startTime);
        const entryFeeFormatted = race.entryFee.toLocaleString();
        const prizePurseFormatted = race.prizePurse.toLocaleString();
        
        card.innerHTML = `
            <div class="race-header">
                <h3>${race.name}</h3>
                <span class="race-time">${timeUntilRace}</span>
            </div>
            <div class="race-details">
                <div class="race-info">
                    <div>Distance: ${race.distance}m</div>
                    <div>Terrain: ${race.terrain}</div>
                    <div>Difficulty: ${race.difficulty}</div>
                </div>
                <div class="race-prizes">
                    <div>Entry: $${entryFeeFormatted}</div>
                    <div>Prize: $${prizePurseFormatted}</div>
                </div>
            </div>
            <div class="race-requirements">
                ${this.formatRaceRequirements(race.requirements)}
            </div>
            <button class="enter-race-btn" ${this.canEnterRace(race) ? '' : 'disabled'}>
                Enter Race
            </button>
        `;
        
        return card;
    }

    formatRaceRequirements(requirements) {
        const reqList = [];
        if (requirements.minLevel) reqList.push(`Min Level: ${requirements.minLevel}`);
        if (requirements.maxLevel) reqList.push(`Max Level: ${requirements.maxLevel}`);
        if (requirements.breed) reqList.push(`Breed: ${requirements.breed}`);
        if (requirements.minRating) reqList.push(`Min Rating: ${requirements.minRating}`);
        
        return reqList.join(' • ');
    }

    calculateTimeUntilRace(startTime) {
        const now = this.gameManager.getCurrentGameTime();
        const diff = startTime - now;
        
        if (diff <= 0) return 'Starting Now';
        
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    }

    canEnterRace(race) {
        return this.gameManager.canEnterRace(race.id);
    }

    showRaceHistory() {
        const historyContainer = document.getElementById('raceHistory');
        historyContainer.innerHTML = '';
        
        const history = this.gameManager.getRaceHistory();
        history.forEach(result => {
            const resultCard = this.createRaceResultCard(result);
            historyContainer.appendChild(resultCard);
        });
    }

    createRaceResultCard(result) {
        const card = document.createElement('div');
        card.className = 'race-result-card';
        
        const position = this.formatPosition(result.position);
        const earnings = result.earnings > 0 ? `+$${result.earnings.toLocaleString()}` : '-';
        
        card.innerHTML = `
            <div class="result-header">
                <h4>${result.raceName}</h4>
                <span class="result-date">${this.formatDate(result.date)}</span>
            </div>
            <div class="result-details">
                <div class="horse-info">
                    <div>${result.horseName}</div>
                    <div>Time: ${this.formatRaceTime(result.time)}</div>
                </div>
                <div class="race-outcome">
                    <div class="position">${position}</div>
                    <div class="earnings">${earnings}</div>
                </div>
            </div>
        `;
        
        return card;
    }

    formatPosition(position) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const suffix = position <= 3 ? suffixes[position] : suffixes[0];
        return `${position}${suffix}`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString();
    }

    formatRaceTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = (time % 60).toFixed(1);
        return `${minutes}:${seconds.padStart(4, '0')}`;
    }

    initiateRaceEntry() {
        const raceId = document.querySelector('.race-card.selected').dataset.raceId;
        const race = this.gameManager.getRace(raceId);
        
        // Populate eligible horses
        const eligibleHorses = this.gameManager.getEligibleHorsesForRace(raceId);
        this.populateHorseSelection(eligibleHorses, race);
        
        this.uiController.showModal('raceEntry');
    }

    populateHorseSelection(horses, race) {
        const container = document.getElementById('raceHorseSelection');
        container.innerHTML = '';
        
        horses.forEach(horse => {
            const option = document.createElement('div');
            option.className = 'horse-entry-option';
            option.dataset.horseId = horse.id;
            
            const winChance = this.calculateWinChance(horse, race);
            
            option.innerHTML = `
                <div class="horse-entry-info">
                    <h4>${horse.name}</h4>
                    <div>Level ${horse.level} • Rating ${horse.overallRating}</div>
                </div>
                <div class="horse-entry-stats">
                    <div>Energy: ${horse.energy}/${horse.maxEnergy}</div>
                    <div>Win Chance: ${winChance}%</div>
                </div>
                <button class="select-horse-btn">Select</button>
            `;
            
            container.appendChild(option);
        });
    }

    calculateWinChance(horse, race) {
        // This would be calculated based on horse stats, race requirements, and competition
        const chance = this.gameManager.calculateRaceWinChance(horse.id, race.id);
        return Math.round(chance * 100);
    }

    confirmRaceEntry() {
        const raceId = document.querySelector('.race-card.selected').dataset.raceId;
        const horseId = document.querySelector('.horse-entry-option.selected').dataset.horseId;
        
        const result = this.gameManager.enterRace(raceId, horseId);
        
        if (result.success) {
            this.uiController.showSuccess('Successfully entered the race!');
            this.showRaceSchedule(); // Refresh the schedule
            this.uiController.closeModal(document.getElementById('raceEntryModal'));
        } else {
            this.uiController.showError(result.message);
        }
    }
}

export default RaceUI; 