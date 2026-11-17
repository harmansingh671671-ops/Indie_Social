import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, IconButton, PaperProvider, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

type Site = { title: string; creator: string; handle: string; category: string; description: string; url: string; colors: [string, string, ...string[]]; symbol: string; }

const sites: Site[] = [
  { title: 'A Garden That Thinks', creator: 'Mira Chen', handle: '@miramakes', category: 'GENERATIVE ART', description: 'A quiet little world that grows differently every time you visit.', url: 'https://example.org', colors: ['#152D2A', '#4A8C6A', '#D7A66B'], symbol: '✳' },
  { title: 'Tiny Planet Radio', creator: 'Studio Orbit', handle: '@studioorbit', category: 'INTERACTIVE SOUND', description: 'Turn the planets. Find a signal. Stay for the strange little songs.', url: 'https://example.com', colors: ['#171934', '#5552A0', '#E8A36C'], symbol: '◉' },
  { title: 'The Useful Machine', creator: 'Dev Patel', handle: '@devbuilds', category: 'PLAYFUL TOOL', description: 'A small, thoughtful tool for making something out of nothing.', url: 'https://example.net', colors: ['#292118', '#B46A43', '#E2C889'], symbol: '⌘' },
];

const theme = { colors: { primary: '#C6F36B', onPrimary: '#171A15', background: '#0D100E', surface: '#171B18', onSurface: '#F3F0E8', outline: '#363D37' } };
const MIN_REVIEW_MS = 5000;

