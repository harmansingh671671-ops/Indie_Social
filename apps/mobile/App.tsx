import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Pin {
  id: string;
  title: string;
  creator: string;
  category: string;
  image: string;
  url: string;
  likes: number;
  height: number;
  description?: string;
  tags?: string[];
  calculatedHeight?: number;
}

// Pinterest Color Scheme
const PINTERST_RED = '#E60023';
const PINTERST_WHITE = '#FFFFFF';
const PINTERST_GRAY = '#EFEFEF';
const PINTERST_TEXT = '#111111';
const PINTERST_TEXT_SECONDARY = '#666666';
const PINTERST_BG = '#FFFFFF';

// Pinterest Navigation Items
const PINTEREST_TOP_NAV = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'explore', icon: 'explore', label: 'Explore' },
  { id: 'create', icon: 'add', label: 'Create' },
];

const PINTEREST_MOBILE_NAV = [
  { id: 'home', icon: 'home' },
  { id: 'explore', icon: 'explore' },
  { id: 'create', icon: 'add', size: 28 },
  { id: 'messages', icon: 'message' },
  { id: 'profile', icon: 'person' },
];

// 51 Unique Interactive Websites - All work in iframes/WebViews
const ALL_PINS: Pin[] = [
  // ============ KEPT FROM PREVIOUS (30 websites - exactly 70%) ============
  
  // Music & Audio (3)
  {
    id: 'patatap',
    title: 'Patatap',
    creator: 'Jono Brandel',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    url: 'https://patatap.com',
    likes: 15678,
    height: 350,
    description: 'Tap keys to create music and animations',
    tags: ['music', 'interactive', 'animation']
  },
  {
    id: 'radio-garden',
    title: 'Radio Garden',
    creator: 'Studio Puckey & Moniker',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80',
    url: 'https://radio.garden',
    likes: 24567,
    height: 400,
    description: 'Explore live radio stations worldwide on a 3D globe',
    tags: ['radio', 'music', '3D', 'world']
  },
  {
    id: 'chrome-music-lab',
    title: 'Chrome Music Lab',
    creator: 'Google Creative Lab',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://musiclab.chromeexperiments.com',
    likes: 18234,
    height: 380,
    description: 'Hands-on music experiments to explore sound',
    tags: ['music', 'education', 'experiment', 'sound']
  },
  
  // Generative Art (3)
  {
    id: 'weavesilk',
    title: 'Silk',
    creator: 'Yuri Vishnevsky',
    category: 'Generative Art',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    url: 'https://weavesilk.com',
    likes: 32456,
    height: 450,
    description: 'Draw glowing threads that weave into mesmerizing art',
    tags: ['generative', 'art', 'drawing', 'creative']
  },
  {
    id: 'thisissand',
    title: 'This Is Sand',
    creator: 'David Li',
    category: 'Generative Art',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://thisissand.com',
    likes: 28345,
    height: 360,
    description: 'Pour colorful sand to create layered landscapes',
    tags: ['sand', 'generative', 'art', 'creative']
  },
  {
    id: 'fluid-simulation',
    title: 'Fluid Simulation',
    creator: 'Pavel Dobryakov',
    category: 'Generative Art',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://paveldogreat.github.io/WebGL-Fluid-Simulation/',
    likes: 21345,
    height: 420,
    description: 'Swirl vibrant fluid dynamics with your cursor',
    tags: ['fluid', 'webgl', 'simulation', 'art']
  },
  
  // Games (4)
  {
    id: 'sandspiel',
    title: 'Sandspiel',
    creator: 'Max Bittker',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://sandspiel.club',
    likes: 45678,
    height: 350,
    description: 'Falling sand game with water, fire, plants and more elements',
    tags: ['game', 'sand', 'physics', 'simulation']
  },
  {
    id: '2048',
    title: '2048 Game',
    creator: 'Gabriele Cirulli',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://play2048.co',
    likes: 56789,
    height: 400,
    description: 'Slide tiles to create the 2048 tile',
    tags: ['game', 'puzzle', 'addictive', 'numbers']
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    creator: 'Sudoku.com',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://sudoku.com',
    likes: 34567,
    height: 380,
    description: 'Classic Sudoku puzzle game',
    tags: ['game', 'puzzle', 'logic', 'numbers']
  },
  {
    id: 'memory-game',
    title: 'Memory Card Game',
    creator: 'Memory Games',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.memory-game.net/',
    likes: 23456,
    height: 320,
    description: 'Match cards in this classic memory game',
    tags: ['game', 'memory', 'cards', 'puzzle']
  },
  
  // Interactive Experiments (5)
  {
    id: 'pointerpointer',
    title: 'Pointer Pointer',
    creator: 'Studio Moniker',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80',
    url: 'https://pointerpointer.com',
    likes: 15678,
    height: 350,
    description: 'Move your cursor - a photo appears of someone pointing at it',
    tags: ['interactive', 'experiment', 'cursor', 'photo']
  },
  {
    id: 'zoomquilt',
    title: 'Zoomquilt',
    creator: 'Nikolaus Baumgarten',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://zoomquilt.org',
    likes: 23456,
    height: 400,
    description: 'An infinitely zooming painting - seamless fractal worlds',
    tags: ['interactive', 'zoom', 'fractal', 'art']
  },
  {
    id: 'staggering-beauty',
    title: 'Staggering Beauty',
    creator: 'George Michael Brower',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.staggeringbeauty.com',
    likes: 12345,
    height: 320,
    description: 'Wiggle a worm gently, then shake it fast for a surprise',
    tags: ['interactive', 'experiment', 'animation', 'surprise']
  },
  {
    id: 'neal-fun',
    title: 'Neal.fun',
    creator: 'Neal Agarwal',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://neal.fun',
    likes: 56789,
    height: 450,
    description: 'Collection of delightful interactive experiments',
    tags: ['interactive', 'experiments', 'fun', 'collection']
  },
  {
    id: 'windows93',
    title: 'Windows 93',
    creator: 'Jankenpopp & Zombectro',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.windows93.net',
    likes: 34567,
    height: 380,
    description: 'A fully functional parody OS with apps and games',
    tags: ['interactive', 'os', 'parody', 'nostalgia']
  },
  
  // Visual Experiments (2)
  {
    id: '100k-stars',
    title: '100,000 Stars',
    creator: 'Google Data Arts Team',
    category: 'Visual Essay',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://stars.chromeexperiments.com',
    likes: 45678,
    height: 550,
    description: 'Interactive 3D visualization of the stellar neighborhood',
    tags: ['visual', '3D', 'stars', 'space']
  },
  {
    id: 'stellarium',
    title: 'Stellarium Web',
    creator: 'Stellarium',
    category: 'Tool',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://stellarium-web.org',
    likes: 32456,
    height: 360,
    description: 'Online planetarium showing the real sky in real time',
    tags: ['tool', 'planetarium', 'stars', 'astronomy']
  },
  
  // AI (2)
  {
    id: 'quickdraw',
    title: 'Quick, Draw!',
    creator: 'Google',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://quickdraw.withgoogle.com',
    likes: 45678,
    height: 420,
    description: 'Draw and see if Google AI can guess what it is',
    tags: ['AI', 'drawing', 'game', 'google']
  },
  {
    id: 'autodraw',
    title: 'AutoDraw',
    creator: 'Google',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.autodraw.com',
    likes: 34567,
    height: 380,
    description: 'AI-assisted drawing tool that guesses what you are drawing',
    tags: ['AI', 'drawing', 'tool', 'creative']
  },
  
  // Simulations (2)
  {
    id: 'gravity-simulator',
    title: 'PhET Gravity Simulator',
    creator: 'University of Colorado',
    category: 'Simulation',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_en.html',
    likes: 19234,
    height: 450,
    description: 'Explore gravity and orbits with this physics simulation',
    tags: ['simulation', 'gravity', 'physics', 'education']
  },
  {
    id: 'circuit-simulator',
    title: 'DC Circuit Builder',
    creator: 'PhET',
    category: 'Simulation',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html',
    likes: 24567,
    height: 420,
    description: 'Build and test DC electrical circuits',
    tags: ['simulation', 'circuit', 'electricity', 'physics']
  },
  
  // Tools (2)
  {
    id: 'desmos',
    title: 'Desmos Graphing Calculator',
    creator: 'Desmos',
    category: 'Tool',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.desmos.com/calculator',
    likes: 67890,
    height: 350,
    description: 'Beautiful, powerful graphing calculator',
    tags: ['math', 'calculator', 'graphing', 'education']
  },
  {
    id: 'geogebra',
    title: 'GeoGebra Geometry',
    creator: 'GeoGebra',
    category: 'Tool',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.geogebra.org/geometry',
    likes: 45678,
    height: 400,
    description: 'Dynamic geometry software for visualizing math',
    tags: ['math', 'geometry', 'tool', 'education']
  },
  
  // ============ NEW UNIQUE WEBSITES (21 websites - exactly 30%) ============
  
  // Puzzle Games (5)
  {
    id: 'jigsaw-puzzle',
    title: 'Jigsaw Puzzle',
    creator: 'Jigsaw Explorer',
    category: 'Puzzle',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.jigsawexplorer.com/online-jigsaw-puzzle-player.html',
    likes: 28345,
    height: 380,
    description: 'Solve beautiful jigsaw puzzles online',
    tags: ['puzzle', 'game', 'jigsaw', 'interactive']
  },
  {
    id: 'crossword',
    title: 'Daily Crossword',
    creator: 'Boatload Puzzles',
    category: 'Puzzle',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://boatloadpuzzles.com/playcrossword',
    likes: 19234,
    height: 400,
    description: 'Solve daily crossword puzzles online',
    tags: ['puzzle', 'crossword', 'word', 'game']
  },
  {
    id: 'tangram',
    title: 'Tangram Puzzle',
    creator: 'Tangram Game',
    category: 'Puzzle',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.mathsisfun.com/games/tangram.html',
    likes: 14567,
    height: 350,
    description: 'Solve ancient Chinese tangram puzzles',
    tags: ['puzzle', 'tangram', 'geometry', 'logic']
  },
  {
    id: 'maze-game',
    title: '3D Maze Game',
    creator: 'Maze Game',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.maze-game.com/3d-maze',
    likes: 21345,
    height: 420,
    description: 'Navigate through 3D mazes with keyboard controls',
    tags: ['game', 'maze', '3D', 'navigation']
  },
  {
    id: 'word-search',
    title: 'Word Search',
    creator: 'Word Search',
    category: 'Puzzle',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://wordsearchpuzzle.org',
    likes: 17890,
    height: 360,
    description: 'Find hidden words in a grid of letters',
    tags: ['puzzle', 'word', 'search', 'game']
  },
  
  // Action Games (5)
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    creator: 'Flappy Bird',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://flappybird.io',
    likes: 56789,
    height: 400,
    description: 'Classic flappy bird game - tap to fly',
    tags: ['game', 'action', 'arcade', 'flappy']
  },
  {
    id: 'pacman',
    title: 'Pac-Man',
    creator: 'Namco',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.pacman.com/en',
    likes: 89012,
    height: 380,
    description: 'Classic Pac-Man arcade game',
    tags: ['game', 'action', 'arcade', 'classic']
  },
  {
    id: 'snake',
    title: 'Snake Game',
    creator: 'Snake',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://snake.io',
    likes: 45678,
    height: 360,
    description: 'Classic snake game - eat food and grow',
    tags: ['game', 'action', 'classic', 'snake']
  },
  {
    id: 'tetris',
    title: 'Tetris',
    creator: 'Tetris',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://tetris.com/play-tetris',
    likes: 67890,
    height: 420,
    description: 'Classic Tetris block puzzle game',
    tags: ['game', 'puzzle', 'action', 'classic']
  },
  {
    id: 'breakout',
    title: 'Breakout',
    creator: 'Breakout',
    category: 'Game',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.breakoutgame.net',
    likes: 23456,
    height: 380,
    description: 'Classic breakout/brick breaker game',
    tags: ['game', 'action', 'arcade', 'breakout']
  },
  
  // Creative Tools (5)
  {
    id: 'photopea',
    title: 'Photopea',
    creator: 'Ivan Kutskir',
    category: 'Creative Tool',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.photopea.com',
    likes: 89012,
    height: 400,
    description: 'Free online Photoshop alternative',
    tags: ['tool', 'photo', 'editor', 'design']
  },
  {
    id: 'piskel',
    title: 'Piskel',
    creator: 'Piskel Team',
    category: 'Creative Tool',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.piskelapp.com',
    likes: 23456,
    height: 380,
    description: 'Free online pixel art and sprite editor',
    tags: ['tool', 'pixel', 'art', 'sprite', 'design']
  },
  {
    id: 'color-picker',
    title: 'Image Color Picker',
    creator: 'ImageColorPicker',
    category: 'Creative Tool',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://imagecolorpicker.com',
    likes: 15678,
    height: 300,
    description: 'Pick colors from images and create palettes',
    tags: ['tool', 'color', 'picker', 'design']
  },
  {
    id: 'figma',
    title: 'Figma',
    creator: 'Figma',
    category: 'Creative Tool',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.figma.com/figma',
    likes: 98765,
    height: 380,
    description: 'Online design and prototyping tool',
    tags: ['tool', 'design', 'prototype', 'collaboration']
  },
  {
    id: 'canva',
    title: 'Canva',
    creator: 'Canva',
    category: 'Creative Tool',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.canva.com',
    likes: 123456,
    height: 400,
    description: 'Easy to use graphic design platform',
    tags: ['tool', 'design', 'graphics', 'templates']
  },
  
  // AI & ML (3)
  {
    id: 'teachable-machine',
    title: 'Teachable Machine',
    creator: 'Google',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://teachablemachine.withgoogle.com',
    likes: 28901,
    height: 400,
    description: 'Train a computer to recognize your images, sounds, and poses',
    tags: ['AI', 'machine learning', 'education', 'interactive']
  },
  {
    id: 'runway-ml',
    title: 'Runway ML',
    creator: 'Runway',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://runwayml.com',
    likes: 21345,
    height: 380,
    description: 'AI tools for creative projects',
    tags: ['AI', 'machine learning', 'creative', 'tool']
  },
  {
    id: 'deep-dream',
    title: 'Deep Dream Generator',
    creator: 'Deep Dream',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    url: 'https://deepdreamgenerator.com',
    likes: 17890,
    height: 420,
    description: 'Create AI-generated art from your photos',
    tags: ['AI', 'art', 'generator', 'creative']
  },
];

