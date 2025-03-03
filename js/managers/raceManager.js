/**
 * Horse Tycoon - Race Manager Class
 * 
 * Manages race schedules, racing circuits, and race operations
 */

class RaceManager {
  /**
   * Create a new Race Manager
   * @param {Object} config - The manager configuration
   */
  constructor(config = {}) {
    this.races = config.races || [];
    this.gameTime = config.gameTime || { day: 1, month: 1, year: 2023 };
    this.playerReputation = config.playerReputation || 0;
    this.unlockedTiers = config.unlockedTiers || ['low'];
    this.raceHistory = config.raceHistory || [];
    this.maxHistoryLength = config.maxHistoryLength || 50;
    this.playerHorseIds = config.playerHorseIds || [];
    
    // Load race class if not in browser context
    if (typeof Race === 'undefined' && typeof require !== 'undefined') {
      const Race = require('../models/race.js');
      this.Race = Race;
    } else {
      this.Race = Race;
    }
    
    // Initialize race templates
    this.raceTemplates = this.initializeRaceTemplates();
  }
  
  /**
   * Initialize race templates for different tiers and types
   * @returns {Object} Race templates organized by tier and type
   */
  initializeRaceTemplates() {
    return {
      low: {
        flat: [
          {
            name: "Beginner's Sprint",
            distance: 'sprint',
            surface: 'dirt',
            type: 'flat',
            tier: 'low',
            difficulty: 1,
            purse: 1000,
            requirements: { minAge: 3, maxAge: 20, minRating: 0 }
          },
          {
            name: "Novice Cup",
            distance: 'middle',
            surface: 'dirt',
            type: 'flat',
            tier: 'low',
            difficulty: 1,
            purse: 1200,
            requirements: { minAge: 3, maxAge: 20, minRating: 0 }
          },
          {
            name: "Local Turf Challenge",
            distance: 'middle',
            surface: 'turf',
            type: 'flat',
            tier: 'low',
            difficulty: 2,
            purse: 1500,
            requirements: { minAge: 3, maxAge: 20, minRating: 0 }
          }
        ],
        jump: [
          {
            name: "Beginner's Hurdle",
            distance: 'middle',
            surface: 'turf',
            type: 'jump',
            tier: 'low',
            difficulty: 2,
            purse: 1800,
            requirements: { minAge: 4, maxAge: 20, minRating: 0 }
          }
        ]
      },
      medium: {
        flat: [
          {
            name: "Regional Sprint Cup",
            distance: 'sprint',
            surface: 'dirt',
            type: 'flat',
            tier: 'medium',
            difficulty: 2,
            purse: 5000,
            requirements: { minAge: 3, maxAge: 20, minRating: 40 }
          },
          {
            name: "State Championship",
            distance: 'middle',
            surface: 'dirt',
            type: 'flat',
            tier: 'medium',
            difficulty: 3,
            purse: 7500,
            requirements: { minAge: 3, maxAge: 20, minRating: 45 }
          },
          {
            name: "Autumn Classic",
            distance: 'long',
            surface: 'turf',
            type: 'flat',
            tier: 'medium',
            difficulty: 3,
            purse: 10000,
            requirements: { minAge: 3, maxAge: 20, minRating: 50 }
          }
        ],
        jump: [
          {
            name: "Regional Steeplechase",
            distance: 'middle',
            surface: 'turf',
            type: 'jump',
            tier: 'medium',
            difficulty: 3,
            purse: 8000,
            requirements: { minAge: 4, maxAge: 20, minRating: 45 }
          },
          {
            name: "Spring Hurdles",
            distance: 'long',
            surface: 'turf',
            type: 'jump',
            tier: 'medium',
            difficulty: 3,
            purse: 9000,
            requirements: { minAge: 4, maxAge: 20, minRating: 50 }
          }
        ]
      },
      high: {
        flat: [
          {
            name: "National Sprint",
            distance: 'sprint',
            surface: 'dirt',
            type: 'flat',
            tier: 'high',
            difficulty: 4,
            purse: 25000,
            requirements: { minAge: 3, maxAge: 20, minRating: 65 }
          },
          {
            name: "Summer Cup",
            distance: 'middle',
            surface: 'dirt',
            type: 'flat',
            tier: 'high',
            difficulty: 4,
            purse: 35000,
            requirements: { minAge: 3, maxAge: 20, minRating: 70 }
          },
          {
            name: "Coastal Stakes",
            distance: 'long',
            surface: 'turf',
            type: 'flat',
            tier: 'high',
            difficulty: 4,
            purse: 50000,
            requirements: { minAge: 3, maxAge: 20, minRating: 75 }
          }
        ],
        jump: [
          {
            name: "National Steeplechase",
            distance: 'long',
            surface: 'turf',
            type: 'jump',
            tier: 'high',
            difficulty: 4,
            purse: 40000,
            requirements: { minAge: 4, maxAge: 20, minRating: 70 }
          }
        ]
      },
      elite: {
        flat: [
          {
            name: "Champion Sprint",
            distance: 'sprint',
            surface: 'dirt',
            type: 'flat',
            tier: 'elite',
            difficulty: 5,
            purse: 100000,
            requirements: { minAge: 3, maxAge: 20, minRating: 85 }
          },
          {
            name: "Grand Derby",
            distance: 'middle',
            surface: 'dirt',
            type: 'flat',
            tier: 'elite',
            difficulty: 5,
            purse: 150000,
            requirements: { minAge: 3, maxAge: 20, minRating: 90 }
          },
          {
            name: "International Cup",
            distance: 'long',
            surface: 'turf',
            type: 'flat',
            tier: 'elite',
            difficulty: 5,
            purse: 250000,
            requirements: { minAge: 3, maxAge: 20, minRating: 95 }
          }
        ],
        jump: [
          {
            name: "Grand National",
            distance: 'long',
            surface: 'turf',
            type: 'jump',
            tier: 'elite',
            difficulty: 5,
            purse: 200000,
            requirements: { minAge: 5, maxAge: 20, minRating: 90 }
          }
        ]
      }
    };
  }
  