function FeedScreen() {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(false);
  const [elapsed, setElapsed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState('For you');
  const arrivedAt = useRef(Date.now());
  const site = sites[index % sites.length];
  const opened = ready && elapsed;
  const webKey = `${index}`;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setReady(false); setElapsed(false); setFailed(false); setLiked(false); setSaved(false);
    arrivedAt.current = Date.now();
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: MIN_REVIEW_MS, useNativeDriver: false }).start();
    const timer = setTimeout(() => setElapsed(true), MIN_REVIEW_MS);
    return () => clearTimeout(timer);
  }, [index, progress]);

  const next = () => setIndex((v) => v + 1);
  const status = failed ? 'Taking longer than expected' : opened ? 'You’re in' : ready ? 'Ready when you are' : 'Finding its footing';

  return <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
    <StatusBar style="light" />
    <View style={s.header}>
      <View style={s.brand}><View style={s.brandMark}><Text style={s.brandMarkText}>s</Text></View><Text style={s.brandName}>scroll</Text></View>
      <View style={s.headerRight}><IconButton icon="magnify" iconColor="#E9EDE6" size={23} onPress={() => {}} /><IconButton icon="account-circle-outline" iconColor="#E9EDE6" size={23} onPress={() => {}} /></View>
    </View>
    <View style={s.tabs}>{['For you', 'Following', 'Collections'].map((x) => <Pressable key={x} onPress={() => setTab(x)} style={[s.tab, tab === x && s.tabOn]}><Text style={[s.tabText, tab === x && s.tabTextOn]}>{x}</Text></Pressable>)}</View>
    <View style={s.card}>
      <WebView key={webKey} source={{ uri: site.url }} style={[StyleSheet.absoluteFill, { opacity: opened ? 1 : 0 }]} onLoadEnd={() => { if (Date.now() - arrivedAt.current > 1000) setReady(true); }} onError={() => setFailed(true)} onHttpError={(e) => { if (e.nativeEvent.statusCode >= 400) setFailed(true); }} javaScriptEnabled domStorageEnabled allowsBackForwardNavigationGestures originWhitelist={['https://*']} userAgent="ScrollPreview/1.0" />
      {!opened && <View style={StyleSheet.absoluteFill} pointerEvents="none"><LinearGradient colors={site.colors} style={s.art}>
        <View style={s.artTop}><Text style={s.artLabel}>A SMALL WEB DISCOVERY</Text><View style={s.livePill}><View style={s.liveDot}/><Text style={s.liveText}>LIVE SITE</Text></View></View>
        <View style={s.artCenter}><View style={[s.orbit,s.orbit1]}/><View style={[s.orbit,s.orbit2]}/><View style={[s.orbit,s.orbit3]}/><Text style={s.artSymbol}>{site.symbol}</Text><View style={[s.artSpark,s.spark1]}/><View style={[s.artSpark,s.spark2]}/><View style={[s.artSpark,s.spark3]}/></View>
        <View style={s.artBottom}><Text style={s.artTiny}>MADE FOR THE CURIOUS</Text><Text style={s.artFoot}>A little corner of the internet ↗</Text></View>
      </LinearGradient></View>}
      {!opened && <View style={s.scrim} pointerEvents="none"/>}
      <View style={s.cardTop}><View style={s.categoryPill}><Text style={s.categoryText}>{site.category}</Text></View><IconButton icon="dots-horizontal" iconColor="#FFF" size={22} onPress={() => {}} style={s.more}/></View>
      <View style={s.cardBottom}>
        {!opened && <View style={s.reviewPanel}>
          <View style={s.statusRow}><View style={s.statusDot}/><Text style={s.statusText}>{status}</Text><Text style={s.timeText}>{elapsed ? '·' : '· 5 sec min'}</Text></View>
          <ProgressBar progress={opened ? 1 : ready ? 1 : 0.38} color="#C6F36B" style={s.progress}/>
          {failed && <Text style={s.errorText}>The live site is slow. You can retry or open it in your browser.</Text>}
        </View>}
        <View style={s.creatorRow}><View style={s.avatar}><Text style={s.avatarText}>{site.creator.split(' ').map(p => p[0]).join('')}</Text></View><View style={s.creatorInfo}><Text style={s.creatorName}>{site.creator}</Text><Text style={s.creatorHandle}>{site.handle}  ·  <Text style={s.aiLabel}>Human-made</Text></Text></View><Button mode="outlined" compact textColor="#F2F3EE" style={s.follow} contentStyle={{ height: 34 }} labelStyle={s.followLabel} onPress={() => {}}>Follow</Button></View>
        <Text style={s.siteTitle}>{site.title}</Text><Text style={s.description}>{site.description}</Text>
      </View>
      {opened && <Pressable style={s.nextArrow} accessibilityRole="button" accessibilityLabel="Next website" onPress={next}><Icon source="arrow-down" size={23} color="#151813"/></Pressable>}
      {!opened && <View style={s.actionRail}><IconButton icon={liked ? 'heart' : 'heart-outline'} iconColor={liked ? '#FF7D73' : '#FFF'} size={27} onPress={() => setLiked(!liked)}/><Text style={s.railCount}>{liked ? '1' : 'Like'}</Text><IconButton icon={saved ? 'bookmark' : 'bookmark-outline'} iconColor={saved ? '#C6F36B' : '#FFF'} size={25} onPress={() => setSaved(!saved)}/><Text style={s.railCount}>Save</Text><IconButton icon="share-variant-outline" iconColor="#FFF" size={24} onPress={() => {}}/><Text style={s.railCount}>Share</Text></View>}
    </View>
    <View style={s.footer}><Text style={s.footerHint}>{opened ? 'Explore at your own pace' : 'Independent sites, found one at a time'}</Text>{failed && <Button compact textColor="#C6F36B" onPress={() => setIndex((v) => v)}>Retry</Button>}<View style={s.footerRight}><Pressable onPress={next} style={s.skip}><Text style={s.skipText}>Skip</Text><Icon source="chevron-right" size={18} color="#B8C0B8"/></Pressable></View></View>
  </SafeAreaView>;
}

