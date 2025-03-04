class AssetLoader {
    constructor() {
        // Try different selectors for loading elements
        this.loadingText = document.querySelector('.loading-text') || document.getElementById('loadingText');
        this.loadingBar = document.querySelector('.loading-bar') || document.getElementById('loadingBar');
        this.loadingScreen = document.getElementById('loading') || document.getElementById('loadingScreen');
        this.mainMenuScreen = document.getElementById('mainMenu') || document.getElementById('mainMenuScreen');
        
        // Check if elements were found, and try alternative selectors
        if (!this.loadingText) console.warn('Loading text element not found');
        if (!this.loadingBar) console.warn('Loading bar element not found');
        if (!this.loadingScreen) console.warn('Loading screen element not found');
        if (!this.mainMenuScreen) console.warn('Main menu screen element not found');
        
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }

    async loadAllAssets() {
        const soundFiles = [
            'background-music-224633.mp3',
            'mystery-music-loop-226835.mp3',
            'arcade-horse-racing-32871.mp3',
            'horse-snort-95874.mp3',
            'horse-footsteps-189992.mp3',
            'horse-footsteps-type-1-235999.mp3',
            'violin-music-64019.mp3',
            'relaxing-guitar-loop-v5-245859.mp3'
        ];

        this.totalAssets = soundFiles.length;
        
        try {
            console.log('Starting to load assets...');
            const loadPromises = soundFiles.map(file => {
                console.log(`Attempting to load: ${file}`);
                return this.loadSound(`/horsetycoon/assets/Sound/${file}`);
            });
            
            await Promise.all(loadPromises);
            console.log('All assets loaded successfully!');
            this.showMainMenu();
        } catch (error) {
            console.error('Error loading assets:', error);
            if (this.loadingText) {
                this.loadingText.textContent = `Error loading assets: ${error.message}. Check console for details.`;
            }
        }
    }

    async loadSound(path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = path;
            
            audio.oncanplaythrough = () => {
                this.loadedAssets++;
                this.updateLoadingProgress();
                resolve(audio);
            };
            
            audio.onerror = (error) => {
                console.error(`Error loading audio file ${path}:`, error);
                reject(new Error(`Failed to load ${path}`));
            };
        });
    }

    updateLoadingProgress() {
        const progress = Math.floor((this.loadedAssets / this.totalAssets) * 100);
        
        // Safely update loading text
        if (this.loadingText) {
            this.loadingText.textContent = `Loading assets: ${progress}%`;
        }
        
        // Safely update loading bar
        if (this.loadingBar) {
            this.loadingBar.style.width = `${progress}%`;
        }
        
        // Try to find elements again if they weren't found initially
        if (!this.loadingText) {
            this.loadingText = document.querySelector('.loading-text') || document.getElementById('loadingText');
            if (this.loadingText) {
                this.loadingText.textContent = `Loading assets: ${progress}%`;
            }
        }
        
        if (!this.loadingBar) {
            this.loadingBar = document.querySelector('.loading-bar') || document.getElementById('loadingBar');
            if (this.loadingBar) {
                this.loadingBar.style.width = `${progress}%`;
            }
        }
    }

    showMainMenu() {
        // Try multiple approaches to hide loading screen
        try {
            if (this.loadingScreen) {
                this.loadingScreen.style.display = 'none';
            } else {
                // Try alternative methods to find loading screen
                const loadingElements = [
                    document.getElementById('loading'),
                    document.getElementById('loadingScreen'),
                    document.querySelector('.loading-screen')
                ];
                
                for (const el of loadingElements) {
                    if (el) {
                        el.style.display = 'none';
                        break;
                    }
                }
            }
            
            // Try multiple approaches to show main menu
            if (this.mainMenuScreen) {
                this.mainMenuScreen.style.display = 'flex';
            } else {
                // Try alternative methods to find main menu
                const mainMenuElements = [
                    document.getElementById('mainMenu'),
                    document.getElementById('main-menu'),
                    document.querySelector('.main-menu')
                ];
                
                for (const el of mainMenuElements) {
                    if (el) {
                        el.style.display = 'flex';
                        break;
                    }
                }
            }
            
            // Last resort: hide all screens and show mainMenu by class
            document.querySelectorAll('.screen').forEach(screen => {
                screen.style.display = 'none';
            });
            
            const mainMenuByClass = document.querySelector('.main-menu-screen');
            if (mainMenuByClass) {
                mainMenuByClass.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error showing main menu:', error);
        }
    }
}

export default new AssetLoader(); 