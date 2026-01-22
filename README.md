# Web Apps Collection

A collection of interactive web applications built with React, TypeScript, and Vite.

## 📱 Applications

This repository contains three standalone applications, deployed to GitHub Pages:

### 1. **Arcade Room**
Play Tic Tac Toe, Connect 4, Memory, Snake, 2048, Rock Paper Scissors, Simon Says, Whack-a-Light, Minefield, and Reflex. Challenge the computer or train your brain.

**Live Demo:** https://ft2801.github.io/Web-Apps-Repo/arcade-room/

### 2. **Square Shadows**
An interactive 2D visualization featuring rotating squares with shadow effects. Built with React Three Fiber for stunning real-time graphics and custom cursor interactions.

**Live Demo:** https://ft2801.github.io/Web-Apps-Repo/square-shadows/

### 3. **Thermometer**
An interactive thermometer application with weather integration. Features real-time temperature display with visual feedback and dynamic weather effects.

**Live Demo:** https://ft2801.github.io/Web-Apps-Repo/thermometer/

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm

### Development

Each application can be run independently:

```bash
# Navigate to the application directory
cd arcade-room
# or
cd square-shadows
# or
cd thermometer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Project Structure

```
Web-Apps-Repo/
├── arcade-room/          # Classic games collection
│   ├── components/
│   ├── utils/
│   ├── index.tsx
│   └── vite.config.ts
├── square-shadows/       # 2D visualization
│   ├── components/
│   ├── types.ts
│   └── vite.config.ts
├── thermometer/          # Weather thermometer
│   ├── components/
│   ├── utils/
│   └── vite.config.ts
└── README.md
```

## 🔧 Technology Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **3D Graphics:** Three.js / React Three Fiber
- **Icons:** Lucide React
- **Styling:** Tailwind CSS (where applicable)

## 📝 Building & Deployment

Each application is automatically built and deployed to GitHub Pages using GitHub Actions. The deployment workflow:

1. Triggers on push to `main` branch
2. Builds each application independently
3. Deploys to `/{app-name}/` subdirectory via GitHub Pages Actions

### Manual Build

```bash
cd [app-name]
npm run build
# Output will be in dist/ directory
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