export default function App() { return <PaperProvider theme={theme}><FeedScreen/></PaperProvider>; }

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#0D100E',paddingHorizontal:16},header:{height:54,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},brand:{flexDirection:'row',alignItems:'center',gap:9},brandMark:{width:29,height:29,borderRadius:10,backgroundColor:'#C6F36B',alignItems:'center',justifyContent:'center',transform:[{rotate:'-8deg'}]},brandMarkText:{fontSize:22,fontWeight:'900',color:'#151813',fontStyle:'italic',marginTop:-2},brandName:{fontSize:20,fontWeight:'800',color:'#F2F3EE',letterSpacing:-1},headerRight:{flexDirection:'row',alignItems:'center',marginRight:-8},tabs:{height:47,flexDirection:'row',alignItems:'flex-start',gap:22,paddingTop:8},tab:{height:31},tabOn:{borderBottomWidth:2,borderBottomColor:'#C6F36B'},tabText:{color:'#747C75',fontSize:13,fontWeight:'600'},tabTextOn:{color:'#F2F3EE'},card:{flex:1,borderRadius:22,overflow:'hidden',backgroundColor:'#20251F',marginBottom:10},art:{flex:1,justifyContent:'space-between',padding:23},artTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},artLabel:{fontSize:9,letterSpacing:2,color:'#FFFFFFA0',fontWeight:'700'},livePill:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:9,paddingVertical:6,borderRadius:20,backgroundColor:'#17241EBB'},liveDot:{height:6,width:6,borderRadius:3,backgroundColor:'#C6F36B'},liveText:{fontSize:8,color:'#E9F4DE',letterSpacing:1,fontWeight:'700'},artCenter:{flex:1,alignItems:'center',justifyContent:'center'},orbit:{position:'absolute',borderWidth:1,borderColor:'#FFFFFF30',borderRadius:999},orbit1:{width:220,height:220},orbit2:{width:164,height:164,borderColor:'#FFFFFF55'},orbit3:{width:94,height:94,borderColor:'#FFFFFF70'},artSymbol:{fontSize:68,color:'#F1DAA6',textShadowColor:'#EAB87780',textShadowRadius:26},artSpark:{position:'absolute',width:8,height:8,borderRadius:4,backgroundColor:'#F3D69C'},spark1:{top:'23%',left:'26%'},spark2:{top:'68%',right:'27%',width:5,height:5},spark3:{bottom:'29%',left:'31%',width:4,height:4},artBottom:{gap:5},artTiny:{fontSize:8,color:'#FFFFFF90',letterSpacing:2,fontWeight:'700'},artFoot:{fontSize:13,color:'#FFF',fontWeight:'600'},scrim:{...StyleSheet.absoluteFill,backgroundColor:'#00000035'},cardTop:{position:'absolute',top:10,left:10,right:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},categoryPill:{paddingHorizontal:11,paddingVertical:7,borderRadius:20,backgroundColor:'#121612C9'},categoryText:{fontSize:9,letterSpacing:1.2,color:'#F4F4EC',fontWeight:'700'},more:{backgroundColor:'#12161270'},cardBottom:{position:'absolute',left:20,right:20,bottom:18},reviewPanel:{borderRadius:14,backgroundColor:'#111511D9',padding:12,marginBottom:14},statusRow:{flexDirection:'row',alignItems:'center',gap:7},statusDot:{height:6,width:6,borderRadius:3,backgroundColor:'#C6F36B'},statusText:{fontSize:11,color:'#F2F3EE',fontWeight:'600'},timeText:{fontSize:10,color:'#B6BDB5'},progress:{height:3,borderRadius:3,marginTop:10,backgroundColor:'#41483F'},errorText:{fontSize:11,color:'#F1B0A7',marginTop:8,lineHeight:16},creatorRow:{flexDirection:'row',alignItems:'center',marginBottom:15},avatar:{width:37,height:37,borderRadius:14,backgroundColor:'#D2A77A',alignItems:'center',justifyContent:'center',marginRight:10},avatarText:{fontSize:11,fontWeight:'800',color:'#281B13'},creatorInfo:{flex:1},creatorName:{color:'#FFF',fontSize:13,fontWeight:'700'},creatorHandle:{color:'#D3D5CF',fontSize:10,marginTop:3},aiLabel:{color:'#D6EDB5'},follow:{borderColor:'#FFFFFF8A',borderRadius:18},followLabel:{fontSize:11,marginHorizontal:8},siteTitle:{color:'#FFF',fontSize:27,fontWeight:'800',letterSpacing:-0.8},description:{color:'#E3E5DE',fontSize:13,lineHeight:19,marginTop:6,maxWidth:'91%'},actionRail:{position:'absolute',right:7,bottom:174,alignItems:'center'},railCount:{fontSize:9,color:'#F5F5F0',marginTop:-7,marginBottom:6,fontWeight:'600'},nextArrow:{position:'absolute',right:18,bottom:20,width:48,height:48,borderRadius:18,backgroundColor:'#C6F36B',alignItems:'center',justifyContent:'center',elevation:8},footer:{height:43,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},footerHint:{color:'#778078',fontSize:11},footerRight:{flexDirection:'row',alignItems:'center'},skip:{flexDirection:'row',alignItems:'center',gap:2,padding:8},skipText:{color:'#B8C0B8',fontSize:12,fontWeight:'600'}
});
