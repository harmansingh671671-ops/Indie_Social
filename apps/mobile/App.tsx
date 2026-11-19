import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Platform } from 'react-native';

interface Pin {
  id: string;
  title: string;
  creator: string;
  category: string;
  image: string;
  url: string;
  likes: number;
  height?: number; // Variable height for masonry
}

// Real embeddable sites with varied heights for masonry effect
const PINS: Pin[] = [
  { 
    id: '1', 
    title: 'Patatap - Interactive Music & Animation', 
    creator: 'Jono Brandel', 
    category: 'Music', 
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', 
    url: 'https://patatap.com', 
    likes: 1245,
    height: 350
  },
  { 
    id: '2', 
    title: 'Silk - Generative Art Canvas', 
    creator: 'Yuri Vishnevsky', 
    category: 'Generative art', 
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', 
    url: 'https://weavesilk.com', 
    likes: 8920,
    height: 450
  },
  { 
    id: '3', 
    title: 'This Is Sand - Digital Sandbox Experience', 
    creator: 'David Li', 
    category: 'Interactive experiment', 
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', 
    url: 'https://thisissand.com', 
    likes: 4567,
    height: 280
  },
  { 
    id: '4', 
    title: 'Sandspiel - Falling Sand Physics Game', 
    creator: 'Max Bittker', 
    category: 'Game', 
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 
    url: 'https://sandspiel.club', 
    likes: 3456,
    height: 500
  },
  { 
    id: '5', 
    title: 'Pointer Pointer - Interactive Web Experiment', 
    creator: 'Studio Moniker', 
    category: 'Interactive experiment', 
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80', 
    url: 'https://pointerpointer.com', 
    likes: 2345,
    height: 320
  },
  { 
    id: '6', 
    title: 'Zoomquilt - Infinite Zooming Art', 
    creator: 'Nikolaus Baumgarten', 
    category: 'Visual essay', 
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 
    url: 'https://zoomquilt.org', 
    likes: 5678,
    height: 400
  },
  { 
    id: '7', 
    title: 'Radio Garden - Global Radio Explorer', 
    creator: 'Studio Puckey', 
    category: 'Music', 
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80', 
    url: 'https://radio.garden', 
    likes: 7890,
    height: 380
  },
  { 
    id: '8', 
    title: 'Neal.fun - Collection of Interactive Experiments', 
    creator: 'Neal Agarwal', 
    category: 'Interactive experiment', 
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80', 
    url: 'https://neal.fun', 
    likes: 15678,
    height: 420
  },
  { 
    id: '9', 
    title: 'Chrome Music Lab - Hands-on Music Experiments', 
    creator: 'Google Creative Lab', 
    category: 'Music', 
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', 
    url: 'https://musiclab.chromeexperiments.com', 
    likes: 12345,
    height: 300
  },
  { 
    id: '10', 
    title: '100,000 Stars - 3D Star Visualization', 
    creator: 'Google Data Arts Team', 
    category: 'Visual essay', 
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 
    url: 'https://stars.chromeexperiments.com', 
    likes: 8765,
    height: 550
  },
  { 
    id: '11', 
    title: 'Stellarium Web - Online Planetarium', 
    creator: 'Stellarium', 
    category: 'Tool', 
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 
    url: 'https://stellarium-web.org', 
    likes: 6543,
    height: 360
  },
  { 
    id: '12', 
    title: 'Dwitter - Social Network for Creative Coders', 
    creator: 'Lionel Lemariè', 
    category: 'Generative art', 
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80', 
    url: 'https://dwitter.net', 
    likes: 4321,
    height: 480
  },
];

const CATEGORIES = ['All', 'Music', 'Generative art', 'Interactive experiment', 'Game', 'Visual essay', 'Tool'];

// Pinterest red color
const PINTERST_RED = '#E60023';

