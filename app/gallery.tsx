import {
  View, Text, FlatList, Image, StyleSheet,
  TouchableOpacity, Dimensions
} from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { getImages, deleteImages } from './utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');
const size = width / 4 - 8;

export default function Gallery() {

  const router = useRouter();

  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const flatRef = useRef<FlatList>(null);

  // 🔥 AUTO REFRESH (FIX)
  useFocusEffect(
    useCallback(() => {
      loadImages();
    }, [])
  );

  const loadImages = async () => {
    const data = await getImages();
    setImages([...data]); // no reverse bug
  };

  // ✅ SELECT TOGGLE
  const toggleSelect = (item: string) => {
    let updated;

    if (selectedItems.includes(item)) {
      updated = selectedItems.filter(i => i !== item);
    } else {
      updated = [...selectedItems, item];
    }

    setSelectedItems(updated);
    setSelectionMode(updated.length > 0);
  };

  // 🗑️ DELETE MULTIPLE
  const deleteSelected = async () => {
    await deleteImages(selectedItems);
    loadImages();
    setSelectedItems([]);
    setSelectionMode(false);
  };

  // 🗑️ DELETE ONE
  const deleteOne = async () => {
    if (currentIndex === null) return;

    const item = images[currentIndex];

    await deleteImages([item]);
    loadImages();
    setCurrentIndex(null);
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>

        <Text style={styles.header}>Gallery</Text>
      </View>

      {/* MULTI SELECT BAR */}
      {selectionMode && (
        <View style={styles.topBar}>
          <Text style={styles.selectedText}>
            {selectedItems.length} selected
          </Text>

          <TouchableOpacity style={styles.deleteBtnTop} onPress={deleteSelected}>
            <Ionicons name="trash" size={18} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* GRID */}
      {images.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No Images
        </Text>
      ) : (
        <FlatList
          data={images}
          numColumns={4}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 4 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (selectionMode) {
                  toggleSelect(item);
                } else {
                  setCurrentIndex(index);
                }
              }}
              onLongPress={() => toggleSelect(item)}
            >
              <Image source={{ uri: item }} style={styles.image} />

              {selectedItems.includes(item) && (
                <View style={styles.overlay}>
                  <Ionicons name="checkmark-circle" size={20} color="#4da6ff" />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* FULLSCREEN VIEW */}
      {currentIndex !== null && (
        <View style={styles.fullscreen}>

          <FlatList
            ref={flatRef}
            data={images}
            horizontal
            pagingEnabled
            initialScrollIndex={currentIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.fullImage} />
            )}
          />

          {/* CLOSE */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setCurrentIndex(null)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={deleteOne}
          >
            <Ionicons name="trash" size={26} color="white" />
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf3ff',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 45,
    paddingHorizontal: 12,
  },

  header: {
    fontSize: 22,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#222',
  },

  image: {
    width: size,
    height: size,
    margin: 3,
    borderRadius: 12,
  },

  overlay: {
    position: 'absolute',
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginVertical: 8,
  },

  selectedText: {
    color: '#333',
    fontWeight: '600',
  },

  deleteBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  deleteText: {
    color: 'white',
    marginLeft: 5,
  },

  fullscreen: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },

  fullImage: {
    width: width,
    height: '100%',
    resizeMode: 'contain',
  },

  closeBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
  },

  deleteBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});