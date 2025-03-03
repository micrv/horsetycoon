class MarketUI {
    constructor(gameManager, uiController) {
        this.gameManager = gameManager;
        this.uiController = uiController;
        this.filters = {
            minLevel: 0,
            maxLevel: 100,
            minPrice: 0,
            maxPrice: Infinity,
            breed: 'all',
            sort: 'price-asc'
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Market Tabs
        document.getElementById('buyTab').addEventListener('click', () => this.showBuyMarket());
        document.getElementById('sellTab').addEventListener('click', () => this.showSellMarket());
        
        // Filters
        document.getElementById('marketFilters').addEventListener('change', (e) => {
            if (e.target.matches('select, input')) {
                this.updateFilters(e.target);
            }
        });
        
        // Sort
        document.getElementById('marketSort').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.refreshMarket();
        });
        
        // Search
        document.getElementById('marketSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
    }

    showBuyMarket() {
        const marketContainer = document.getElementById('marketListings');
        marketContainer.innerHTML = '';
        
        const listings = this.gameManager.getMarketListings();
        const filteredListings = this.filterListings(listings);
        
        filteredListings.forEach(listing => {
            const card = this.createMarketCard(listing);
            marketContainer.appendChild(card);
        });
        
        this.updateMarketStats(filteredListings);
    }

    showSellMarket() {
        const marketContainer = document.getElementById('playerListings');
        marketContainer.innerHTML = '';
        
        const listings = this.gameManager.getPlayerListings();
        listings.forEach(listing => {
            const card = this.createPlayerListingCard(listing);
            marketContainer.appendChild(card);
        });
    }

    createMarketCard(listing) {
        const card = document.createElement('div');
        card.className = 'market-card';
        card.dataset.listingId = listing.id;
        
        const horse = listing.horse;
        const canAfford = this.gameManager.player.funds >= listing.price;
        
        card.innerHTML = `
            <div class="market-card-header">
                <h3>${horse.name}</h3>
                <span class="price">$${listing.price.toLocaleString()}</span>
            </div>
            <div class="market-card-stats">
                <div class="stat-group">
                    <div>Level ${horse.level}</div>
                    <div>Rating ${horse.overallRating}</div>
                </div>
                <div class="stat-group">
                    <div>${horse.breed}</div>
                    <div>${horse.gender}</div>
                </div>
            </div>
            <div class="market-card-details">
                <div class="stat-bars">
                    <div class="stat-bar">
                        <label>Speed</label>
                        <div class="bar">
                            <div class="fill" style="width: ${horse.speed}%"></div>
                        </div>
                    </div>
                    <div class="stat-bar">
                        <label>Stamina</label>
                        <div class="bar">
                            <div class="fill" style="width: ${horse.stamina}%"></div>
                        </div>
                    </div>
                    <div class="stat-bar">
                        <label>Acceleration</label>
                        <div class="bar">
                            <div class="fill" style="width: ${horse.acceleration}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="buy-btn" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? 'Purchase' : 'Cannot Afford'}
            </button>
        `;
        
        card.querySelector('.buy-btn').addEventListener('click', () => this.purchaseHorse(listing));
        
        return card;
    }

    createPlayerListingCard(listing) {
        const card = document.createElement('div');
        card.className = 'player-listing-card';
        card.dataset.listingId = listing.id;
        
        const horse = listing.horse;
        const timeLeft = this.formatListingTime(listing.expiresAt);
        
        card.innerHTML = `
            <div class="listing-header">
                <h3>${horse.name}</h3>
                <span class="time-left">${timeLeft}</span>
            </div>
            <div class="listing-details">
                <div>Listed: $${listing.price.toLocaleString()}</div>
                <div>Views: ${listing.views}</div>
            </div>
            <button class="cancel-listing-btn">Cancel Listing</button>
        `;
        
        card.querySelector('.cancel-listing-btn').addEventListener('click', () => this.cancelListing(listing));
        
        return card;
    }

    formatListingTime(expiresAt) {
        const now = this.gameManager.getCurrentGameTime();
        const timeLeft = expiresAt - now;
        
        if (timeLeft <= 0) return 'Expired';
        
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        if (hours < 24) return `${hours}h left`;
        
        const days = Math.floor(hours / 24);
        return `${days}d left`;
    }

    updateFilters(input) {
        const value = input.type === 'number' ? Number(input.value) : input.value;
        this.filters[input.name] = value;
        this.refreshMarket();
    }

    filterListings(listings) {
        return listings.filter(listing => {
            const horse = listing.horse;
            return (
                horse.level >= this.filters.minLevel &&
                horse.level <= this.filters.maxLevel &&
                listing.price >= this.filters.minPrice &&
                listing.price <= this.filters.maxPrice &&
                (this.filters.breed === 'all' || horse.breed === this.filters.breed)
            );
        }).sort((a, b) => {
            switch (this.filters.sort) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'level-asc':
                    return a.horse.level - b.horse.level;
                case 'level-desc':
                    return b.horse.level - a.horse.level;
                case 'rating-asc':
                    return a.horse.overallRating - b.horse.overallRating;
                case 'rating-desc':
                    return b.horse.overallRating - a.horse.overallRating;
                default:
                    return 0;
            }
        });
    }

    handleSearch(query) {
        const marketContainer = document.getElementById('marketListings');
        const cards = marketContainer.querySelectorAll('.market-card');
        
        cards.forEach(card => {
            const horseName = card.querySelector('h3').textContent.toLowerCase();
            const visible = horseName.includes(query.toLowerCase());
            card.style.display = visible ? 'block' : 'none';
        });
    }

    updateMarketStats(listings) {
        const stats = document.getElementById('marketStats');
        const prices = listings.map(l => l.price);
        
        stats.innerHTML = `
            <div>Listings: ${listings.length}</div>
            <div>Avg Price: $${this.calculateAverage(prices).toLocaleString()}</div>
            <div>Min Price: $${Math.min(...prices).toLocaleString()}</div>
            <div>Max Price: $${Math.max(...prices).toLocaleString()}</div>
        `;
    }

    calculateAverage(numbers) {
        return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
    }

    async purchaseHorse(listing) {
        const confirmed = await this.uiController.showConfirmation(
            'Purchase Horse',
            `Are you sure you want to purchase ${listing.horse.name} for $${listing.price.toLocaleString()}?`
        );
        
        if (confirmed) {
            const result = this.gameManager.purchaseHorse(listing.id);
            
            if (result.success) {
                this.uiController.showSuccess(`Successfully purchased ${listing.horse.name}!`);
                this.refreshMarket();
            } else {
                this.uiController.showError(result.message);
            }
        }
    }

    async cancelListing(listing) {
        const confirmed = await this.uiController.showConfirmation(
            'Cancel Listing',
            `Are you sure you want to cancel the listing for ${listing.horse.name}?`
        );
        
        if (confirmed) {
            const result = this.gameManager.cancelListing(listing.id);
            
            if (result.success) {
                this.uiController.showSuccess('Listing cancelled successfully');
                this.showSellMarket();
            } else {
                this.uiController.showError(result.message);
            }
        }
    }

    refreshMarket() {
        if (document.getElementById('buyTab').classList.contains('active')) {
            this.showBuyMarket();
        } else {
            this.showSellMarket();
        }
    }
}

export default MarketUI; 