export default function App() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeNav, setActiveNav] = useState('home');

  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;

  // Calculate pin width based on screen size (Pinterest uses ~236px)
  const getPinWidth = () => {
    if (isMobile) {
      // On mobile, use 2 columns
      return (width - 48) / 2; // 16px padding * 2 + 16px gap
    }
    // On desktop, use fixed width like Pinterest
    const columns = Math.floor((width - 240) / 236); // 240px for sidebar
    const totalGap = (columns - 1) * 16;
    const availableWidth = width - 240 - totalGap;
    return Math.min(236, availableWidth / columns);
  };

  const pinWidth = getPinWidth();

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredPins = PINS.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.creator.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate masonry layout
  const getMasonryLayout = () => {
    const numColumns = isMobile ? 2 : Math.floor((width - 240) / (pinWidth + 16)) + 1;
    const columns: {items: Pin[], height: number}[] = Array.from({ length: numColumns }, () => ({ items: [], height: 0 }));
    
    filteredPins.forEach(pin => {
      // Find the shortest column
      let minIndex = 0;
      for (let i = 1; i < columns.length; i++) {
        if (columns[i].height < columns[minIndex].height) {
          minIndex = i;
        }
      }
      
      // Calculate the height ratio (Pinterest pins have varied aspect ratios)
      const aspectRatio = (pin.height || 300) / 300; // Default to 300 if not specified
      const itemHeight = pinWidth * aspectRatio;
      
      columns[minIndex].items.push({ ...pin, calculatedHeight: itemHeight });
      columns[minIndex].height += itemHeight + 16; // 16px gap
    });
    
    return columns;
  };

  const masonryColumns = getMasonryLayout();

  // Navigation icons
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'explore', icon: '🔭', label: 'Explore' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'messages', icon: '💬', label: 'Messages' },
    { id: 'create', icon: '➕', label: 'Create' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {!isMobile && (
        <>
          {/* Left Sidebar - Pinterest Style */}
          <View style={styles.sidebar}>
            <View style={styles.sidebarContent}>
              {/* Pinterest Logo */}
              <View style={styles.logoContainer}>
                <View style={[styles.logo, { backgroundColor: PINTERST_RED }]}>
                  <Text style={styles.logoText}>P</Text>
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
                    <Text style={styles.navIcon}>{item.icon}</Text>
                    {activeNav === item.id && <View style={styles.navIndicator} />}
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Settings Icon */}
              <TouchableOpacity style={styles.settingsButton}>
                <Text style={styles.navIcon}>⚙️</Text>
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

            {/* Category Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoryContainer}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryButton, activeCategory === cat ? styles.categoryButtonActive : styles.categoryButtonInactive]}
                >
                  <Text style={[styles.categoryButtonText, activeCategory === cat ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Masonry Grid */}
            <ScrollView contentContainerStyle={styles.gridContainer}>
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
                          style={[styles.card, { width: pinWidth, height: pin.calculatedHeight }]}
                          activeOpacity={0.9}
                        >
                          {/* Pin Image */}
                          <View style={[styles.cardImageContainer, { width: pinWidth, height: pin.calculatedHeight }]}>
                            <Image 
                              source={{ uri: pin.image }} 
                              style={[styles.cardImage, { width: pinWidth, height: pin.calculatedHeight }]}
                            />
                            
                            {/* Save Button Overlay */}
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                toggleSave(pin.id); 
                              }}
                              style={[styles.saveButton, isSaved ? styles.saveButtonSaved : styles.saveButtonDefault]}
                            >
                              <Text style={styles.saveButtonText}>
                                {isSaved ? '●' : '○'}
                              </Text>
                            </TouchableOpacity>
                            
                            {/* Top Right Menu */}
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                setActiveMenuId(isMenuOpen ? null : pin.id); 
                              }}
                              style={styles.menuButton}
                            >
                              <Text style={styles.menuButtonText}>•••</Text>
                            </TouchableOpacity>
                            
                            {isMenuOpen && (
                              <View style={styles.dropdownMenu}>
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
                                    alert(`Shared ${pin.title}!`); 
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
                                    window.open(pin.url, '_blank'); 
                                    setActiveMenuId(null); 
                                  }}
                                  style={styles.dropdownItem}
                                >
                                  <Text style={styles.dropdownItemText}>Open in browser</Text>
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
                    <Text style={styles.modalCloseText}>×</Text>
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
                        <Text style={styles.modalSaveButtonText}>
                          {selectedPin && savedIds.includes(selectedPin.id) ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.modalTitle}>{selectedPin?.title}</Text>
                    <Text style={styles.modalDescription}>
                      {selectedPin?.creator} · {selectedPin?.category}
                    </Text>
                    
                    <Text style={styles.modalLikes}>❤️ {selectedPin?.likes.toLocaleString()} saves</Text>
                    
                    <TouchableOpacity
                      onPress={() => {
                        // @ts-ignore
                        window.open(selectedPin?.url, '_blank');
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
            <TouchableOpacity style={styles.mobileSearch}>
              <Text>🔍</Text>
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
          
          {/* Mobile Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryContainer}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.categoryButton, activeCategory === cat ? styles.categoryButtonActive : styles.categoryButtonInactive]}
              >
                <Text style={[styles.categoryButtonText, activeCategory === cat ? styles.categoryButtonTextActive : styles.categoryButtonTextInactive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Mobile Grid */}
          <ScrollView contentContainerStyle={styles.mobileGridContainer}>
            <View style={styles.mobileGrid}>
              {filteredPins.map(pin => {
                const isSaved = savedIds.includes(pin.id);
                return (
                  <TouchableOpacity
                    key={pin.id}
                    onPress={() => setSelectedPin(pin)}
                    style={[styles.mobileCard, { width: pinWidth }]}
                  >
                    <View style={[styles.cardImageContainer, { width: pinWidth, height: pinWidth * 1.5 }]}>
                      <Image source={{ uri: pin.image }} style={[styles.cardImage, { width: pinWidth, height: pinWidth * 1.5 }]} />
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); toggleSave(pin.id); }}
                        style={[styles.saveButton, isSaved ? styles.saveButtonSaved : styles.saveButtonDefault]}
                      >
                        <Text style={styles.saveButtonText}>{isSaved ? '●' : '○'}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{pin.title}</Text>
                      <Text style={styles.creatorName}>{pin.creator}</Text>
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
              <View style={styles.mobileModalContent}>
                <TouchableOpacity
                  onPress={() => setSelectedPin(null)}
                  style={styles.modalClose}
                >
                  <Text style={styles.modalCloseText}>×</Text>
                </TouchableOpacity>
                <Image source={{ uri: selectedPin?.image || '' }} style={styles.mobileModalImage} resizeMode="contain" />
                <Text style={styles.mobileModalTitle}>{selectedPin?.title}</Text>
                <Text style={styles.mobileModalDescription}>{selectedPin?.creator} · {selectedPin?.category}</Text>
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
  },
  // Sidebar
  sidebar: {
    width: 80,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  searchBar: {
    backgroundColor: '#EFEFEF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 560,
  },
  searchInput: {
    fontSize: 16,
    color: '#111',
    width: '100%',
  },
  // Categories
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#E60023',
  },
  categoryButtonInactive: {
    backgroundColor: '#F0F0F0',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  categoryButtonTextInactive: {
    color: '#111',
  },
  // Grid
  gridContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    gap: 16,
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
    right: 64,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 200,
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
  creatorRow: {
    marginTop: 4,
  },
  creatorName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
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
  },
  modalImage: {
    width: '100%',
    height: '100%',
    maxHeight: 500,
  },
  modalDetails: {
    flex: 1,
    padding: 32,
    justifyContent: 'flex-start',
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
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalLikes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  modalVisitButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  modalVisitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  // Mobile Styles
  mobileContainer: {
    flex: 1,
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
    padding: 16,
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
  },
  mobileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  },
  mobileModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  mobileModalImage: {
    width: '100%',
    height: 300,
    marginBottom: 16,
    borderRadius: 12,
  },
  mobileModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  mobileModalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
