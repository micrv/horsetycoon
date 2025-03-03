/**
 * Horse Tycoon - Race Class
 * 
 * Handles race creation, configuration, and results
 */

class Race {
  /**
   * Create a new Race
   * @param {Object} config - The race configuration
   */
  constructor(config = {}) {
    // Basic info
    this.id = config.id || Date.now() + '_' + Math.floor(Math.random() * 1000000);
    this.name = config.name || 'Unnamed Race';
    
    // Race details
    this.distance = config.distance || 'middle';  // 'sprint', 'middle', or 'long'
    this.surface = config.surface || 'dirt';  // 'dirt', 'turf', or 'synthetic'
    this.type = config.type || 'flat';  // 'flat' or 'jump'
    this.tier = config.tier || 'low';  // 'low', 'medium', 'high', or 'elite'
    this.difficulty = config.difficulty || 1;  // 1-5 scale
    this.entryFee = config.entryFee || 0;
    
    // Prize details
    this.purse = config.purse || 1000;  // Total prize money
    this.prizes = config.prizes || this.calculateDefaultPrizes();
    
    // Requirements
    this.requirements = config.requirements || {
      minAge: 3,
      maxAge: 20,
      minRating: 0,
      gender: 'any',  // 'male', 'female', or 'any'
      breeds: []  // Empty array means any breed
    };
    
    // Maximum number of horses that can enter
    this.maxEntrants = config.maxEntrants || 8;
    
    // Special flag
    this.isSpecial = config.isSpecial || false;  // Special races have unique rewards/conditions
    
    // Results
    this.hasRun = config.hasRun || false;
    this.entrants = config.entrants || [];
    this.results = config.results || [];
    
    // Scheduled time (game day)
    this.scheduleDay = config.scheduleDay || null;
    
    // Unlock condition
    this.unlockCondition = config.unlockCondition || null;
  }
  
  /**
   * Calculate default prize distribution
   * @returns {Array} Array of prize amounts
   */
  calculateDefaultPrizes() {
    // Default distribution: 60% to 1st, 20% to 2nd, 10% to 3rd, 5% to 4th, 5% to 5th
    const prizes = [
      Math.floor(this.purse * 0.6),  // 1st place
      Math.floor(this.purse * 0.2),  // 2nd place
      Math.floor(this.purse * 0.1),  // 3rd place
      Math.floor(this.purse * 0.05), // 4th place
      Math.floor(this.purse * 0.05)  // 5th place
    ];
    
    return prizes;
  }
  
  /**
   * Check if a horse is eligible for this race
   * @param {Horse} horse - The horse to check
   * @returns {Object} Eligibility result
   */
  checkEligibility(horse) {
    const reasons = [];
    
    // Check age
    if (horse.age < this.requirements.minAge) {
      reasons.push(`Horse is too young (minimum age: ${this.requirements.minAge})`);
    }
    
    if (horse.age > this.requirements.maxAge) {
      reasons.push(`Horse is too old (maximum age: ${this.requirements.maxAge})`);
    }
    
    // Check rating
    if (horse.calculateOverallRating() < this.requirements.minRating) {
      reasons.push(`Horse's rating is too low (minimum rating: ${this.requirements.minRating})`);
    }
    
    // Check gender restrictions
    if (this.requirements.gender !== 'any' && horse.gender !== this.requirements.gender) {
      reasons.push(`This race is for ${this.requirements.gender} horses only`);
    }
    
    // Check breed restrictions
    if (this.requirements.breeds.length > 0 && !this.requirements.breeds.includes(horse.breed)) {
      reasons.push(`This race is only for ${this.requirements.breeds.join(', ')} breeds`);
    }
    
    // Check health and injury
    if (horse.injured) {
      reasons.push('Horse is injured and cannot race');
    }
    
    if (horse.health < 50) {
      reasons.push('Horse\'s health is too low to race');
    }
    
    // Check if horse is on cooldown
    if (horse.racingCooldown > 0) {
      reasons.push(`Horse needs to rest for ${horse.racingCooldown} more days before racing again`);
    }
    
    // Determine eligibility
    const isEligible = reasons.length === 0;
    
    return {
      isEligible,
      reasons
    };
  }
  
