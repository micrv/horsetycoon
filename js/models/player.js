/**
 * Horse Tycoon - Player Class
 * 
 * Manages the player's game state, horses, finances, and progression
 */

class Player {
  /**
   * Create a new Player
   * @param {Object} config - The player configuration
   */
  constructor(config = {}) {
    // Basic info
    this.id = config.id || Date.now() + '_' + Math.floor(Math.random() * 1000000);
    this.name = config.name || 'Player';
    this.stableName = config.stableName || 'My Stable';
    
    // Finances
    this.funds = config.funds !== undefined ? config.funds : 10000;
    this.income = config.income || [];  // Income history
    this.expenses = config.expenses || [];  // Expense history
    
    // Game time tracking
    this.gameTime = config.gameTime || 0;  // In days
    this.startDate = config.startDate || new Date().toISOString();
    this.lastPlayedDate = config.lastPlayedDate || new Date().toISOString();
    
    // Horses
    this.horses = config.horses || [];
    this.maxHorses = config.maxHorses || 4;  // Starting stable capacity
    
    // Stable
    this.stableLevel = config.stableLevel || 1;
    this.stableUpgradeCosts = [0, 5000, 15000, 30000, 60000];  // Cost to upgrade to each level
    
    // Racing
    this.races = config.races || [];  // Race history
    this.trophies = config.trophies || 0;  // Achievements
    
    // Stats and progression
    this.reputation = config.reputation || 0;  // 0-100 scale
    this.difficultyMultiplier = config.difficultyMultiplier || 1.0;  // Affects various game mechanics
    this.stats = config.stats || {
      racesEntered: 0,
      racesWon: 0,
      horsesBred: 0,
      horsesSold: 0,
      horsesBought: 0,
      moneyEarned: 0,
      moneySpent: 0,
      daysPlayed: 0
    };
    
    // Unlocked features
    this.unlockedFeatures = config.unlockedFeatures || {
      breeding: true,      // Available from the start
      training: true,      // Available from the start
      racing: true,        // Available from the start
      market: true,        // Available from the start
      specialRaces: false, // Unlock at reputation 30
      auctions: false,     // Unlock at reputation 50
      international: false // Unlock at reputation 75
    };
    
    // Events and notifications
    this.pendingEvents = config.pendingEvents || [];
    this.notifications = config.notifications || [];
    
    // Tutorial status
    this.tutorialCompleted = config.tutorialCompleted || false;
    this.tutorialStep = config.tutorialStep || 0;
    
    // Update reputation level based on stats
    if (config.calculateInitialReputation !== false) {
      this.calculateReputation();
    }
  }
  
  /**
   * Add a horse to the player's stable
   * @param {Horse} horse - The horse to add
   * @returns {Object} Result of the operation
   */
  addHorse(horse) {
    // Check if stable is full
    if (this.horses.length >= this.maxHorses) {
      return {
        success: false,
        message: 'Stable is full! Upgrade your stable or sell a horse first.',
        currentCount: this.horses.length,
        maxHorses: this.maxHorses
      };
    }
    
    // Add the horse
    this.horses.push(horse);
    
    // Return success
    return {
      success: true,
      message: `${horse.name} has been added to your stable.`,
      horse: horse,
      currentCount: this.horses.length,
      maxHorses: this.maxHorses
    };
  }
  
  /**
   * Remove a horse from the player's stable
   * @param {string} horseId - The ID of the horse to remove
   * @returns {Object} Result of the operation
   */
  removeHorse(horseId) {
    const initialCount = this.horses.length;
    
    // Find and remove the horse
    this.horses = this.horses.filter(horse => horse.id !== horseId);
    
    // Check if a horse was removed
    if (this.horses.length < initialCount) {
      return {
        success: true,
        message: 'Horse removed from stable.',
        currentCount: this.horses.length,
        maxHorses: this.maxHorses
      };
    } else {
      return {
        success: false,
        message: 'Horse not found in stable.',
        currentCount: this.horses.length,
        maxHorses: this.maxHorses
      };
    }
  }
  
