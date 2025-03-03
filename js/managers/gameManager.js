/**
 * Horse Tycoon - Game Manager Class
 * 
 * Manages overall game state and coordinates between different managers
 */

class GameManager {
  /**
   * Create a new Game Manager
   * @param {Object} config - The game configuration
   */
  constructor(config = {}) {
    // Game state
    this.gameState = 'loading'; // loading, mainMenu, playerSetup, playing, paused
    this.gameTime = config.gameTime || { day: 1, month: 1, year: 2023 };
    this.gameSpeed = config.gameSpeed || 1; // 1 = normal, 2 = fast, 3 = very fast
    this.autosaveEnabled = config.autosaveEnabled !== false;
    this.soundEnabled = config.soundEnabled !== false;
    this.difficulty = config.difficulty || 'normal'; // easy, normal, hard
    this.lastSaveTime = config.lastSaveTime || null;
    this.tutorialEnabled = config.tutorialEnabled !== false;
    this.tutorialStep = config.tutorialStep || 0;
    
    // Load manager classes if not in browser context
    if (typeof require !== 'undefined') {
      const Player = require('../models/player.js');
      const HorseManager = require('../managers/horseManager.js');
      const RaceManager = require('../managers/raceManager.js');
      
      this.Player = Player;
      this.HorseManager = HorseManager;
      this.RaceManager = RaceManager;
    } else {
      this.Player = Player;
      this.HorseManager = HorseManager;
      this.RaceManager = RaceManager;
    }
    
    // Initialize managers
    this.player = null;
    this.horseManager = null;
    this.raceManager = null;
    
    // Event callbacks
    this.callbacks = {
      onGameStateChange: [],
      onDayChange: [],
      onPlayerUpdate: [],
      onHorsesUpdate: [],
      onRacesUpdate: [],
      onNotification: []
    };
    
    // Initialize game if config is provided
    if (config.autoInit) {
      this.initGame();
    }
  }
  
  /**
   * Initialize the game
   * @returns {Object} Initialization result
   */
  initGame() {
    // Set game state to loading
    this.setGameState('loading');
    
    // Initialize player
    this.player = new this.Player({
      gameTime: this.gameTime,
      difficulty: this.difficulty
    });
    
    // Initialize horse manager
    this.horseManager = new this.HorseManager({
      gameTime: this.gameTime,
      playerFunds: this.player.funds,
      stableSize: this.player.maxHorses
    });
    
    // Initialize race manager
    this.raceManager = new this.RaceManager({
      gameTime: this.gameTime,
      playerReputation: this.player.reputation
    });
    
    // Generate initial race schedule
    this.raceManager.generateRaceSchedule(7);
    
    // Set game state to main menu
    this.setGameState('mainMenu');
    
    return {
      success: true,
      message: 'Game initialized successfully'
    };
  }
  
  /**
   * Set the game state
   * @param {string} state - New game state
   */
  setGameState(state) {
    const oldState = this.gameState;
    this.gameState = state;
    
    // Trigger callbacks
    this.triggerCallbacks('onGameStateChange', {
      oldState,
      newState: state
    });
  }
  
  /**
   * Start a new game
   * @param {Object} playerConfig - Player configuration
   * @returns {Object} Result of starting a new game
   */
  startNewGame(playerConfig) {
    // Set game state to player setup
    this.setGameState('playerSetup');
    
    // Initialize player with config
    this.player = new this.Player({
      name: playerConfig.name || 'Player',
      stableName: playerConfig.stableName || 'My Stable',
      gameTime: this.gameTime,
      difficulty: this.difficulty
    });
    
    // Initialize horse manager
    this.horseManager = new this.HorseManager({
      gameTime: this.gameTime,
      playerFunds: this.player.funds,
      stableSize: this.player.maxHorses
    });
    
    // Initialize race manager
    this.raceManager = new this.RaceManager({
      gameTime: this.gameTime,
      playerReputation: this.player.reputation
    });
    
    // Generate initial race schedule
    this.raceManager.generateRaceSchedule(7);
    
    return {
      success: true,
      message: 'New game started',
      starterHorses: this.horseManager.generateStarterHorses(3, this.difficulty)
    };
  }
  