  /**
   * Add a horse to the race
   * @param {Horse} horse - The horse to add
   * @param {string} jockeyName - Name of the jockey
   * @returns {Object} Result of the operation
   */
  addEntrant(horse, jockeyName = 'Unknown Jockey') {
    // Check if race is already full
    if (this.entrants.length >= this.maxEntrants) {
      return {
        success: false,
        message: 'Race is already full',
        maxEntrants: this.maxEntrants
      };
    }
    
    // Check if race has already run
    if (this.hasRun) {
      return {
        success: false,
        message: 'Race has already been run'
      };
    }
    
    // Check if horse is already entered
    if (this.entrants.some(e => e.horseId === horse.id)) {
      return {
        success: false,
        message: 'Horse is already entered in this race'
      };
    }
    
    // Check eligibility
    const eligibility = this.checkEligibility(horse);
    if (!eligibility.isEligible) {
      return {
        success: false,
        message: 'Horse is not eligible for this race',
        reasons: eligibility.reasons
      };
    }
    
    // Add horse to entrants
    this.entrants.push({
      horseId: horse.id,
      horseName: horse.name,
      jockeyName: jockeyName,
      playerOwned: true,  // Flag to indicate this is the player's horse
      odds: this.calculateOdds(horse)
    });
    
    return {
      success: true,
      message: `${horse.name} has been entered in ${this.name}`,
      entrantCount: this.entrants.length,
      maxEntrants: this.maxEntrants
    };
  }
  
  /**
   * Add an AI horse to the race (non-player horse)
   * @param {Object} aiHorse - AI horse data
   * @returns {Object} Result of the operation
   */
  addAIEntrant(aiHorse) {
    // Check if race is already full
    if (this.entrants.length >= this.maxEntrants) {
      return {
        success: false,
        message: 'Race is already full',
        maxEntrants: this.maxEntrants
      };
    }
    
    // Check if race has already run
    if (this.hasRun) {
      return {
        success: false,
        message: 'Race has already been run'
      };
    }
    
    // Add AI horse to entrants
    this.entrants.push({
      horseId: aiHorse.id,
      horseName: aiHorse.name,
      jockeyName: aiHorse.jockeyName || this.generateRandomJockeyName(),
      playerOwned: false,  // This is an AI horse
      odds: aiHorse.odds || this.calculateAIOdds(aiHorse)
    });
    
    return {
      success: true,
      message: `${aiHorse.name} has been entered in the race`,
      entrantCount: this.entrants.length,
      maxEntrants: this.maxEntrants
    };
  }
  
  /**
   * Generate a random jockey name
   * @returns {string} Random jockey name
   */
  generateRandomJockeyName() {
    const firstNames = [
      'John', 'Mike', 'James', 'Robert', 'Tom', 'William', 'David', 'Richard',
      'Sarah', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Emily', 'Grace'
    ];
    
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia',
      'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Martin', 'Lee'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }
  
  /**
   * Calculate odds for a player's horse based on its stats and the race
   * @param {Horse} horse - The horse to calculate odds for
   * @returns {number} Decimal odds (e.g. 3.5 means 3.5 to 1)
   */
  calculateOdds(horse) {
    // Get the horse's rating
    const rating = horse.calculateOverallRating();
    
    // Base odds calculation (lower rating = higher odds)
    let baseOdds = 10 - (rating / 12.5);
    
    // Adjust for preferred distance
    if (horse.preferredDistance === this.distance) {
      baseOdds *= 0.8; // Reduce odds (make more likely) if horse prefers this distance
    } else if (
      (horse.preferredDistance === 'sprint' && this.distance === 'long') ||
      (horse.preferredDistance === 'long' && this.distance === 'sprint')
    ) {
      baseOdds *= 1.3; // Increase odds (make less likely) if horse dislikes this distance
    }
    
    // Adjust for preferred surface
    if (horse.preferredSurface === this.surface) {
      baseOdds *= 0.85; // Reduce odds if horse prefers this surface
    } else {
      baseOdds *= 1.15; // Increase odds if horse doesn't prefer this surface
    }
    
    // Adjust for race type
    if (this.type === 'jump' && horse.jumping >= 70) {
      baseOdds *= 0.85; // Better odds for good jumpers in jump races
    } else if (this.type === 'jump' && horse.jumping <= 40) {
      baseOdds *= 1.3; // Worse odds for poor jumpers in jump races
    }
    
    // Add some randomness (±15%)
    const randomFactor = 0.85 + (Math.random() * 0.3);
    baseOdds *= randomFactor;
    
    // Ensure odds are within reasonable range
    baseOdds = Math.max(1.2, Math.min(20, baseOdds));
    
    // Round to 1 decimal place
    return Math.round(baseOdds * 10) / 10;
  }
  