  /**
   * Get a horse by ID
   * @param {string} horseId - The ID of the horse to find
   * @returns {Horse|null} The horse object or null if not found
   */
  getHorse(horseId) {
    return this.horses.find(horse => horse.id === horseId) || null;
  }
  
  /**
   * Add funds to the player's account
   * @param {number} amount - The amount to add
   * @param {string} source - The source of the funds
   * @returns {Object} Result of the operation
   */
  addFunds(amount, source = 'unknown') {
    if (amount <= 0) {
      return {
        success: false,
        message: 'Invalid amount',
        funds: this.funds
      };
    }
    
    // Add the funds
    this.funds += amount;
    
    // Record income
    this.income.push({
      amount,
      source,
      day: this.gameTime
    });
    
    // Update stats
    this.stats.moneyEarned += amount;
    
    return {
      success: true,
      message: `$${amount.toLocaleString()} added from ${source}.`,
      funds: this.funds
    };
  }
  
  /**
   * Remove funds from the player's account
   * @param {number} amount - The amount to remove
   * @param {string} reason - The reason for the expense
   * @returns {Object} Result of the operation
   */
  removeFunds(amount, reason = 'unknown') {
    if (amount <= 0) {
      return {
        success: false,
        message: 'Invalid amount',
        funds: this.funds
      };
    }
    
    // Check if player has enough funds
    if (this.funds < amount) {
      return {
        success: false,
        message: 'Insufficient funds',
        funds: this.funds,
        missing: amount - this.funds
      };
    }
    
    // Remove the funds
    this.funds -= amount;
    
    // Record expense
    this.expenses.push({
      amount,
      reason,
      day: this.gameTime
    });
    
    // Update stats
    this.stats.moneySpent += amount;
    
    return {
      success: true,
      message: `$${amount.toLocaleString()} spent on ${reason}.`,
      funds: this.funds
    };
  }
  
  /**
   * Upgrade the player's stable
   * @returns {Object} Result of the operation
   */
  upgradeStable() {
    // Check if already at max level
    if (this.stableLevel >= this.stableUpgradeCosts.length - 1) {
      return {
        success: false,
        message: 'Stable is already at maximum level.',
        stableLevel: this.stableLevel,
        maxHorses: this.maxHorses
      };
    }
    
    // Get upgrade cost
    const upgradeCost = this.stableUpgradeCosts[this.stableLevel + 1];
    
    // Check if player has enough funds
    if (this.funds < upgradeCost) {
      return {
        success: false,
        message: `Insufficient funds. You need $${upgradeCost.toLocaleString()}.`,
        funds: this.funds,
        upgradeCost
      };
    }
    
    // Remove funds
    const result = this.removeFunds(upgradeCost, 'Stable Upgrade');
    if (!result.success) return result;
    
    // Upgrade stable
    this.stableLevel++;
    
    // Each level adds 2 more horse slots
    this.maxHorses = 4 + ((this.stableLevel - 1) * 2);
    
    // Gain some reputation for upgrading stable
    this.reputation += 5;
    
    return {
      success: true,
      message: `Stable upgraded to level ${this.stableLevel}. New capacity: ${this.maxHorses} horses.`,
      stableLevel: this.stableLevel,
      maxHorses: this.maxHorses
    };
  }
  
  /**
   * Advance the game time by a specified number of days
   * @param {number} days - Number of days to advance
   * @returns {Object} Result of the operation
   */
  advanceTime(days = 1) {
    // Update game time
    const previousDay = Math.floor(this.gameTime);
    this.gameTime += days;
    const currentDay = Math.floor(this.gameTime);
    
    // Update last played date
    this.lastPlayedDate = new Date().toISOString();
    
    // Update days played stat
    this.stats.daysPlayed += days;
    
    // Apply daily maintenance costs
    const maintenanceCost = this.calculateDailyMaintenanceCost() * days;
    this.removeFunds(maintenanceCost, 'Stable Maintenance');
    
    // Process daily events
    const daysPassed = currentDay - previousDay;
    let events = [];
    
    if (daysPassed > 0) {
      // Process events for each day that passed
      for (let i = 0; i < daysPassed; i++) {
        const dailyEvents = this.processDailyEvents(previousDay + i + 1);
        events = events.concat(dailyEvents);
      }
    }
    
    return {
      success: true,
      previousDay,
      currentDay,
      daysPassed,
      events
    };
  }
  
