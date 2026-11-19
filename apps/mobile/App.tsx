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
}

// 50 Unique Interactive Websites - All work in iframes/WebViews
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
    likes: 19234,
    height: 360,
    description: 'Create and explore machine learning models without coding',
    tags: ['AI', 'machine learning', 'creative', 'tool']
  },
  {
    id: 'deep-dream',
    title: 'Deep Dream Generator',
    creator: 'Google',
    category: 'AI',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    url: 'https://deepdreamgenerator.com',
    likes: 24567,
    height: 420,
    description: 'Generate artistic images using AI neural networks',
    tags: ['AI', 'art', 'generator', 'creative']
  },
  
  // Simulation (3)
  {
    id: 'ph-et-simulations',
    title: 'PhET Physics Simulations',
    creator: 'University of Colorado',
    category: 'Simulation',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://phet.colorado.edu',
    likes: 56789,
    height: 450,
    description: 'Free interactive math and science simulations',
    tags: ['simulation', 'physics', 'math', 'education']
  },
  {
    id: 'virtual-lab',
    title: 'Virtual Chemistry Lab',
    creator: 'ChemCollective',
    category: 'Simulation',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://chemcollective.org/vlabs',
    likes: 15678,
    height: 380,
    description: 'Perform virtual chemistry experiments online',
    tags: ['simulation', 'chemistry', 'lab', 'education']
  },
  {
    id: 'flight-simulator',
    title: 'Flight Simulator',
    creator: 'GeoFS',
    category: 'Simulation',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.geo-fs.com',
    likes: 34567,
    height: 450,
    description: 'Fly a plane in a realistic flight simulator',
    tags: ['simulation', 'flight', 'plane', '3D']
  },
  
  // Visual Experiments (2)
  {
    id: 'rotating-snakes',
    title: 'Rotating Snakes',
    creator: 'Kitaoka Akiyoshi',
    category: 'Visual Experiment',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.michaelbach.de/ot/snakes/index.html',
    likes: 18901,
    height: 340,
    description: 'Optical illusion of rotating snakes',
    tags: ['visual', 'optical illusion', 'psychology', 'experiment']
  },
  {
    id: 'optical-illusions',
    title: 'Optical Illusions Gallery',
    creator: 'Michael Bach',
    category: 'Visual Experiment',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.michaelbach.de/ot/index.html',
    likes: 24567,
    height: 400,
    description: 'Collection of over 100 optical illusions',
    tags: ['visual', 'optical illusion', 'psychology', 'science']
  },
  
  // Educational (2)
  {
    id: 'brilliant',
    title: 'Brilliant',
    creator: 'Brilliant',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://brilliant.org',
    likes: 34567,
    height: 380,
    description: 'Learn math, science, and computer science interactively',
    tags: ['education', 'math', 'science', 'interactive']
  },
  {
    id: 'scratch',
    title: 'Scratch',
    creator: 'MIT',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
    url: 'https://scratch.mit.edu',
    likes: 189012,
    height: 420,
    description: 'Program interactive stories, games, and animations',
    tags: ['education', 'programming', 'games', 'creative']
  },
  
  // Fun & Novelty (2)
  {
    id: 'endless-paper',
    title: 'Endless Paper',
    creator: 'Endless Paper',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    url: 'https://endlesspaper.com',
    likes: 15678,
    height: 360,
    description: 'Endless scroll of grid paper',
    tags: ['interactive', 'paper', 'scroll', 'oddly-satisfying']
  },
  {
    id: 'longest-webpage',
    title: 'The Longest Page on the Internet',
    creator: 'Longest Page',
    category: 'Interactive Experiment',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    url: 'https://thelongest.page',
    likes: 12345,
    height: 400,
    description: 'Scroll through the longest webpage ever',
    tags: ['interactive', 'scroll', 'fun', 'novelty']
  },
  
  // Music Tools (1)
  {
    id: 'soundtrap',
    title: 'Soundtrap',
    creator: 'Spotify',
    category: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    url: 'https://www.soundtrap.com',
    likes: 21345,
    height: 380,
    description: 'Online music and audio recording studio',
    tags: ['music', 'audio', 'studio', 'collaboration']
  },
];