  /**
   * Calculate odds for an AI horse
   * @param {Object} aiHorse - AI horse data
   * @returns {number} Decimal odds
   */
  calculateAIOdds(aiHorse) {
    // Base odds on the AI horse's "quality" (0-100)
    const quality = aiHorse.quality || (aiHorse.rating || 50);
    
    // Calculate base odds (higher quality = lower odds)
    let baseOdds = 12 - (quality / 10);
    
    // Add some randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4);
    baseOdds *= randomFactor;
    
    // Ensure odds are within reasonable range
    baseOdds = Math.max(1.5, Math.min(20, baseOdds));
    
    // Round to 1 decimal place
    return Math.round(baseOdds * 10) / 10;
  }
  
  /**
   * Generate the field of AI horses if not enough entrants
   * @param {number} playerRating - The player's horse's rating
   * @returns {Array} Array of AI horse objects
   */
  generateAIField(playerRating = 50) {
    const aiHorses = [];
    const remainingSlots = this.maxEntrants - this.entrants.length;
    
    if (remainingSlots <= 0) return aiHorses;
    
    // Generate AI horses to fill the field
    for (let i = 0; i < remainingSlots; i++) {
      // Base AI horse quality on tier and player's horse rating
      let quality;
      
      // AI horses should be slightly worse than the player rating on average
      const difficultyAdjustment = (this.difficulty - 3) * 5;
      const baseQuality = playerRating + difficultyAdjustment;
      
      // Add spread based on race tier
      let spread;
      switch (this.tier) {
        case 'low':
          spread = 20;
          break;
        case 'medium':
          spread = 15;
          break;
        case 'high':
          spread = 10;
          break;
        case 'elite':
          spread = 5;
          break;
        default:
          spread = 15;
      }
      
      // Generate quality with randomness
      quality = baseQuality + (Math.random() * spread * 2) - spread;
      
      // Cap quality between 20 and 95
      quality = Math.max(20, Math.min(95, quality));
      
      // Create AI horse
      const aiHorse = {
        id: `ai_${Date.now()}_${i}`,
        name: this.generateRandomHorseName(),
        jockeyName: this.generateRandomJockeyName(),
        quality: quality,
        rating: quality,
        odds: null, // Will be calculated later
        preferredDistance: ['sprint', 'middle', 'long'][Math.floor(Math.random() * 3)],
        preferredSurface: ['dirt', 'turf', 'synthetic'][Math.floor(Math.random() * 3)]
      };
      
      // Calculate odds
      aiHorse.odds = this.calculateAIOdds(aiHorse);
      
      aiHorses.push(aiHorse);
    }
    
    return aiHorses;
  }
  