  /**
   * Process events that happen on a specific game day
   * @param {number} day - The game day to process
   * @returns {Array} List of events that occurred
   */
  processDailyEvents(day) {
    const events = [];
    
    // Check for unlockable features based on reputation
    if (this.reputation >= 30 && !this.unlockedFeatures.specialRaces) {
      this.unlockedFeatures.specialRaces = true;
      events.push({
        type: 'feature_unlocked',
        feature: 'specialRaces',
        message: 'Special races are now available! Enter high-stakes competitions for greater rewards.'
      });
    }
    
    if (this.reputation >= 50 && !this.unlockedFeatures.auctions) {
      this.unlockedFeatures.auctions = true;
      events.push({
        type: 'feature_unlocked',
        feature: 'auctions',
        message: 'Horse auctions are now available! Find rare horses with unique traits.'
      });
    }
    
    if (this.reputation >= 75 && !this.unlockedFeatures.international) {
      this.unlockedFeatures.international = true;
      events.push({
        type: 'feature_unlocked',
        feature: 'international',
        message: 'International racing circuit unlocked! Compete in prestigious races around the world.'
      });
    }
    
    // Add events to pending events list
    this.pendingEvents = this.pendingEvents.concat(events);
    
    return events;
  }
  
  /**
   * Calculate the daily maintenance cost based on stable size and level
   * @returns {number} Daily maintenance cost
   */
  calculateDailyMaintenanceCost() {
    // Base cost per horse
    const baseCostPerHorse = 50;
    
    // Additional cost per stable level
    const levelCost = this.stableLevel * 25;
    
    // Calculate total (higher level stables cost more to maintain)
    const totalCost = (this.horses.length * baseCostPerHorse) + levelCost;
    
    // Apply difficulty multiplier
    return Math.round(totalCost * this.difficultyMultiplier);
  }
  
  /**
   * Records a race result in the player's history
   * @param {Object} raceResult - Race result information
   * @returns {Object} Result of the operation
   */
  recordRaceResult(raceResult) {
    // Add race to history
    this.races.push(raceResult);
    
    // Update stats
    this.stats.racesEntered++;
    
    if (raceResult.position === 1) {
      this.stats.racesWon++;
    }
    
    // Add race earnings
    if (raceResult.earnings > 0) {
      this.addFunds(raceResult.earnings, 'Race Winnings');
    }
    
    // Add trophies if applicable
    if (raceResult.position <= 3) {
      const trophyPoints = raceResult.position === 1 ? 3 : raceResult.position === 2 ? 2 : 1;
      this.trophies += trophyPoints;
    }
    
    // Update reputation based on performance
    let reputationChange = 0;
    
    if (raceResult.position === 1) {
      reputationChange = 3; // First place
    } else if (raceResult.position === 2) {
      reputationChange = 2; // Second place
    } else if (raceResult.position === 3) {
      reputationChange = 1; // Third place
    } else if (raceResult.position >= 8) {
      reputationChange = -1; // Very bad performance
    }
    
    // Adjust reputation change based on race tier
    if (raceResult.tier === 'high') {
      reputationChange *= 2;
    } else if (raceResult.tier === 'elite') {
      reputationChange *= 3;
    }
    
    // Apply reputation change
    this.reputation = Math.max(0, Math.min(100, this.reputation + reputationChange));
    
    return {
      success: true,
      message: `Race result recorded. Position: ${raceResult.position}.`,
      reputationChange,
      trophies: this.trophies
    };
  }
  
