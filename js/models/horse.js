/**
 * Horse Tycoon - Horse Class
 * 
 * The core Horse class that handles all horse-related properties and methods
 */

class Horse {
  /**
   * Create a new Horse
   * @param {Object} config - The horse configuration
   */
  constructor(config = {}) {
    // Generate a unique ID
    this.id = config.id || Date.now() + '_' + Math.floor(Math.random() * 1000000);
    
    // Basic info
    this.name = config.name || this.generateRandomName();
    this.gender = config.gender || (Math.random() > 0.5 ? 'male' : 'female');
    this.breed = config.breed || this.getRandomBreed();
    this.color = config.color || this.getRandomColor();
    this.age = config.age || 2; // Age in years
    this.birthDay = config.birthDay || 0; // Game day of birth
    
    // Lineage
    this.sire = config.sire || null; // Father
    this.dam = config.dam || null; // Mother
    
    // Core stats (0-100 scale)
    this.speed = config.speed !== undefined ? config.speed : this.generateRandomStat(30, 70);
    this.acceleration = config.acceleration !== undefined ? config.acceleration : this.generateRandomStat(30, 70);
    this.stamina = config.stamina !== undefined ? config.stamina : this.generateRandomStat(30, 70);
    this.jumping = config.jumping !== undefined ? config.jumping : this.generateRandomStat(30, 70);
    this.temperament = config.temperament !== undefined ? config.temperament : this.generateRandomStat(40, 80);
    
    // Racing preferences
    this.preferredDistance = config.preferredDistance || this.getRandomPreferredDistance();
    this.preferredSurface = config.preferredSurface || this.getRandomPreferredSurface();
    
    // Status
    this.energy = config.energy !== undefined ? config.energy : 100;
    this.health = config.health !== undefined ? config.health : 100;
    this.happiness = config.happiness !== undefined ? config.happiness : 100;
    this.training = config.training || 0; // Training level (experience)
    
    // Flags
    this.forSale = config.forSale || false;
    this.salePrice = config.salePrice || 0;
    this.breedingCooldown = config.breedingCooldown || 0;
    this.racingCooldown = config.racingCooldown || 0;
    this.injured = config.injured || false;
    this.injuryDuration = config.injuryDuration || 0;
    
    // Records and achievements
    this.races = config.races || []; // Race history
    this.racesWon = config.racesWon || 0;
    this.racesPlaced = config.racesPlaced || 0;
    this.earnings = config.earnings || 0;
    this.level = config.level || 1;
    
    // Traits (special abilities or characteristics)
    this.traits = config.traits || [];
    this.acquiredTraits = config.acquiredTraits || [];
    
    // Internal states
    this.needsUpdate = true;
    this.growthRate = this.calculateGrowthRate();
    
    // Calculate potential based on stats
    this.potential = this.calculatePotential();
  }
  
