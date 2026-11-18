import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Modal, Platform, Pressable, Share, StatusBar, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

type Site = { id: string; title: string; maker: string; category: string; description: string; url: string; palette: [string, string, string]; mark: string };

// Public test sites for local development only. They are not approved production listings.
const SITES: Site[] = [
  {id:'nealfun',title:'Neal.fun',maker:'Neal Agarwal',category:'Web experiments',description:'Interactive curiosities and tiny browser games.',url:'https://neal.fun/',palette:['#405C52','#7FA16E','#D7D39A'],mark:'✳'},
  {id:'radiogarden',title:'Radio Garden',maker:'Radio Garden',category:'Interactive sound',description:'A globe full of radio stations.',url:'https://radio.garden/',palette:['#1E3D58','#3A7591','#E0C47C'],mark:'◉'},
  {id:'patatap',title:'Patatap',maker:'Jono Brandel',category:'Music and motion',description:'An audiovisual instrument for your keyboard.',url:'https://patatap.com/',palette:['#512E56','#A15C82','#ECB879'],mark:'♪'},
  {id:'pointerpointer',title:'Pointer Pointer',maker:'Moniker',category:'Interactive art',description:'A photo archive that follows your cursor.',url:'https://pointerpointer.com/',palette:['#6B4A3C','#BF8667','#E3C6A5'],mark:'↗'},
  {id:'thisissand',title:'This Is Sand',maker:'This Is Sand',category:'Creative tool',description:'Draw with falling colored sand.',url:'https://thisissand.com/',palette:['#665B38','#B59A5A','#EEE0A7'],mark:'〰'},
  {id:'zoomquilt',title:'Zoomquilt',maker:'Zoomquilt Collective',category:'Generative art',description:'A painting that continues forever.',url:'https://zoomquilt.org/',palette:['#423657','#7D6CA1','#D9BFCE'],mark:'◎'},
  {id:'musiclab',title:'Chrome Music Lab',maker:'Google Creative Lab',category:'Music experiment',description:'Visual ways to explore sound.',url:'https://musiclab.chromeexperiments.com/',palette:['#6B4933','#C88151','#EBCB8D'],mark:'♫'},
  {id:'pudding',title:'The Pudding',maker:'The Pudding',category:'Visual stories',description:'Culture and data through visual essays.',url:'https://pudding.cool/',palette:['#53634B','#91A475','#E2D6AF'],mark:'◌'},
  {id:'ciechanowski',title:'Bartosz Ciechanowski',maker:'Bartosz Ciechanowski',category:'Playable explainer',description:'Interactive science and engineering.',url:'https://ciechanow.ski/',palette:['#294E58','#6F99A1','#CAE0D8'],mark:'⌁'},
  {id:'ncase',title:'Nicky Case',maker:'Nicky Case',category:'Interactive story',description:'Things you can play to understand systems.',url:'https://ncase.me/',palette:['#713E4E','#BB6F77','#E5BCA2'],mark:'◇'},
  {id:'setosa',title:'Setosa',maker:'Setosa',category:'Visual explainer',description:'Friendly stories about algorithms.',url:'https://setosa.io/',palette:['#47664D','#82A470','#D5DCB7'],mark:'⌗'},
  {id:'squoosh',title:'Squoosh',maker:'Google Chrome Labs',category:'Image tool',description:'Compare image compression settings.',url:'https://squoosh.app/',palette:['#315568','#6F9CB2','#C9E0E7'],mark:'▧'},
  {id:'coolors',title:'Coolors',maker:'Coolors',category:'Color tool',description:'Create and save color palettes.',url:'https://coolors.co/',palette:['#683B54','#B16D86','#EDC6AC'],mark:'◒'},
  {id:'excalidraw',title:'Excalidraw',maker:'Excalidraw',category:'Creative tool',description:'A canvas for sketches and diagrams.',url:'https://excalidraw.com/',palette:['#5D6247','#A5A77A','#E6DEB1'],mark:'✎'},
  {id:'openprocessing',title:'OpenProcessing',maker:'OpenProcessing',category:'Creative coding',description:'A community gallery for code sketches.',url:'https://openprocessing.org/',palette:['#474564','#817FB0','#D0CEE8'],mark:'⌘'},
];

const STORE_KEY = 'scroll.demo.saved.v3';