  /**
   * Select a starter horse and begin the game
   * @param {Object} horse - The selected starter horse
   * @returns {Object} Result of selecting a starter horse
   */
  selectStarterHorse(horse) {
    // Add the horse to the player's stable
    const addResult = this.horseManager.addHorse(horse);
    
    if (!addResult.success) {
      return {
        success: false,
        message: 'Failed to add starter horse: ' + addResult.message
      };
    }
    
    // Update player's horses
    this.player.horses = this.horseManager.getAllHorses();
    
    // Set game state to playing
    this.setGameState('playing');
    
    // Save the game
    this.saveGame();
    
    return {
      success: true,
      message: 'Starter horse selected, game started',
      horse: horse
    };
  }
  
  /**
   * Advance the game by one day
   * @returns {Object} Result of advancing the game
   */
  advanceDay() {
    // Update game time
    this.gameTime.day += 1;
    
    // Handle month/year changes (simple implementation)
    if (this.gameTime.day > 30) {
      this.gameTime.day = 1;
      this.gameTime.month += 1;
      
      if (this.gameTime.month > 12) {
        this.gameTime.month = 1;
        this.gameTime.year += 1;
      }
    }
    
    // Update player
    const playerUpdateResult = this.player.advanceTime(1);
    
    // Update horses
    const horsesUpdateResult = this.horseManager.updateHorses(this.gameTime);
    
    // Update races
    const racesUpdateResult = this.raceManager.update(this.gameTime);
    
    // Update player's horses reference
    this.player.horses = this.horseManager.getAllHorses();
    
    // Update horse manager's player funds reference
    this.horseManager.playerFunds = this.player.funds;
    
    // Update race manager's player reputation reference
    this.raceManager.playerReputation = this.player.reputation;
    
    // Trigger day change callbacks
    this.triggerCallbacks('onDayChange', {
      gameTime: { ...this.gameTime },
      playerUpdate: playerUpdateResult,
      horsesUpdate: horsesUpdateResult,
      racesUpdate: racesUpdateResult
    });
    
    // Trigger individual update callbacks
    this.triggerCallbacks('onPlayerUpdate', playerUpdateResult);
    this.triggerCallbacks('onHorsesUpdate', horsesUpdateResult);
    this.triggerCallbacks('onRacesUpdate', racesUpdateResult);
    
    // Process notifications
    if (playerUpdateResult.notifications && playerUpdateResult.notifications.length > 0) {
      playerUpdateResult.notifications.forEach(notification => {
        this.triggerCallbacks('onNotification', notification);
      });
    }
    
    // Autosave if enabled
    if (this.autosaveEnabled) {
      this.saveGame();
    }
    
    return {
      success: true,
      message: 'Advanced to day ' + this.gameTime.day,
      gameTime: { ...this.gameTime },
      playerUpdate: playerUpdateResult,
      horsesUpdate: horsesUpdateResult,
      racesUpdate: racesUpdateResult
    };
  }
  
  /**
   * Enter a horse in a race
   * @param {string} horseId - ID of the horse to enter
   * @param {string} raceId - ID of the race
   * @returns {Object} Result of entering the race
   */
  enterRace(horseId, raceId) {
    // Get the horse
    const horse = this.horseManager.getHorse(horseId);
    
    if (!horse) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    // Check if player can afford entry fee
    const race = this.raceManager.getRace(raceId);
    
    if (!race) {
      return {
        success: false,
        message: 'Race not found'
      };
    }
    
    if (race.entryFee > 0) {
      if (!this.player.canAfford(race.entryFee)) {
        return {
          success: false,
          message: `Not enough funds to pay entry fee of $${race.entryFee}`
        };
      }
      
      // Pay entry fee
      this.player.removeFunds(race.entryFee, 'Race entry fee');
    }
    
    // Enter the race
    const entryResult = this.raceManager.enterHorseInRace(raceId, horse);
    
    return entryResult;
  }
  
  /**
   * Run a race
   * @param {string} raceId - ID of the race to run
   * @returns {Object} Race results
   */
  runRace(raceId) {
    // Get the race
    const race = this.raceManager.getRace(raceId);
    
    if (!race) {
      return {
        success: false,
        message: 'Race not found'
      };
    }
    
    // Find player's horse in the race
    let playerHorse = null;
    
    for (const entrant of race.entrants) {
      if (entrant.playerOwned) {
        playerHorse = this.horseManager.getHorse(entrant.horseId);
        break;
      }
    }
    
    // Run the race
    const raceResult = this.raceManager.runRace(raceId, playerHorse);
    
    if (!raceResult.success) {
      return raceResult;
    }
    
    // Process race results
    if (playerHorse && raceResult.playerResult) {
      // Update horse with race results
      playerHorse.addRaceResult({
        raceId: race.id,
        raceName: race.name,
        position: raceResult.playerResult.position,
        prize: raceResult.playerResult.prize,
        experience: raceResult.playerResult.experience,
        energyUsed: raceResult.playerResult.energyUsed,
        injury: raceResult.playerResult.injury
      });
      
      // Add prize money if player won a prize
      if (raceResult.playerResult.prize > 0) {
        this.player.addFunds(
          raceResult.playerResult.prize,
          `Prize money from ${race.name}`
        );
      }
      
      // Record race result in player stats
      this.player.recordRaceResult({
        raceId: race.id,
        raceName: race.name,
        position: raceResult.playerResult.position,
        prize: raceResult.playerResult.prize
      });
      
      // Update player reputation
      this.player.calculateReputation();
      this.raceManager.calculateReputation();
    }
    
    // Save game after race
    this.saveGame();
    
    return raceResult;
  }
  