  /**
   * Records that a horse was bred by the player
   * @returns {Object} Result of the operation
   */
  recordHorseBred() {
    this.stats.horsesBred++;
    
    // Reputation increase for breeding
    this.reputation = Math.min(100, this.reputation + 1);
    
    return {
      success: true,
      horsesBred: this.stats.horsesBred
    };
  }
  
  /**
   * Records that a horse was sold by the player
   * @param {number} amount - Sale amount
   * @returns {Object} Result of the operation
   */
  recordHorseSold(amount) {
    this.stats.horsesSold++;
    
    // Add funds from sale
    this.addFunds(amount, 'Horse Sale');
    
    return {
      success: true,
      horsesSold: this.stats.horsesSold
    };
  }
  
  /**
   * Records that a horse was bought by the player
   * @param {number} amount - Purchase amount
   * @returns {Object} Result of the operation
   */
  recordHorseBought(amount) {
    this.stats.horsesBought++;
    
    // Remove funds for purchase
    this.removeFunds(amount, 'Horse Purchase');
    
    return {
      success: true,
      horsesBought: this.stats.horsesBought
    };
  }
  
  /**
   * Calculate the player's reputation level
   * @returns {number} Updated reputation value
   */
  calculateReputation() {
    // Calculate base reputation from stats
    let baseReputation = 0;
    
    // Horses owned contribution
    const horseCount = this.horses.length;
    baseReputation += Math.min(20, horseCount * 2);
    
    // Stable level contribution
    baseReputation += (this.stableLevel - 1) * 5;
    
    // Races contribution
    baseReputation += Math.min(20, this.stats.racesWon * 2);
    
    // Breeding contribution
    baseReputation += Math.min(15, this.stats.horsesBred);
    
    // Trading contribution
    baseReputation += Math.min(10, this.stats.horsesSold + this.stats.horsesBought);
    
    // Money earned contribution
    const moneyEarnedFactor = Math.min(15, Math.floor(this.stats.moneyEarned / 10000));
    baseReputation += moneyEarnedFactor;
    
    // Set reputation (with a soft cap at 100)
    this.reputation = Math.min(100, baseReputation);
    
    return this.reputation;
  }
  
  /**
   * Check if the player has completed a specific achievement
   * @param {string} achievementId - ID of the achievement to check
   * @returns {boolean} Whether the achievement is completed
   */
  hasCompletedAchievement(achievementId) {
    // Define achievement completion criteria
    const criteria = {
      own_5_horses: () => this.horses.length >= 5,
      win_10_races: () => this.stats.racesWon >= 10,
      breed_5_horses: () => this.stats.horsesBred >= 5,
      upgrade_stable_lvl3: () => this.stableLevel >= 3,
      earn_50k: () => this.stats.moneyEarned >= 50000,
      reputation_50: () => this.reputation >= 50
    };
    
    // Check if achievement exists and is completed
    return (
      criteria[achievementId] && 
      typeof criteria[achievementId] === 'function' && 
      criteria[achievementId]()
    );
  }
  
  /**
   * Add a notification to the player's queue
   * @param {Object} notification - Notification information
   */
  addNotification(notification) {
    // Add timestamp if not provided
    if (!notification.timestamp) {
      notification.timestamp = new Date().toISOString();
    }
    
    // Add to notifications queue
    this.notifications.push(notification);
    
    // Limit the number of notifications stored
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(-50);
    }
    