function SiteArt({ site }: { site: Site }) {
  return <View style={[styles.art, { backgroundColor: site.palette[0] }]}><View style={[styles.blob, { backgroundColor: site.palette[1] }]} /><View style={[styles.ring, { borderColor: site.palette[2] }]} /><View style={[styles.ringSmall, { borderColor: site.palette[2] }]} /><Text style={[styles.mark, { color: site.palette[2] }]}>{site.mark}</Text><Text style={styles.artKicker}>SCROLL · PUBLIC DEMO</Text><Text style={styles.artFooter}>Open web, in progress</Text></View>;
}

function BrowserFrame({ site, onReady, onFailure }: { site: Site; onReady: () => void; onFailure: () => void }) {
  if (Platform.OS === 'web') return React.createElement('iframe', { src: site.url, title: site.title, onLoad: onReady, onError: onFailure, sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups', style: { height: '100%', width: '100%', border: 0, backgroundColor: '#fff' } });
  return <WebView source={{ uri: site.url }} onLoadEnd={onReady} onError={onFailure} onHttpError={event => event.nativeEvent.statusCode >= 400 && onFailure()} userAgent="ScrollPreview/1.0" />;
}

function ReelCard({ site, index, count, pageHeight, saved, onOpen, onSave, onShare }: { site: Site; index: number; count: number; pageHeight: number; saved: boolean; onOpen: () => void; onSave: () => void; onShare: () => void }) {
  return <View style={[styles.reel, { height: pageHeight }]}><Pressable style={styles.artPressable} onPress={onOpen}><SiteArt site={site}/><View style={styles.tint}/></Pressable><View pointerEvents="none" style={styles.topShade}/><View style={styles.reelHeader}><View style={styles.reelBrand}><View style={styles.logo}><Text style={styles.logoText}>s</Text></View><Text style={styles.reelBrandText}>scroll</Text></View><Text style={styles.reelCount}>{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</Text></View><View style={styles.reelMeta}><View style={styles.categoryPill}><View style={styles.liveDot}/><Text style={styles.categoryText}>{site.category.toUpperCase()}</Text></View><Text style={styles.demoText}>LOCAL DEMO</Text></View><View style={styles.bottomShade}/><View style={styles.reelInfo}><Text style={styles.maker}>@{site.maker.replaceAll(' ', '').toLowerCase()}</Text><Text style={styles.title}>{site.title}</Text><Text style={styles.description}>{site.description}</Text><Pressable style={styles.openButton} onPress={onOpen}><Text style={styles.openButtonText}>OPEN LIVE SITE</Text><MaterialCommunityIcons name="arrow-up-right" size={18} color="#1A2018"/></Pressable></View><View style={styles.actionRail}><Pressable style={styles.railButton} onPress={onSave}><MaterialCommunityIcons name={saved ? 'bookmark' : 'bookmark-outline'} size={26} color={saved ? '#C8E77A' : '#fff'}/><Text style={styles.railText}>{saved ? 'Saved' : 'Save'}</Text></Pressable><Pressable style={styles.railButton} onPress={onShare}><MaterialCommunityIcons name="share-variant-outline" size={25} color="#fff"/><Text style={styles.railText}>Share</Text></Pressable><Pressable style={styles.railButton} onPress={onOpen}><MaterialCommunityIcons name="web" size={24} color="#fff"/><Text style={styles.railText}>Visit</Text></Pressable></View><View style={styles.swipeHint}><MaterialCommunityIcons name="chevron-down" size={16} color="#FFFFFFA8"/><Text style={styles.swipeText}>SWIPE FOR NEXT</Text></View></View>;
}

function App() {
  const { height } = useWindowDimensions();
  const pageHeight = Math.max(550, height);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Site | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [siteReady, setSiteReady] = useState(false);
  const [minimumPassed, setMinimumPassed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => { AsyncStorage.getItem(STORE_KEY).then(value => { if (value) setSavedIds(JSON.parse(value)); }).catch(() => {}); }, []);
  useEffect(() => { if (selected) { const id = setTimeout(() => setMinimumPassed(true), 5000); return () => clearTimeout(id); } }, [selected, reloadKey]);
  const results = useMemo(() => SITES.filter(site => `${site.title} ${site.maker} ${site.category}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const save = (id: string) => { const next = savedIds.includes(id) ? savedIds.filter(value => value !== id) : [...savedIds, id]; setSavedIds(next); AsyncStorage.setItem(STORE_KEY, JSON.stringify(next)).catch(() => {}); };
  const start = (site: Site) => { setSelected(site); setSiteReady(false); setMinimumPassed(false); setFailed(false); setReloadKey(value => value + 1); };
  const retry = () => { setSiteReady(false); setMinimumPassed(false); setFailed(false); setReloadKey(value => value + 1); };
  const liveVisible = siteReady && minimumPassed && !failed;

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}><StatusBar barStyle="light-content"/><FlatList data={results} renderItem={({ item, index }) => <ReelCard site={item} index={index} count={results.length} pageHeight={pageHeight} saved={savedIds.includes(item.id)} onOpen={() => start(item)} onSave={() => save(item.id)} onShare={() => Share.share({ title: item.title, message: `${item.title}: ${item.url}` }).catch(() => {})}/>} keyExtractor={item => item.id} pagingEnabled snapToInterval={pageHeight} decelerationRate="fast" showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No demo sites found</Text></View>}/><Pressable style={styles.searchButton} onPress={() => setSearchOpen(true)}><MaterialCommunityIcons name="magnify" size={23} color="#fff"/></Pressable><Modal visible={searchOpen} animationType="slide" transparent><SafeAreaView style={styles.searchSheet} edges={['top','left','right']}><View style={styles.searchHeader}><Text style={styles.searchTitle}>Find a site</Text><Pressable onPress={() => { setSearchOpen(false); setQuery(''); }}><MaterialCommunityIcons name="close" size={24} color="#2D332C"/></Pressable></View><View style={styles.inputRow}><MaterialCommunityIcons name="magnify" size={20} color="#72776F"/><TextInput value={query} onChangeText={setQuery} autoFocus placeholder="Search 15 demo sites" placeholderTextColor="#92978D" style={styles.input}/></View><FlatList data={results} keyExtractor={item => item.id} renderItem={({ item }) => <Pressable style={styles.searchItem} onPress={() => { setSearchOpen(false); setQuery(''); start(item); }}><Text style={styles.searchItemCategory}>{item.category.toUpperCase()}</Text><Text style={styles.searchItemTitle}>{item.title}</Text><Text style={styles.searchItemMaker}>{item.maker}</Text></Pressable>}/></SafeAreaView></Modal><Modal visible={selected !== null} animationType="slide" onRequestClose={() => setSelected(null)}>
  {selected && (
    <View style={styles.fullScreenModal}>
      <View style={styles.fullScreenWebView}>
        <BrowserFrame
          key={`${selected.id}-${reloadKey}`}
          site={selected}
          onReady={() => setSiteReady(true)}
          onFailure={() => setFailed(true)}
        />
        {!liveVisible && (
          <View style={styles.gate}>
            <SiteArt site={selected} />
            <View style={styles.gateTint} />
            <View style={styles.gatePanel}>
              <View style={styles.gateTop}>
                <ActivityIndicator color="#D8F18B" />
                <Text style={styles.gateStatus}>
                  {failed ? 'This site cannot open here' : siteReady ? 'Site is ready' : 'Loading live website'}
                </Text>
              </View>
              <Text style={styles.gateDescription}>
                {failed ? 'Some sites block embedded browsing. You can still open this one in your browser.' : minimumPassed ? 'Opening now that the site is ready.' : 'Previewing for five seconds before opening.'}
              </Text>
              {failed ? (
                <View style={styles.gateActions}>
                  <Pressable style={styles.gateButton} onPress={retry}>
                    <Text style={styles.gateButtonText}>RETRY</Text>
                  </Pressable>
                  <Pressable style={styles.gateButton} onPress={() => Linking.openURL(selected.url).catch(() => {})}>
                    <Text style={styles.gateButtonText}>OPEN IN BROWSER</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.gateActions}>
                  <Pressable style={styles.gateButton} onPress={() => setMinimumPassed(true)}>
                    <Text style={styles.gateButtonText}>OPEN NOW</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Floating Overlay: Back Button (Top-Left) */}
      <Pressable onPress={() => setSelected(null)} style={styles.floatingBackBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
      </Pressable>

      {/* Floating Overlay: Info & Actions Card (Bottom) */}
      <View style={styles.floatingInfoCard} pointerEvents="box-none">
        <View style={styles.floatingInfoInner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.floatingCategory}>{selected.category.toUpperCase()}</Text>
            <Text style={styles.floatingTitle}>{selected.title}</Text>
            <Text style={styles.floatingMaker} numberOfLines={1}>by {selected.maker} · {selected.description}</Text>
          </View>
          <View style={styles.floatingActions}>
            <Pressable onPress={() => save(selected.id)} style={styles.floatingActionBtn}>
              <MaterialCommunityIcons
                name={savedIds.includes(selected.id) ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={savedIds.includes(selected.id) ? '#D8F18B' : '#fff'}
              />
              <Text style={[styles.floatingActionText, savedIds.includes(selected.id) && { color: '#D8F18B' }]}>
                {savedIds.includes(selected.id) ? 'SAVED' : 'SAVE'}
              </Text>
            </Pressable>
            <Pressable onPress={() => Share.share({ title: selected.title, message: `${selected.title}: ${selected.url}` }).catch(() => {})} style={styles.floatingActionBtn}>
              <MaterialCommunityIcons name="share-variant-outline" size={20} color="#fff" />
              <Text style={styles.floatingActionText}>SHARE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )}
</Modal></SafeAreaView>;
}

export default function RootApp() { return <SafeAreaProvider><App /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#101410'},reel:{position:'relative',overflow:'hidden',backgroundColor:'#26372A'},artPressable:{...StyleSheet.absoluteFill},art:{flex:1,overflow:'hidden',justifyContent:'space-between',padding:24},blob:{position:'absolute',width:420,height:420,borderRadius:210,right:-120,top:-120,opacity:.82},ring:{position:'absolute',width:270,height:270,borderRadius:135,borderWidth:1,left:'12%',top:'30%',opacity:.8},ringSmall:{position:'absolute',width:124,height:124,borderRadius:62,borderWidth:1,right:'18%',top:'42%',opacity:.65},mark:{fontSize:112,fontWeight:'300',position:'absolute',alignSelf:'center',top:'38%'},artKicker:{color:'#FFFFFFB0',fontSize:10,letterSpacing:2,fontWeight:'800'},artFooter:{color:'#FFFFFFCC',fontSize:13,fontWeight:'600'},tint:{...StyleSheet.absoluteFill,backgroundColor:'#00000016'},topShade:{...StyleSheet.absoluteFill,backgroundColor:'#00000022',height:'28%'},bottomShade:{position:'absolute',left:0,right:0,bottom:0,height:'48%',backgroundColor:'#00000066'},reelHeader:{position:'absolute',top:14,left:20,right:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},reelBrand:{flexDirection:'row',alignItems:'center',gap:8},logo:{width:29,height:29,borderRadius:10,backgroundColor:'#D8F18B',alignItems:'center',justifyContent:'center'},logoText:{color:'#1B241B',fontSize:21,fontWeight:'900',fontStyle:'italic',marginTop:-2},reelBrandText:{color:'#F5F6EE',fontWeight:'800',fontSize:19,letterSpacing:-.8},reelCount:{color:'#FFFFFFD0',fontSize:10,letterSpacing:1.1,fontWeight:'800'},reelMeta:{position:'absolute',top:66,left:20,right:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},categoryPill:{backgroundColor:'#10151099',borderWidth:1,borderColor:'#FFFFFF2B',borderRadius:18,paddingHorizontal:10,paddingVertical:7,flexDirection:'row',gap:6,alignItems:'center'},liveDot:{height:5,width:5,borderRadius:4,backgroundColor:'#D8F18B'},categoryText:{color:'#F1F3EB',fontSize:9,letterSpacing:1.1,fontWeight:'800'},demoText:{color:'#FFFFFF9E',fontSize:8,letterSpacing:1,fontWeight:'800'},reelInfo:{position:'absolute',left:20,right:85,bottom:72},maker:{color:'#E1E7D9',fontSize:12,fontWeight:'700'},title:{color:'#fff',fontSize:34,fontWeight:'900',letterSpacing:-1.1,marginTop:5},description:{color:'#F5F6F0',fontSize:13,lineHeight:19,marginTop:6,maxWidth:330},openButton:{alignSelf:'flex-start',marginTop:15,backgroundColor:'#D8F18B',borderRadius:9,height:43,paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:7},openButtonText:{color:'#1A2018',fontSize:10,letterSpacing:1,fontWeight:'900'},actionRail:{position:'absolute',right:14,bottom:84,alignItems:'center',gap:14},railButton:{alignItems:'center',gap:3,width:54},railText:{color:'#fff',fontSize:9,fontWeight:'700'},swipeHint:{position:'absolute',bottom:18,alignSelf:'center',alignItems:'center'},swipeText:{color:'#FFFFFFA8',fontSize:8,letterSpacing:1.2,fontWeight:'800'},searchButton:{position:'absolute',right:16,top:64,width:44,height:44,borderRadius:22,backgroundColor:'#151B15A8',borderWidth:1,borderColor:'#FFFFFF2B',alignItems:'center',justifyContent:'center'},empty:{alignItems:'center',paddingTop:100},emptyTitle:{color:'#fff',fontSize:17,fontWeight:'800'},searchSheet:{flex:1,backgroundColor:'#F4F3EC',padding:20},searchHeader:{height:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},searchTitle:{color:'#293029',fontSize:22,fontWeight:'900'},inputRow:{height:48,borderWidth:1,borderColor:'#DAD9D0',borderRadius:9,paddingHorizontal:12,alignItems:'center',flexDirection:'row',marginTop:7},input:{flex:1,height:'100%',fontSize:14,color:'#293029',marginLeft:8},searchItem:{paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#E1E0D8'},searchItemCategory:{fontSize:9,color:'#74816C',letterSpacing:1,fontWeight:'800'},searchItemTitle:{fontSize:18,color:'#293029',fontWeight:'800',marginTop:3},searchItemMaker:{fontSize:12,color:'#73786F',marginTop:3},browserSafe:{flex:1,backgroundColor:'#111611'},browserHeader:{height:61,backgroundColor:'#1B241B',flexDirection:'row',alignItems:'center',paddingHorizontal:10,gap:10},browserIcon:{height:40,width:40,alignItems:'center',justifyContent:'center'},browserTitleBlock:{flex:1},browserTitle:{color:'#F3F4EE',fontSize:14,fontWeight:'800'},browserSubtitle:{color:'#B5C0AD',fontSize:10,marginTop:2},browserBody:{flex:1,position:'relative',backgroundColor:'#fff'},gate:{...StyleSheet.absoluteFill},gateTint:{...StyleSheet.absoluteFill,backgroundColor:'#00000055'},gatePanel:{position:'absolute',bottom:24,left:18,right:18,backgroundColor:'#152015E8',borderRadius:14,padding:15},gateTop:{flexDirection:'row',alignItems:'center',gap:9},gateStatus:{color:'#F2F4EC',fontSize:13,fontWeight:'800'},gateDescription:{color:'#CCD3C5',fontSize:11,lineHeight:16,marginTop:10},progressTrack:{height:3,backgroundColor:'#FFFFFF35',marginTop:13,borderRadius:2},progressBar:{height:3,backgroundColor:'#D8F18B',borderRadius:2},gateActions:{flexDirection:'row',gap:9,marginTop:13},gateButton:{paddingHorizontal:11,paddingVertical:8,borderRadius:6,backgroundColor:'#D8F18B'},gateButtonText:{fontSize:9,fontWeight:'900',letterSpacing:.5,color:'#172016'},
  fullScreenModal: { flex: 1, backgroundColor: '#101410', position: 'relative' },
  fullScreenWebView: { flex: 1, position: 'relative', backgroundColor: '#fff' },
  floatingBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
    borderWidth: 1,
    borderColor: '#ffffff25',
  },
  floatingInfoCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#0c100cb8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff20',
    zIndex: 40,
  },
  floatingInfoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  floatingCategory: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, color: '#D8F18B' },
  floatingTitle: { fontSize: 17, fontWeight: '900', color: '#fff', marginTop: 2, letterSpacing: -.4 },
  floatingMaker: { fontSize: 11, color: '#CFD7C8', marginTop: 3 },
  floatingActions: { flexDirection: 'row', gap: 8 },
  floatingActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: '#ffffff18',
    borderWidth: 1,
    borderColor: '#ffffff30',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  floatingActionText: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.8 },
});