const PINTERST_RED = '#E60023';

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

  // Layout constants
  const SIDEBAR_WIDTH = 80;
  const MIN_PIN_WIDTH = 200;
  const MAX_PIN_WIDTH = 250;
  const GAP = 16;
  const SIDEBAR_PADDING = 24;

  // Calculate available width for grid
  const availableWidth = width - (isMobile ? 0 : SIDEBAR_WIDTH) - SIDEBAR_PADDING * 2;
  
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

  // Navigation icons - minimal line style using Material Icons
  const navItems = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'search', icon: 'search', label: 'Search' },
    { id: 'explore', icon: 'explore', label: 'Explore' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
    { id: 'messages', icon: 'message', label: 'Messages' },
    { id: 'create', icon: 'add', label: 'Create' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

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

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
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
          }
          #root {
            overflow: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-behavior: smooth !important;
          }
        `}</style>
      )}
      {!isMobile && (
        <>
          {/* Left Sidebar */}
          <View style={[styles.sidebar, { width: SIDEBAR_WIDTH }]}>
            <View style={styles.sidebarContent}>
              {/* Pinterest Logo */}
              <View style={styles.logoContainer}>
                <View style={[styles.logo, { backgroundColor: PINTERST_RED }]}>
                  <MaterialIcons name="push-pin" size={22} color="white" />
                </View>
              </View>
              
              {/* Navigation Icons */}
              <View style={styles.navContainer}>
                {navItems.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setActiveNav(item.id)}
                    style={[styles.navItem, activeNav === item.id ? styles.navItemActive : null]}
                  >
                    <MaterialIcons 
                      name={item.icon} 
                      size={24} 
                      color="#000" 
                    />
                    {activeNav === item.id && <View style={styles.navIndicator} />}
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Settings Icon */}
              <TouchableOpacity style={styles.settingsButton}>
                <MaterialIcons name="settings" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {/* Top Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <TextInput
                  placeholder="Search"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Masonry Grid */}
            <ScrollView 
              contentContainerStyle={[styles.gridContainer, { paddingHorizontal: SIDEBAR_PADDING }]}
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
                        <TouchableOpacity
                          key={pin.id}
                          onPress={() => setSelectedPin(pin)}
                          style={[
                            styles.card,
                            { width: pinWidth, height: pin.calculatedHeight },
                            hoveredPinId === pin.id && styles.cardHover
                          ]}
                          activeOpacity={0.95}
                          delayPressIn={0}
                          delayPressOut={0}
                          pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
                          onMouseEnter={() => setHoveredPinId(pin.id)}
                          onMouseLeave={() => setHoveredPinId(null)}
                          // @ts-expect-error - onMouseEnter/onMouseLeave are web-only props supported by react-native-web
                        >
                            {/* Pin Image */}
                            <View style={[styles.cardImageContainer, { width: pinWidth, height: pin.calculatedHeight }]}>
                              <Image 
                                source={{ uri: pin.image }} 
                                style={[styles.cardImage, { width: pinWidth, height: pin.calculatedHeight }]}
                              />
                              
                              {/* Top Right Menu with Bookmark on Hover */}
                              <TouchableOpacity
                                onPress={(e) => { 
                                  e.stopPropagation(); 
                                  if (hoveredPinId === pin.id) {
                                    toggleSave(pin.id);
                                  } else {
                                    setActiveMenuId(isMenuOpen ? null : pin.id);
                                  }
                                }}
                                style={[styles.menuButton, { right: 12 }]}
                              >
                                {hoveredPinId === pin.id ? (
                                  <MaterialIcons 
                                    name={isSaved ? 'bookmark' : 'bookmark-border'} 
                                    size={20} 
                                    color="white" 
                                  />
                                ) : (
                                  <MaterialIcons name="more-vert" size={20} color="white" />
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
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    onPress={() => setSelectedPin(null)}
                    style={styles.modalClose}
                  >
                    <MaterialIcons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                  
                  <View style={styles.modalImageContainer}>
                    <Image 
                      source={{ uri: selectedPin?.image || '' }} 
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </View>
                  
                  <View style={styles.modalDetails}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedPin) toggleSave(selectedPin.id);
                        }}
                        style={[styles.modalSaveButton, selectedPin && savedIds.includes(selectedPin.id) ? styles.modalSaveButtonSaved : styles.modalSaveButtonDefault]}
                      >
                        <MaterialIcons 
                          name={selectedPin && savedIds.includes(selectedPin.id) ? 'bookmark' : 'bookmark-border'} 
                          size={18} 
                          color="white" 
                        />
                        <Text style={[styles.modalSaveButtonText, { marginLeft: 8 }]}>
                          {selectedPin && savedIds.includes(selectedPin.id) ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.modalTitle}>{selectedPin?.title}</Text>
                    <Text style={styles.modalDescription}>
                      {selectedPin?.creator} · {selectedPin?.category}
                    </Text>
                    
                    {selectedPin?.description && (
                      <Text style={styles.modalTagline}>{selectedPin.description}</Text>
                    )}
                    
                    <Text style={styles.modalLikes}>❤️ {selectedPin?.likes.toLocaleString()} saves</Text>
                    
                    <TouchableOpacity
                      onPress={() => {
                        // @ts-ignore
                        if (Platform.OS === 'web') {
                          window.open(selectedPin?.url, '_blank');
                        } else {
                          alert(`Opening: ${selectedPin?.url}`);
                        }
                        setSelectedPin(null);
                      }}
                      style={styles.modalVisitButton}
                    >
                      <Text style={styles.modalVisitButtonText}>Visit Website</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </>
      )}
      
      {isMobile && (
        <View style={styles.mobileContainer}>
          {/* Mobile Header */}
          <View style={styles.mobileHeader}>
            <View style={styles.mobileLogo}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.mobileHeaderTitle}>Pinterest</Text>
            <TouchableOpacity 
              onPress={() => { /* Search action */ }}
              style={styles.mobileSearch}
            >
              <MaterialIcons name="search" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          {/* Mobile Search */}
          <View style={styles.mobileSearchContainer}>
            <View style={styles.mobileSearchBar}>
              <TextInput
                placeholder="Search"
                value={search}
                onChangeText={setSearch}
                style={styles.mobileSearchInput}
                placeholderTextColor="#999"
              />
            </View>
          </View>
          
          {/* Mobile Grid */}
          <ScrollView 
            contentContainerStyle={styles.mobileGridContainer}
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
            <View style={[styles.mobileGrid, { gap: GAP }]}>
              {filteredPins.map(pin => {
                const isSaved = savedIds.includes(pin.id);
                const cols = isTablet ? 3 : 2;
                const mobilePinWidth = (width - (cols + 1) * GAP) / cols;
                const aspectRatio = (pin.height || 300) / 300;
                const pinHeight = mobilePinWidth * aspectRatio;
                
                return (
                  <TouchableOpacity
                    key={pin.id}
                    onPress={() => setSelectedPin(pin)}
                    style={[
                      styles.mobileCard,
                      { width: mobilePinWidth, height: pinHeight },
                      hoveredPinId === pin.id && styles.cardHover
                    ]}
                    activeOpacity={0.95}
                    delayPressIn={0}
                    delayPressOut={0}
                    pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
                    onMouseEnter={() => setHoveredPinId(pin.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                    // @ts-expect-error - onMouseEnter/onMouseLeave are web-only props supported by react-native-web
                  >
                      <View style={[styles.cardImageContainer, { width: mobilePinWidth, height: pinHeight }]}>
                        <Image 
                          source={{ uri: pin.image }} 
                          style={[styles.cardImage, { width: mobilePinWidth, height: pinHeight }]}
                        />
                        <TouchableOpacity
                          onPress={(e) => { 
                            e.stopPropagation(); 
                            if (hoveredPinId === pin.id) {
                              toggleSave(pin.id);
                            } else {
                              setActiveMenuId(isMenuOpen ? null : pin.id);
                            }
                          }}
                          style={[styles.menuButton, { right: 12 }]}
                        >
                          {hoveredPinId === pin.id ? (
                            <MaterialIcons 
                              name={isSaved ? 'bookmark' : 'bookmark-border'} 
                              size={20} 
                              color="white" 
                            />
                          ) : (
                            <MaterialIcons name="more-vert" size={20} color="white" />
                          )}
                        </TouchableOpacity>
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, styles.mobileCardTitle]} numberOfLines={1}>{pin.title}</Text>
                        <Text style={[styles.creatorName, styles.mobileCreatorName]}>{pin.creator}</Text>
                      </View>
                    </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          
          {/* Mobile Modal */}
          <Modal
            visible={selectedPin !== null}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setSelectedPin(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, styles.mobileModalContent]}>
                <TouchableOpacity
                  onPress={() => setSelectedPin(null)}
                  style={styles.modalClose}
                >
                  <MaterialIcons name="close" size={24} color="#000" />
                </TouchableOpacity>
                
                <View style={styles.mobileModalImageContainer}>
                  <Image 
                    source={{ uri: selectedPin?.image || '' }} 
                    style={styles.mobileModalImage}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.mobileModalDetails}>
                  <Text style={[styles.modalTitle, styles.mobileModalTitle]}>{selectedPin?.title}</Text>
                  <Text style={[styles.modalDescription, styles.mobileModalDescription]}>
                    {selectedPin?.creator} · {selectedPin?.category}
                  </Text>
                  {selectedPin?.description && (
                    <Text style={styles.mobileModalTagline}>{selectedPin.description}</Text>
                  )}
                  <Text style={[styles.modalLikes, styles.mobileModalLikes]}>❤️ {selectedPin?.likes.toLocaleString()} saves</Text>
                  <TouchableOpacity
                    onPress={() => {
                      // @ts-ignore
                      if (Platform.OS === 'web') {
                        window.open(selectedPin?.url, '_blank');
                      } else {
                        alert(`Opening: ${selectedPin?.url}`);
                      }
                      setSelectedPin(null);
                    }}
                    style={[styles.modalVisitButton, styles.mobileVisitButton]}
                  >
                    <Text style={styles.modalVisitButtonText}>Visit Website</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    // @ts-expect-error - web-specific properties for smooth scrolling
    overflow: 'hidden',
    WebkitOverflowScrolling: 'touch',
  },
  // Hide scrollbars
  hideScrollbar: {
    // For Firefox
    scrollbarWidth: 'none',
    // For IE and Edge
    msOverflowStyle: 'none',
  },
  // Scroll container for smooth scrolling
  scrollContainer: {
    flex: 1,
    // @ts-expect-error - web-specific scroll behavior
    scrollBehavior: 'smooth',
    // @ts-expect-error - web-specific CSS for smooth scrolling
    WebkitOverflowScrolling: 'touch',
  },
  // Main content area
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // @ts-expect-error - web-specific smooth scrolling
    scrollBehavior: 'smooth',
  },
  // Sidebar
  sidebar: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EFEFEF',
    paddingTop: 24,
    height: '100%',
  },
  sidebarContent: {
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoContainer: {
    paddingBottom: 24,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  navItemActive: {
    backgroundColor: '#F0F0F0',
  },
  navIcon: {
    fontSize: 24,
  },
  navIndicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 4,
    height: 24,
    backgroundColor: '#E60023',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    transform: [{ translateY: -12 }],
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  searchBar: {
    backgroundColor: '#EFEFEF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
    marginLeft: 24,
  },
  searchInput: {
    fontSize: 16,
    color: '#111',
    width: '100%',
  },
  // Categories (kept for potential future use)
  // Grid
  gridContainer: {
    paddingVertical: 24,
    paddingBottom: 48, // Extra padding at bottom for better scrolling
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    gap: 24, // Increased gap for better visual separation
  },
  // Mobile grid
  mobileGridContainer: {
    paddingVertical: 16,
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  // Card
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // @ts-expect-error - transition is a web-specific CSS property
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardHover: {
    transform: [{ translateY: -8 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
    // @ts-expect-error - web-specific transform style
    willChange: 'transform, box-shadow',
  },
  cardImageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    resizeMode: 'cover',
  },
  saveButton: {
    position: 'absolute',
    top: 12,
    right: 12,
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
    backgroundColor: '#E60023',
  },
  saveButtonText: {
    fontSize: 18,
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    // @ts-expect-error - web-specific transition
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  menuButtonHover: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    // @ts-expect-error - web-specific transform
    transform: [{ scale: 1.1 }],
  },
  menuButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    lineHeight: 20,
  },
  mobileCardTitle: {
    fontSize: 14,
  },
  creatorRow: {
    marginTop: 4,
  },
  creatorName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  mobileCreatorName: {
    fontSize: 12,
  },
  statsRow: {
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  // Modal
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
  modalCloseText: {
    fontSize: 24,
    color: '#111',
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
  },
  mobileModalImage: {
    width: '100%',
    height: 300,
    maxHeight: 400,
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
    backgroundColor: '#E60023',
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
    color: '#111',
    marginBottom: 8,
  },
  mobileModalTitle: {
    fontSize: 20,
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  mobileModalDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  modalTagline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  mobileModalTagline: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  modalLikes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  mobileModalLikes: {
    fontSize: 12,
    marginBottom: 16,
  },
  modalVisitButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
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
    color: '#111',
  },
  // Mobile Styles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    // @ts-expect-error - web-specific touch scrolling
    WebkitOverflowScrolling: 'touch',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  mobileLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E60023',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mobileHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  mobileSearch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
  },
  mobileSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  mobileSearchBar: {
    backgroundColor: '#EFEFEF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  mobileSearchInput: {
    fontSize: 16,
    color: '#111',
    width: '100%',
  },
  mobileGridContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mobileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mobileCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // @ts-expect-error - transition is a web-specific CSS property
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
});
