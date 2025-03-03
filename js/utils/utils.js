// Random number generation
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function randomFromWeighted(options) {
    const totalWeight = options.reduce((sum, option) => sum + (option.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const option of options) {
        random -= (option.weight || 1);
        if (random <= 0) return option;
    }
    
    return options[0];
}

// Time and date formatting
export function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function formatMoney(amount) {
    return `$${amount.toLocaleString()}`;
}

// Statistics and calculations
export function calculateAverage(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

export function calculateWeightedAverage(numbers, weights) {
    const sum = numbers.reduce((acc, val, i) => acc + val * weights[i], 0);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    return sum / weightSum;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
    return start + (end - start) * clamp(t, 0, 1);
}

// Horse name generation
const prefixes = ['Noble', 'Swift', 'Mighty', 'Royal', 'Thunder', 'Shadow', 'Silver', 'Golden', 'Wild', 'Mystic'];
const suffixes = ['Runner', 'Spirit', 'Wind', 'Storm', 'Star', 'Heart', 'Legend', 'Flash', 'Dancer', 'Dream'];

export function generateHorseName() {
    return `${randomFromArray(prefixes)} ${randomFromArray(suffixes)}`;
}

// Color generation
export const horseColors = [
    { name: 'Bay', code: '#8B4513', weight: 3 },
    { name: 'Chestnut', code: '#954535', weight: 3 },
    { name: 'Black', code: '#2F2F2F', weight: 2 },
    { name: 'White', code: '#F5F5F5', weight: 1 },
    { name: 'Grey', code: '#808080', weight: 2 },
    { name: 'Palomino', code: '#FFD700', weight: 1 },
    { name: 'Dapple Grey', code: '#A9A9A9', weight: 1 },
    { name: 'Roan', code: '#B87333', weight: 1 }
];

export function generateHorseColor() {
    return randomFromWeighted(horseColors);
}

// Breed generation
export const horseBreeds = [
    { name: 'Thoroughbred', stats: { speed: 0.8, acceleration: 0.7, stamina: 0.6 }, weight: 3 },
    { name: 'Arabian', stats: { speed: 0.7, acceleration: 0.8, stamina: 0.7 }, weight: 2 },
    { name: 'Quarter Horse', stats: { speed: 0.6, acceleration: 0.9, stamina: 0.6 }, weight: 2 },
    { name: 'Standardbred', stats: { speed: 0.7, acceleration: 0.7, stamina: 0.8 }, weight: 2 },
    { name: 'Mustang', stats: { speed: 0.6, acceleration: 0.6, stamina: 0.9 }, weight: 1 }
];

export function generateHorseBreed() {
    return randomFromWeighted(horseBreeds);
}

// Race generation
export const raceTypes = [
    { name: 'Sprint', distance: 1000, energyCost: 0.3, weight: 3 },
    { name: 'Medium', distance: 2000, energyCost: 0.5, weight: 2 },
    { name: 'Long', distance: 3000, energyCost: 0.7, weight: 1 },
    { name: 'Marathon', distance: 5000, energyCost: 1.0, weight: 0.5 }
];

export const raceTerrains = [
    { name: 'Dirt', speedMod: 1.0, staminaMod: 1.0, weight: 3 },
    { name: 'Turf', speedMod: 0.9, staminaMod: 1.1, weight: 2 },
    { name: 'Sand', speedMod: 0.8, staminaMod: 1.2, weight: 1 },
    { name: 'Mud', speedMod: 0.7, staminaMod: 1.3, weight: 1 }
];

export function generateRace() {
    const type = randomFromWeighted(raceTypes);
    const terrain = randomFromWeighted(raceTerrains);
    const purse = Math.round(type.distance * (Math.random() * 0.5 + 0.75));
    const entryFee = Math.round(purse * 0.1);
    
    return {
        name: `${terrain.name} ${type.name}`,
        distance: type.distance,
        terrain: terrain.name,
        speedMod: terrain.speedMod,
        staminaMod: terrain.staminaMod,
        energyCost: type.energyCost,
        purse,
        entryFee
    };
}

// Save/Load helpers
export function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

export function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// Event system
export class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

// Notifications
export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                this.container.removeChild(notification);
            }, 300);
        }, duration);
    }
    
    success(message) {
        this.show(message, 'success');
    }
    
    error(message) {
        this.show(message, 'error');
    }
    
    info(message) {
        this.show(message, 'info');
    }
}

export default {
    randomInt,
    randomFloat,
    randomFromArray,
    randomFromWeighted,
    formatTime,
    formatDate,
    formatMoney,
    calculateAverage,
    calculateWeightedAverage,
    clamp,
    lerp,
    generateHorseName,
    generateHorseColor,
    generateHorseBreed,
    generateRace,
    saveToLocalStorage,
    loadFromLocalStorage,
    EventEmitter,
    NotificationManager,
    horseColors,
    horseBreeds,
    raceTypes,
    raceTerrains
}; 