  /**
   * Train a horse
   * @param {string} horseId - ID of the horse to train
   * @param {string} statType - Type of stat to train
   * @param {number} intensity - Training intensity (1-3)
   * @returns {Object} Result of training
   */
  trainHorse(horseId, statType, intensity = 1) {
    // Get the horse
    const horse = this.horseManager.getHorse(horseId);
    
    if (!horse) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    // Calculate training cost
    const baseCost = 50 * intensity;
    const trainingCost = Math.round(baseCost * (1 + (horse.calculateOverallRating() / 100)));
    
    // Check if player can afford training
    if (!this.player.canAfford(trainingCost)) {
      return {
        success: false,
        message: `Not enough funds to pay training cost of $${trainingCost}`
      };
    }
    
    // Pay training cost
    this.player.removeFunds(trainingCost, 'Training cost');
    
    // Train the horse
    const trainingResult = horse.train(statType, intensity);
    
    // Save game after training
    this.saveGame();
    
    return {
      ...trainingResult,
      cost: trainingCost
    };
  }
  
  /**
   * Rest a horse
   * @param {string} horseId - ID of the horse to rest
   * @param {number} days - Number of days to rest
   * @returns {Object} Result of resting
   */
  restHorse(horseId, days = 1) {
    // Get the horse
    const horse = this.horseManager.getHorse(horseId);
    
    if (!horse) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    // Rest the horse
    const restResult = horse.rest(days);
    
    // Save game after resting
    this.saveGame();
    
    return restResult;
  }
  
  /**
   * Provide care for a horse
   * @param {string} horseId - ID of the horse
   * @param {string} careType - Type of care to provide
   * @returns {Object} Result of providing care
   */
  provideHorseCare(horseId, careType) {
    // Get the horse
    const horse = this.horseManager.getHorse(horseId);
    
    if (!horse) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    // Calculate care cost
    let careCost = 0;
    
    switch (careType) {
      case 'vet':
        careCost = 500;
        break;
      case 'groom':
        careCost = 100;
        break;
      case 'farrier':
        careCost = 200;
        break;
      case 'massage':
        careCost = 300;
        break;
      default:
        return {
          success: false,
          message: 'Invalid care type'
        };
    }
    
    // Check if player can afford care
    if (!this.player.canAfford(careCost)) {
      return {
        success: false,
        message: `Not enough funds to pay care cost of $${careCost}`
      };
    }
    
    // Pay care cost
    this.player.removeFunds(careCost, `${careType} care cost`);
    
    // Provide care
    const careResult = horse.provideCare(careType);
    
    // Save game after providing care
    this.saveGame();
    
    return {
      ...careResult,
      cost: careCost
    };
  }
  
  /**
   * Breed two horses
   * @param {string} damId - ID of the dam (female)
   * @param {string} sireId - ID of the sire (male)
   * @param {number} studFee - Stud fee if sire is not owned by player
   * @returns {Object} Result of breeding
   */
  breedHorses(damId, sireId, studFee = 0) {
    // Get the dam
    const dam = this.horseManager.getHorse(damId);
    
    if (!dam) {
      return {
        success: false,
        message: 'Dam not found'
      };
    }
    
    // Get the sire (could be player-owned or external)
    let sire;
    
    if (this.horseManager.getHorse(sireId)) {
      // Player-owned sire
      sire = this.horseManager.getHorse(sireId);
    } else {
      // External sire (from breeding candidates)
      // In a real implementation, we would store breeding candidates
      // For now, we'll assume sireId is always a player-owned horse
      return {
        success: false,
        message: 'Sire not found'
      };
    }
    
    // Check if player can afford stud fee
    if (studFee > 0) {
      if (!this.player.canAfford(studFee)) {
        return {
          success: false,
          message: `Not enough funds to pay stud fee of $${studFee}`
        };
      }
      
      // Pay stud fee
      this.player.removeFunds(studFee, 'Stud fee');
    }
    
    // Breed the horses
    const breedingResult = this.horseManager.breedHorses(dam, sire);
    
    if (breedingResult.success) {
      // Record breeding in player stats
      this.player.recordHorseBred();
      
      // Update player's horses reference
      this.player.horses = this.horseManager.getAllHorses();
    }
    
    // Save game after breeding
    this.saveGame();
    
    return {
      ...breedingResult,
      studFee
    };
  }
  
