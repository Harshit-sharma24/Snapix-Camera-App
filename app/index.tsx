import { useCameraPermissions, CameraView } from 'expo-camera';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRef, useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { saveImage } from './utils/storage';
import Slider from '@react-native-community/slider';
import ViewShot from "react-native-view-shot";

export default function HomeScreen() {

  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);
  const viewRef = useRef<any>(null);

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [lastMedia, setLastMedia] = useState<string | null>(null);

  const [flash, setFlash] = useState<"off" | "on">("off");
  const [zoom, setZoom] = useState(0);
  const [facing, setFacing] = useState<"back" | "front">("back");

  const [showZoom, setShowZoom] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [showSaved, setShowSaved] = useState(false);

  const filters = ["normal", ...Array.from({ length: 20 }, (_, i) => `f${i+1}`)];
  const [filterIndex, setFilterIndex] = useState(0);
  const filter = filters[filterIndex];

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current.takePictureAsync({
      skipProcessing: true,
    });
    setMediaUri(photo.uri);
    setEditMode(false);
  };

  // ✅ FINAL SAVE FIX
  const save = async () => {
    try {
      const uri = await viewRef.current.capture();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await saveImage(asset.uri);

      setLastMedia(asset.uri);

      setShowSaved(true);

      // ✅ 1 second only
      setTimeout(() => {
        setShowSaved(false);
        setMediaUri(null);
      }, 1000);

    } catch (err) {
      console.log("Save error:", err);
    }
  };

  // ================= PREVIEW =================
  if (mediaUri) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>

        <ViewShot ref={viewRef} style={{ flex: 1 }}>
          <Image
            source={{ uri: mediaUri }}
            style={{
              flex: 1,
              transform: facing === "front" ? [{ scaleX: -1 }] : []
            }}
          />
          <FilterOverlay filter={filter} />
        </ViewShot>

        {/* ✅ CENTER TOAST */}
        {showSaved && (
          <View style={styles.toast}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Saved ✨✔
            </Text>
          </View>
        )}

        <View style={styles.previewBtns}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMediaUri(null)}>
            <Ionicons name="refresh" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setEditMode(!editMode)}>
            <Ionicons name="color-filter" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={save}>
            <Ionicons name="download" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/gallery')}>
            <Ionicons name="images" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {editMode && (
          <ScrollView horizontal style={styles.filters}>
            {filters.map((f, i) => (
              <TouchableOpacity key={i} onPress={() => setFilterIndex(i)}>
                <View style={styles.filterBox}>
                  <Image source={{ uri: mediaUri }} style={{ width: "100%", height: "100%" }} />
                  <FilterOverlay filter={f} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        flash={flash}
        zoom={zoom}
        facing={facing}
      />

      <FilterOverlay filter={filter} />
      {showGrid && <Grid />}

      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(p => p === "off" ? "on" : "off")}>
          <Ionicons name={flash === "on" ? "flash" : "flash-off"} size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.logo}>Snapix</Text>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowGrid(!showGrid)}>
          <MaterialIcons name="grid-on" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.leftBtn, styles.iconBtn]} onPress={() => setShowFilters(!showFilters)}>
        <MaterialIcons name="auto-awesome" size={22} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.rightBtn, styles.iconBtn]} onPress={() => setShowZoom(!showZoom)}>
        <Ionicons name="expand" size={22} color="white" />
      </TouchableOpacity>

      {/* ✅ Slightly bigger panel */}
      {showZoom && (
        <View style={styles.zoomPanel}>
          <View style={styles.zoomBtns}>
            {["1x", "3x", "6x"].map((z, i) => (
              <TouchableOpacity key={i} onPress={() => setZoom(i === 0 ? 0 : i === 1 ? 0.3 : 0.6)}>
                <Text style={styles.zoomText}>{z}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Slider
            style={{ width: "85%", alignSelf: "center" }}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={setZoom}
          />
        </View>
      )}

      {showFilters && (
        <ScrollView horizontal style={styles.filters}>
          {filters.map((f, i) => (
            <TouchableOpacity key={i} onPress={() => setFilterIndex(i)}>
              <View style={styles.filterBox}>
                <Image source={require('./assets/images/demo.png')  } style={{ width: "100%", height: "100%" }} />
                <FilterOverlay filter={f} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.gallery} onPress={() => router.push('/gallery')}>
        {lastMedia && <Image source={{ uri: lastMedia }} style={styles.preview} />}
      </TouchableOpacity>

      <TouchableOpacity style={styles.capture} onPress={takePhoto}>
        <View style={styles.captureInner} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.flipBtn} onPress={() => setFacing(p => p === "back" ? "front" : "back")}>
        <Ionicons name="camera-reverse" size={26} color="white" />
      </TouchableOpacity>

    </View>
  );
}

// ===== FILTER =====
const FilterOverlay = ({ filter }: any) => {
  if (filter === "normal") return null;
  const hue = (parseInt(filter.replace("f","")) * 15) % 360;
  return (
    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: `hsla(${hue},80%,60%,0.25)` }} />
  );
};

// ===== GRID =====
const Grid = () => (
  <View style={{ ...StyleSheet.absoluteFillObject }}>
    {[...Array(2)].map((_,i)=><View key={i} style={{position:"absolute",top:`${(i+1)*33}%`,width:"100%",height:1,backgroundColor:"white"}} />)}
    {[...Array(2)].map((_,i)=><View key={i} style={{position:"absolute",left:`${(i+1)*33}%`,height:"100%",width:1,backgroundColor:"white"}} />)}
  </View>
);

const styles = StyleSheet.create({
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  logo:{color:"white",fontSize:20,fontWeight:"700"},

  top:{position:"absolute",top:50,width:"100%",flexDirection:"row",justifyContent:"space-between",padding:20},

  iconBtn:{backgroundColor:"rgba(0,0,0,0.5)",padding:10,borderRadius:50},

  leftBtn:{position:"absolute",left:20,bottom:220},
  rightBtn:{position:"absolute",right:20,bottom:220},

  // ✅ width slightly increased
  zoomPanel:{
    position:"absolute",
    bottom:200,
    width:"60%",
    alignSelf:"center",
    backgroundColor:"rgba(0,0,0,0.5)",
    paddingVertical:8,
    paddingHorizontal:10,
    borderRadius:12
  },

  zoomBtns:{flexDirection:"row",justifyContent:"space-around",marginBottom:5},
  zoomText:{color:"white",fontWeight:"bold"},

  filters:{position:"absolute",bottom:125},

  filterBox:{width:60,height:60,margin:5,borderRadius:10,overflow:"hidden",backgroundColor:"#222"},

  gallery:{position:"absolute",left:20,bottom:40},
  preview:{width:50,height:50,borderRadius:10},

  capture:{position:"absolute",bottom:25,alignSelf:"center",width:90,height:90,borderRadius:100,borderWidth:4,borderColor:"white",justifyContent:"center",alignItems:"center"},
  captureInner:{width:65,height:65,borderRadius:100,backgroundColor:"white"},

  flipBtn:{position:"absolute",right:20,bottom:40,backgroundColor:"rgba(0,0,0,0.4)",padding:10,borderRadius:50},

  previewBtns:{position:"absolute",bottom:60,width:"100%",flexDirection:"row",justifyContent:"space-around"},

  // ✅ center toast
  toast:{
    position:"absolute",
    top:"70%",
    alignSelf:"center",
    backgroundColor:"rgba(0,0,0,0.8)",
    paddingVertical:10,
    paddingHorizontal:18,
    borderRadius:25
  }
});