import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Share, TextInput } from 'react-native';

// Demo-only sites for local feed/WebView testing. These are not owner-verified or approved for a public Scroll catalog.
const sites = [
  { title: 'Neal.fun', maker: 'Neal Agarwal', tag: 'WEB EXPERIMENTS', line: 'A playful collection of interactive curiosities and tiny games.', url: 'https://neal.fun/', mark: '✳', colors: ['#CDD3B4', '#879979', '#506859'] as [string,string,string] },
  { title: 'Radio Garden', maker: 'Radio Garden', tag: 'INTERACTIVE SOUND', line: 'Spin a globe and discover radio stations from around the world.', url: 'https://radio.garden/', mark: '◉', colors: ['#E6C9A8', '#B77D62', '#704D50'] as [string,string,string] },
  { title: 'Patatap', maker: 'Jono Brandel', tag: 'MUSIC & MOTION', line: 'An audiovisual instrument made for playful tapping.', url: 'https://patatap.com/', mark: '♪', colors: ['#CCD7D3', '#819C9A', '#4C6668'] as [string,string,string] },
  { title: 'Pointer Pointer', maker: 'Moniker', tag: 'INTERACTIVE ART', line: 'A curious camera trick that finds a finger pointing at your cursor.', url: 'https://pointerpointer.com/', mark: '↗', colors: ['#E5D6C5', '#B78567', '#725B50'] as [string,string,string] },
  { title: 'This Is Sand', maker: 'This Is Sand', tag: 'CREATIVE TOOL', line: 'Draw with falling grains of colored sand.', url: 'https://thisissand.com/', mark: '〰', colors: ['#E9D8A6', '#C39D61', '#756C4B'] as [string,string,string] },
  { title: 'Zoomquilt', maker: 'Zoomquilt Collective', tag: 'GENERATIVE ART', line: 'Step into a continuously unfolding collaborative painting.', url: 'https://zoomquilt.org/', mark: '◎', colors: ['#D4C8D8', '#9780A1', '#514D6B'] as [string,string,string] },
  { title: 'Chrome Music Lab', maker: 'Google Creative Lab', tag: 'MUSIC EXPERIMENT', line: 'Small, visual ways to explore rhythm, sound and melody.', url: 'https://musiclab.chromeexperiments.com/', mark: '♫', colors: ['#E5D6BC', '#D09B62', '#765D48'] as [string,string,string] },
  { title: 'The Pudding', maker: 'The Pudding', tag: 'VISUAL STORIES', line: 'A publication that explains ideas through visual essays.', url: 'https://pudding.cool/', mark: '◌', colors: ['#D8D3BE', '#AFA27D', '#66705C'] as [string,string,string] },
  { title: 'Bartosz Ciechanowski', maker: 'Bartosz Ciechanowski', tag: 'PLAYABLE EXPLAINER', line: 'Detailed interactive explanations of science and engineering.', url: 'https://ciechanow.ski/', mark: '⌁', colors: ['#D0D9D7', '#8BA5A3', '#4F686C'] as [string,string,string] },
  { title: 'Nicky Case', maker: 'Nicky Case', tag: 'INTERACTIVE STORY', line: 'Ideas about people and systems, told through things you can play.', url: 'https://ncase.me/', mark: '◇', colors: ['#E5C7B6', '#B88170', '#6C555B'] as [string,string,string] },
  { title: 'Setosa', maker: 'Setosa', tag: 'VISUAL EXPLAINER', line: 'Clear, interactive stories about statistics and algorithms.', url: 'https://setosa.io/', mark: '⌗', colors: ['#D6DFC5', '#9DAF7D', '#5F715B'] as [string,string,string] },
  { title: 'Squoosh', maker: 'Google Chrome Labs', tag: 'IMAGE TOOL', line: 'Compare image formats and compression settings side by side.', url: 'https://squoosh.app/', mark: '▧', colors: ['#D7DDE0', '#8DA9B8', '#526B7C'] as [string,string,string] },
  { title: 'Coolors', maker: 'Coolors', tag: 'COLOR TOOL', line: 'Explore and build color palettes with a few quick actions.', url: 'https://coolors.co/', mark: '◒', colors: ['#E4D0BD', '#C28E70', '#74616B'] as [string,string,string] },
  { title: 'Excalidraw', maker: 'Excalidraw', tag: 'CREATIVE TOOL', line: 'A friendly sketching canvas for quick diagrams and ideas.', url: 'https://excalidraw.com/', mark: '✎', colors: ['#DDD8C8', '#B6A982', '#6D7561'] as [string,string,string] },
  { title: 'OpenProcessing', maker: 'OpenProcessing', tag: 'CREATIVE CODING', line: 'A community gallery for sketches and code-based artwork.', url: 'https://openprocessing.org/', mark: '⌘', colors: ['#D3D2E1', '#9290B8', '#55546F'] as [string,string,string] },
];
const theme = { colors: { primary: '#596B4E', background: '#F5F3EC', surface: '#F5F3EC', onSurface: '#252923' } };

