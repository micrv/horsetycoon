class AssetLoader {
    constructor() {
        this.loadingText = document.querySelector('.loading-text');
        this.loadingBar = document.querySelector('.loading-bar');
        this.loadingScreen = document.getElementById('loading-screen');
        this.mainMenuScreen = document.getElementById('main-menu-screen');
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
        if (this.loadingText) {
            this.loadingText.textContent = `Loading assets: ${progress}%`;
        }
        if (this.loadingBar) {
            this.loadingBar.style.width = `${progress}%`;
        }
    }

    showMainMenu() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }
        if (this.mainMenuScreen) {
            this.mainMenuScreen.style.display = 'flex';
        } else {
            console.log('Main menu screen element not found. It might have a different ID.');
            // Try to show the main menu using a different strategy
            document.querySelectorAll('.screen').forEach(screen => {
                screen.style.display = 'none';
            });
            const mainMenu = document.getElementById('mainMenu');
            if (mainMenu) {
                mainMenu.style.display = 'flex';
            } else {
                console.error('Could not find a main menu screen to display.');
            }
        }
    }
}

export default new AssetLoader(); 