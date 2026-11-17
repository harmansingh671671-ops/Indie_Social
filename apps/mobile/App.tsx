import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const sites = [
  { title: 'A Garden That Thinks', maker: 'Mira Chen', tag: 'GENERATIVE ART', line: 'A quiet little world that grows differently every time you visit.', url: 'https://example.org', mark: '✳', colors: ['#CDD3B4', '#879979', '#506859'] as [string,string,string] },
  { title: 'Tiny Planet Radio', maker: 'Studio Orbit', tag: 'INTERACTIVE SOUND', line: 'Turn the planets. Find a signal. Stay for the strange little songs.', url: 'https://example.com', mark: '◉', colors: ['#E6C9A8', '#B77D62', '#704D50'] as [string,string,string] },
  { title: 'The Useful Machine', maker: 'Dev Patel', tag: 'PLAYFUL TOOL', line: 'A small, thoughtful tool for making something out of nothing.', url: 'https://example.net', mark: '⌘', colors: ['#CCD7D3', '#819C9A', '#4C6668'] as [string,string,string] },
];
const theme = { colors: { primary: '#596B4E', background: '#F5F3EC', surface: '#F5F3EC', onSurface: '#252923' } };

function AppContent() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [minTime, setMinTime] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [failed, setFailed] = useState(false);
  const arrived = useRef(Date.now());
  const site = sites[index % sites.length];
  const opened = ready && minTime && !failed;

  useEffect(() => {
    setReady(false); setMinTime(false); setFailed(false); setSaved(false);
    arrived.current = Date.now();
    const t = setTimeout(() => setMinTime(true), 5000);
    return () => clearTimeout(t);
  }, [index]);

  const next = () => setIndex((n) => n + 1);
  const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap, size = 21, color = '#454B42') => <MaterialCommunityIcons name={name} size={size} color={color}/>;

  return <SafeAreaView style={s.page} edges={['top','left','right']}>
    <StatusBar style="dark" />
    <View style={s.topbar}>
      <View style={s.wordmark}><View style={s.logo}><Text style={s.logoText}>s</Text></View><Text style={s.brand}>scroll</Text><View style={s.divider}/><Text style={s.edition}>FIELD NOTES  /  001</Text></View>
      <Pressable style={s.search} accessibilityLabel="Search"><MaterialCommunityIcons name="magnify" size={21} color="#50564E"/></Pressable>
    </View>
    <View style={s.intro}><Text style={s.eyebrow}>A MORE CURIOUS WEB</Text><Text style={s.headline}>Somewhere{ '\n'}worth wandering.</Text><Text style={s.subhead}>Independent websites, chosen by the people who make them.</Text></View>
    <View style={s.filters}><Text style={s.filterActive}>TODAY'S PICK</Text><Text style={s.filterDot}>·</Text><Text style={s.filter}>GENERATIVE</Text><Text style={s.filterDot}>·</Text><Text style={s.filter}>TOOLS</Text><View style={s.filterSpacer}/><Text style={s.count}>0{index+1} / 03</Text></View>
    <View style={s.feature}>
      <WebView key={index} source={{uri:site.url}} style={[StyleSheet.absoluteFill,{opacity:opened?1:0}]} originWhitelist={['https://*']} javaScriptEnabled domStorageEnabled userAgent="ScrollPreview/1.0" onLoadEnd={()=>{if(Date.now()-arrived.current>800)setReady(true)}} onError={()=>setFailed(true)} onHttpError={(e)=>{if(e.nativeEvent.statusCode>=400)setFailed(true)}} />
      {!opened && <LinearGradient colors={site.colors} style={s.art}>
        <View style={s.artHeader}><Text style={s.artOverline}>AN INTERNET OBJECT</Text><Text style={s.artNumber}>Nº 0{index+1}</Text></View>
        <View style={s.artCenter}><View style={s.sunHalo}/><View style={s.sun}/><View style={s.planet}/><View style={s.orbitLine}/><Text style={s.artGlyph}>{site.mark}</Text></View>
        <View style={s.artCaption}><View style={s.artRule}/><Text style={s.artCaptionText}>A little corner of the internet</Text><MaterialCommunityIcons name="arrow-top-left" size={17} color="#F7F1E5"/></View>
      </LinearGradient>}
      <View style={s.featureTop}><View style={s.tag}><View style={s.tagDot}/><Text style={s.tagText}>{site.tag}</Text></View><Text style={s.disclosure}>HUMAN-MADE</Text></View>
      {!opened && <View style={s.load}><View style={s.loadRow}><View style={[s.loadDot,ready&&s.loadDotReady]}/><Text style={s.loadText}>{failed?'Site is taking a while':ready?'Ready to explore':'Opening the live site'}</Text><Text style={s.loadTime}>{minTime?'':'5 sec minimum'}</Text></View><ProgressBar progress={ready?1:0.32} color="#F6F0E2" style={s.progress}/></View>}
      {opened && <Pressable onPress={next} style={s.nextButton} accessibilityLabel="Next website">{icon('arrow-right',22,'#F7F4EC')}</Pressable>}
    </View>
    <View style={s.details}>
      <View style={s.creatorLine}><View style={s.avatar}><Text style={s.avatarText}>{site.maker.split(' ').map(v=>v[0]).join('')}</Text></View><Text style={s.by}>A site by </Text><Text style={s.maker}>{site.maker}</Text><Pressable onPress={()=>setFollowing(!following)} style={s.follow}><Text style={s.followText}>{following?'FOLLOWING':'FOLLOW +'}</Text></Pressable></View>
      <Text style={s.title}>{site.title}</Text><Text style={s.description}>{site.line}</Text>
      <View style={s.actions}><Pressable onPress={()=>setSaved(!saved)} style={s.saveAction}>{icon(saved?'bookmark':'bookmark-outline',18,saved?'#596B4E':'#50564E')}<Text style={s.saveText}>{saved?'SAVED TO YOUR LIBRARY':'SAVE FOR LATER'}</Text></Pressable><View style={s.actionGap}/><Pressable style={s.shareAction}>{icon('share-variant-outline',18)}<Text style={s.saveText}>SHARE</Text></Pressable><View style={s.actionGap}/><Text style={s.siteNo}>SITE 0{index+1}</Text></View>
    </View>
    <View style={s.bottom}><Text style={s.bottomLabel}>MADE FOR THE OPEN WEB</Text><Pressable onPress={next} style={s.skip}><Text style={s.skipText}>NEXT DISCOVERY</Text>{icon('arrow-right',16,'#596B4E')}</Pressable></View>
  </SafeAreaView>;
}