function AppContent() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [minTime, setMinTime] = useState(false);
  const [savedSites, setSavedSites] = useState<string[]>([]);
  const [followedMakers, setFollowedMakers] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<number[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const arrived = useRef(Date.now());
  const requestGeneration = useRef(0);
  const readyRef = useRef(false);
  const site = sites[index];
  const siteId = site.url;
  const saved = savedSites.includes(siteId);
  const following = followedMakers.includes(site.maker);
  const opened = ready && minTime && !failed;

  useEffect(() => {
    AsyncStorage.multiGet(['scroll.savedSites.v1','scroll.followedMakers.v1']).then(([savedValue,followedValue])=>{
      try { if(savedValue[1])setSavedSites(JSON.parse(savedValue[1])); } catch {}
      try { if(followedValue[1])setFollowedMakers(JSON.parse(followedValue[1])); } catch {}
    }).catch(()=>{}).finally(()=>setStorageLoaded(true));
  }, []);

  useEffect(() => {
    if(storageLoaded)AsyncStorage.setItem('scroll.savedSites.v1',JSON.stringify(savedSites)).catch(()=>{});
  },[savedSites,storageLoaded]);
  useEffect(() => {
    if(storageLoaded)AsyncStorage.setItem('scroll.followedMakers.v1',JSON.stringify(followedMakers)).catch(()=>{});
  },[followedMakers,storageLoaded]);

  useEffect(() => {
    const generation = ++requestGeneration.current;
    setReady(false); setMinTime(false); setFailed(false);
    readyRef.current = false;
    arrived.current = Date.now();
    const t = setTimeout(() => setMinTime(true), 5000);
    const timeout = setTimeout(() => { if(requestGeneration.current===generation&&!readyRef.current)setFailed(true); },15000);
    return () => { clearTimeout(t); clearTimeout(timeout); };
  }, [index,retry]);

  const next = () => { setHistory(h=>[...h,index]); setIndex(n=>(n+1)%sites.length); };
  const previous = () => { const prior=history[history.length-1]; if(prior===undefined)return; setHistory(h=>h.slice(0,-1)); setIndex(prior); };
  const toggleSaved = () => setSavedSites(v=>saved?v.filter(x=>x!==siteId):[...v,siteId]);
  const toggleFollowing = () => setFollowedMakers(v=>following?v.filter(x=>x!==site.maker):[...v,site.maker]);
  const shareSite = () => Share.share({title:site.title,message:`${site.title} — ${site.url}`}).catch(()=>{});
  const retryLoad = () => setRetry(v=>v+1);
  const onReady = () => { if(requestGeneration.current>0&&Date.now()-arrived.current>0){readyRef.current=true;setReady(true);} };
  const filteredSites = sites.filter(x=>`${x.title} ${x.maker} ${x.tag} ${x.line}`.toLowerCase().includes(query.toLowerCase()));
  const moveToFiltered = (item: typeof sites[number]) => { const target=sites.indexOf(item); if(target>=0){setHistory(h=>[...h,index]);setIndex(target);setSearching(false);setQuery('');} };
  const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap, size = 21, color = '#454B42') => <MaterialCommunityIcons name={name} size={size} color={color}/>;

  return <SafeAreaView style={s.page} edges={['top','left','right']}>
    <StatusBar style="dark" />
    <View style={s.topbar}>
      <View style={s.wordmark}><View style={s.logo}><Text style={s.logoText}>s</Text></View><Text style={s.brand}>scroll</Text><View style={s.divider}/><Text style={s.edition}>FIELD NOTES  /  001</Text></View>
      <Pressable style={s.search} accessibilityLabel="Search sites" onPress={()=>setSearching(v=>!v)}><MaterialCommunityIcons name={searching?'close':'magnify'} size={21} color="#50564E"/></Pressable>
    </View>
    {searching&&<View style={s.searchArea}><TextInput value={query} onChangeText={setQuery} placeholder="Search sites, makers, topics" placeholderTextColor="#8A8C83" autoFocus style={s.searchInput}/>{query.length>0&&filteredSites.map(item=><Pressable key={item.url} onPress={()=>moveToFiltered(item)} style={s.searchResult}><Text style={s.searchResultTitle}>{item.title}</Text><Text style={s.searchResultMaker}>{item.maker} · {item.tag}</Text></Pressable>)}</View>}
    <View style={s.intro}><Text style={s.eyebrow}>A MORE CURIOUS WEB</Text><Text style={s.headline}>Somewhere{ '\n'}worth wandering.</Text><Text style={s.subhead}>15 public demo sites for local testing · not owner-verified.</Text></View>
    <View style={s.filters}><Text style={s.filterActive}>DEMO CATALOG</Text><Text style={s.filterDot}>·</Text><Text style={s.filter}>VISUAL</Text><Text style={s.filterDot}>·</Text><Text style={s.filter}>INTERACTIVE</Text><View style={s.filterSpacer}/><Text style={s.count}>{String(index+1).padStart(2,'0')} / 15</Text></View>
    <View style={s.feature}>
      <WebView key={`${index}-${retry}`} source={{uri:site.url}} style={[StyleSheet.absoluteFill,{opacity:opened?1:0}]} originWhitelist={['https://*']} javaScriptEnabled domStorageEnabled userAgent="ScrollPreview/1.0" onLoadEnd={onReady} onError={()=>setFailed(true)} onHttpError={(e)=>{if(e.nativeEvent.statusCode>=400)setFailed(true)}} />
      {!opened && <LinearGradient colors={site.colors} style={s.art}>
        <View style={s.artHeader}><Text style={s.artOverline}>AN INTERNET OBJECT</Text><Text style={s.artNumber}>Nº 0{index+1}</Text></View>
        <View style={s.artCenter}><View style={s.sunHalo}/><View style={s.sun}/><View style={s.planet}/><View style={s.orbitLine}/><Text style={s.artGlyph}>{site.mark}</Text></View>
        <View style={s.artCaption}><View style={s.artRule}/><Text style={s.artCaptionText}>A little corner of the internet</Text><MaterialCommunityIcons name="arrow-top-left" size={17} color="#F7F1E5"/></View>
      </LinearGradient>}
      <View style={s.featureTop}><View style={s.tag}><View style={s.tagDot}/><Text style={s.tagText}>{site.tag}</Text></View><Text style={s.disclosure}>PUBLIC DEMO</Text></View>
      {!opened && <View style={s.load}><View style={s.loadRow}><View style={[s.loadDot,ready&&s.loadDotReady]}/><Text style={s.loadText}>{failed?'Site could not be opened':ready?'Ready to explore':'Opening the live site'}</Text><Text style={s.loadTime}>{minTime?'':'5 sec minimum'}</Text></View><ProgressBar progress={ready?1:0.32} color="#F6F0E2" style={s.progress}/>{failed&&<View style={s.errorActions}><Pressable onPress={retryLoad}><Text style={s.errorActionText}>RETRY</Text></Pressable><Pressable onPress={()=>Linking.openURL(site.url).catch(()=>{})}><Text style={s.errorActionText}>OPEN IN BROWSER</Text></Pressable><Pressable onPress={next}><Text style={s.errorActionText}>SKIP</Text></Pressable></View>}</View>}
      {opened && <Pressable onPress={next} style={s.nextButton} accessibilityLabel="Next website">{icon('arrow-right',22,'#F7F4EC')}</Pressable>}
    </View>
    <View style={s.details}>
      <View style={s.creatorLine}><View style={s.avatar}><Text style={s.avatarText}>{site.maker.split(' ').map(v=>v[0]).join('')}</Text></View><Text style={s.by}>A site by </Text><Text style={s.maker}>{site.maker}</Text><Pressable onPress={toggleFollowing} style={s.follow}><Text style={s.followText}>{following?'FOLLOWING':'FOLLOW +'}</Text></Pressable></View>
      <Text style={s.title}>{site.title}</Text><Text style={s.description}>{site.line}</Text>
      <View style={s.actions}><Pressable onPress={toggleSaved} style={s.saveAction}>{icon(saved?'bookmark':'bookmark-outline',18,saved?'#596B4E':'#50564E')}<Text style={s.saveText}>{saved?'SAVED TO YOUR LIBRARY':'SAVE FOR LATER'}</Text></Pressable><View style={s.actionGap}/><Pressable onPress={shareSite} style={s.shareAction}>{icon('share-variant-outline',18)}<Text style={s.saveText}>SHARE</Text></Pressable><View style={s.actionGap}/><Pressable disabled={!history.length} onPress={previous} style={{opacity:history.length?1:.35}}>{icon('arrow-left',18)}</Pressable><Text style={s.siteNo}>SITE 0{index+1}</Text></View>
    </View>
    <View style={s.bottom}><Text style={s.bottomLabel}>DEMO CATALOG · NOT OWNER-VERIFIED</Text><Pressable onPress={next} style={s.skip}><Text style={s.skipText}>NEXT DISCOVERY</Text>{icon('arrow-right',16,'#596B4E')}</Pressable></View>
  </SafeAreaView>;
}