  /**
   * Get all available races
   * @returns {Array} Array of race objects
   */
  getAllRaces() {
    return this.races;
  }
  
  /**
   * Get a race by ID
   * @param {string} id - The race ID
   * @returns {Race|null} The race object or null if not found
   */
  getRace(id) {
    return this.races.find(race => race.id === id) || null;
  }
  
  /**
   * Get races scheduled for a specific day
   * @param {Object} gameDay - The game day to check
   * @returns {Array} Array of races scheduled for that day
   */
  getRacesForDay(gameDay) {
    return this.races.filter(race => {
      if (!race.scheduleDay) return false;
      
      return (
        race.scheduleDay.day === gameDay.day &&
        race.scheduleDay.month === gameDay.month &&
        race.scheduleDay.year === gameDay.year
      );
    });
  }
  
  /**
   * Get races that a specific horse is eligible for
   * @param {Horse} horse - The horse to check
   * @returns {Array} Array of races the horse is eligible for
   */
  getEligibleRaces(horse) {
    return this.races.filter(race => {
      // Skip races that have already run
      if (race.hasRun) return false;
      
      // Check eligibility
      const eligibility = race.checkEligibility(horse);
      return eligibility.isEligible;
    });
  }
  
  /**
   * Generate a race schedule for the next X days
   * @param {number} days - Number of days to schedule
   * @returns {Object} Result of the scheduling operation
   */
  generateRaceSchedule(days = 7) {
    const scheduledRaces = [];
    
    // Clear any unrun races that were previously scheduled
    this.races = this.races.filter(race => race.hasRun);
    
    // Schedule races for each day
    for (let i = 0; i < days; i++) {
      // Calculate the game day for this schedule day
      const scheduleDay = this.calculateGameDay(i);
      
      // Generate races for this day
      const dayRaces = this.generateRacesForDay(scheduleDay);
      
      // Add to races array
      this.races.push(...dayRaces);
      scheduledRaces.push(...dayRaces);
    }
    
    return {
      success: true,
      message: `Generated ${scheduledRaces.length} races for the next ${days} days`,
      scheduledRaces
    };
  }
  
  /**
   * Calculate a game day based on current game time and days to add
   * @param {number} daysToAdd - Days to add to current game time
   * @returns {Object} New game day
   */
  calculateGameDay(daysToAdd) {
    // Simple implementation - doesn't handle month/year boundaries
    // In a real implementation, this would properly handle date arithmetic
    return {
      day: this.gameTime.day + daysToAdd,
      month: this.gameTime.month,
      year: this.gameTime.year
    };
  }
  