export default function App(){return <PaperProvider theme={theme}><AppContent/></PaperProvider>}

const s=StyleSheet.create({
  page:{flex:1,backgroundColor:'#F5F3EC',paddingHorizontal:22},topbar:{height:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},wordmark:{flexDirection:'row',alignItems:'center'},logo:{width:26,height:26,borderRadius:9,backgroundColor:'#596B4E',alignItems:'center',justifyContent:'center'},logoText:{fontSize:20,fontWeight:'900',fontStyle:'italic',color:'#F7F5EE',marginTop:-2},brand:{fontSize:18,fontWeight:'800',letterSpacing:-.7,color:'#292D27',marginLeft:8},divider:{height:16,width:1,backgroundColor:'#D6D5CA',marginHorizontal:12},edition:{fontSize:9,letterSpacing:1.4,color:'#84877C',fontWeight:'700'},search:{width:36,height:36,borderWidth:1,borderColor:'#DEDDD4',borderRadius:18,alignItems:'center',justifyContent:'center'},intro:{paddingTop:17,paddingBottom:14},eyebrow:{fontSize:9,letterSpacing:2.2,color:'#64745B',fontWeight:'800'},headline:{fontSize:34,lineHeight:36,letterSpacing:-1.25,color:'#282D26',fontWeight:'700',marginTop:8},subhead:{fontSize:12,color:'#77796F',marginTop:8},filters:{height:30,flexDirection:'row',alignItems:'center',gap:9},filterActive:{fontSize:9,letterSpacing:1,color:'#394632',fontWeight:'800'},filter:{fontSize:9,letterSpacing:1,color:'#9A9B91',fontWeight:'700'},filterDot:{fontSize:13,color:'#C4C3B8'},filterSpacer:{flex:1},count:{fontSize:9,letterSpacing:1,color:'#808378',fontWeight:'700'},feature:{flex:1,minHeight:225,maxHeight:360,borderRadius:4,overflow:'hidden',backgroundColor:'#819979',position:'relative',marginTop:4},art:{flex:1,justifyContent:'space-between',padding:18},artHeader:{flexDirection:'row',justifyContent:'space-between'},artOverline:{color:'#F8F5EBB0',fontSize:8,letterSpacing:1.8,fontWeight:'700'},artNumber:{color:'#F8F5EBB0',fontSize:9,letterSpacing:1.2},artCenter:{flex:1,alignItems:'center',justifyContent:'center'},sunHalo:{width:160,height:160,borderRadius:80,backgroundColor:'#EDE5C326',position:'absolute'},sun:{width:96,height:96,borderRadius:48,backgroundColor:'#E8D7A7',position:'absolute',opacity:.92},planet:{width:38,height:38,borderRadius:19,backgroundColor:'#AE8061',position:'absolute',left:'29%',top:'28%',borderWidth:6,borderColor:'#E8D7A755'},orbitLine:{width:210,height:80,borderWidth:1,borderColor:'#F4EEDB99',borderRadius:100,transform:[{rotate:'-28deg'}],position:'absolute'},artGlyph:{fontSize:36,color:'#485B4B',fontWeight:'300',position:'absolute',bottom:'20%',right:'30%'},artCaption:{flexDirection:'row',alignItems:'center',gap:8},artRule:{height:1,width:22,backgroundColor:'#F7F1E5'},artCaptionText:{fontSize:10,color:'#F7F1E5',letterSpacing:.3},featureTop:{position:'absolute',top:13,left:14,right:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},tag:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#F5F3EADD',paddingHorizontal:9,paddingVertical:7,borderRadius:2},tagDot:{width:5,height:5,borderRadius:3,backgroundColor:'#627755'},tagText:{fontSize:8,letterSpacing:1,color:'#394632',fontWeight:'800'},disclosure:{fontSize:8,color:'#F8F5EB',letterSpacing:1.2,fontWeight:'700'},load:{position:'absolute',bottom:13,left:14,right:14,backgroundColor:'#28352DBB',paddingHorizontal:11,paddingVertical:9,borderRadius:3},loadRow:{flexDirection:'row',alignItems:'center',gap:7},loadDot:{width:5,height:5,borderRadius:3,backgroundColor:'#E6D69F'},loadDotReady:{backgroundColor:'#AFC68D'},loadText:{fontSize:9,color:'#F8F5EB',fontWeight:'600',flex:1},loadTime:{fontSize:8,color:'#E6E0D1A8'},progress:{height:2,marginTop:7,backgroundColor:'#FFFFFF3A'},nextButton:{position:'absolute',right:14,bottom:14,width:40,height:40,borderRadius:20,backgroundColor:'#394B3F',alignItems:'center',justifyContent:'center'},details:{paddingTop:13},creatorLine:{height:30,flexDirection:'row',alignItems:'center'},avatar:{width:22,height:22,borderRadius:11,backgroundColor:'#DED5BE',alignItems:'center',justifyContent:'center'},avatarText:{fontSize:8,color:'#4D5849',fontWeight:'800'},by:{fontSize:10,color:'#93948A',marginLeft:7},maker:{fontSize:10,color:'#444A41',fontWeight:'700'},follow:{marginLeft:'auto',borderBottomWidth:1,borderBottomColor:'#89927F',paddingBottom:3},followText:{fontSize:8,letterSpacing:1,color:'#596B4E',fontWeight:'800'},title:{fontSize:24,letterSpacing:-.7,color:'#292D27',fontWeight:'700',marginTop:5},description:{fontSize:12,lineHeight:18,color:'#74766E',marginTop:3},actions:{height:45,borderTopWidth:1,borderBottomWidth:1,borderColor:'#E3E1D8',marginTop:12,flexDirection:'row',alignItems:'center'},saveAction:{flexDirection:'row',alignItems:'center',gap:7},shareAction:{flexDirection:'row',alignItems:'center',gap:7},saveText:{fontSize:8,letterSpacing:.8,color:'#65695F',fontWeight:'700'},actionGap:{height:16,width:1,backgroundColor:'#DCDAD0',marginHorizontal:13},siteNo:{marginLeft:'auto',fontSize:8,letterSpacing:1,color:'#929489'},bottom:{height:38,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},bottomLabel:{fontSize:8,letterSpacing:1.4,color:'#A0A197',fontWeight:'700'},skip:{flexDirection:'row',alignItems:'center',gap:6},skipText:{fontSize:8,letterSpacing:1,color:'#596B4E',fontWeight:'800'}
});