  /**
   * Generate a random horse name
   * @returns {string} Random horse name
   */
  generateRandomHorseName() {
    const prefixes = [
      'Bold', 'Swift', 'Mighty', 'Royal', 'Noble', 'Fast', 'Lucky', 'Epic',
      'Thunder', 'Silent', 'Golden', 'Silver', 'Midnight', 'Wild', 'Winter', 'Summer'
    ];
    
    const suffixes = [
      'Runner', 'Spirit', 'Wind', 'Star', 'Prince', 'King', 'Queen', 'Dancer',
      'Legend', 'Flash', 'Heart', 'Moon', 'Storm', 'Hero', 'Warrior', 'Champion'
    ];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix}`;
  }
  
  /**
   * Run the race and generate results
   * @param {Object} playerHorse - The player's horse object
   * @returns {Object} Race results
   */
  runRace(playerHorse) {
    // Check if the race has already been run
    if (this.hasRun) {
      return {
        success: false,
        message: 'Race has already been run',
        results: this.results
      };
    }
    
    // Ensure we have at least one entrant
    if (this.entrants.length === 0) {
      return {
        success: false,
        message: 'No horses entered in the race'
      };
    }
    
    // Generate any needed AI horses
    const playerRating = playerHorse ? playerHorse.calculateOverallRating() : 50;
    const aiHorses = this.generateAIField(playerRating);
    
    // Add AI horses to entrants
    aiHorses.forEach(aiHorse => this.addAIEntrant(aiHorse));
    
    // Get the player's horse performance
    let playerPerformance = null;
    let playerEntrantIndex = -1;
    
    if (playerHorse) {
      playerEntrantIndex = this.entrants.findIndex(e => e.horseId === playerHorse.id);
      
      if (playerEntrantIndex >= 0) {
        // Get performance based on horse stats and race conditions
        playerPerformance = playerHorse.getRacePerformance({
          distance: this.distance,
          surface: this.surface,
          type: this.type,
          tier: this.tier
        });
      }
    }
    
    // Generate performances for all horses
    const performances = this.entrants.map((entrant, index) => {
      // For the player's horse, use the calculated performance
      if (index === playerEntrantIndex && playerPerformance) {
        return {
          entrantIndex: index,
          horseId: entrant.horseId,
          horseName: entrant.horseName,
          jockeyName: entrant.jockeyName,
          playerOwned: entrant.playerOwned,
          odds: entrant.odds,
          score: playerPerformance.score,
          time: playerPerformance.time,
          energyUsed: playerPerformance.energyUsed,
          injury: playerPerformance.injury,
          experience: playerPerformance.experience
        };
      }
      
      // For AI horses, generate a performance
      // Base the performance score on odds (lower odds = better performance)
      const baseScore = 100 - (entrant.odds * 4);
      const score = baseScore * (0.85 + (Math.random() * 0.3)); // Add randomness
      
      // Calculate time based on score and race distance
      let baseTime;
      switch(this.distance) {
        case 'sprint':
          baseTime = 70; // ~1:10 for 1200m
          break;
        case 'middle':
          baseTime = 120; // ~2:00 for 2000m
          break;
        case 'long':
          baseTime = 180; // ~3:00 for 3000m
          break;
        default:
          baseTime = 120;
      }
      
      // Adjust based on performance (higher score = lower time)
      const performanceAdjustment = (100 - score) / 100;
      const randomAdjustment = (Math.random() * 10 - 5) / 100; // -5% to +5%
      const time = baseTime * (1 + performanceAdjustment + randomAdjustment);
      
      // AI horses don't need energy calculations or injury checks
      return {
        entrantIndex: index,
        horseId: entrant.horseId,
        horseName: entrant.horseName,
        jockeyName: entrant.jockeyName,
        playerOwned: entrant.playerOwned,
        odds: entrant.odds,
        score,
        time,
        energyUsed: 0,
        injury: { injured: false },
        experience: 0
      };
    });
    
    // Sort by performance score (descending) to determine race positions
    performances.sort((a, b) => b.score - a.score);
    
    // Assign positions and calculate prizes
    const results = performances.map((perf, index) => {
      const position = index + 1;
      const prize = position <= this.prizes.length ? this.prizes[position - 1] : 0;
      
      return {
        ...perf,
        position,
        prize,
        formattedTime: this.formatRaceTime(perf.time)
      };
    });
    
    // Update race state
    this.hasRun = true;
    this.results = results;
    
    // Return race results with focus on player's horse if entered
    const playerResult = results.find(r => r.playerOwned);
    
    return {
      success: true,
      message: 'Race completed',
      results,
      playerResult,
      purse: this.purse,
      prizes: this.prizes
    };
  }
  
  /**
   * Format race time from seconds to MM:SS.ms format
   * @param {number} timeInSeconds - Race time in seconds
   * @returns {string} Formatted time string
   */
  formatRaceTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Get detailed information about the race
   * @returns {Object} Race details
   */
  getDetails() {
    return {
      id: this.id,
      name: this.name,
      details: {
        distance: this.distance,
        surface: this.surface,
        type: this.type,
        tier: this.tier,
        difficulty: this.difficulty,
        entryFee: this.entryFee
      },
      prizes: {
        purse: this.purse,
        distribution: this.prizes
      },
      requirements: this.requirements,
      status: {
        hasRun: this.hasRun,
        entrantCount: this.entrants.length,
        maxEntrants: this.maxEntrants,
        scheduleDay: this.scheduleDay
      },
      entrants: this.entrants,
      results: this.results
    };
  }
  
  /**
   * Get a formatted prize string
   * @returns {string} Formatted prize string
   */
  getPrizeString() {
    return `$${this.purse.toLocaleString()} (1st: $${this.prizes[0].toLocaleString()})`;
  }
  
  /**
   * Get a formatted distance string
   * @returns {string} Formatted distance string
   */
  getDistanceString() {
    const distances = {
      sprint: '1200m (6 furlongs)',
      middle: '2000m (10 furlongs)',
      long: '3000m (15 furlongs)'
    };
    
    return distances[this.distance] || this.distance;
  }
  
  /**
   * Convert the race to a plain object for serialization
   * @returns {Object} Serializable race object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      distance: this.distance,
      surface: this.surface,
      type: this.type,
      tier: this.tier,
      difficulty: this.difficulty,
      entryFee: this.entryFee,
      purse: this.purse,
      prizes: this.prizes,
      requirements: this.requirements,
      maxEntrants: this.maxEntrants,
      isSpecial: this.isSpecial,
      hasRun: this.hasRun,
      entrants: this.entrants,
      results: this.results,
      scheduleDay: this.scheduleDay,
      unlockCondition: this.unlockCondition
    };
  }
} 