  /**
   * Sell a horse
   * @param {string} horseId - ID of the horse to sell
   * @param {number} price - Sale price (if not specified, market value is used)
   * @returns {Object} Result of the sale
   */
  sellHorse(horseId, price = null) {
    // Get the horse
    const horse = this.horseManager.getHorse(horseId);
    
    if (!horse) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    // Sell the horse
    const saleResult = this.horseManager.sellHorse(horseId, price);
    
    if (saleResult.success) {
      // Add funds from sale
      this.player.addFunds(saleResult.price, `Sale of ${saleResult.horse.name}`);
      
      // Record sale in player stats
      this.player.recordHorseSold(saleResult.price);
      
      // Update player's horses reference
      this.player.horses = this.horseManager.getAllHorses();
    }
    
    // Save game after selling
    this.saveGame();
    
    return saleResult;
  }
  
  /**
   * Buy a horse
   * @param {Object} horse - The horse to buy
   * @param {number} price - Purchase price
   * @returns {Object} Result of the purchase
   */
  buyHorse(horse, price) {
    // Check if player can afford the horse
    if (!this.player.canAfford(price)) {
      return {
        success: false,
        message: `Not enough funds to buy horse for $${price}`
      };
    }
    
    // Buy the horse
    const purchaseResult = this.horseManager.buyHorse(horse, price);
    
    if (purchaseResult.success) {
      // Remove funds for purchase
      this.player.removeFunds(price, `Purchase of ${horse.name}`);
      
      // Record purchase in player stats
      this.player.recordHorseBought(price);
      
      // Update player's horses reference
      this.player.horses = this.horseManager.getAllHorses();
    }
    
    // Save game after buying
    this.saveGame();
    
    return purchaseResult;
  }
  
  /**
   * Upgrade the player's stable
   * @returns {Object} Result of the upgrade
   */
  upgradeStable() {
    // Upgrade the stable
    const upgradeResult = this.player.upgradeStable();
    
    if (upgradeResult.success) {
      // Update horse manager's stable size
      this.horseManager.stableSize = this.player.maxHorses;
    }
    
    // Save game after upgrading
    this.saveGame();
    
    return upgradeResult;
  }
  