    return {
      success: true,
      notificationCount: this.notifications.length
    };
  }
  
  /**
   * Get financial summary for a specific period
   * @param {number} days - Number of days to include in the summary
   * @returns {Object} Financial summary
   */
  getFinancialSummary(days = 7) {
    const currentDay = Math.floor(this.gameTime);
    const startDay = currentDay - days;
    
    // Filter income and expenses within the period
    const recentIncome = this.income.filter(item => item.day >= startDay);
    const recentExpenses = this.expenses.filter(item => item.day >= startDay);
    
    // Calculate totals
    const totalIncome = recentIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = recentExpenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    // Group by source/reason
    const incomeBySource = {};
    const expensesByReason = {};
    
    recentIncome.forEach(item => {
      incomeBySource[item.source] = (incomeBySource[item.source] || 0) + item.amount;
    });
    
    recentExpenses.forEach(item => {
      expensesByReason[item.reason] = (expensesByReason[item.reason] || 0) + item.amount;
    });
    
    return {
      period: {
        start: startDay,
        end: currentDay,
        days
      },
      totals: {
        income: totalIncome,
        expenses: totalExpenses,
        netProfit
      },
      breakdown: {
        income: incomeBySource,
        expenses: expensesByReason
      }
    };
  }
  
  /**
   * Get the player's stable summary
   * @returns {Object} Stable summary
   */
  getStableSummary() {
    // Get highest value horse
    let highestValueHorse = null;
    let highestValue = 0;
    
    // Get highest rated horse
    let highestRatedHorse = null;
    let highestRating = 0;
    
    // Get total stable value
    let totalStableValue = 0;
    
    // Calculate statistics
    for (const horse of this.horses) {
      const value = horse.calculateMarketValue();
      const rating = horse.calculateOverallRating();
      
      totalStableValue += value;
      
      if (value > highestValue) {
        highestValue = value;
        highestValueHorse = horse;
      }
      
      if (rating > highestRating) {
        highestRating = rating;
        highestRatedHorse = horse;
      }
    }
    
    return {
      stableLevel: this.stableLevel,
      horseCount: this.horses.length,
      maxHorses: this.maxHorses,
      totalValue: totalStableValue,
      highestValueHorse: highestValueHorse ? {
        id: highestValueHorse.id,
        name: highestValueHorse.name,
        value: highestValue
      } : null,
      highestRatedHorse: highestRatedHorse ? {
        id: highestRatedHorse.id,
        name: highestRatedHorse.name,
        rating: highestRating
      } : null,
      dailyMaintenance: this.calculateDailyMaintenanceCost()
    };
  }
  
  /**
   * Check if player can afford a specific amount
   * @param {number} amount - The amount to check
   * @returns {boolean} Whether the player can afford the amount
   */
  canAfford(amount) {
    return this.funds >= amount;
  }
  
  /**
   * Get player game progress data
   * @returns {Object} Player progress information
   */
  getProgress() {
    return {
      reputation: this.reputation,
      stableLevel: this.stableLevel,
      horses: this.horses.length,
      maxHorses: this.maxHorses,
      raceStats: {
        entered: this.stats.racesEntered,
        won: this.stats.racesWon,
        winRate: this.stats.racesEntered > 0 ? 
                 Math.round((this.stats.racesWon / this.stats.racesEntered) * 100) : 0
      },
      breedingStats: {
        bred: this.stats.horsesBred
      },
      financialStats: {
        moneyEarned: this.stats.moneyEarned,
        moneySpent: this.stats.moneySpent,
        currentFunds: this.funds
      },
      unlockedFeatures: this.unlockedFeatures,
      trophies: this.trophies,
      daysPlayed: this.stats.daysPlayed
    };
  }
  
  /**
   * Convert the player to a plain object for serialization
   * @returns {Object} Serializable player object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      stableName: this.stableName,
      funds: this.funds,
      income: this.income,
      expenses: this.expenses,
      gameTime: this.gameTime,
      startDate: this.startDate,
      lastPlayedDate: this.lastPlayedDate,
      horses: this.horses.map(horse => 
        typeof horse.toJSON === 'function' ? horse.toJSON() : horse
      ),
      maxHorses: this.maxHorses,
      stableLevel: this.stableLevel,
      races: this.races,
      trophies: this.trophies,
      reputation: this.reputation,
      difficultyMultiplier: this.difficultyMultiplier,
      stats: this.stats,
      unlockedFeatures: this.unlockedFeatures,
      pendingEvents: this.pendingEvents,
      notifications: this.notifications,
      tutorialCompleted: this.tutorialCompleted,
      tutorialStep: this.tutorialStep
    };
  }
} 