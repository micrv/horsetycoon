/**
 * Horse Tycoon - Horse Manager Class
 * 
 * Manages collections of horses and operations on multiple horses
 */

class HorseManager {
  /**
   * Create a new Horse Manager
   * @param {Object} config - The manager configuration
   */
  constructor(config = {}) {
    this.horses = config.horses || [];
    this.gameTime = config.gameTime || { day: 1, month: 1, year: 2023 };
    this.playerFunds = config.playerFunds || 0;
    this.stableSize = config.stableSize || 5;
    
    // Load horse class if not in browser context
    if (typeof Horse === 'undefined' && typeof require !== 'undefined') {
      const Horse = require('../models/horse.js');
      this.Horse = Horse;
    } else {
      this.Horse = Horse;
    }
  }
  
  /**
   * Get all horses
   * @returns {Array} Array of horse objects
   */
  getAllHorses() {
    return this.horses;
  }
  
  /**
   * Get a horse by ID
   * @param {string} id - The horse ID
   * @returns {Horse|null} The horse object or null if not found
   */
  getHorse(id) {
    return this.horses.find(horse => horse.id === id) || null;
  }
  
  /**
   * Add a horse to the manager
   * @param {Horse|Object} horse - Horse object or configuration
   * @returns {Object} Result of the operation
   */
  addHorse(horse) {
    // Check if we've reached stable capacity
    if (this.horses.length >= this.stableSize) {
      return {
        success: false,
        message: 'Stable is at maximum capacity',
        stableSize: this.stableSize,
        horseCount: this.horses.length
      };
    }
    
    // If it's a plain object, create a Horse instance
    const horseInstance = (horse instanceof this.Horse) 
      ? horse 
      : new this.Horse(horse);
    
    // Check if horse with same ID already exists
    if (this.horses.some(h => h.id === horseInstance.id)) {
      // Generate a new ID for the horse
      horseInstance.id = Date.now() + '_' + Math.floor(Math.random() * 1000000);
    }
    
    // Add the horse
    this.horses.push(horseInstance);
    
    return {
      success: true,
      message: `${horseInstance.name} has been added to your stable`,
      horse: horseInstance,
      horseCount: this.horses.length,
      stableSize: this.stableSize
    };
  }
  
  /**
   * Remove a horse by ID
   * @param {string} id - The horse ID
   * @returns {Object} Result of the operation
   */
  removeHorse(id) {
    const index = this.horses.findIndex(horse => horse.id === id);
    
    if (index === -1) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    const horseName = this.horses[index].name;
    this.horses.splice(index, 1);
    
    return {
      success: true,
      message: `${horseName} has been removed from your stable`,
      horseCount: this.horses.length,
      stableSize: this.stableSize
    };
  }
  
  /**
   * Generate a random starter horse
   * @param {string} difficulty - Game difficulty
   * @returns {Horse} A new starter horse
   */
  generateStarterHorse(difficulty = 'normal') {
    // Adjust stats based on difficulty
    let statModifier;
    switch (difficulty) {
      case 'easy':
        statModifier = 1.2; // 20% better stats
        break;
      case 'hard':
        statModifier = 0.8; // 20% worse stats
        break;
      default: // 'normal'
        statModifier = 1.0;
    }
    
    // Create a new horse with random stats
    const horse = new this.Horse({
      // Starter horses have slightly lower stats
      baseStatCap: 60 * statModifier,
      minStat: 30 * statModifier,
      age: 3, // Young horses
      isPlayerOwned: true
    });
    
    return horse;
  }
  
  /**
   * Generate multiple starter horses for player selection
   * @param {number} count - Number of starter horses to generate
   * @param {string} difficulty - Game difficulty
   * @returns {Array} Array of starter horses
   */
  generateStarterHorses(count = 3, difficulty = 'normal') {
    const starterHorses = [];
    
    for (let i = 0; i < count; i++) {
      starterHorses.push(this.generateStarterHorse(difficulty));
    }
    
    return starterHorses;
  }
  