  /**
   * Generate races for a specific day
   * @param {Object} gameDay - The game day to generate races for
   * @returns {Array} Array of generated races
   */
  generateRacesForDay(gameDay) {
    const races = [];
    
    // Determine how many races to generate based on day of week
    // More races on weekends (assuming day 1 is Monday)
    const dayOfWeek = (gameDay.day - 1) % 7 + 1;
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 7; // Saturday or Sunday
    
    // Base number of races per day
    let raceCount = isWeekend ? 5 : 3;
    
    // Generate races
    for (let i = 0; i < raceCount; i++) {
      // Select a tier based on unlocked tiers and randomness
      const tier = this.selectRandomTier();
      
      // Select race type (flat or jump)
      const type = Math.random() < 0.8 ? 'flat' : 'jump';
      
      // Get templates for this tier and type
      const templates = this.raceTemplates[tier][type];
      
      // Skip if no templates available
      if (!templates || templates.length === 0) continue;
      
      // Select a random template
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Create race from template
      const race = new this.Race({
        ...template,
        scheduleDay: { ...gameDay }
      });
      
      races.push(race);
    }
    
    // Add special races occasionally
    if (isWeekend && Math.random() < 0.3) {
      this.addSpecialRace(races, gameDay);
    }
    
    return races;
  }
  
  /**
   * Select a random tier based on unlocked tiers
   * @returns {string} Selected tier
   */
  selectRandomTier() {
    // Weight selection toward lower tiers
    const weights = {
      low: 0.5,
      medium: 0.3,
      high: 0.15,
      elite: 0.05
    };
    
    // Filter to only unlocked tiers
    const availableTiers = this.unlockedTiers.filter(tier => 
      ['low', 'medium', 'high', 'elite'].includes(tier)
    );
    
    // If no tiers are unlocked, default to 'low'
    if (availableTiers.length === 0) return 'low';
    
    // Calculate total weight of available tiers
    let totalWeight = 0;
    availableTiers.forEach(tier => {
      totalWeight += weights[tier];
    });
    
    // Normalize weights
    const normalizedWeights = {};
    availableTiers.forEach(tier => {
      normalizedWeights[tier] = weights[tier] / totalWeight;
    });
    
    // Select a tier based on weights
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const tier of availableTiers) {
      cumulativeWeight += normalizedWeights[tier];
      if (random <= cumulativeWeight) {
        return tier;
      }
    }
    
