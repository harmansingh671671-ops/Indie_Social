import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';

interface Pin {
  id: string;
  title: string;
  creator: string;
  category: string;
  image: string;
  url: string;
  likes: number;
}

const PINS: Pin[] = [
  { id: '1', title: 'Minimalist Habit Tracker Widget', creator: 'Odyssey Studio', category: 'Productivity', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', url: 'https://neal.fun', likes: 342 },
  { id: '2', title: 'Live Dynamic Wallpaper Concept', creator: 'PixelCraft', category: 'Wallpaper', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80', url: 'https://radio.garden', likes: 812 },
  { id: '3', title: 'Glassmorphic Day Planner Dashboard', creator: 'Elena R.', category: 'Planner', image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80', url: 'https://patatap.com', likes: 520 },
  { id: '4', title: 'Timeline & Streak Visualizer', creator: 'Studio Mono', category: 'Productivity', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', url: 'https://pointerpointer.com', likes: 194 },
  { id: '5', title: 'Ambient Forest Soundscape', creator: 'Aura Beats', category: 'Audio', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', url: 'https://thisissand.com', likes: 673 },
  { id: '6', title: 'Productivity Analytics UI', creator: 'MetricLabs', category: 'Analytics', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80', url: 'https://zoomquilt.org', likes: 429 },
  { id: '7', title: 'Generative Canvas Art Toy', creator: 'Silk Labs', category: 'Art', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80', url: 'https://weavesilk.com', likes: 920 },
  { id: '8', title: 'Falling Sand Cellular Automata', creator: 'Max Bittker', category: 'Simulation', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', url: 'https://sandspiel.club', likes: 480 },
];

const CATEGORIES = ['All', 'Productivity', 'Wallpaper', 'Planner', 'Audio', 'Analytics', 'Art', 'Simulation'];
const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function App() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredPins = PINS.filter(p => 
    (activeCategory === 'All' || p.category === activeCategory) && 
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate number of columns based on screen width
  const getColumns = () => {
    if (width >= 1200) return 4;
    if (width >= 768) return 3;
    return 2;
  };

  // Masonry grid layout
  const renderMasonryGrid = () => {
    const columns = getColumns();
    const columnItems: Pin[][] = Array.from({ length: columns }, () => []);
    
    filteredPins.forEach((pin, index) => {
      columnItems[index % columns].push(pin);
    });

    return (
      <View style={styles.gridContainer}>
        {columnItems.map((column, colIndex) => (
          <View key={colIndex} style={styles.column}>
            {column.map(pin => {
              const isSaved = savedIds.includes(pin.id);
              const isMenuOpen = activeMenuId === pin.id;

              return (
                <TouchableOpacity
                  key={pin.id}
                  onPress={() => setSelectedPin(pin)}
                  style={styles.card}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardImageContainer}>
                    <Image source={{ uri: pin.image }} style={styles.cardImage} />
                    
                    {/* Overlay on hover (web) */}
                    <View style={styles.overlay}>
                      <View style={styles.overlayTop}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{pin.category}</Text>
                        </View>
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
                              <Text style={styles.dropdownItemText}>{isSaved ? '📌 Saved' : '🔖 Save'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                alert(`Shared ${pin.title}!`); 
                                setActiveMenuId(null); 
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>🔗 Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={(e) => { 
                                e.stopPropagation(); 
                                // @ts-ignore - window is available in web
                                window.open(pin.url, '_blank'); 
                                setActiveMenuId(null); 
                              }}
                              style={styles.dropdownItem}
                            >
                              <Text style={styles.dropdownItemText}>🌐 Visit Web</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.overlayBottom}>
                        <View style={styles.urlBadge}>
                          <Text style={styles.urlText}>🔗 {pin.url.replace('https://', '').split('/')[0]}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => { 
                            e.stopPropagation(); 
                            toggleSave(pin.id); 
                          }}
                          style={[styles.saveButton, isSaved ? styles.saveButtonSaved : styles.saveButtonDefault]}
                        >
                          <Text style={styles.saveButtonText}>{isSaved ? 'Saved' : 'Save'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{pin.title}</Text>
                    <View style={styles.creatorRow}>
                      <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80' }} style={styles.creatorAvatar} />
                      <Text style={styles.creatorName} numberOfLines={1}>{pin.creator}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>O</Text>
          </View>
          <Text style={styles.headerTitle}>Odyssey Pinterest Feed</Text>
          {!isMobile && (
            <View style={styles.nav}>
              <TouchableOpacity style={styles.navButtonActive}>
                <Text style={styles.navButtonTextActive}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>Explore</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {!isMobile && (
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search minimalist habit widgets, day planners, wallpapers..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#999"
            />
          </View>
        )}
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Text>💬</Text>
          </TouchableOpacity>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }} style={styles.profileAvatar} />
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
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

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {filteredPins.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No pins found</Text>
          </View>
        ) : (
          renderMasonryGrid()
        )}
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
              <Image source={{ uri: selectedPin?.image || '' }} style={styles.modalImage} />
            </View>
            
            <View style={styles.modalDetails}>
              <View style={styles.modalHeader}>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => toggleSave(selectedPin?.id || '')}
                    style={[styles.modalSaveButton, savedIds.includes(selectedPin?.id || '') ? styles.modalSaveButtonSaved : styles.modalSaveButtonDefault]}
                  >
                    <Text style={styles.modalSaveButtonText}>
                      {savedIds.includes(selectedPin?.id || '') ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.modalCategory}>{selectedPin?.category}</Text>
              <Text style={styles.modalTitle}>{selectedPin?.title}</Text>
              <Text style={styles.modalDescription}>
                Experience the live interactive widget and seamless day planning experience built for Odyssey creators.
              </Text>
              
              <View style={styles.modalCreator}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }} style={styles.modalCreatorAvatar} />
                <View style={styles.modalCreatorInfo}>
                  <Text style={styles.modalCreatorName}>{selectedPin?.creator}</Text>
                  <Text style={styles.modalCreatorFollowers}>14.2K Followers</Text>
                </View>
                <TouchableOpacity style={styles.modalFollowButton}>
                  <Text style={styles.modalFollowButtonText}>Follow</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalFooter}>
                <Text style={styles.modalLikes}>❤️ {selectedPin?.likes} Likes</Text>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E60023',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E60023',
  },
  nav: {
    flexDirection: 'row',
    gap: 4,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  navButtonActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  navButtonTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  searchContainer: {
    flex: 1,
    maxWidth: 400,
  },
  searchInput: {
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: '#E9E9E9',
    borderRadius: 20,
    fontSize: 14,
    color: '#111',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 18,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  // Categories
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#111',
  },
  categoryButtonInactive: {
    backgroundColor: '#F0F0F0',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  categoryButtonTextInactive: {
    color: '#111',
  },
  // Content
  content: {
    padding: 16,
  },
  // Grid
  gridContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 16,
  },
  // Card
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'space-between',
    padding: 16,
  },
  overlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    width: 144,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  overlayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urlBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  urlText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDefault: {
    backgroundColor: '#E60023',
  },
  saveButtonSaved: {
    backgroundColor: '#111',
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111',
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  creatorName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 800,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#111',
    fontWeight: '300',
  },
  modalImageContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    maxHeight: 400,
  },
  modalDetails: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalSaveButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
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
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  modalCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginTop: 12,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 24,
  },
  modalCreatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
  },
  modalCreatorInfo: {
    flex: 1,
  },
  modalCreatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  modalCreatorFollowers: {
    fontSize: 12,
    color: '#666',
  },
  modalFollowButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#111',
    borderRadius: 20,
  },
  modalFollowButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  modalLikes: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  modalVisitButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  modalVisitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
});
