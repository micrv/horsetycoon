# Horse Tycoon

A browser-based horse breeding and racing management game where players can build their dream stable, train horses, compete in races, and become a successful horse tycoon.

## Features

- **Horse Management**
  - Breed, train, and care for horses
  - Each horse has unique stats and characteristics
  - Monitor horse health, energy, and happiness
  - Level up horses through training and racing

- **Racing System**
  - Multiple race types and distances
  - Different track conditions and terrains
  - Race entry requirements and prize purses
  - Detailed race results and statistics

- **Breeding System**
  - Strategic horse pairing
  - Genetic trait inheritance
  - Breeding cooldowns and success rates
  - Foal development system

- **Market System**
  - Buy and sell horses
  - Dynamic market prices
  - Horse listing management
  - Market statistics and trends

- **Training System**
  - Multiple training options
  - Skill-specific improvements
  - Energy management
  - Training history tracking

- **Stable Management**
  - Upgrade stable facilities
  - Manage stable capacity
  - Track finances and expenses
  - Build reputation and achievements

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/horse-tycoon.git
   cd horse-tycoon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Game Controls

- Use mouse clicks to navigate menus and select options
- Click on horses to view details and perform actions
- Use the navigation bar to access different game sections
- Modal windows provide additional information and controls

## Development

The game is built using:
- Vanilla JavaScript (ES6+)
- HTML5
- CSS3
- Vite for bundling and development

### Project Structure

```
horse-tycoon/
├── index.html
├── css/
│   ├── styles.css
│   └── mobile.css
├── js/
│   ├── main.js
│   ├── models/
│   │   ├── horse.js
│   │   └── player.js
│   ├── managers/
│   │   ├── gameManager.js
│   │   └── raceManager.js
│   ├── ui/
│   │   ├── uiController.js
│   │   ├── horseUI.js
│   │   ├── raceUI.js
│   │   ├── marketUI.js
│   │   ├── breedingUI.js
│   │   └── trainingUI.js
│   └── utils/
│       ├── utils.js
│       └── eventSystem.js
└── assets/
    └── images/
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Horse breed information and statistics based on real-world data
- Racing mechanics inspired by professional horse racing
- Special thanks to all contributors and testers 