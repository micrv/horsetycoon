class AudioManager {
    constructor() {
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isMusicMuted = false;
        this.isSfxMuted = false;
        this.currentMusic = null;
        
        // Initialize audio elements
        this.sounds = {
            // Background music
            bgMusic: new Audio('assets/Sound/background-music-224633.mp3'),
            menuMusic: new Audio('assets/Sound/mystery-music-loop-226835.mp3'),
            raceMusic: new Audio('assets/Sound/arcade-horse-racing-32871.mp3'),
            
            // UI sounds
            click: new Audio('assets/Sound/horse-snort-95874.mp3'),
            hover: new Audio('assets/Sound/horse-snort-95874.mp3'),
            success: new Audio('assets/Sound/violin-music-64019.mp3'),
            error: new Audio('assets/Sound/horse-snort-95874.mp3'),
            
            // Game sounds
            horseNeigh: new Audio('assets/Sound/horse-snort-95874.mp3'),
            horseGallop: new Audio('assets/Sound/horse-footsteps-189992.mp3'),
            raceStart: new Audio('assets/Sound/horse-footsteps-type-1-235999.mp3'),
            raceFinish: new Audio('assets/Sound/violin-music-64019.mp3'),
            relaxingMusic: new Audio('assets/Sound/relaxing-guitar-loop-v5-245859.mp3'),
            coins: new Audio('assets/Sound/violin-music-64019.mp3'),
            levelUp: new Audio('assets/Sound/violin-music-64019.mp3'),
            achievement: new Audio('assets/Sound/violin-music-64019.mp3')
        };
        
        // Configure all audio elements
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            if (sound.src.includes('background-music-224633.mp3') || 
                sound.src.includes('mystery-music-loop-226835.mp3') || 
                sound.src.includes('arcade-horse-racing-32871.mp3') ||
                sound.src.includes('relaxing-guitar-loop-v5-245859.mp3')) {
                sound.loop = true;
            }
        });
    }

    playMusic(type) {
        // Stop current music if playing
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        // Select and play new music
        switch (type) {
            case 'background':
                this.currentMusic = this.sounds.bgMusic;
                break;
            case 'menu':
                this.currentMusic = this.sounds.menuMusic;
                break;
            case 'race':
                this.currentMusic = this.sounds.raceMusic;
                break;
            default:
                return;
        }
        
        if (!this.isMusicMuted) {
            this.currentMusic.volume = this.musicVolume;
            this.currentMusic.play().catch(error => console.warn('Audio playback failed:', error));
        }
    }

    playSfx(soundName) {
        if (this.isSfxMuted || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        sound.volume = this.sfxVolume;
        
        // Reset and play sound
        sound.currentTime = 0;
        sound.play().catch(error => console.warn('Audio playback failed:', error));
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        if (this.currentMusic) {
            if (this.isMusicMuted) {
                this.currentMusic.pause();
            } else {
                this.currentMusic.play().catch(error => console.warn('Audio playback failed:', error));
            }
        }
        return this.isMusicMuted;
    }

    toggleSfx() {
        this.isSfxMuted = !this.isSfxMuted;
        return this.isSfxMuted;
    }

    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        this.currentMusic = null;
    }
}

// Create and export a singleton instance
const audioManager = new AudioManager();
export default audioManager; 