class EventSystem {
    constructor() {
        this.events = {};
        this.gameEvents = {
            // Game state events
            GAME_STARTED: 'gameStarted',
            GAME_LOADED: 'gameLoaded',
            GAME_SAVED: 'gameSaved',
            GAME_UPDATED: 'gameUpdated',
            
            // Player events
            FUNDS_CHANGED: 'fundsChanged',
            STABLE_UPGRADED: 'stableUpgraded',
            REPUTATION_CHANGED: 'reputationChanged',
            ACHIEVEMENT_UNLOCKED: 'achievementUnlocked',
            
            // Horse events
            HORSE_ACQUIRED: 'horseAcquired',
            HORSE_SOLD: 'horseSold',
            HORSE_TRAINED: 'horseTrained',
            HORSE_LEVELED_UP: 'horseLeveledUp',
            HORSE_INJURED: 'horseInjured',
            HORSE_RECOVERED: 'horseRecovered',
            HORSE_RESTED: 'horseRested',
            HORSE_STATS_UPDATED: 'horseStatsUpdated',
            
            // Race events
            RACE_SCHEDULED: 'raceScheduled',
            RACE_STARTED: 'raceStarted',
            RACE_FINISHED: 'raceFinished',
            RACE_RESULTS: 'raceResults',
            RACE_REWARD_CLAIMED: 'raceRewardClaimed',
            
            // Breeding events
            BREEDING_STARTED: 'breedingStarted',
            BREEDING_SUCCESSFUL: 'breedingSuccessful',
            BREEDING_FAILED: 'breedingFailed',
            FOAL_BORN: 'foalBorn',
            
            // Market events
            MARKET_UPDATED: 'marketUpdated',
            LISTING_CREATED: 'listingCreated',
            LISTING_REMOVED: 'listingRemoved',
            LISTING_EXPIRED: 'listingExpired',
            HORSE_PURCHASED: 'horsePurchased',
            
            // Training events
            TRAINING_STARTED: 'trainingStarted',
            TRAINING_COMPLETED: 'trainingCompleted',
            TRAINING_CANCELLED: 'trainingCancelled',
            
            // Time events
            DAY_PASSED: 'dayPassed',
            WEEK_PASSED: 'weekPassed',
            MONTH_PASSED: 'monthPassed',
            SEASON_CHANGED: 'seasonChanged',
            YEAR_PASSED: 'yearPassed',
            
            // UI events
            SCREEN_CHANGED: 'screenChanged',
            MODAL_OPENED: 'modalOpened',
            MODAL_CLOSED: 'modalClosed',
            NOTIFICATION_SHOWN: 'notificationShown'
        };
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        
        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    off(eventName, callback) {
        if (!this.events[eventName]) return;
        
        if (callback) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        } else {
            delete this.events[eventName];
        }
    }

    emit(eventName, data) {
        if (!this.events[eventName]) return;
        
        this.events[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${eventName}:`, error);
            }
        });
    }

    // Helper method to emit multiple events
    emitMultiple(events) {
        events.forEach(({ event, data }) => this.emit(event, data));
    }

    // Helper method to subscribe to multiple events
    onMultiple(events, callback) {
        const unsubscribers = events.map(event => this.on(event, callback));
        return () => unsubscribers.forEach(unsubscribe => unsubscribe());
    }

    // Helper method to subscribe to an event once
    once(eventName, callback) {
        const onceCallback = (data) => {
            this.off(eventName, onceCallback);
            callback(data);
        };
        return this.on(eventName, onceCallback);
    }

    // Helper method to clear all event listeners
    clearAll() {
        this.events = {};
    }

    // Helper method to get all registered events
    getRegisteredEvents() {
        return Object.keys(this.events);
    }

    // Helper method to get listener count for an event
    getListenerCount(eventName) {
        return this.events[eventName]?.length || 0;
    }

    // Helper method to check if an event has listeners
    hasListeners(eventName) {
        return this.getListenerCount(eventName) > 0;
    }
}

// Create and export a singleton instance
const eventSystem = new EventSystem();
export default eventSystem;

// Export event names as constants
export const GameEvents = eventSystem.gameEvents; 