  /**
   * Generate a random name for a horse
   * @returns {string} A randomly generated name
   */
  generateRandomName() {
    const prefixes = ['Swift', 'Mighty', 'Golden', 'Thunder', 'Shadow', 'Royal', 'Noble', 'Mystic', 
                      'Wild', 'Silver', 'Midnight', 'Stellar', 'Magic', 'Legend', 'Storm', 'Brave'];
    const suffixes = ['Runner', 'Spirit', 'Star', 'Bolt', 'Wind', 'Heart', 'Fire', 'Dash', 'Flash',
                      'Mane', 'Dancer', 'Jumper', 'Blaze', 'Whisper', 'Dream', 'Legend'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return prefix + ' ' + suffix;
  }
  
  /**
   * Get a random horse breed
   * @returns {string} A randomly selected breed
   */
  getRandomBreed() {
    const breeds = ['Thoroughbred', 'Arabian', 'Quarter Horse', 'Appaloosa', 'Mustang', 
                    'Morgan', 'Andalusian', 'Friesian', 'Belgian', 'Clydesdale'];
    return breeds[Math.floor(Math.random() * breeds.length)];
  }
  
  /**
   * Get a random horse color
   * @returns {string} A randomly selected color
   */
  getRandomColor() {
    const colors = ['Bay', 'Chestnut', 'Black', 'Grey', 'Palomino', 'Buckskin', 
                    'Roan', 'Dun', 'Pinto', 'White', 'Sorrel'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Generate a random stat value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} A random value between min and max
   */
  generateRandomStat(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Get a random preferred race distance
   * @returns {string} A randomly selected preferred distance
   */
  getRandomPreferredDistance() {
    const distances = ['sprint', 'middle', 'long'];
    return distances[Math.floor(Math.random() * distances.length)];
  }
  
  /**
   * Get a random preferred surface
   * @returns {string} A randomly selected preferred surface
   */
  getRandomPreferredSurface() {
    const surfaces = ['dirt', 'turf', 'synthetic'];
    return surfaces[Math.floor(Math.random() * surfaces.length)];
  }
  
  /**
   * Calculate growth rate based on breed and random factors
   * @returns {number} Growth rate factor
   */
  calculateGrowthRate() {
    // Base growth rate
    let rate = 1.0;
    
    // Adjust based on breed
    if (this.breed === 'Thoroughbred' || this.breed === 'Arabian') {
      rate *= 1.1; // Faster growth
    } else if (this.breed === 'Belgian' || this.breed === 'Clydesdale') {
      rate *= 0.9; // Slower growth
    }
    
    // Add some randomness
    rate *= (0.9 + Math.random() * 0.2);
    
    return rate;
  }
  
  /**
   * Calculate horse's overall potential
   * @returns {number} Potential rating (0-100)
   */
  calculatePotential() {
    // Average of base stats with small random factor
    const baseAverage = (this.speed + this.acceleration + this.stamina + this.jumping + this.temperament) / 5;
    const potential = Math.min(100, baseAverage * (1 + (Math.random() * 0.3 - 0.1)));
    return Math.round(potential);
  }
  
  /**
   * Calculate horse's overall rating based on stats
   * @returns {number} Overall rating (0-100)
   */
  calculateOverallRating() {
    // Weights for different stats
    const weights = {
      speed: 0.25,
      acceleration: 0.2,
      stamina: 0.2,
      jumping: 0.15,
      temperament: 0.2
    };
    
    // Calculate weighted average
    const rating = (
      this.speed * weights.speed +
      this.acceleration * weights.acceleration +
      this.stamina * weights.stamina +
      this.jumping * weights.jumping +
      this.temperament * weights.temperament
    );
    
    // Apply training modifier
    const trainingBonus = this.training * 0.05; // 5% bonus per training level
    
    // Apply age modifier
    let ageModifier = 1.0;
    if (this.age < 3) {
      // Young horses haven't reached full potential
      ageModifier = 0.8 + (this.age / 3) * 0.2;
    } else if (this.age > 15) {
      // Older horses decline
      ageModifier = 1.0 - ((this.age - 15) * 0.05);
    } else if (this.age >= 5 && this.age <= 10) {
      // Prime years
      ageModifier = 1.05;
    }
    
    // Apply health and energy modifiers
    const healthModifier = this.health / 100;
    const energyModifier = this.energy / 100;
    
    // Calculate final rating
    let finalRating = rating * ageModifier * healthModifier * energyModifier * (1 + trainingBonus);
    
    // Apply trait modifiers
    if (this.traits.length > 0) {
      this.traits.forEach(trait => {
        if (trait.ratingEffect) {
          finalRating += trait.ratingEffect;
        }
      });
    }
    
    // Cap at 100
    return Math.min(100, Math.round(finalRating));
  }
  
  /**
   * Calculate market value of the horse
   * @returns {number} Estimated market value
   */
  calculateMarketValue() {
    // Base value based on overall rating
    const baseValue = this.calculateOverallRating() * 100;
    
    // Multiply based on age
    let ageMultiplier = 1.0;
    if (this.age < 3) {
      // Young horses with potential
      ageMultiplier = 1.5;
    } else if (this.age > 12) {
      // Older horses worth less
      ageMultiplier = 0.7 - ((this.age - 12) * 0.05);
    } else if (this.age >= 4 && this.age <= 8) {
      // Prime years
      ageMultiplier = 1.2;
    }
    
    // Add value for racing success
    const raceBonus = (this.racesWon * 500) + (this.racesPlaced * 200);
    
    // Add value for good traits
    let traitBonus = 0;
    if (this.traits.length > 0) {
      this.traits.forEach(trait => {
        if (trait.valueEffect) {
          traitBonus += trait.valueEffect;
        }
      });
    }
    
    // Calculate final value
    return Math.max(500, Math.round((baseValue * ageMultiplier) + raceBonus + traitBonus));
  }
  
  /**
   * Get racing performance for a specific race
   * @param {Object} race - Race information
   * @returns {Object} Performance metrics for the race
   */
  getRacePerformance(race) {
    // Base performance from overall rating
    let performance = this.calculateOverallRating() * 0.8;
    
    // Calculate distance compatibility
    let distanceCompatibility = 1.0;
    if (race.distance === this.preferredDistance) {
      distanceCompatibility = 1.2; // 20% boost for preferred distance
    } else if (
      (race.distance === 'sprint' && this.preferredDistance === 'long') ||
      (race.distance === 'long' && this.preferredDistance === 'sprint')
    ) {
      distanceCompatibility = 0.8; // 20% penalty for opposite preference
    }
    
    // Calculate surface compatibility
    let surfaceCompatibility = 1.0;
    if (race.surface === this.preferredSurface) {
      surfaceCompatibility = 1.15; // 15% boost for preferred surface
    } else {
      surfaceCompatibility = 0.9; // 10% penalty for non-preferred surface
    }
    
    // Apply energy and health factors
    const energyFactor = this.energy / 100;
    const healthFactor = this.health / 100;
    
    // Apply random factor (luck)
    const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 to 1.15
    
    // Apply trait modifiers
    let traitModifier = 0;
    if (this.traits.length > 0) {
      this.traits.forEach(trait => {
        if (trait.raceEffect) {
          traitModifier += trait.raceEffect;
        }
      });
    }
    
    // Calculate final performance score
    const finalScore = performance * distanceCompatibility * surfaceCompatibility * 
                       energyFactor * healthFactor * randomFactor + traitModifier;
    
    // Create race result data
    return {
      score: finalScore,
      time: this.calculateRaceTime(race, finalScore),
      energyUsed: this.calculateEnergyUsed(race),
      injury: this.calculateInjuryChance(race),
      experience: this.calculateExperienceGained(race)
    };
  }
  
  /**
   * Calculate race time based on performance
   * @param {Object} race - Race information
   * @param {number} performance - Performance score
   * @returns {number} Race time in seconds
   */
  calculateRaceTime(race, performance) {
    // Base time depends on distance
    let baseTime;
    switch(race.distance) {
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
    
    // Adjust based on performance
    // Higher performance = lower time
    const performanceAdjustment = (100 - performance) / 100;
    
    // Add some randomness
    const randomAdjustment = (Math.random() * 10 - 5) / 100; // -5% to +5%
    
    // Calculate final time
    return baseTime * (1 + performanceAdjustment + randomAdjustment);
  }
  
  /**
   * Calculate energy used in a race
   * @param {Object} race - Race information
   * @returns {number} Energy used (0-100)
   */
  calculateEnergyUsed(race) {
    // Base energy usage depends on distance
    let baseEnergy;
    switch(race.distance) {
      case 'sprint':
        baseEnergy = 30;
        break;
      case 'middle':
        baseEnergy = 50;
        break;
      case 'long':
        baseEnergy = 70;
        break;
      default:
        baseEnergy = 50;
    }
    
    // Adjust based on stamina
    const staminaFactor = 1 - (this.stamina / 200); // 0.5 to 1
    
    // Add some randomness
    const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
    
    // Calculate total energy used
    return Math.min(100, Math.round(baseEnergy * staminaFactor * randomFactor));
  }
  
  /**
   * Calculate chance of injury during a race
   * @param {Object} race - Race information
   * @returns {Object} Injury information
   */
  calculateInjuryChance(race) {
    // Base injury chance (0.5%)
    let baseChance = 0.005;
    
    // Adjust based on energy and health
    if (this.energy < 30) baseChance *= 2;
    if (this.health < 50) baseChance *= 3;
    
    // Adjust based on race distance
    if (race.distance === 'long') baseChance *= 1.5;
    
    // Adjust based on temperament (calmer horses less likely to injure)
    const temperamentFactor = 1 - (this.temperament / 200); // 0.5 to 1
    baseChance *= temperamentFactor;
    
    // Roll for injury
    const injured = Math.random() < baseChance;
    
    // If injured, determine severity
    let severity = 0;
    let duration = 0;
    
    if (injured) {
      // 1-3 severity, higher is worse
      severity = Math.floor(Math.random() * 3) + 1;
      
      // Duration based on severity
      switch(severity) {
        case 1: // Minor
          duration = Math.floor(Math.random() * 3) + 1; // 1-3 days
          break;
        case 2: // Moderate
          duration = Math.floor(Math.random() * 5) + 3; // 3-7 days
          break;
        case 3: // Severe
          duration = Math.floor(Math.random() * 10) + 7; // 7-16 days
          break;
      }
    }
    
    return {
      injured,
      severity,
      duration
    };
  }
  
  /**
   * Calculate experience gained from a race
   * @param {Object} race - Race information
   * @returns {number} Experience points gained
   */
  calculateExperienceGained(race) {
    // Base experience based on race type
    let baseExp;
    switch(race.tier) {
      case 'low':
        baseExp = 10;
        break;
      case 'medium':
        baseExp = 20;
        break;
      case 'high':
        baseExp = 30;
        break;
      case 'elite':
        baseExp = 50;
        break;
      default:
        baseExp = 15;
    }
    
    // Bonus for preferred distance/surface
    if (race.distance === this.preferredDistance) baseExp *= 1.2;
    if (race.surface === this.preferredSurface) baseExp *= 1.1;
    
    // Random variance
    const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
    
    return Math.round(baseExp * randomFactor);
  }
  
  /**
   * Train the horse to improve a specific stat
   * @param {string} statType - The stat to train
   * @param {number} intensity - Training intensity (1-3)
   * @returns {Object} Training results
   */
  train(statType, intensity = 1) {
    // Check if horse has enough energy
    if (this.energy < 20) {
      return {
        success: false,
        message: "Horse is too tired to train"
      };
    }
    
    // Cap intensity
    intensity = Math.min(3, Math.max(1, intensity));
    
    // Base stat gain
    const baseGain = intensity * 2;
    
    // Energy cost
    const energyCost = intensity * 15;
    
    // Chance of secondary stat loss
    const secondaryStatLossChance = intensity * 0.1;
    
    // Apply training
    let primaryStatGain = 0;
    let secondaryStatLoss = false;
    let secondaryStatType = '';
    let secondaryStatLossAmount = 0;
    
    // Calculate actual gain with some randomness
    primaryStatGain = Math.round(baseGain * (0.8 + Math.random() * 0.4));
    
    // Apply gain to the selected stat
    if (this[statType] !== undefined) {
      this[statType] = Math.min(100, this[statType] + primaryStatGain);
    }
    
    // Check for secondary stat loss
    if (Math.random() < secondaryStatLossChance) {
      // Choose a random stat that's not the primary one
      const stats = ['speed', 'acceleration', 'stamina', 'jumping', 'temperament'].filter(s => s !== statType);
      secondaryStatType = stats[Math.floor(Math.random() * stats.length)];
      secondaryStatLossAmount = Math.round(baseGain * 0.3); // 30% of gain becomes loss in secondary
      
      // Apply loss
      this[secondaryStatType] = Math.max(0, this[secondaryStatType] - secondaryStatLossAmount);
      secondaryStatLoss = true;
    }
    
    // Reduce energy
    this.energy = Math.max(0, this.energy - energyCost);
    
    // Increase training level (with diminishing returns)
    const trainingGain = 1 / (1 + (this.training / 10));
    this.training += trainingGain;
    
    // Check for level up
    let leveledUp = false;
    if (this.training >= this.level * 5) {
      this.level += 1;
      leveledUp = true;
    }
    
    // Record that the horse needs an update
    this.needsUpdate = true;
    
    // Return training results
    return {
      success: true,
      message: "Training completed successfully",
      primaryStatGain,
      statTrained: statType,
      secondaryStatLoss,
      secondaryStatType,
      secondaryStatLossAmount,
      energyCost,
      leveledUp,
      newLevel: this.level
    };
  }
  
  /**
   * Rest the horse to recover energy
   * @param {number} days - Number of days to rest
   * @returns {Object} Rest results
   */
  rest(days) {
    // Calculate energy recovery (with diminishing returns)
    const baseRecovery = 20 * days;
    const actualRecovery = Math.min(100 - this.energy, baseRecovery);
    
    // Apply recovery
    this.energy = Math.min(100, this.energy + actualRecovery);
    
    // Recover some health if injured
    if (this.health < 100) {
      const healthRecovery = 5 * days;
      this.health = Math.min(100, this.health + healthRecovery);
    }
    
    // Process injury recovery
    let recoveredFromInjury = false;
    if (this.injured) {
      this.injuryDuration -= days;
      if (this.injuryDuration <= 0) {
        this.injured = false;
        this.injuryDuration = 0;
        recoveredFromInjury = true;
      }
    }
    
    // Reduce cooldowns
    if (this.breedingCooldown > 0) {
      this.breedingCooldown = Math.max(0, this.breedingCooldown - days);
    }
    
    if (this.racingCooldown > 0) {
      this.racingCooldown = Math.max(0, this.racingCooldown - days);
    }
    
    // Record that the horse needs an update
    this.needsUpdate = true;
    
    return {
      success: true,
      message: "Rest completed",
      energyRecovered: actualRecovery,
      recoveredFromInjury
    };
  }
  
  /**
   * Process daily updates for the horse
   * @param {number} days - Number of days to process
   * @returns {Object} Update results
   */
  update(days = 1) {
    // Age processing
    const previousAge = this.age;
    const daysSinceBirth = Math.floor(days) + this.birthDay;
    this.age = 2 + Math.floor(daysSinceBirth / 365); // Starting at 2 years old
    
    const hasAged = this.age > previousAge;
    
    // Natural energy recovery (small amount)
    this.energy = Math.min(100, this.energy + (days * 5));
    
    // Natural happiness decay
    this.happiness = Math.max(0, this.happiness - (days * 1));
    
    // Cooldown reduction
    if (this.breedingCooldown > 0) {
      this.breedingCooldown = Math.max(0, this.breedingCooldown - days);
    }
    
    if (this.racingCooldown > 0) {
      this.racingCooldown = Math.max(0, this.racingCooldown - days);
    }
    
    // Injury processing
    let recoveredFromInjury = false;
    if (this.injured) {
      this.injuryDuration -= days;
      if (this.injuryDuration <= 0) {
        this.injured = false;
        this.injuryDuration = 0;
        recoveredFromInjury = true;
      }
    }
    
    // Check for age-related stat changes
    if (hasAged) {
      if (this.age > 15) {
        // Decline in old age
        this.speed = Math.max(0, this.speed - Math.floor(Math.random() * 3));
        this.acceleration = Math.max(0, this.acceleration - Math.floor(Math.random() * 3));
        this.stamina = Math.max(0, this.stamina - Math.floor(Math.random() * 3));
      } else if (this.age < 6) {
        // Young horses still developing
        const growthChance = (6 - this.age) * 0.1; // 40% at age 2, down to 10% at age 5
        
        if (Math.random() < growthChance) {
          const stats = ['speed', 'acceleration', 'stamina', 'jumping', 'temperament'];
          const statToImprove = stats[Math.floor(Math.random() * stats.length)];
          this[statToImprove] = Math.min(100, this[statToImprove] + Math.floor(Math.random() * 3) + 1);
        }
      }
    }
    
    // Horse is now up to date
    this.needsUpdate = false;
    
    return {
      success: true,
      hasAged,
      recoveredFromInjury
    };
  }
  
  /**
   * Add a race to the horse's history
   * @param {Object} raceResult - Race result information
   */
  addRaceResult(raceResult) {
    // Add to race history
    this.races.push(raceResult);
    
    // Update statistics
    if (raceResult.position === 1) {
      this.racesWon++;
    }
    
    if (raceResult.position <= 3) {
      this.racesPlaced++;
    }
    
    // Add earnings
    this.earnings += raceResult.earnings || 0;
    
    // Apply experience gain
    const expGain = raceResult.experience || 0;
    this.training += expGain / 10;
    
    // Apply energy loss
    this.energy = Math.max(0, this.energy - (raceResult.energyUsed || 0));
    
    // Apply racing cooldown
    this.racingCooldown = 1; // 1 day cooldown
    
    // Check for injury
    if (raceResult.injury && raceResult.injury.injured) {
      this.injured = true;
      this.injuryDuration = raceResult.injury.duration;
      this.health = Math.max(0, this.health - (raceResult.injury.severity * 10));
    }
    
    // Check for level up
    if (this.training >= this.level * 5) {
      this.level += 1;
    }
    
    // Mark for update
    this.needsUpdate = true;
    
    return {
      success: true,
      racesWon: this.racesWon,
      racesPlaced: this.racesPlaced,
      totalEarnings: this.earnings,
      injured: this.injured
    };
  }
  
  /**
   * Care for the horse to improve happiness and health
   * @param {string} careType - Type of care to provide
   * @returns {Object} Care results
   */
  provideCare(careType) {
    let message = '';
    let bonusApplied = false;
    
    switch(careType) {
      case 'groom':
        // Improves happiness
        const happinessGain = Math.min(100 - this.happiness, 15);
        this.happiness += happinessGain;
        message = `Groomed horse. Happiness +${happinessGain}`;
        break;
      
      case 'veterinarian':
        // Improves health
        const healthGain = Math.min(100 - this.health, 20);
        this.health += healthGain;
        
        // Chance to reduce injury duration
        if (this.injured && Math.random() < 0.5) {
          this.injuryDuration = Math.max(0, this.injuryDuration - 1);
          bonusApplied = true;
          message = `Veterinarian care provided. Health +${healthGain}. Reduced injury recovery by 1 day.`;
        } else {
          message = `Veterinarian care provided. Health +${healthGain}`;
        }
        break;
      
      case 'feed':
        // Premium feed - improves energy and slight health boost
        const energyGain = Math.min(100 - this.energy, 25);
        this.energy += energyGain;
        
        const smallHealthGain = Math.min(100 - this.health, 5);
        this.health += smallHealthGain;
        
        message = `Premium feed provided. Energy +${energyGain}, Health +${smallHealthGain}`;
        break;
      
      case 'massage':
        // Massage - reduces racing cooldown and improves energy
        const cooldownReduction = Math.min(this.racingCooldown, 1);
        this.racingCooldown -= cooldownReduction;
        
        const massageEnergyGain = Math.min(100 - this.energy, 15);
        this.energy += massageEnergyGain;
        
        bonusApplied = cooldownReduction > 0;
        message = `Massage provided. Energy +${massageEnergyGain}` + 
                  (bonusApplied ? `, Racing cooldown -${cooldownReduction}` : '');
        break;
      
      default:
        message = 'No care provided';
    }
    
    // Mark for update
    this.needsUpdate = true;
    
    return {
      success: true,
      message,
      bonusApplied
    };
  }
  
  /**
   * Get detailed information about the horse
   * @returns {Object} Horse details
   */
  getDetails() {
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      age: this.age,
      breed: this.breed,
      color: this.color,
      stats: {
        speed: this.speed,
        acceleration: this.acceleration,
        stamina: this.stamina,
        jumping: this.jumping,
        temperament: this.temperament,
        overall: this.calculateOverallRating()
      },
      status: {
        energy: this.energy,
        health: this.health,
        happiness: this.happiness,
        training: this.training,
        level: this.level
      },
      racing: {
        racesWon: this.racesWon,
        racesPlaced: this.racesPlaced,
        totalRaces: this.races.length,
        earnings: this.earnings,
        preferredDistance: this.preferredDistance,
        preferredSurface: this.preferredSurface
      },
      conditions: {
        injured: this.injured,
        injuryDuration: this.injuryDuration,
        racingCooldown: this.racingCooldown,
        breedingCooldown: this.breedingCooldown
      },
      traits: this.traits,
      value: this.calculateMarketValue()
    };
  }
  
  /**
   * Convert the horse to a plain object for serialization
   * @returns {Object} Serializable horse object
   */
  toJSON() {
    // Return only the data we need to save
    return {
      id: this.id,
      name: this.name,
      gender: this.gender,
      breed: this.breed,
      color: this.color,
      age: this.age,
      birthDay: this.birthDay,
      sire: this.sire ? { id: this.sire.id, name: this.sire.name } : null,
      dam: this.dam ? { id: this.dam.id, name: this.dam.name } : null,
      speed: this.speed,
      acceleration: this.acceleration,
      stamina: this.stamina,
      jumping: this.jumping,
      temperament: this.temperament,
      preferredDistance: this.preferredDistance,
      preferredSurface: this.preferredSurface,
      energy: this.energy,
      health: this.health,
      happiness: this.happiness,
      training: this.training,
      forSale: this.forSale,
      salePrice: this.salePrice,
      breedingCooldown: this.breedingCooldown,
      racingCooldown: this.racingCooldown,
      injured: this.injured,
      injuryDuration: this.injuryDuration,
      races: this.races,
      racesWon: this.racesWon,
      racesPlaced: this.racesPlaced,
      earnings: this.earnings,
      level: this.level,
      traits: this.traits,
      acquiredTraits: this.acquiredTraits,
      potential: this.potential
    };
  }
} 