export default function App(){return <PaperProvider theme={theme}><AppContent/></PaperProvider>}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#F5F3EC',paddingHorizontal:22},topbar:{height:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},wordmark:{flexDirection:'row',alignItems:'center'},logo:{width:26,height:26,borderRadius:9,backgroundColor:'#596B4E',alignItems:'center',justifyContent:'center'},logoText:{fontSize:20,fontWeight:'900',fontStyle:'italic',color:'#F7F5EE',marginTop:-2},brand:{fontSize:18,fontWeight:'800',letterSpacing:-.7,color:'#292D27',marginLeft:8},divider:{height:16,width:1,backgroundColor:'#D6D5CA',marginHorizontal:12},edition:{fontSize:9,letterSpacing:1.4,color:'#84877C',fontWeight:'700'},search:{width:36,height:36,borderWidth:1,borderColor:'#DEDDD4',borderRadius:18,alignItems:'center',justifyContent:'center'},searchArea:{backgroundColor:'#fff',padding:12,borderWidth:1,borderColor:'#E3E1D8',zIndex:10},searchInput:{height:36,color:'#292D27'},searchResult:{paddingVertical:9,borderTopWidth:1,borderTopColor:'#EEECE5'},searchResultTitle:{color:'#292D27',fontSize:12,fontWeight:'700'},searchResultMaker:{color:'#7C7E73',fontSize:10,marginTop:3},errorActions:{flexDirection:'row',justifyContent:'space-between',marginTop:9},errorActionText:{fontSize:8,color:'#F7F1E5',fontWeight:'800',letterSpacing:.6},intro:{paddingTop:17,paddingBottom:14},eyebrow:{fontSize:9,letterSpacing:2.2,color:'#64745B',fontWeight:'800'},headline:{fontSize:34,lineHeight:36,letterSpacing:-1.25,color:'#282D26',fontWeight:'700',marginTop:8},subhead:{fontSize:12,color:'#77796F',marginTop:8},filters:{height:30,flexDirection:'row',alignItems:'center',gap:9},filterActive:{fontSize:9,letterSpacing:1,color:'#394632',fontWeight:'800'},filter:{fontSize:9,letterSpacing:1,color:'#9A9B91',fontWeight:'700'},filterDot:{fontSize:13,color:'#C4C3B8'},filterSpacer:{flex:1},count:{fontSize:9,letterSpacing:1,color:'#808378',fontWeight:'700'},feature:{flex:1,minHeight:225,maxHeight:360,borderRadius:4,overflow:'hidden',backgroundColor:'#819979',position:'relative',marginTop:4},art:{flex:1,justifyContent:'space-between',padding:18},artHeader:{flexDirection:'row',justifyContent:'space-between'},artOverline:{color:'#F8F5EBB0',fontSize:8,letterSpacing:1.8,fontWeight:'700'},artNumber:{color:'#F8F5EBB0',fontSize:9,letterSpacing:1.2},artCenter:{flex:1,alignItems:'center',justifyContent:'center'},sunHalo:{width:160,height:160,borderRadius:80,backgroundColor:'#EDE5C326',position:'absolute'},sun:{width:96,height:96,borderRadius:48,backgroundColor:'#E8D7A7',position:'absolute',opacity:.92},planet:{width:38,height:38,borderRadius:19,backgroundColor:'#AE8061',position:'absolute',left:'29%',top:'28%',borderWidth:6,borderColor:'#E8D7A755'},orbitLine:{width:210,height:80,borderWidth:1,borderColor:'#F4EEDB99',borderRadius:100,transform:[{rotate:'-28deg'}],position:'absolute'},artGlyph:{fontSize:36,color:'#485B4B',fontWeight:'300',position:'absolute',bottom:'20%',right:'30%'},artCaption:{flexDirection:'row',alignItems:'center',gap:8},artRule:{height:1,width:22,backgroundColor:'#F7F1E5'},artCaptionText:{fontSize:10,color:'#F7F1E5',letterSpacing:.3},featureTop:{position:'absolute',top:13,left:14,right:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},tag:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#F5F3EADD',paddingHorizontal:9,paddingVertical:7,borderRadius:2},tagDot:{width:5,height:5,borderRadius:3,backgroundColor:'#627755'},tagText:{fontSize:8,letterSpacing:1,color:'#394632',fontWeight:'800'},disclosure:{fontSize:8,color:'#F8F5EB',letterSpacing:1.2,fontWeight:'700'},load:{position:'absolute',bottom:13,left:14,right:14,backgroundColor:'#28352DBB',paddingHorizontal:11,paddingVertical:9,borderRadius:3},loadRow:{flexDirection:'row',alignItems:'center',gap:7},loadDot:{width:5,height:5,borderRadius:3,backgroundColor:'#E6D69F'},loadDotReady:{backgroundColor:'#AFC68D'},loadText:{fontSize:9,color:'#F8F5EB',fontWeight:'600',flex:1},loadTime:{fontSize:8,color:'#E6E0D1A8'},progress:{height:2,marginTop:7,backgroundColor:'#FFFFFF3A'},nextButton:{position:'absolute',right:14,bottom:14,width:40,height:40,borderRadius:20,backgroundColor:'#394B3F',alignItems:'center',justifyContent:'center'},details:{paddingTop:13},creatorLine:{height:30,flexDirection:'row',alignItems:'center'},avatar:{width:22,height:22,borderRadius:11,backgroundColor:'#DED5BE',alignItems:'center',justifyContent:'center'},avatarText:{fontSize:8,color:'#4D5849',fontWeight:'800'},by:{fontSize:10,color:'#93948A',marginLeft:7},maker:{fontSize:10,color:'#444A41',fontWeight:'700'},follow:{marginLeft:'auto',borderBottomWidth:1,borderBottomColor:'#89927F',paddingBottom:3},followText:{fontSize:8,letterSpacing:1,color:'#596B4E',fontWeight:'800'},title:{fontSize:24,letterSpacing:-.7,color:'#292D27',fontWeight:'700',marginTop:5},description:{fontSize:12,lineHeight:18,color:'#74766E',marginTop:3},actions:{height:45,borderTopWidth:1,borderBottomWidth:1,borderColor:'#E3E1D8',marginTop:12,flexDirection:'row',alignItems:'center'},saveAction:{flexDirection:'row',alignItems:'center',gap:7},shareAction:{flexDirection:'row',alignItems:'center',gap:7},saveText:{fontSize:8,letterSpacing:.8,color:'#65695F',fontWeight:'700'},actionGap:{height:16,width:1,backgroundColor:'#DCDAD0',marginHorizontal:13},siteNo:{marginLeft:'auto',fontSize:8,letterSpacing:1,color:'#929489'},bottom:{height:38,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},bottomLabel:{fontSize:8,letterSpacing:1.4,color:'#A0A197',fontWeight:'700'},skip:{flexDirection:'row',alignItems:'center',gap:6},skipText:{fontSize:8,letterSpacing:1,color:'#596B4E',fontWeight:'800'}
});
