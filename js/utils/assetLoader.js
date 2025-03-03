class AssetLoader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.loadingBar = document.querySelector('.loading-bar');
        this.loadingText = document.querySelector('.loading-text');
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
        
        const loadPromises = soundFiles.map(file => this.loadSound(`assets/Sound/${file}`));
        
        try {
            await Promise.all(loadPromises);
            this.showMainMenu();
        } catch (error) {
            console.error('Error loading assets:', error);
            this.loadingText.textContent = 'Error loading assets. Please refresh the page.';
        }
    }

    loadSound(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.loadedAssets++;
                this.updateLoadingBar();
                resolve();
            };
            audio.onerror = () => {
                reject(new Error(`Failed to load sound: ${src}`));
            };
            audio.src = src;
        });
    }

    updateLoadingBar() {
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        this.loadingBar.style.width = `${progress}%`;
        this.loadingText.textContent = `Loading game assets... ${Math.round(progress)}%`;
    }

    showMainMenu() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-menu-screen').style.display = 'flex';
    }
}

export default new AssetLoader(); 