  /**
   * Set game difficulty
   * @param {string} difficulty - Game difficulty (easy, normal, hard)
   */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }
  
  /**
   * Set game speed
   * @param {number} speed - Game speed (1 = normal, 2 = fast, 3 = very fast)
   */
  setGameSpeed(speed) {
    this.gameSpeed = speed;
  }
  
  /**
   * Toggle autosave
   * @param {boolean} enabled - Whether autosave is enabled
   */
  setAutosave(enabled) {
    this.autosaveEnabled = enabled;
  }
  
  /**
   * Toggle sound
   * @param {boolean} enabled - Whether sound is enabled
   */
  setSound(enabled) {
    this.soundEnabled = enabled;
  }
  
  /**
   * Toggle tutorial
   * @param {boolean} enabled - Whether tutorial is enabled
   */
  setTutorial(enabled) {
    this.tutorialEnabled = enabled;
  }
  
  /**
   * Advance tutorial step
   * @returns {number} New tutorial step
   */
  advanceTutorialStep() {
    this.tutorialStep += 1;
    return this.tutorialStep;
  }
  
  /**
   * Save the game
   * @returns {Object} Save result
   */
  saveGame() {
    try {
      // Create save data
      const saveData = {
        gameState: this.gameState,
        gameTime: this.gameTime,
        gameSpeed: this.gameSpeed,
        autosaveEnabled: this.autosaveEnabled,
        soundEnabled: this.soundEnabled,
        difficulty: this.difficulty,
        lastSaveTime: new Date().toISOString(),
        tutorialEnabled: this.tutorialEnabled,
        tutorialStep: this.tutorialStep,
        player: this.player ? this.player.toJSON() : null,
        horseManager: this.horseManager ? this.horseManager.toJSON() : null,
        raceManager: this.raceManager ? this.raceManager.toJSON() : null
      };
      
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('horseTycoonSave', JSON.stringify(saveData));
      }
      
      this.lastSaveTime = saveData.lastSaveTime;
      
      return {
        success: true,
        message: 'Game saved successfully',
        timestamp: this.lastSaveTime
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save game: ' + error.message
      };
    }
  }
  
  /**
   * Load a saved game
   * @returns {Object} Load result
   */
  loadGame() {
    try {
      // Load from localStorage
      let saveData;
      
      if (typeof localStorage !== 'undefined') {
        const savedGame = localStorage.getItem('horseTycoonSave');
        
        if (!savedGame) {
          return {
            success: false,
            message: 'No saved game found'
          };
        }
        
        saveData = JSON.parse(savedGame);
      } else {
        return {
          success: false,
          message: 'localStorage not available'
        };
      }
      
      // Set game state
      this.gameState = saveData.gameState || 'mainMenu';
      this.gameTime = saveData.gameTime || { day: 1, month: 1, year: 2023 };
      this.gameSpeed = saveData.gameSpeed || 1;
      this.autosaveEnabled = saveData.autosaveEnabled !== false;
      this.soundEnabled = saveData.soundEnabled !== false;
      this.difficulty = saveData.difficulty || 'normal';
      this.lastSaveTime = saveData.lastSaveTime || null;
      this.tutorialEnabled = saveData.tutorialEnabled !== false;
      this.tutorialStep = saveData.tutorialStep || 0;
      
      // Load player
      if (saveData.player) {
        this.player = new this.Player(saveData.player);
      }
      
      // Load horse manager
      if (saveData.horseManager) {
        this.horseManager = new this.HorseManager({
          gameTime: this.gameTime,
          playerFunds: this.player ? this.player.funds : 0,
          stableSize: this.player ? this.player.maxHorses : 5
        });
        
        // Load horses
        if (saveData.horseManager.horses) {
          this.horseManager.loadHorses(saveData.horseManager.horses);
        }
      }
      
      // Load race manager
      if (saveData.raceManager) {
        this.raceManager = new this.RaceManager({
          gameTime: this.gameTime,
          playerReputation: this.player ? this.player.reputation : 0
        });
        
        // Load race manager data
        this.raceManager.loadFromJSON(saveData.raceManager);
      }
      
      // Update player's horses reference
      if (this.player && this.horseManager) {
        this.player.horses = this.horseManager.getAllHorses();
      }
      
      // Trigger game state change
      this.triggerCallbacks('onGameStateChange', {
        oldState: 'loading',
        newState: this.gameState
      });
      
      return {
        success: true,
        message: 'Game loaded successfully',
        timestamp: this.lastSaveTime
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to load game: ' + error.message
      };
    }
  }
  
  /**
   * Delete saved game
   * @returns {Object} Delete result
   */
  deleteSavedGame() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('horseTycoonSave');
      }
      
      return {
        success: true,
        message: 'Saved game deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete saved game: ' + error.message
      };
    }
  }
  
  /**
   * Register a callback function
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {boolean} Success
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
      return true;
    }
    return false;
  }
  
  /**
   * Remove a callback function
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {boolean} Success
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index !== -1) {
        this.callbacks[event].splice(index, 1);
        return true;
      }
    }
    return false;
  }
  
  /**
   * Trigger callbacks for an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }
  
  /**
   * Get game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    if (!this.player) {
      return {
        gameTime: this.gameTime,
        difficulty: this.difficulty,
        lastSaveTime: this.lastSaveTime
      };
    }
    
    return {
      gameTime: this.gameTime,
      difficulty: this.difficulty,
      lastSaveTime: this.lastSaveTime,
      playerStats: {
        name: this.player.name,
        stableName: this.player.stableName,
        funds: this.player.funds,
        reputation: this.player.reputation,
        horseCount: this.player.horses.length,
        maxHorses: this.player.maxHorses,
        stableLevel: this.player.stableLevel,
        raceWins: this.player.stats.raceWins,
        totalRaces: this.player.stats.totalRaces,
        totalEarnings: this.player.stats.totalEarnings,
        horsesBred: this.player.stats.horsesBred,
        horsesSold: this.player.stats.horsesSold,
        horsesBought: this.player.stats.horsesBought
      }
    };
  }
} 