  /**
   * Generate a random horse with quality based on game progression
   * @param {Object} options - Generation options
   * @returns {Horse} A newly generated horse
   */
  generateRandomHorse(options = {}) {
    const {
      minAge = 3,
      maxAge = 8,
      minQuality = 30,
      maxQuality = 70,
      playerRating = 50, // Average rating of player's horses
      adjustForProgression = true
    } = options;
    
    // Adjust quality based on player's progression
    let adjustedMaxQuality = maxQuality;
    
    if (adjustForProgression) {
      // As player's horses improve, the random horses should also improve
      // But not exceed the player's average horse rating by too much
      adjustedMaxQuality = Math.min(maxQuality, playerRating + 10);
    }
    
    // Calculate random quality
    const quality = minQuality + Math.random() * (adjustedMaxQuality - minQuality);
    
    // Calculate random age
    const age = Math.floor(minAge + Math.random() * (maxAge - minAge + 1));
    
    // Create a new horse with the calculated stats
    const horse = new this.Horse({
      baseStatCap: quality,
      minStat: quality * 0.7, // Minimum stat is 70% of the max
      age: age,
      isPlayerOwned: false
    });
    
    return horse;
  }
  
  /**
   * Generate market horses for buying
   * @param {number} count - Number of horses to generate
   * @param {Object} options - Generation options
   * @returns {Array} Array of horses for sale
   */
  generateMarketHorses(count = 5, options = {}) {
    const marketHorses = [];
    const playerRating = options.playerRating || this.calculateAveragePlayerRating();
    
    for (let i = 0; i < count; i++) {
      const horse = this.generateRandomHorse({
        ...options,
        playerRating
      });
      
      // Set for-sale flag and price
      horse.forSale = true;
      horse.salePrice = horse.calculateMarketValue();
      
      marketHorses.push(horse);
    }
    
    return marketHorses;
  }
  
  /**
   * Calculate the average rating of player's horses
   * @returns {number} Average horse rating
   */
  calculateAveragePlayerRating() {
    if (this.horses.length === 0) return 50; // Default if no horses
    
    const totalRating = this.horses.reduce((sum, horse) => {
      return sum + horse.calculateOverallRating();
    }, 0);
    
    return totalRating / this.horses.length;
  }
  
  /**
   * Generate horses with specific criteria for breeding selection
   * @param {Object} criteria - Criteria for generation
   * @param {number} count - Number of horses to generate
   * @returns {Array} Array of potential breeding partners
   */
  generateBreedingCandidates(criteria = {}, count = 5) {
    const {
      playerRating = this.calculateAveragePlayerRating(),
      minQuality = playerRating - 10,
      maxQuality = playerRating + 10,
      gender = 'male', // Target gender for breeding
      preferredBreeds = [] // Preferred breeds (if any)
    } = criteria;
    
    const breedingCandidates = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a horse suitable for breeding
      const horse = this.generateRandomHorse({
        minQuality,
        maxQuality,
        playerRating,
        minAge: 3, // Minimum breeding age
        maxAge: 10, // Prime breeding age
        adjustForProgression: true
      });
      
      // Force the gender
      horse.gender = gender;
      
      // If preferred breeds are specified, give them higher probability
      if (preferredBreeds.length > 0 && Math.random() > 0.5) {
        const randomBreedIndex = Math.floor(Math.random() * preferredBreeds.length);
        horse.breed = preferredBreeds[randomBreedIndex];
      }
      
      // Calculate stud fee based on quality
      const studFee = Math.round(horse.calculateMarketValue() * 0.15); // 15% of market value
      horse.studFee = studFee;
      
      breedingCandidates.push(horse);
    }
    