    // Fallback to the highest unlocked tier
    return availableTiers[availableTiers.length - 1];
  }
  
  /**
   * Add a special race to the schedule
   * @param {Array} races - Array of races to add to
   * @param {Object} gameDay - The game day for the race
   */
  addSpecialRace(races, gameDay) {
    // Special races have higher purses and unique requirements
    
    // Select a tier (special races are usually higher tier)
    const availableTiers = this.unlockedTiers.filter(tier => 
      ['medium', 'high', 'elite'].includes(tier)
    );
    
    // If no suitable tiers are unlocked, use 'low'
    const tier = availableTiers.length > 0 
      ? availableTiers[Math.floor(Math.random() * availableTiers.length)]
      : 'low';
    
    // Create special race templates based on tier
    const specialTemplates = {
      low: {
        name: "Newcomer's Special",
        distance: 'middle',
        surface: 'dirt',
        type: 'flat',
        tier: 'low',
        difficulty: 2,
        purse: 2500,
        requirements: { minAge: 3, maxAge: 5, minRating: 0 },
        isSpecial: true
      },
      medium: {
        name: "Breeder's Cup",
        distance: 'middle',
        surface: Math.random() < 0.5 ? 'dirt' : 'turf',
        type: 'flat',
        tier: 'medium',
        difficulty: 3,
        purse: 15000,
        requirements: { minAge: 3, maxAge: 20, minRating: 50 },
        isSpecial: true
      },
      high: {
        name: "Governor's Stakes",
        distance: 'long',
        surface: 'turf',
        type: 'flat',
        tier: 'high',
        difficulty: 4,
        purse: 75000,
        requirements: { minAge: 3, maxAge: 20, minRating: 75 },
        isSpecial: true
      },
      elite: {
        name: "Triple Crown Event",
        distance: 'middle',
        surface: 'dirt',
        type: 'flat',
        tier: 'elite',
        difficulty: 5,
        purse: 500000,
        requirements: { minAge: 3, maxAge: 3, minRating: 85 },
        isSpecial: true
      }
    };
    
    // Create the special race
    const specialRace = new this.Race({
      ...specialTemplates[tier],
      scheduleDay: { ...gameDay }
    });
    
    races.push(specialRace);
  }
  
  /**
   * Enter a horse in a race
   * @param {string} raceId - ID of the race
   * @param {Horse} horse - The horse to enter
   * @param {string} jockeyName - Name of the jockey
   * @returns {Object} Result of the entry operation
   */
  enterHorseInRace(raceId, horse, jockeyName = 'Player Jockey') {
    const race = this.getRace(raceId);
    
    if (!race) {
      return {
        success: false,
        message: 'Race not found'
      };
    }
    
    // Add horse to race
    const entryResult = race.addEntrant(horse, jockeyName);
    
    // Update player horse IDs if successful
    if (entryResult.success) {
      if (!this.playerHorseIds.includes(horse.id)) {
        this.playerHorseIds.push(horse.id);
      }
    }
    
    return entryResult;
  }
  
  /**
   * Run a race
   * @param {string} raceId - ID of the race to run
   * @param {Horse} playerHorse - The player's horse in the race
   * @returns {Object} Race results
   */
  runRace(raceId, playerHorse) {
    const race = this.getRace(raceId);
    
    if (!race) {
      return {
        success: false,
        message: 'Race not found'
      };
    }
    
    // Run the race
    const raceResult = race.runRace(playerHorse);
    
    // If race was successful, add to history
    if (raceResult.success) {
      this.addRaceToHistory(race);
    }
    
    return raceResult;
  }
  
  /**
   * Add a race to the history
   * @param {Race} race - The race to add to history
   */
  addRaceToHistory(race) {
    // Add race to history
    this.raceHistory.unshift({
      id: race.id,
      name: race.name,
      date: { ...race.scheduleDay },
      results: race.results,
      playerResults: race.results.filter(r => this.playerHorseIds.includes(r.horseId))
    });
    
    // Trim history if it exceeds max length
    if (this.raceHistory.length > this.maxHistoryLength) {
      this.raceHistory = this.raceHistory.slice(0, this.maxHistoryLength);
    }
  }
  
  /**
   * Get race history
   * @param {number} limit - Maximum number of history items to return
   * @returns {Array} Race history
   */
  getRaceHistory(limit = 10) {
    return this.raceHistory.slice(0, limit);
  }
  
  /**
   * Get race history for a specific horse
   * @param {string} horseId - ID of the horse
   * @param {number} limit - Maximum number of history items to return
   * @returns {Array} Horse's race history
   */
  getHorseRaceHistory(horseId, limit = 10) {
    const horseHistory = [];
    
    for (const raceRecord of this.raceHistory) {
      const horseResult = raceRecord.results.find(r => r.horseId === horseId);
      
      if (horseResult) {
        horseHistory.push({
          raceId: raceRecord.id,
          raceName: raceRecord.name,
          date: raceRecord.date,
          position: horseResult.position,
          prize: horseResult.prize,
          time: horseResult.formattedTime
        });
        
        if (horseHistory.length >= limit) break;
      }
    }
    
    return horseHistory;
  }
  
  /**
   * Calculate player's racing reputation based on race history
   * @returns {number} Updated reputation score
   */
  calculateReputation() {
    if (this.raceHistory.length === 0) return 0;
    
    let reputationPoints = 0;
    
    // Look at the last 20 races at most
    const recentHistory = this.raceHistory.slice(0, 20);
    
    recentHistory.forEach(raceRecord => {
      // Only count races with player horses
      const playerResults = raceRecord.playerResults || [];
      
      playerResults.forEach(result => {
        // Points based on position
        switch (result.position) {
          case 1:
            reputationPoints += 10;
            break;
          case 2:
            reputationPoints += 5;
            break;
          case 3:
            reputationPoints += 3;
            break;
          case 4:
            reputationPoints += 1;
            break;
          default:
            // No points for positions 5+
            break;
        }
        
        // Bonus points for higher tier races
        const race = this.getRace(raceRecord.id);
        if (race) {
          switch (race.tier) {
            case 'medium':
              reputationPoints += result.position <= 3 ? 2 : 0;
              break;
            case 'high':
              reputationPoints += result.position <= 3 ? 5 : 0;
              break;
            case 'elite':
              reputationPoints += result.position <= 3 ? 10 : 0;
              break;
          }
        }
      });
    });
    
    // Update player reputation
    this.playerReputation = reputationPoints;
    
    // Check for tier unlocks based on reputation
    this.checkTierUnlocks();
    
    return this.playerReputation;
  }
  
  /**
   * Check if new race tiers should be unlocked based on reputation
   */
  checkTierUnlocks() {
    // Unlock medium tier at 30 reputation
    if (this.playerReputation >= 30 && !this.unlockedTiers.includes('medium')) {
      this.unlockedTiers.push('medium');
    }
    
    // Unlock high tier at 100 reputation
    if (this.playerReputation >= 100 && !this.unlockedTiers.includes('high')) {
      this.unlockedTiers.push('high');
    }
    
    // Unlock elite tier at 250 reputation
    if (this.playerReputation >= 250 && !this.unlockedTiers.includes('elite')) {
      this.unlockedTiers.push('elite');
    }
  }
  
  /**
   * Update race manager for a new day
   * @param {Object} gameTime - Current game time
   * @returns {Object} Update results
   */
  update(gameTime) {
    if (gameTime) {
      this.gameTime = gameTime;
    }
    
    // Check if we need to generate more races
    const scheduledDays = this.getScheduledDays();
    
    // If we have less than 7 days of races scheduled, generate more
    if (scheduledDays < 7) {
      this.generateRaceSchedule(7 - scheduledDays);
    }
    
    return {
      success: true,
      message: 'Race manager updated',
      scheduledDays: this.getScheduledDays(),
      races: this.races.length,
      reputation: this.playerReputation,
      unlockedTiers: [...this.unlockedTiers]
    };
  }
  
  /**
   * Get the number of days that have races scheduled
   * @returns {number} Number of days with scheduled races
   */
  getScheduledDays() {
    // Get all unique scheduled days
    const scheduledDays = new Set();
    
    this.races.forEach(race => {
      if (race.scheduleDay && !race.hasRun) {
        const dayKey = `${race.scheduleDay.year}-${race.scheduleDay.month}-${race.scheduleDay.day}`;
        scheduledDays.add(dayKey);
      }
    });
    
    return scheduledDays.size;
  }
  
  /**
   * Convert manager to a plain object for serialization
   * @returns {Object} Serializable manager object
   */
  toJSON() {
    return {
      races: this.races.map(race => race.toJSON()),
      gameTime: this.gameTime,
      playerReputation: this.playerReputation,
      unlockedTiers: this.unlockedTiers,
      raceHistory: this.raceHistory,
      maxHistoryLength: this.maxHistoryLength,
      playerHorseIds: this.playerHorseIds
    };
  }
  
  /**
   * Load races from serialized data
   * @param {Object} data - Serialized race manager data
   * @returns {Object} Load results
   */
  loadFromJSON(data) {
    if (!data) {
      return {
        success: false,
        message: 'Invalid data format'
      };
    }
    
    // Load races
    if (Array.isArray(data.races)) {
      this.races = data.races.map(raceData => new this.Race(raceData));
    }
    
    // Load other properties
    if (data.gameTime) this.gameTime = data.gameTime;
    if (typeof data.playerReputation === 'number') this.playerReputation = data.playerReputation;
    if (Array.isArray(data.unlockedTiers)) this.unlockedTiers = data.unlockedTiers;
    if (Array.isArray(data.raceHistory)) this.raceHistory = data.raceHistory;
    if (typeof data.maxHistoryLength === 'number') this.maxHistoryLength = data.maxHistoryLength;
    if (Array.isArray(data.playerHorseIds)) this.playerHorseIds = data.playerHorseIds;
    
    return {
      success: true,
      message: 'Race manager data loaded',
      races: this.races.length,
      history: this.raceHistory.length
    };
  }
} 