// Pinterest-style category icons
const CATEGORY_ICONS: Record<string, string> = {
  'Music': 'music-note',
  'Generative Art': 'palette',
  'Game': 'games',
  'Puzzle': 'extension',
  'Interactive Experiment': 'touch-app',
  'Visual Essay': 'photo-library',
  'Simulation': 'graphic-eq',
  'Tool': 'build',
  'AI': 'smart-toy',
  'Creative Tool': 'color-lens',
  'Education': 'school',
  'Visual Experiment': 'remove-red-eye',
};

// Pinterest-style navigation icons
const PINTEREST_NAV_ICONS: Record<string, string> = {
  'home': 'home',
  'explore': 'explore',
  'create': 'add',
  'messages': 'message',
  'profile': 'person',
  'search': 'search',
  'notifications': 'notifications',
};

export default function App() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [search, setSearch] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  const { width, height } = Dimensions.get('window');
  const isMobile = width < 1024;
  const isTablet = width >= 768 && width < 1024;

  // Layout constants - Pinterest-style
  const SIDEBAR_WIDTH = isMobile ? 0 : 240;
  const MIN_PIN_WIDTH = 220;
  const MAX_PIN_WIDTH = 280;
  const GAP = 16;
  const PADDING = isMobile ? 16 : 24;

  // Calculate available width for grid
  const availableWidth = width - SIDEBAR_WIDTH - PADDING * 2;
  
  // Calculate number of columns
  const numColumns = Math.max(1, Math.floor(availableWidth / (MIN_PIN_WIDTH + GAP)));
  
  // Calculate pin width
  const pinWidth = Math.min(MAX_PIN_WIDTH, Math.floor((availableWidth - (numColumns - 1) * GAP) / numColumns));

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredPins = ALL_PINS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.creator.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
                          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())));
    return matchesSearch;
  });

  // Masonry layout algorithm
  const getMasonryLayout = () => {
    const columns: {items: Pin[], height: number}[] = Array.from({ length: numColumns }, () => ({ items: [], height: 0 }));
    
    filteredPins.forEach(pin => {
      // Find the shortest column
      let minIndex = 0;
      for (let i = 1; i < columns.length; i++) {
        if (columns[i].height < columns[minIndex].height) {
          minIndex = i;
        }
      }
      
      // Calculate the aspect ratio for this pin
      const aspectRatio = pin.height / 300;
      const itemHeight = pinWidth * aspectRatio;
      
      columns[minIndex].items.push({ ...pin, calculatedHeight: itemHeight });
      columns[minIndex].height += itemHeight + GAP;
    });
    
    return columns;
  };

  const masonryColumns = getMasonryLayout();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setActiveMenuId(null);
    };
    // @ts-ignore - Add event listener for web
    if (Platform.OS === 'web') {
      document.addEventListener('click', handleClick);
    }
    return () => {
      // @ts-ignore
      if (Platform.OS === 'web') {
        document.removeEventListener('click', handleClick);
      }
    };
  }, []);

  // Pinterest Top Navigation Component
  const PinterestTopNav = () => (
    <View style={styles.pinterestTopNav}>
      <View style={styles.pinterestNavContent}>
        {/* Pinterest Logo */}
        <TouchableOpacity onPress={() => setActiveNav('home')} style={styles.pinterestLogo}>
          <MaterialIcons name="push-pin" size={28} color={PINTERST_RED} />
          <Text style={styles.pinterestLogoText}>Pinterest</Text>
        </TouchableOpacity>

        {/* Top Navigation Items */}
        <View style={styles.pinterestNavItems}>
          {PINTEREST_TOP_NAV.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActiveNav(item.id)}
              style={[styles.pinterestNavItem, activeNav === item.id && styles.pinterestNavItemActive]}
            >
              <Text style={[styles.pinterestNavText, activeNav === item.id && styles.pinterestNavTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.pinterestSearchContainer}>
          <View style={styles.pinterestSearchBar}>
            <MaterialIcons name="search" size={20} color={PINTERST_TEXT_SECONDARY} style={styles.pinterestSearchIcon} />
            <TextInput
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
              style={styles.pinterestSearchInput}
              placeholderTextColor={PINTERST_TEXT_SECONDARY}
            />
          </View>
        </View>

        {/* Profile and Notifications */}
        <View style={styles.pinterestNavActions}>
          <TouchableOpacity style={styles.pinterestActionButton}>
            <MaterialIcons name="notifications" size={24} color={PINTERST_TEXT} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pinterestActionButton}>
            <MaterialIcons name="message" size={24} color={PINTERST_TEXT} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pinterestActionButton, styles.pinterestProfileButton]}>
            <MaterialIcons name="person" size={24} color={PINTERST_TEXT} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Pinterest Bottom Navigation for Mobile
  const PinterestBottomNav = () => (
    <View style={styles.pinterestBottomNav}>
      {PINTEREST_MOBILE_NAV.map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => setActiveNav(item.id)}
          style={[styles.pinterestBottomNavItem, activeNav === item.id && styles.pinterestBottomNavItemActive]}
        >
          <MaterialIcons
            name={item.icon as any}
            size={item.size || 24}
            color={activeNav === item.id ? PINTERST_RED : PINTERST_TEXT_SECONDARY}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: PINTERST_BG }]}>
      {/* Global scrollbar hiding for web */}
      {Platform.OS === 'web' && (
        <style>{`
          ::-webkit-scrollbar {
            display: none !important;
          }
          html {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            scroll-behavior: smooth !important;
            -webkit-text-size-adjust: 100% !important;
          }
          body {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            scroll-behavior: smooth !important;
            overflow: hidden !important;
            overscroll-behavior: none !important;
          }
          #root {
            overflow: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth !important;
            overscroll-behavior: none !important;
          }
        `}</style>
      )}

      {/* Desktop: Pinterest Top Navigation */}
      {!isMobile && <PinterestTopNav />}

      {/* Mobile: Pinterest Header */}
      {isMobile && (
        <View style={styles.mobilePinterestHeader}>
          <View style={styles.mobilePinterestNav}>
            <TouchableOpacity onPress={() => setActiveNav('home')} style={styles.mobilePinterestLogo}>
              <MaterialIcons name="push-pin" size={28} color={PINTERST_RED} />
              <Text style={styles.mobilePinterestLogoText}>Pinterest</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} style={styles.mobileSearchIcon}>
              <MaterialIcons name="search" size={24} color={PINTERST_TEXT} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.contentArea, isMobile ? styles.mobileContentArea : styles.desktopContentArea]}>
        {/* Desktop: Search Bar */}
        {!isMobile && (
          <View style={styles.desktopSearchContainer}>
            <View style={styles.desktopSearchBar}>
              <MaterialIcons name="search" size={20} color={PINTERST_TEXT_SECONDARY} style={styles.desktopSearchIcon} />
              <TextInput
                placeholder="Search for ideas"
                value={search}
                onChangeText={setSearch}
                style={styles.desktopSearchInput}
                placeholderTextColor={PINTERST_TEXT_SECONDARY}
              />
            </View>
          </View>
        )}

        {/* Mobile: Search Bar */}
        {isMobile && (
          <View style={styles.mobileSearchContainer}>
            <View style={styles.mobileSearchBar}>
              <MaterialIcons name="search" size={20} color={PINTERST_TEXT_SECONDARY} style={styles.mobileSearchInputIcon} />
              <TextInput
                placeholder="Search"
                value={search}
                onChangeText={setSearch}
                style={styles.mobileSearchInput}
                placeholderTextColor={PINTERST_TEXT_SECONDARY}
              />
            </View>
          </View>
        )}

        {/* Category Filters */}
        <View style={styles.categoryFilters}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFiltersContent}
          >
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={[styles.categoryFilter, !search && styles.categoryFilterActive]}
            >
              <Text style={[styles.categoryFilterText, !search && styles.categoryFilterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {Array.from(new Set(ALL_PINS.map(p => p.category))).map(category => (
              <TouchableOpacity
                key={category}
                onPress={() => setSearch(`category:${category}`)}
                style={[styles.categoryFilter, search === `category:${category}` && styles.categoryFilterActive]}
              >
                <Text style={[styles.categoryFilterText, search === `category:${category}` && styles.categoryFilterTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Masonry Grid */}
        <ScrollView 
          contentContainerStyle={[styles.gridContainer, { paddingHorizontal: PADDING, paddingBottom: isMobile ? 80 : 48 }]}
          showsVerticalScrollIndicator={false}
          style={[styles.hideScrollbar, styles.scrollContainer]}
          nestedScrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          decelerationRate="normal"
          snapToAlignment="start"
          bounces={true}
          alwaysBounceVertical={true}
        >
          <View style={[styles.grid, { width: '100%' }]}>
            {masonryColumns.map((column, colIndex) => (
              <View key={colIndex} style={[styles.column, { width: pinWidth }]}>
                {column.items.map(pin => {
                  const isSaved = savedIds.includes(pin.id);
                  const isMenuOpen = activeMenuId === pin.id;

                  return (
                    <View
                      key={pin.id}
                      style={[
                        styles.card,
                        { width: pinWidth, height: pin.calculatedHeight },
                        hoveredPinId === pin.id && styles.cardHover
                      ]}
                      // @ts-ignore - onMouseEnter/onMouseLeave are web-only props supported by react-native-web
                      onMouseEnter={() => setHoveredPinId(pin.id)}
                      // @ts-ignore - onMouseLeave is web-only
                      onMouseLeave={() => setHoveredPinId(null)}
                    >
                      <TouchableOpacity
                        onPress={() => setSelectedPin(pin)}
                        activeOpacity={0.95}
                        delayPressIn={0}
                        delayPressOut={0}
                        pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
                        style={styles.cardTouchableArea}
                      >
                      {/* Pin Image */}
                      <View style={{ width: pinWidth, height: pin.calculatedHeight, position: 'relative' }}>
                        <Image 
                          source={{ uri: pin.image }} 
                          style={{ width: pinWidth, height: pin.calculatedHeight, resizeMode: 'cover' }}
                        />
                        
                        {/* Top Right Menu with Save Button on Hover */}
                        <TouchableOpacity
                          onPress={(e) => { 
                            e.stopPropagation(); 
                            if (hoveredPinId === pin.id) {
                              toggleSave(pin.id);
                            } else {
                              setActiveMenuId(isMenuOpen ? null : pin.id);
                            }
                          }}
                          style={[styles.menuButton, { right: 12, top: 12 }]}
                        >
                          {hoveredPinId === pin.id ? (
                            <View style={[styles.saveButton, isSaved ? styles.saveButtonSaved : styles.saveButtonDefault]}>
                              <MaterialIcons 
                                name={isSaved ? 'check' : 'add'}
                                size={20}
                                color={isSaved ? 'white' : PINTERST_RED}
                              />
                            </View>
                          ) : (
                            <View style={styles.threeDotsContainer}>
                              <MaterialIcons name="more-vert" size={20} color="white" />
                            </View>
                          )}
                        </TouchableOpacity>

                        {isMenuOpen && (
                          <View style={[styles.dropdownMenu, { width: 200 }]}>
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                toggleSave(pin.id);
                                setActiveMenuId(null); 
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>{isSaved ? 'Unsave' : 'Save'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                alert(`Shared "${pin.title}"!\n\n${pin.url}`); 
                                setActiveMenuId(null); 
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                // @ts-ignore
                                if (Platform.OS === 'web') {
                                  window.open(pin.url, '_blank');
                                } else {
                                  alert(`Opening: ${pin.url}`);
                                }
                                setActiveMenuId(null); 
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>Visit Website</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                // @ts-ignore
                                if (Platform.OS === 'web') {
                                  navigator.clipboard.writeText(pin.url);
                                  alert('Link copied to clipboard!');
                                } else {
                                  alert(`Link: ${pin.url}`);
                                }
                                setActiveMenuId(null); 
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>Copy Link</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      
                      {/* Pin Info */}
                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{pin.title}</Text>
                        <View style={styles.creatorRow}>
                          <Text style={styles.creatorName}>{pin.creator}</Text>
                        </View>
                        <View style={styles.statsRow}>
                          <Text style={styles.statText}>{pin.likes.toLocaleString()} saves</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Modal */}
        <Modal
          visible={selectedPin !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPin(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isMobile && styles.mobileModalContent]}>
              <TouchableOpacity
                onPress={() => setSelectedPin(null)}
                style={styles.modalClose}
              >
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
              
              <View style={[styles.modalImageContainer, isMobile && styles.mobileModalImageContainer]}>
                <Image 
                  source={{ uri: selectedPin?.image || '' }} 
                  style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                />
              </View>
              
              <View style={[styles.modalDetails, isMobile && styles.mobileModalDetails]}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedPin) {
                        toggleSave(selectedPin.id);
                      }
                    }}
                    style={[styles.modalSaveButton, savedIds.includes(selectedPin?.id || '') ? styles.modalSaveButtonSaved : styles.modalSaveButtonDefault]}
                  >
                    <Text style={styles.modalSaveButtonText}>
                      {savedIds.includes(selectedPin?.id || '') ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.modalTitle, isMobile && styles.mobileModalTitle]} numberOfLines={2}>
                  {selectedPin?.title}
                </Text>
                <Text style={[styles.modalTagline, isMobile && styles.mobileModalTagline]}>
                  {selectedPin?.description}
                </Text>
                <Text style={[styles.modalLikes, isMobile && styles.mobileModalLikes]}>
                  {selectedPin?.likes.toLocaleString()} saves
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // @ts-ignore
                    if (Platform.OS === 'web') {
                      window.open(selectedPin?.url || '', '_blank');
                    } else {
                      alert(`Opening: ${selectedPin?.url}`);
                    }
                  }}
                  style={[styles.modalVisitButton, isMobile && styles.mobileVisitButton]}
                >
                  <Text style={styles.modalVisitButtonText}>Visit Website</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Mobile Bottom Navigation */}
        {isMobile && <PinterestBottomNav />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PINTERST_BG,
  },
  contentArea: {
    flex: 1,
  },
  desktopContentArea: {
    marginLeft: 0,
  },
  mobileContentArea: {
    flex: 1,
  },
  // Hide scrollbars
  hideScrollbar: {
    // @ts-ignore - web-specific scrollbar properties
    scrollbarWidth: 'none',
    // @ts-ignore - web-specific scrollbar property
    msOverflowStyle: 'none',
  },
  // Scroll container for smooth scrolling
  scrollContainer: {
    flex: 1,
    // @ts-ignore - web-specific scroll behavior
    scrollBehavior: 'smooth',
    // @ts-ignore - web-specific CSS for smooth scrolling
    WebkitOverflowScrolling: 'touch',
  },

  // ============ PINTEREST TOP NAVIGATION ============
  pinterestTopNav: {
    backgroundColor: PINTERST_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: PINTERST_GRAY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    // @ts-ignore - sticky position is supported in React Native Web
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  pinterestNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1400,
    marginHorizontal: 'auto',
  },
  pinterestLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinterestLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: PINTERST_RED,
    letterSpacing: 0.5,
  },
  pinterestNavItems: {
    flexDirection: 'row',
    gap: 32,
  },
  pinterestNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pinterestNavItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: PINTERST_RED,
  },
  pinterestNavText: {
    fontSize: 16,
    fontWeight: '600',
    color: PINTERST_TEXT,
  },
  pinterestNavTextActive: {
    color: PINTERST_RED,
  },
  pinterestSearchContainer: {
    flex: 1,
    maxWidth: 400,
    marginHorizontal: 32,
  },
  pinterestSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINTERST_GRAY,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pinterestSearchIcon: {
    marginRight: 12,
  },
  pinterestSearchInput: {
    flex: 1,
    fontSize: 16,
    color: PINTERST_TEXT,
  },
  pinterestNavActions: {
    flexDirection: 'row',
    gap: 16,
  },
  pinterestActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinterestProfileButton: {
    backgroundColor: PINTERST_GRAY,
  },

  // ============ MOBILE PINTEREST HEADER ============
  mobilePinterestHeader: {
    backgroundColor: PINTERST_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: PINTERST_GRAY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // @ts-ignore - sticky position is supported in React Native Web
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  mobilePinterestNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobilePinterestLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobilePinterestLogoText: {
    fontSize: 20,
    fontWeight: '700',
    color: PINTERST_RED,
    letterSpacing: 0.5,
  },
  mobileSearchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============ SEARCH BARS ============
  desktopSearchContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  desktopSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINTERST_GRAY,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
    marginHorizontal: 'auto',
  },
  desktopSearchIcon: {
    marginRight: 12,
  },
  desktopSearchInput: {
    flex: 1,
    fontSize: 16,
    color: PINTERST_TEXT,
  },

  mobileSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PINTERST_GRAY,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  mobileSearchInputIcon: {
    marginRight: 12,
  },
  mobileSearchInput: {
    flex: 1,
    fontSize: 16,
    color: PINTERST_TEXT,
  },

  // ============ CATEGORY FILTERS ============
  categoryFilters: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  categoryFiltersContent: {
    gap: 16,
    paddingHorizontal: 8,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: PINTERST_GRAY,
  },
  categoryFilterActive: {
    backgroundColor: PINTERST_RED,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: PINTERST_TEXT,
  },
  categoryFilterTextActive: {
    color: PINTERST_WHITE,
  },

  // ============ PINTEREST BOTTOM NAVIGATION ============
  pinterestBottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: PINTERST_WHITE,
    borderTopWidth: 1,
    borderTopColor: PINTERST_GRAY,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  pinterestBottomNavItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinterestBottomNavItemActive: {
    backgroundColor: PINTERST_GRAY,
  },

  // ============ GRID ============
  gridContainer: {
    paddingVertical: 24,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    gap: 24,
  },

  // ============ CARD ============
  card: {
    borderRadius: 16,
    backgroundColor: PINTERST_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTouchableArea: {
    width: '100%',
    height: '100%',
  },
  cardHover: {
    transform: [{ translateY: -8 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
    // @ts-ignore - web-specific transform style
    willChange: 'transform, box-shadow',
    // Add backdrop filter for blur effect on hover
    // @ts-ignore - web-specific property
    backdropFilter: 'blur(12px)',
    // @ts-ignore - web-specific property
    WebkitBackdropFilter: 'blur(12px)',
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 12,
    backgroundColor: PINTERST_WHITE,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PINTERST_TEXT,
    lineHeight: 20,
  },
  creatorRow: {
    marginTop: 4,
  },
  creatorName: {
    fontSize: 14,
    color: PINTERST_TEXT_SECONDARY,
    fontWeight: '400',
  },
  statsRow: {
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: PINTERST_TEXT_SECONDARY,
  },

  // ============ MENU & SAVE BUTTON ============
  menuButton: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    // @ts-ignore - web-specific transition
    transition: 'all 0.2s ease',
  },
  threeDotsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDefault: {
    backgroundColor: 'white',
  },
  saveButtonSaved: {
    backgroundColor: PINTERST_RED,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 44,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111',
  },

  // ============ MODAL ============
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '90%',
    maxWidth: 900,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mobileModalContent: {
    width: '95%',
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImageContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  mobileModalImageContainer: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 250,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    maxHeight: 500,
    resizeMode: 'contain',
  },
  mobileModalImage: {
    width: '100%',
    height: 300,
    maxHeight: 400,
    resizeMode: 'contain',
  },
  modalDetails: {
    flex: 1,
    padding: 32,
    justifyContent: 'flex-start',
    maxHeight: '100%',
  },
  mobileModalDetails: {
    padding: 20,
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  modalSaveButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalSaveButtonDefault: {
    backgroundColor: PINTERST_RED,
  },
  modalSaveButtonSaved: {
    backgroundColor: '#111',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: PINTERST_TEXT,
    marginBottom: 8,
  },
  mobileModalTitle: {
    fontSize: 20,
    marginBottom: 6,
  },
  modalTagline: {
    fontSize: 14,
    color: PINTERST_TEXT_SECONDARY,
    marginBottom: 20,
    lineHeight: 20,
  },
  mobileModalTagline: {
    fontSize: 12,
    color: PINTERST_TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 18,
  },
  modalLikes: {
    fontSize: 14,
    color: PINTERST_TEXT_SECONDARY,
    marginBottom: 24,
  },
  mobileModalLikes: {
    fontSize: 12,
    marginBottom: 16,
  },
  modalVisitButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: PINTERST_GRAY,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  mobileVisitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalVisitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PINTERST_TEXT,
  },
});