    return breedingCandidates;
  }
  
  /**
   * Breed two horses to produce a foal
   * @param {Horse} dam - The mother horse
   * @param {Horse} sire - The father horse
   * @returns {Object} Result of the breeding operation
   */
  breedHorses(dam, sire) {
    // Check if horses exist
    if (!dam || !sire) {
      return {
        success: false,
        message: 'Both parent horses must be provided'
      };
    }
    
    // Check genders
    if (dam.gender !== 'female' || sire.gender !== 'male') {
      return {
        success: false,
        message: 'Breeding requires one female horse (dam) and one male horse (sire)'
      };
    }
    
    // Check breeding cooldowns
    if (dam.breedingCooldown > 0) {
      return {
        success: false,
        message: `${dam.name} needs to rest for ${dam.breedingCooldown} more days before breeding again`
      };
    }
    
    // Check ages
    if (dam.age < 3 || sire.age < 3) {
      return {
        success: false,
        message: 'Horses must be at least 3 years old to breed'
      };
    }
    
    // Check stable capacity
    if (this.horses.length >= this.stableSize && dam.isPlayerOwned) {
      return {
        success: false,
        message: 'Your stable is at maximum capacity. Upgrade your stable or sell horses to make room for a foal.'
      };
    }
    
    // Create the foal by mixing parent traits
    const foal = new this.Horse({
      // Set parent references
      sire: {
        id: sire.id,
        name: sire.name,
        breed: sire.breed
      },
      dam: {
        id: dam.id,
        name: dam.name,
        breed: dam.breed
      },
      // Determine breed (50% chance of each parent's breed)
      breed: Math.random() < 0.5 ? dam.breed : sire.breed,
      // Inherit preferred traits
      preferredDistance: Math.random() < 0.6 ? dam.preferredDistance : sire.preferredDistance,
      preferredSurface: Math.random() < 0.6 ? dam.preferredSurface : sire.preferredSurface,
      // Determine gender (50/50 chance)
      gender: Math.random() < 0.5 ? 'male' : 'female',
      // Start as a foal
      age: 0,
      // Set birth date
      birthDay: { ...this.gameTime },
      // Always owned by player if dam is owned
      isPlayerOwned: dam.isPlayerOwned
    });
    
    // Calculate inherited stats
    this.calculateInheritedStats(foal, dam, sire);
    
    // Set cooldown for dam
    dam.breedingCooldown = 30; // 30 days cooldown after breeding
    
    // Add foal to stable if dam is player-owned
    let addResult = { success: true };
    if (dam.isPlayerOwned) {
      addResult = this.addHorse(foal);
      if (!addResult.success) {
        return {
          success: false,
          message: 'Failed to add foal to stable: ' + addResult.message
        };
      }
    }
    
    return {
      success: true,
      message: `Breeding successful! ${dam.name} and ${sire.name} produced a ${foal.gender === 'male' ? 'colt' : 'filly'}.`,
      foal,
      addedToStable: dam.isPlayerOwned
    };
  }
  
  /**
   * Calculate inherited stats for a foal based on parents
   * @param {Horse} foal - The foal to calculate stats for
   * @param {Horse} dam - The mother horse
   * @param {Horse} sire - The father horse
   */
  calculateInheritedStats(foal, dam, sire) {
    // Core stats are inherited with random weighting from parents
    // plus some random variation
    
    const statNames = ['speed', 'acceleration', 'stamina', 'jumping', 'temperament'];
    
    statNames.forEach(stat => {
      // Weighted average of parents' stats (random weight)
      const parentWeight = Math.random(); // 0 to 1
      const parentAvg = (dam[stat] * parentWeight) + (sire[stat] * (1 - parentWeight));
      
      // Add random variation (±10%)
      const variation = (Math.random() * 0.2) - 0.1; // -10% to +10%
      
      // Calculate stat with a small boost for genetic potential
      const inheritedStat = Math.round(parentAvg * (1 + variation));
      
      // Ensure stat is within reasonable range (10-100)
      foal[stat] = Math.max(10, Math.min(100, inheritedStat));
    });
    
    // Calculate potential (slightly higher than parents on average)
    const damPotential = dam.potential || 0;
    const sirePotential = sire.potential || 0;
    const parentPotentialAvg = (damPotential + sirePotential) / 2;
    
    // Potential can sometimes exceed parents (genetic lottery)
    const potentialBoost = Math.random() < 0.3 ? Math.random() * 15 : 0;
    foal.potential = Math.min(100, parentPotentialAvg + potentialBoost);
    
    // Growth rate varies with potential
    foal.growthRate = 0.8 + (foal.potential / 100) * 0.4; // 0.8 to 1.2
    
    // Calculate traits - chance to inherit traits from parents
    // or develop new ones
    foal.traits = [];
    
    // 70% chance to inherit a trait from each parent
    if (dam.traits && dam.traits.length > 0 && Math.random() < 0.7) {
      const randomDamTrait = dam.traits[Math.floor(Math.random() * dam.traits.length)];
      foal.traits.push(randomDamTrait);
    }
    
    if (sire.traits && sire.traits.length > 0 && Math.random() < 0.7) {
      const randomSireTrait = sire.traits[Math.floor(Math.random() * sire.traits.length)];
      // Avoid duplicate traits
      if (!foal.traits.includes(randomSireTrait)) {
        foal.traits.push(randomSireTrait);
      }
    }
    
    // 20% chance for a random new trait
    if (Math.random() < 0.2) {
      const possibleTraits = [
        'Sprinter', 'Endurance', 'Quick Learner', 'Calm', 'Competitive',
        'Late Bloomer', 'Early Developer', 'Mud Runner', 'Turf Specialist'
      ];
      
      const newTrait = possibleTraits[Math.floor(Math.random() * possibleTraits.length)];
      
      // Avoid duplicate traits
      if (!foal.traits.includes(newTrait)) {
        foal.traits.push(newTrait);
      }
    }
  }
  
  /**
   * Sell a horse
   * @param {string} horseId - ID of the horse to sell
   * @param {number} price - Sale price (if not specified, market value is used)
   * @returns {Object} Result of the sale operation
   */
  sellHorse(horseId, price = null) {
    const horse = this.getHorse(horseId);
    
    if (!horse) {
      return {
        success: false,
        message: 'Horse not found'
      };
    }
    
    // Calculate sale price if not specified
    const salePrice = price !== null ? price : horse.calculateMarketValue();
    
    // Remove horse from stable
    const removeResult = this.removeHorse(horseId);
    
    if (!removeResult.success) {
      return {
        success: false,
        message: 'Failed to remove horse from stable: ' + removeResult.message
      };
    }
    
    // Update player funds - this should be handled by the game/player class
    // but we'll calculate the revenue here
    
    return {
      success: true,
      message: `${horse.name} has been sold for $${salePrice.toLocaleString()}`,
      horse: horse,
      price: salePrice
    };
  }
  
  /**
   * Buy a horse
   * @param {Horse} horse - The horse to buy
   * @param {number} price - Purchase price
   * @returns {Object} Result of the purchase operation
   */
  buyHorse(horse, price) {
    // Check if we can add the horse
    if (this.horses.length >= this.stableSize) {
      return {
        success: false,
        message: 'Stable is at maximum capacity',
        stableSize: this.stableSize,
        horseCount: this.horses.length
      };
    }
    
    // Check if player has enough funds - should be handled by game/player class
    if (this.playerFunds < price) {
      return {
        success: false,
        message: 'Not enough funds',
        requiredFunds: price,
        playerFunds: this.playerFunds
      };
    }
    
    // Flag horse as player owned
    horse.isPlayerOwned = true;
    horse.forSale = false;
    horse.salePrice = 0;
    
    // Add horse to stable
    const addResult = this.addHorse(horse);
    
    if (!addResult.success) {
      return {
        success: false,
        message: 'Failed to add horse to stable: ' + addResult.message
      };
    }
    
    // Return success - actual fund deduction should be handled by game/player class
    return {
      success: true,
      message: `${horse.name} has been purchased for $${price.toLocaleString()}`,
      horse: horse,
      price: price
    };
  }
  
  /**
   * Update all horses for a new day
   * @param {Object} gameTime - Current game time
   * @returns {Object} Update results
   */
  updateHorses(gameTime = null) {
    if (gameTime) {
      this.gameTime = gameTime;
    }
    
    const results = {
      updates: [],
      birthdays: [],
      recoveries: [],
      cooldowns: []
    };
    
    this.horses.forEach(horse => {
      // Update horse for a new day
      const updateResult = horse.update(this.gameTime);
      
      // Process update results
      if (updateResult.hadBirthday) {
        results.birthdays.push({
          id: horse.id,
          name: horse.name,
          age: horse.age
        });
      }
      
      if (updateResult.recoveredFromInjury) {
        results.recoveries.push({
          id: horse.id,
          name: horse.name
        });
      }
      
      if (updateResult.cooldownsUpdated) {
        results.cooldowns.push({
          id: horse.id,
          name: horse.name,
          racingCooldown: horse.racingCooldown,
          breedingCooldown: horse.breedingCooldown,
          trainingCooldown: horse.trainingCooldown
        });
      }
      
      results.updates.push({
        id: horse.id,
        name: horse.name,
        updatedValues: updateResult.updatedValues
      });
    });
    
    return results;
  }
  
  /**
   * Sort horses by a specific criteria
   * @param {string} criteria - Sorting criteria
   * @param {boolean} ascending - Sort direction
   * @returns {Array} Sorted array of horses
   */
  sortHorses(criteria = 'name', ascending = true) {
    const sortedHorses = [...this.horses]; // Clone the array
    
    const sortOrder = ascending ? 1 : -1;
    
    sortedHorses.sort((a, b) => {
      switch (criteria) {
        case 'name':
          return sortOrder * a.name.localeCompare(b.name);
        case 'age':
          return sortOrder * (a.age - b.age);
        case 'value':
          return sortOrder * (a.calculateMarketValue() - b.calculateMarketValue());
        case 'rating':
          return sortOrder * (a.calculateOverallRating() - b.calculateOverallRating());
        case 'speed':
          return sortOrder * (a.speed - b.speed);
        case 'stamina':
          return sortOrder * (a.stamina - b.stamina);
        case 'gender':
          return sortOrder * a.gender.localeCompare(b.gender);
        case 'breed':
          return sortOrder * a.breed.localeCompare(b.breed);
        default:
          return 0;
      }
    });
    
    return sortedHorses;
  }
  
  /**
   * Filter horses by criteria
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered array of horses
   */
  filterHorses(filters = {}) {
    return this.horses.filter(horse => {
      // Check each filter criteria
      for (const key in filters) {
        if (!filters[key] || filters[key] === 'all') {
          continue; // Skip empty filters
        }
        
        switch (key) {
          case 'gender':
            if (horse.gender !== filters.gender) return false;
            break;
          case 'breed':
            if (horse.breed !== filters.breed) return false;
            break;
          case 'minAge':
            if (horse.age < filters.minAge) return false;
            break;
          case 'maxAge':
            if (horse.age > filters.maxAge) return false;
            break;
          case 'minRating':
            if (horse.calculateOverallRating() < filters.minRating) return false;
            break;
          case 'canRace':
            if (filters.canRace && (horse.injured || horse.racingCooldown > 0)) return false;
            break;
          case 'canBreed':
            if (filters.canBreed && (horse.age < 3 || horse.breedingCooldown > 0)) return false;
            break;
          case 'injured':
            if (filters.injured !== horse.injured) return false;
            break;
        }
      }
      
      return true; // All filters passed
    });
  }
  
  /**
   * Search horses by name
   * @param {string} query - Search query
   * @returns {Array} Array of matching horses
   */
  searchHorses(query) {
    if (!query) return this.horses;
    
    const lowercaseQuery = query.toLowerCase();
    
    return this.horses.filter(horse => {
      return horse.name.toLowerCase().includes(lowercaseQuery);
    });
  }
  
  /**
   * Get available breeds from current horses
   * @returns {Array} Array of unique breed names
   */
  getAvailableBreeds() {
    const breeds = new Set();
    
    this.horses.forEach(horse => {
      breeds.add(horse.breed);
    });
    
    return Array.from(breeds).sort();
  }
  
  /**
   * Get statistics about the stable
   * @returns {Object} Stable statistics
   */
  getStableStats() {
    if (this.horses.length === 0) {
      return {
        count: 0,
        avgAge: 0,
        avgRating: 0,
        totalValue: 0,
        genderDistribution: { male: 0, female: 0 },
        breedDistribution: {}
      };
    }
    
    let totalAge = 0;
    let totalRating = 0;
    let totalValue = 0;
    const genders = { male: 0, female: 0 };
    const breeds = {};
    
    this.horses.forEach(horse => {
      totalAge += horse.age;
      totalRating += horse.calculateOverallRating();
      totalValue += horse.calculateMarketValue();
      
      // Count genders
      genders[horse.gender]++;
      
      // Count breeds
      if (!breeds[horse.breed]) {
        breeds[horse.breed] = 0;
      }
      breeds[horse.breed]++;
    });
    
    return {
      count: this.horses.length,
      avgAge: totalAge / this.horses.length,
      avgRating: totalRating / this.horses.length,
      totalValue: totalValue,
      genderDistribution: genders,
      breedDistribution: breeds
    };
  }
  
  /**
   * Convert manager to a plain object for serialization
   * @returns {Object} Serializable manager object
   */
  toJSON() {
    return {
      horses: this.horses.map(horse => horse.toJSON()),
      gameTime: this.gameTime,
      playerFunds: this.playerFunds,
      stableSize: this.stableSize
    };
  }
  
  /**
   * Load horses from serialized data
   * @param {Array} horsesData - Array of serialized horse data
   * @returns {Object} Load results
   */
  loadHorses(horsesData) {
    if (!Array.isArray(horsesData)) {
      return {
        success: false,
        message: 'Invalid horse data format'
      };
    }
    
    // Clear existing horses
    this.horses = [];
    
    // Load each horse
    const loadedHorses = horsesData.map(horseData => {
      return new this.Horse(horseData);
    });
    
    // Add all horses
    loadedHorses.forEach(horse => {
      this.horses.push(horse);
    });
    
    return {
      success: true,
      message: `Loaded ${loadedHorses.length} horses`,
      horseCount: this.horses.length
    };
  }
} 